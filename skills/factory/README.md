# factory

Global `/factory` skill: spec → build → four parallel reviews → approve → merge,
one git worktree per job. Adapted from
[zazencodes' software-factory-claude-code](https://github.com/zazencodes/zazencodes-season-3/tree/main/src/software-factory-claude-code)
without the dashboard (`/factory status` replaces it).

Changes from upstream:

- Agents are prefixed `factory-` so they don't collide with other global agents.
- `factory/jobs/` is ignored through `.git/info/exclude`, so a repo's
  `.gitignore` stays untouched.
- The builder is resumed by the agent id stored in `job.json`, with a fresh
  builder as fallback.
- Merge fast-forwards local `main` to `origin/main` first, and never pushes.

## Install on a machine

```bash
ln -s ../../.agents/skills/factory ~/.claude/skills/factory
for f in ~/.agents/skills/factory/agents/*.md; do
  ln -s "../../.agents/skills/factory/agents/$(basename "$f")" ~/.claude/agents/
done
npm i -g agent-browser && agent-browser install   # builder and UX/UI reviewers look at pages with it
```

A repo needs an `AGENTS.md` (or `CLAUDE.md`) that says how to set up a fresh
checkout, start the dev server on a given port, and run tests, build and lint.
