#!/usr/bin/env bash
# Build a research-report .tex into a .pdf next to it.
# Usage: build.sh path/to/report.tex
# - Installs missing LaTeX packages into the user TeX tree (tlmgr --usermode, no sudo).
# - Puts Inter (OFL, rsms/inter release) into fonts/ next to the .tex if it is not there,
#   from a cache in ~/.cache/research-report/inter.
# - Runs xelatex twice (links), prints errors and overfull boxes, removes aux files.
set -euo pipefail

tex="${1:?usage: build.sh path/to/report.tex}"
[ -f "$tex" ] || { echo "no such file: $tex" >&2; exit 1; }
dir="$(cd "$(dirname "$tex")" && pwd)"
base="$(basename "$tex" .tex)"

command -v xelatex >/dev/null || { echo "xelatex not found. Install MacTeX or BasicTeX first." >&2; exit 1; }

# 1. LaTeX packages the template needs (BasicTeX lacks some of them).
missing=()
for p in fontspec microtype xcolor booktabs tabularx titlesec enumitem fancyhdr tcolorbox parskip xurl tikz hyperref environ tikzfill pdfcol trimspaces; do
  kpsewhich "$p.sty" >/dev/null || missing+=("$p")
done
if [ ${#missing[@]} -gt 0 ]; then
  echo "installing LaTeX packages (user mode): ${missing[*]}"
  tlmgr init-usertree >/dev/null 2>&1 || true
  tlmgr --usermode install "${missing[@]}" >/dev/null
fi

# 2. Inter next to the report.
cache="$HOME/.cache/research-report/inter"
need=(Inter-Regular.otf Inter-Bold.otf Inter-Italic.otf Inter-BoldItalic.otf)
if [ ! -f "$cache/Inter-Regular.otf" ]; then
  echo "downloading Inter (rsms/inter, OFL) into $cache"
  mkdir -p "$cache"
  tmp="$(mktemp -d /tmp/research-report-inter.XXXXXX)"
  url="$(curl -fsSL https://api.github.com/repos/rsms/inter/releases/latest \
    | grep -oE '"browser_download_url": *"[^"]+\.zip"' | head -1 | sed -E 's/.*"(https[^"]+)"/\1/')"
  curl -fsSL -o "$tmp/inter.zip" "$url"
  unzip -q "$tmp/inter.zip" -d "$tmp/x"
  for f in "${need[@]}"; do cp "$(find "$tmp/x" -name "$f" | head -1)" "$cache/"; done
  cp "$(find "$tmp/x" -maxdepth 1 -iname 'LICENSE*' | head -1)" "$cache/Inter-LICENSE-OFL.txt"
  rm -rf -- "$tmp"
fi
mkdir -p "$dir/fonts"
for f in "${need[@]}" Inter-LICENSE-OFL.txt; do
  [ -f "$dir/fonts/$f" ] || cp "$cache/$f" "$dir/fonts/"
done

# 3. Build twice.
cd "$dir"
for i in 1 2; do
  if ! xelatex -interaction=nonstopmode -halt-on-error "$base.tex" >/dev/null; then
    echo "xelatex failed:" >&2
    grep -A8 '^!' "$base.log" >&2 || tail -30 "$base.log" >&2
    exit 1
  fi
done
over="$(grep -c 'Overfull' "$base.log" || true)"
undef="$(grep -c 'undefined' "$base.log" || true)"
rm -f "$base.aux" "$base.log" "$base.out"
pages="$(pdfinfo "$base.pdf" 2>/dev/null | awk '/^Pages/ {print $2}')"
echo "built: $dir/$base.pdf (${pages:-?} pages; overfull boxes: $over; undefined refs: $undef)"
