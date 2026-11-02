---
name: supervise
description: Use first, before ListAgents or SendMessage, whenever the owner points at another session or agent (an @Name, a background, Paperclip or cron agent) and wants it kept going, supervised, followed up on, or reported back on when done. Examples are "keep tabs on @X", "keep that going and report back when it's done", "implement this through @Helper and take decisions for it", "supervise the session", "did the cron session push anything new? follow up with it", or /supervise. Briefs the session, answers its questions within what the owner delegated, checks its claims with git fetch and its transcript, and reports only when it is done or the owner must decide. For an overview of all sessions, use /master.
---

# /supervise

The owner hands named sessions to you so they don't have to watch them. You don't do their work. You keep it moving: brief them, answer their questions, check what they say they did, and tell the owner when it's done or when something truly needs the owner.

Text after `/supervise` names the sessions and the goal. `/master` is for "what are all my sessions doing". This skill is for following specific delegated work through to the end.

## 1. Pin down the job
Write this to `STATE.md` in `~/.agent/sessions/<your id>/` before sending anything:
- **Targets:** each session's address (its name in `ListAgents`), repo and branch.
- **Goal:** in the owner's words.
- **Done when:** what proves it is finished, for example tests pass, a PR is open, a file is written, or the report is delivered.
- **Delegated:** the decisions you may take for the owner. Default: everything inside the goal.
- **Owner keeps:** merges the owner said they would review, production writes (Supabase applies, prod migrations, deploy merges), scope changes, product choices, and anything a guard or permission blocked.

## 2. Find each target
- Live sessions: `ListAgents`. Copy the name exactly.
- Not live (a cron run, a Paperclip agent, an ended session): `~/.agents/skills/master/scripts/sessions.sh 48` lists recent sessions with their transcript path. Paperclip work also shows up as commits on its branch.
- What it is doing now: `python3 -I ~/.agents/skills/master/scripts/digest.py <transcript> 6`.

## 3. Brief or nudge
Use `SendMessage` with `notify_when_idle: true`. Make the first line self-contained. Give the exact next step and the owner's git rules: fetch first, stage explicit paths, never force-push, and check that `git log HEAD..origin/main` is empty after a merge. Ask it to report back to you by name. If it is already working on the right thing, leave out the message and only subscribe.

## 4. Wait without polling
An idle notice wakes you. Don't loop on `ListAgents` and don't send "are you done?". For a target that can't send idle notices (cron, Paperclip, a remote branch), use one `Bash` call with `run_in_background` and an `until` loop on `git fetch` that exits when the branch moves. Keep the interval at 60 s or more.

## 5. On every idle notice
1. Read the full last reply (digest.py, or the whole last assistant message if it was cut off), not the notice summary.
2. Look for questions, offers ("If you want, I can…"), blockers and claims of "done".
3. Check claims before you believe them: `git fetch`, then `git log --oneline origin/main..origin/<branch>`, `git status -sb` in its worktree, `gh pr view`, and the test output it quoted.
4. Act:
   - Question inside the delegation: answer it yourself with the recommended option, send it with `notify_when_idle: true`, and log the decision in `STATE.md`.
   - Owner decision: ask with `AskUserQuestion` and put "(Recommended)" on your recommended option. For production writes, tell the owner to type "yes" in that session themselves. Peers refuse approval that you relay.
   - Blocked by a guard or permission: never ask the peer to do it instead. Route it to the owner.
   - Done and verified: go to step 6.
5. Report a session with an open question as "waiting on X", never as "idle".

## 6. Report
When every target is done, or when only owner decisions are left, send one short report:
- Per session: what got done (verified, with the commit, PR or file) and what is left.
- The decisions you took for the owner, one line each.
- The decisions the owner must take, each with a recommendation.

Update `STATE.md` and `NEXT.md` so another session can take over.
