#!/usr/bin/env bash
# Idempotent: link the bulk-reader agent and register big-read-guard as a
# PreToolUse hook in ~/.claude/settings.json (backup written next to it).
set -euo pipefail

dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
hook="$dir/hooks/big-read-guard"
settings="$HOME/.claude/settings.json"

mkdir -p "$HOME/.claude/agents"
[ -e "$HOME/.claude/agents/bulk-reader.md" ] || ln -s "$dir/agents/bulk-reader.md" "$HOME/.claude/agents/bulk-reader.md"

[ -f "$settings" ] || echo '{}' > "$settings"
if jq -e --arg c "$hook" '[.hooks.PreToolUse[]?.hooks[]?.command] | index($c)' "$settings" >/dev/null; then
  echo "ok: big-read-guard already registered"
  exit 0
fi

cp "$settings" "$settings.bak-bulkread"
tmp="$(mktemp)"
jq --arg c "$hook" '.hooks.PreToolUse = ((.hooks.PreToolUse // []) + [{"matcher":"Read|Bash","hooks":[{"type":"command","command":$c,"timeout":10}]}])' "$settings" > "$tmp"
jq -e . "$tmp" >/dev/null
mv "$tmp" "$settings"
echo "registered: big-read-guard (backup: $settings.bak-bulkread)"
