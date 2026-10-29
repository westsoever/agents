#!/usr/bin/env bash
# Idempotent: link this repo's output-styles and skills into Claude Code's config folder.
# Skills: every folder in skills/ that ~/.claude/skills lacks gets a link. Existing entries are left alone.
set -euo pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
src="$repo/output-styles"
dest="$HOME/.claude/output-styles"
status=0

mkdir -p "$HOME/.claude/skills"

if [ -L "$dest" ]; then
  if [ "$(readlink "$dest")" = "$src" ]; then
    echo "ok: $dest -> $src"
  else
    echo "warn: $dest is a symlink to $(readlink "$dest"), not $src. Remove it yourself, then re-run." >&2
    status=1
  fi
elif [ -e "$dest" ]; then
  echo "warn: $dest is a real file or folder. Move its contents into $src, remove it, then re-run." >&2
  status=1
else
  ln -s "$src" "$dest"
  echo "linked: $dest -> $src"
fi

linked=0
for s in "$repo"/skills/*/; do
  name="$(basename "$s")"
  link="$HOME/.claude/skills/$name"
  if [ -e "$link" ] || [ -L "$link" ]; then
    continue
  fi
  ln -s "$repo/skills/$name" "$link"
  echo "linked skill: $name"
  linked=$((linked + 1))
done
echo "skills: $linked newly linked"

exit $status
