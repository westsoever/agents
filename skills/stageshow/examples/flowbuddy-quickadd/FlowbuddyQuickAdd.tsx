import { IconArrowUp, IconCalendar, IconChecklist, IconCirclePlus, IconFlag, IconInbox, IconPlus, IconRobot, IconSun, IconTag, IconX } from '@tabler/icons-react'
import { Bar, Check, Collapse, Popover, Roll, Row, Stage, Text, Window, type Act } from '../../kit'
import './flowbuddy.css'

// flowbuddy's quick add: press N, type one line, the details light up and become pills,
// Enter drops the task into Today already scheduled. The loop resets by ticking it done.

type S = { open: boolean; typed: string; added: boolean; done: boolean }

const FULL = 'Call the bank today 4pm p2 @admin'
// what the parser reads out of FULL; a token lights up once it is typed in full (a label as it is typed)
const TOKENS = [
  { start: 14, end: 19 }, // today
  { start: 20, end: 23 }, // 4pm
  { start: 24, end: 26 }, // p2
  { start: 27, end: 33, grows: true }, // @admin
]
const has = (typed: string, end: number) => typed.length >= end

const initial: S = { open: false, typed: '', added: false, done: false }
const POSTER: S = { open: true, typed: FULL, added: false, done: false }
const REST = { wide: { x: 612, y: 296 }, compact: { x: 300, y: 290 } }

async function script(a: Act<S>) {
  await a.wait(900)
  await a.key('n')
  await a.set({ open: true })
  await a.wait(500)
  await a.type('typed', FULL, { interval: 55 })
  await a.wait(1100) // read the pills
  await a.key('enter')
  await a.set({ open: false, added: true })
  await a.wait(500)
  await a.snap({ typed: '' }) // the popover has faded; clear it unseen
  await a.wait(2000) // the payoff holds

  // Tick it done: the row folds away, which is the loop's reset
  await a.move({ at: 'done', x: 0.5, y: 0.5 })
  await a.wait(250)
  await a.click()
  await a.set({ done: true })
  await a.wait(550)
  await a.set({ added: false })
  await a.wait(700)
  await a.snap({ done: false })
  await a.move('rest')
  await a.wait(300)
}

export function FlowbuddyQuickAdd() {
  return (
    <Stage width={720} height={340} compact={{ below: 600, width: 358, height: 340 }} initial={initial} poster={POSTER}
      script={script} cursor={{ at: REST }} accent="#ff5f00" className="fq">
      {(s, _rect, layout) => (
        <>
          <Window url="localhost:8787" className="fq-win">
            <div className="fq-body">
              {layout === 'wide' && <Sidebar />}
              <main className="fq-main">
                <div className="fq-title"><Text>Today</Text></div>
                <div className="fq-count"><Roll>{s.added ? '4 tasks' : '3 tasks'}</Roll></div>
                <div className="fq-list">
                  <Collapse open={s.added} reveal="drop" className="fq-item">
                    <Row pad={0}
                      lead={<span className="fq-check fq-check--p2" data-target="done"><Check on={s.done} size={16} /></span>}
                      title={<Text>Call the bank</Text>}
                      subtitle={
                        <span className="fq-meta">
                          <span className="fq-due"><IconCalendar size={12} stroke={2} />Today 16:00</span>
                          <span className="fq-tag"><IconTag size={12} stroke={2} />admin</span>
                        </span>
                      } />
                  </Collapse>
                  {[[150, 64], [118, 40], [172, 82], [134, 52], [160, 70], [126, 46]].map(([w, m], i) => (
                    <div key={i} className="fq-item">
                      <Row pad={0} lead={<span className="fq-check"><Check on={false} size={16} /></span>}
                        title={<Bar w={w} h={7} tone={3} />} subtitle={<Bar w={m} h={5} tone={2} />} />
                    </div>
                  ))}
                </div>
              </main>
            </div>
          </Window>

          <Popover show={s.open} origin="top" className="fq-qa">
            <div className="fq-line" data-typing>
              <Typed text={s.typed} />
              <span className="fq-caret" />
            </div>
            <div className="fq-bar">
              <span className="fq-btn fq-btn--soft"><IconPlus size={14} stroke={2} /></span>
              <Pill on={has(s.typed, 19)} icon={<IconCalendar size={13} stroke={2} />}>
                <Roll>{has(s.typed, 23) ? 'Today, 16:00' : 'Today'}</Roll>
              </Pill>
              <Pill on={has(s.typed, 26)} icon={<IconFlag size={13} stroke={2} />}>Priority 2</Pill>
              <Pill on={has(s.typed, 33)} icon={<IconTag size={13} stroke={2} />}>admin</Pill>
              <span className="fq-spacer" />
              <span className="fq-btn fq-btn--close"><IconX size={14} stroke={2} /></span>
              <span className="fq-btn fq-btn--send"><IconArrowUp size={14} stroke={2.25} /></span>
            </div>
          </Popover>

          <span data-target="rest" style={{ position: 'absolute', left: REST[layout].x, top: REST[layout].y }} />
        </>
      )}
    </Stage>
  )
}

// the typed line with each recognized word on a pale accent box
function Typed({ text }: { text: string }) {
  const out: React.ReactNode[] = []
  let at = 0
  for (const t of TOKENS) {
    const end = t.grows ? Math.min(text.length, t.end) : t.end
    const lit = t.grows ? text.length > t.start + 1 : has(text, t.end)
    if (!lit) continue
    out.push(text.slice(at, t.start), <mark key={t.start} className="fq-hl">{text.slice(t.start, end)}</mark>)
    at = end
  }
  out.push(text.slice(at))
  return <>{out}</>
}

// a value read from the line: it opens its own width as it arrives, so its neighbors make room
function Pill({ on, icon, children }: { on: boolean; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="fq-pill-slot" data-on={on || undefined}>
      <span className="fq-pill-clip">
        <span className="fq-pill">{icon}{children}</span>
      </span>
    </span>
  )
}

function Sidebar() {
  const nav = [
    { icon: <IconInbox size={16} stroke={1.75} />, w: 38 },
    { icon: <IconSun size={16} stroke={1.75} />, w: 34, on: true },
    { icon: <IconCalendar size={16} stroke={1.75} />, w: 46 },
    { icon: <IconChecklist size={16} stroke={1.75} />, w: 32 },
    { icon: <IconRobot size={16} stroke={1.75} />, w: 40 },
  ]
  return (
    <aside className="fq-side">
      <div className="fq-word">flowbuddy.</div>
      <div className="fq-add"><IconCirclePlus size={16} stroke={1.75} />Add task</div>
      {nav.map((n, i) => (
        <div key={i} className="fq-nav" data-on={n.on || undefined}>
          {n.icon}
          <Bar w={n.w} h={6} tone={n.on ? 4 : 2} />
        </div>
      ))}
    </aside>
  )
}
