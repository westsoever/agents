---
name: skillfactory
description: Turns a process into a reusable Claude Code skill. The user describes a workflow, or points at one that just happened in this session, and skillfactory works out the trigger, steps, inputs, outputs and hard rules, then writes the skill in the house style with a strong description. In the technobbq/agent-skills repo it adds the skill as a plugin to the team marketplace; in any other repo (a vault, soii itself, a code repo) it writes .claude/skills/<name>/SKILL.md there and adds it to the repo's cheatsheet if one exists. Commits, never pushes, and refuses to overwrite an existing skill without an explicit yes. Use when the user says "make this a skill", "turn what we just did into a command", "I keep doing this, automate it", "share this with the team", or types /skillfactory.
---

# skillfactory

Turns a repeatable process into a skill file anyone can run with `/name`. The skill goes into **the repo this session is in**.

Hard rules:
- **Never overwrite an existing skill without an explicit yes** (show a diff first). Never touch other skills.
- Never put secrets, tokens, absolute personal paths or a person's private details into a skill. Skills get shared and copied.
- The skill you write must work with the current directory as the repo root, and use relative paths.
- Add files only: the new skill (or plugin), its listing rows, one commit. No pushes. Never `push --force` or `reset --hard`.

## 1. Where am I

```bash
git rev-parse --show-toplevel
cat .claude-plugin/marketplace.json 2>/dev/null | head -5
ls .claude/skills 2>/dev/null
ls docs/skills.md .claude/SKILLS.md 2>/dev/null
```

- `.claude-plugin/marketplace.json` exists with `"name": "techbbq"`: it's the **team marketplace** (`technobbq/agent-skills`). The skill becomes a plugin; see step 4b.
- Repo has `scripts/check-vault.ts` and `docs/skills.md`: it's **soii itself**. A repo skill, with cheatsheet `docs/skills.md`; use the `soii-` prefix (except for tools that aren't about a vault), and `bun test scripts` must pass after step 5 (it checks every skill has a row). In soii's repo, soii's scripts are at `scripts/`.
- Has `.obsidian/` or `soii.config.yml`: a **vault**. A repo skill, with cheatsheet `.claude/SKILLS.md` if it exists. Never name it `soii-*`: that prefix is soii's, and `soii update` overwrites those folders. In a vault, soii's scripts are at `.soii/soii/scripts/`; don't mention soii's internals beyond what the skill needs.
- Otherwise it's a **repo skill**: it goes in `.claude/skills/<name>/SKILL.md` and loads for everyone who opens this repo. The cheatsheet is `docs/skills.md` or `.claude/SKILLS.md` if one exists (don't create one unless the user asks).
- No git repo: say so, write the skill anyway, and skip the commit.

If the process isn't tied to this repo and the user wants colleagues to have it everywhere, suggest running skillfactory from a clone of `technobbq/agent-skills` instead.

## 2. Get the process

Either the user describes it, or it is something that **just happened in this session** ("make that a skill"). In the second case, reconstruct it from the conversation: what triggered it, the commands and files used, the decisions the user made along the way. Don't ask for what you can read.

Fill in this list, asking one question at a time with AskUserQuestion where it is a choice, and in plain text where it is open:

1. **Name.** Lowercase, hyphenated, short, not already taken by a skill or plugin here.
2. **Trigger.** When should Claude pick this up? Real phrases the user would say. This becomes the `description`.
3. **Inputs.** What it needs (a file, a topic, a date) and what it can find on its own.
4. **Steps.** 3 to 8 steps, concrete: exact commands, exact files, what to show before writing.
5. **Outputs.** What changes (files, commits) and what it prints.
6. **Hard rules.** What it must never do: no deletes, ask before writes, no pushes. Anything the user said "never" about during the session.
7. **Tools.** Only what the steps need (shell, Read/Edit/Write, WebSearch/WebFetch, AskUserQuestion).

Summarise it back in five lines and ask **Looks right / Change something**.

## 3. Check for a clash

```bash
test -e .claude/skills/<name>/SKILL.md && echo EXISTS     # repo skill
test -e plugins/<name> && echo EXISTS                      # team marketplace
```

If it exists: show the first 15 lines, then ask **Overwrite / Pick another name / Cancel**. Only an explicit **Overwrite** continues. Even then, write the new text and show `git diff` afterwards.

## 4a. Write the skill (repo skill)

`.claude/skills/<name>/SKILL.md`, in the house style:

```markdown
---
name: <name>
description: <what it does, in one or two sentences, then "Use when the user says ..." with real trigger phrases, then "or types /<name>".>
---

# <Title>

<One paragraph: what this does and when. Plain words.>

Hard rules:
- <the never-do list>

## 1. <First step>
<Exact commands in code blocks. What to show the user before writing.>

## 2. ...

## N. Report
<What to print at the end: short.>
```

The house style:
- `name:` is exactly the folder name, and the file starts with `---` on the first line then `name: <name>`. Anything else and the skill isn't found.
- The `description` is the trigger. Write it so Claude would pick the skill from a casual request: say what it does, what it changes, and the phrases that should trigger it. It's one line in YAML: if it contains `: ` quote the whole thing.
- Plain-spoken, second person to Claude ("You check..."), short steps, exact commands, no filler.
- State hard rules near the top. Say what it shows before it writes, and that it asks first.
- Work with the repo root as the working directory.
- Aim for under 150 lines. If a step needs a long reference, say where it lives instead of copying it.

## 4b. Write the plugin (team marketplace)

Same `SKILL.md` and house style as 4a, at `plugins/<name>/skills/<name>/SKILL.md`, plus:

1. `plugins/<name>/.claude-plugin/plugin.json`:
   ```json
   {
     "name": "<name>",
     "version": "1.0.0",
     "description": "<one sentence>",
     "author": { "name": "TechBBQ" }
   }
   ```
2. An entry in `.claude-plugin/marketplace.json` `plugins`, matching the others: `name`, `"source": "./plugins/<name>"`, `description`.
3. One row in the README's **Plugins** table and one `/plugin install <name>@techbbq` line under **Install**, matching the rows already there.
4. `claude plugin validate .` must pass. Fix what it reports.

## 5. Add it to the cheatsheet (repo skill only)

If the cheatsheet exists, add **one row** in the table that matches its columns, starting with `` | `/<name>` | ``, in the section where it fits (read the file; keep the order the others use). Don't edit other rows. If there is no cheatsheet, skip this step and say so.

## 6. Commit

```bash
git add -- <the new skill or plugin folder> <each listing file you changed>
git commit -m "skill: add /<name>" -m "<one line: what it does>"
```

Add the commit trailer your environment asks for. Don't push: the user reviews and pushes.

## 7. Report

Print the path, the description, and: "Try it: `/<name>`". If it was built from this session, mention which steps you took from the conversation so the user can check them. In a vault, remind them that skills in `.claude/skills/` named `soii-*` are managed by soii and overwritten on update; theirs aren't. For a team plugin, add that colleagues get it after the push with `/plugin marketplace update techbbq` and `/plugin install <name>@techbbq`.
