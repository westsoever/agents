---
name: llm-scraper
description: Fetch a webpage with a real browser (Playwright) and return it as markdown, or extract structured JSON from it with Claude, using mishushakov/llm-scraper. Use when asked to scrape a site, turn a URL into markdown, or pull fields (prices, lists, contacts) out of a page, especially JS-rendered pages that a plain fetch misses.
---

# llm-scraper

Wraps [mishushakov/llm-scraper](https://github.com/mishushakov/llm-scraper) (a library, upstream ships no skill). Script: `~/.agents/skills/llm-scraper/scrape.ts`. Run it with `bun`.

## Markdown (no API key)
```
bun ~/.agents/skills/llm-scraper/scrape.ts md <url> > page.md
```
Playwright loads the page (JS runs), then `<body>` goes through Turndown. The whole body comes out, nav and footer included; trim afterwards if needed.

## Structured extraction (Claude Agent SDK, no API key)
```
bun ~/.agents/skills/llm-scraper/scrape.ts extract <url> schema.json "optional extra instruction"
```
`schema.json` is a JSON Schema, e.g. `{"type":"object","properties":{"title":{"type":"string"}},"required":["title"]}`. The page is converted to markdown and sent to Claude Sonnet through the Claude Agent SDK, so it runs on the Claude Code login already on this machine (it spawns a `claude` session; no `ANTHROPIC_API_KEY`). JSON is printed to stdout. Needs `ai-sdk-provider-claude-code`, a community AI SDK provider around the Agent SDK; `scrape.ts` wraps the model to patch its `tool-calls` finish reason, which AI SDK 6 would otherwise reject as "No output generated".

## Setup (already done on this machine)
`npm i zod playwright llm-scraper turndown ai-sdk-provider-claude-code@ai-sdk-v6 ai@6` (llm-scraper 2.0 needs AI SDK 6, so the provider must be the `ai-sdk-v6` tag, not `latest`) and `npx playwright install chromium` inside this folder. On a new machine repeat both, `node_modules/` is gitignored.

## Limits
Login-walled and bot-protected pages are not handled. `networkidle` can hang on sites with endless polling.
