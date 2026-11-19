// Usage:
//   bun scrape.ts md <url>                         page body -> markdown (no LLM, no API key)
//   bun scrape.ts extract <url> <schema.json> [prompt]   structured JSON via Claude
import { chromium } from 'playwright'
import Turndown from 'turndown'
import { z } from 'zod'
import { Output } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import LLMScraper from 'llm-scraper'
import { readFileSync } from 'node:fs'

const [mode, url, schemaPath, prompt] = process.argv.slice(2)
if (!url || (mode !== 'md' && mode !== 'extract') || (mode === 'extract' && !schemaPath)) {
  console.error('usage: scrape.ts md <url> | scrape.ts extract <url> <schema.json> [prompt]')
  process.exit(2)
}

const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  if (mode === 'md') {
    console.log(new Turndown().remove(['style', 'script', 'noscript']).turndown(await page.innerHTML('body')))
  } else {
    const schema = z.fromJSONSchema(JSON.parse(readFileSync(schemaPath, 'utf8')))
    const scraper = new LLMScraper(anthropic('claude-sonnet-5-5'))
    const { data } = await scraper.run(page, Output.object({ schema }), { format: 'markdown', prompt })
    console.log(JSON.stringify(data, null, 2))
  }
} finally {
  await browser.close()
}
