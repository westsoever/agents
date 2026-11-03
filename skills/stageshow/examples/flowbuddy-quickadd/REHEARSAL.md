# flowbuddy quick add: rehearsal

**Gold copied:** `hero-demo` (stage size 720 × 340, compact 358 wide, a typed popup over an app window, keycaps for keys). Its annotations, toolbar and terminal satellite were dropped: quick add is anchored UI, not a satellite.

**What it shows:** press N, type `Call the bank today 4pm p2 @admin`, the recognized words light up in one pale accent tint (square, 1px buffer, as in the app since 9ffac15) and become pills, Enter drops the task into Today with its time and label while the count rolls 3 to 4, it holds, then the cursor ticks it done and the row folds away (the loop's visible reset). About 13.6 s.

**Poster:** quick add open with the line typed and the three pills.

**Changed from the gold:** the corner-bleed crop with a 40 px gutter (24 px compact); flowbuddy's rail (wordmark, Add task, Tabler icons, Today selected); real words only on the heading, the count, the typed line, the pills and the new row; filler rows run off the bottom. Compact drops the rail, the quick add x and the pill icons so the pill row holds on one line.

**Captured:** `film.mjs --gate` passed on the wide loop (18 frames at 750 ms) and at 390 px; reduced-motion poster at both widths, no findings. Video: `shots/flowbuddy-quickadd.mp4` and `.gif` (clipped screenshots at about 18 fps, so playback is a little stepped compared with the live page).

**Not checked:** dark theme, the fresh-eye review in `references/review.md`, hover and Replay in the playground viewer, real touch input, live frame pacing on a device. The dev page was filmed in headless Chrome only.
