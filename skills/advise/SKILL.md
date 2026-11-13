---
name: advise
description: Use whenever the owner points at one or more sessions or agents (an @Name, a background, cron or Paperclip agent) and hands them over to be kept going, supervised, decided for or followed up on, for example "/advise @Name [goal]", "advise @X", "take over @X and see it through", "keep tabs on @X and report back when it's done", "implement this through @Helper and take decisions for it", or "did the cron session push anything? follow up with it". Best run in a Fable session next to Opus or Sonnet working sessions. It takes every decision the sessions ask for, reviews their work for quality, keeps them going until the goal is verified done, then writes a short handoff report, so the owner can forget them. /master auto also uses its consult mode for single hard decisions. For an overview of all sessions, use /master.
---

# /advise

The owner hands you one or more working sessions and walks away. You are its senior advisor and decision-maker. You don't do its work. You:
- set the bar
- take its decisions
- check what it claims
- keep it moving until the goal is met and verified
- write a short handoff report

The owner wants to forget about these sessions, so only interrupt them for the cases listed in step 1.

Arguments: `/advise @Name [@Name2 …] [goal]`. Run every step below for each target. With several targets, the goal and the done-checks can be per target. `/advise checkin` is the fallback check (step 5). `/advise stop` ends advising: delete the cron job and write the report (step 7).

## 0. Model check
This skill is meant to run on Fable (`/model fable`), with the target on Opus or Sonnet. If you are not on a model stronger than the target, say so once in your first reply and carry on.

## 1. Pin down the job
Write this to `STATE.md` in `~/.agent/sessions/<your id>/` before you send anything:
- **Target:** its exact name in `ListAgents`, plus its repo, branch and transcript path.
- **Goal:** the owner's words. If the owner gave none, take it from the target's first request (`digest.py`) and its `STATE.md`/`NEXT.md`, and log it as an assumption.
- **Done when:** checks that prove the goal is met, for example tests green, PR merged, deploy healthy, file written. Write them so you can run them yourself.
- **Delegated to you:** every decision inside the goal. That covers approach, scope trims that keep the goal, library choices, naming, test strategy, which review findings to fix, and committing and pushing a branch.
- **Owner keeps:** production writes (Supabase applies, prod migrations, deploys), anything destructive or irreversible, spending money, sending things to people outside, scope changes that alter the goal, and anything a guard or permission blocked. Collect these. Don't stop the work for them unless nothing else can move.

## 2. Read the target in full
- Live sessions: `ListAgents` gives you the address. A target that is not live (a cron run, a Paperclip agent, an ended session) shows up in `~/.agents/skills/master/scripts/sessions.sh 48` and as commits on its branch. `~/.agents/skills/master/scripts/sessions.sh 48` gives its cwd, branch, context % and transcript.
- `python3 -I ~/.agents/skills/master/scripts/digest.py <transcript> 12`. Read the last long assistant message in full.
- Read its `STATE.md`/`NEXT.md`, the repo's `AGENTS.md`/`CLAUDE.md`, and the plan or spec it works from.
- Check the facts yourself: `git fetch`, `git status -sb`, `git log --oneline origin/main..HEAD`, and `gh pr view` when there is a PR.

## 3. Brief the target
Send one `SendMessage` with `notify_when_idle: true`. Its first line must make sense on its own:
- "@<your name> is now advising this session for the owner. Send every question and decision to @<your name>, not to the owner, then wait for the answer."
- The goal and the done-checks.
- Your review of its current plan: what to keep, what to change and why, and the first concrete next step.
- Ground rules:
  - Keep going without asking the owner.
  - Before calling something done, run the done-checks and paste the output.
  - Git: fetch first, stage explicit paths, never force-push, and after a merge check that `git log HEAD..origin/main` is empty.
  - Don't merge to main or do production writes yourself. Hand those back to the advisor.

## 4. Wait without polling
An idle notice wakes you. Don't loop on `ListAgents` and don't ask "are you done?". For a target that can't send idle notices (cron, Paperclip, a remote branch), use one `Bash` call with `run_in_background` and an `until` loop on `git fetch` that exits when the branch moves. Keep the interval at 60 s or more. Mark the targets `advised by @<your name>` in `~/.agent/master/LEDGER.md` so /master leaves them to you. As a fallback for a missed notice, create a `CronCreate` job every 30 minutes with the prompt `/advise checkin` if `CronList` doesn't already have one.

## 5. On every idle notice (and on `checkin`)
1. Read the full last reply, not the notice summary.
2. Sort what you find:
   - **A question or decision** inside the delegation: decide. Pick the option that holds up best for quality and still meets the goal, not the quickest one. Give one line of reasoning and the condition that would change your mind.
   - **An offer** ("If you want, I can…"): accept it if it serves the goal, otherwise decline it and give the next step.
   - **A claim of progress or "done"**: check it yourself (step 6) before you believe it.
   - **Stuck** (the same error twice, an approach that isn't converging): look at the evidence, name the likely root cause, and give a different approach. Don't just say "try again".
   - **Stopped with no question** but not done: send the next concrete step.
   - **An owner-kept item**: add it to the list for the report. Redirect the target to the rest of the work. Only call `AskUserQuestion` (recommended option first, marked "(Recommended)") when everything left is blocked on it. Then also send `PushNotification`.
   - **A guard or permission block**: never ask the target to work around it. It goes on the owner list.
3. Look for quality problems even when the target didn't ask:
   - scope drift
   - tests that don't check the requirement
   - skipped edge cases
   - silent assumptions
   - files from other sessions getting staged
   - context above 80% (ask it to `/compact` at a clean point)
4. Reply with `SendMessage`, `notify_when_idle: true`. Log every decision in `STATE.md` under Decisions, with its reason.
5. If the target has ended or died: write `NEXT.md` so a fresh session can continue, and put the target on the owner list as "needs a new session started from NEXT.md".

## 6. Quality gate before "done"
Don't accept done from the target's word alone. Check it yourself:
- Run the done-checks yourself: tests, build, `gh pr view`, deploy status.
- Read the full diff (`git diff origin/main...<branch>`). Every change should serve the goal, nothing should be half-finished, and no other session's files should be in it.
- For a large or risky diff, run `/code-review` (or a `ponytail-review` subagent) and send the target the findings that matter.
- Merging to main, if it is part of the goal: once the gate passes, do it yourself with `/merge` and the owner's git rules, then tell the target. A peer won't merge just because you asked.

Then loop back to step 5 until every done-check passes.

## 7. Finish: handoff report
1. Ask the target to run `/handoff`, so its `STATE.md`/`NEXT.md` are current.
2. Delete your `/advise checkin` cron job.
3. Run `/handoff` for your own session. Put the report in your `STATE.md`, at most 15 lines:
   - **Goal:** one line, and whether it is met.
   - **Delivered:** commit, PR, file or deploy, with the evidence you checked.
   - **Decisions taken for the owner:** one line each, with the reason.
   - **Left for the owner:** each item with a recommended option.
   - **Watch out:** anything fragile you noticed.
4. Send the owner the same report as your final reply. Also send `PushNotification`: "<target>: done" or "<target>: needs you for N items".

## Consult mode (one decision, called by /master auto)
When the prompt says "consult mode", you are a one-shot advisor and nothing else:
- Don't message any session and don't create cron jobs.
- Read what you need to judge the decision: the transcript (`digest.py`), the repo and the diff.
- Return at most 8 lines:
  - **Recommendation**
  - **Confidence:** high, medium or low
  - **Reason**
  - **Risk if wrong**
  - **What would change the call**
  - whether the session needs a full `/advise` (it keeps producing hard decisions)
- If it is an owner-kept item (step 1), say so instead of deciding.
