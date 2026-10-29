#!/usr/bin/env bash
# Idempotent: link this repo's output-styles into Claude Code's config folder.
set -euo pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
src="$repo/output-styles"
dest="$HOME/.claude/output-styles"

mkdir -p "$HOME/.claude"

if [ -L "$dest" ]; then
  if [ "$(readlink "$dest")" = "$src" ]; then
    echo "ok: $dest -> $src"
    exit 0
  fi
  echo "warn: $dest is a symlink to $(readlink "$dest"), not $src. Remove it yourself, then re-run." >&2
  exit 1
fi

if [ -e "$dest" ]; then
  echo "warn: $dest is a real file or folder. Move its contents into $src, remove it, then re-run." >&2
  exit 1
fi

ln -s "$src" "$dest"
echo "linked: $dest -> $src"
