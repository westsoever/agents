#!/bin/sh
# List sessions touched in the last ${1:-24} hours: id, state, age, name, branch, ctx%, transcript.
hours=${1:-24}; now=$(date +%s)
for m in "$HOME"/.agent/sessions/*/meta; do
  upd=$(sed -n 's/^updated=//p' "$m"); [ -n "$upd" ] || continue
  [ $((now - upd)) -le $((hours * 3600)) ] || continue
  id=$(basename "$(dirname "$m")")
  get() { sed -n "s/^$1=//p" "$m" | tail -1; }
  printf '%s\t%s\t%smin\t%s\t%s\t%s%%\t%s\n' "$id" "$(get state)" $(((now - upd) / 60)) "$(get cwd)" "$(get branch)" "$(get ctx_pct)" "$(get transcript)"
done | sort -t"$(printf '\t')" -k3 -n
