---
name: gitbook-docs
description: Write or update GitBook documentation so it fits the site's existing structure and style, through the GitBook MCP (change requests, read-back, merge). Use this whenever the user asks to write, add, update, mirror or publish something "into GitBook", "in the gitbook", "under <section> in GitBook", or on technobbq.gitbook.io, e.g. "write up the explanation of the tool into the gitbook under Tools/SpeakerFinder", "mirror the miso structure from technobbq.gitbook.io", "put this .md into GitBook under tools-and-resources/miso". Also use it when a local doc (README, docs/*.md, a spec) should end up on a GitBook page, even if the user only names the section.
---

# GitBook docs

Turn a request like "write it into the gitbook under Tools/SpeakerFinder" into a page that looks like it was always there: in the right section, in the same format as its neighbours, published only as far as the user asked.

## Why this order matters

A GitBook site is a tree: sites, sections, spaces, pages. Most bad GitBook writes come from skipping orientation: a page lands at the space root instead of under its section, it duplicates a page that already exists, or it uses a different heading and tone than its siblings. Published content is never edited directly. Every change goes through a change request, so a mistake is cheap until the merge, and the merge is the one step to take deliberately.

## Workflow

### 1. Locate the target (read-only)
- `list_sites` gives the organization's sites; the TechBBQ docs are `technobbq.gitbook.io`. If several organizations are visible and the user didn't name one, ask.
- `get_site_structure` gives the sections and the spaces they publish. Map the user's words to a real place: "Tools/SpeakerFinder" or "technobbq/tools-and-resources/miso" names a section and a page path. URL paths and page titles often differ in case and dashes, so match loosely, then confirm with the tree.
- `search` for the topic before writing anything. If a page about it already exists, update that page rather than adding a second one.

### 2. Learn the local style
Read one or two sibling pages in the target section with `get_page`. Note the heading levels, whether pages open with a one-line summary, how they use lists, tables and hints, the language (English or Danish) and the length. Match them. A page that follows its neighbours needs no explanation; a page that doesn't looks bolted on.

### 3. Draft from the source of truth
Write from the real material the user pointed at: the repo's README, `docs/*.md`, a spec, or the current conversation. Don't invent features. For a tool page, the useful shape is usually:
- what it is, in one line;
- who uses it and when;
- how to use or update it;
- where the code and owners are.

Keep internal-only details (tokens, private URLs, customer data) out of a published docs site.

"Mirror the structure" requests (like rebuilding the miso section somewhere else) mean copying the page tree and titles first, then filling in content. Create parent pages before children, so the order and nesting match.

### 4. Write through a change request
1. `create_change_request` on the target space. Give it a title that says what changes, e.g. "Add SpeakerFinder tool page".
2. If you are editing an existing page, read it inside the change request: `invoke_operation` with `getPageInChangeRequestById` or `getPageInChangeRequestByPath`, using `computed=false`, `format=markdown` and `format.markdown.refs=stable`. Then edit that text instead of retyping the page, so links and blocks you didn't touch survive.
3. Apply the edits: `invoke_operation` with `updateChangeRequestContent`. Its `changes` array takes `insert_page`, `update_page` and `delete_page` entries with a markdown `document`. Run `describe_operation` on it once to see how to position a new page under a parent.
4. Link to other pages as `/pages/<pageId>`, or by path (`/pages/tools/speakerfinder`). Keep existing links in the form they came back in.
5. Images: upload with an `insert_files` change, give each file a `ref`, and use a public `url` where possible, never an inline `data:` URI.

### 5. Read it back
Read the page from the change request again and check three things: it renders as markdown (no escaped headings or lost lists), it sits under the intended parent, and its links resolve. Fix it in the same change request if not.

### 6. Merge only as far as the user asked
`submit_or_merge_change_request` publishes the change to the live site. Decide from the request:
- **Merge** when the user asked to put, write or publish it into GitBook ("write it into gitbook under …", "add it to the docs"). Their instruction is the go-ahead; don't ask again. Merge after the read-back passes.
- **Leave the change request open** when they asked for a draft, a proposal or a review, or when anything in step 1 was a guess, such as an ambiguous section or a possible duplicate. Report it and say what needs their eye.

If the merge reports a conflict, the change request is out of date. Say so and point the user to the GitBook app to resolve it; don't retry blindly.

## Reporting back
Name things by title, never by internal id: the page title, its section, and whether it is live or waiting in a change request. One short paragraph is enough, for example: "Added 'SpeakerFinder' under Tools on technobbq.gitbook.io, following the other tool pages' layout; it's live." When unsure about anything in the GitBook API, `get_usage_guide` (topics `editing`, `orientation`, `content-blocks`) is the authority.
