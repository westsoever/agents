import {
  IconBuildingFactory2,
  IconCircleCheck,
  IconCompass,
  IconCopy,
  IconDatabase,
  IconDots,
  IconFolder,
  IconLayoutGrid,
  IconLayoutSidebarLeftCollapse,
  IconListCheck,
  IconLogout,
  IconMessageReport,
  IconPlug,
  IconPlus,
  IconSoup,
  IconSparkles,
  IconTarget,
  IconTool,
  IconUsers,
  IconVault,
  IconX,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { Bar, Chart, Popover, Stage, Text, Window, type Act, type Point } from '../../kit'
import './miso-hero.css'

// miso-miso's shell, for the README. Beats: in the Vault space, + opens
// "Open a view"; Skills opens as a new tab; the tab is dragged onto Factory in
// the sidebar and moves there ("Moved to Factory"), which also returns Vault to
// where the loop began, so the reset has a cause.
//
// Real strings: the spaces, the tabs, the view menu, the Skills rows and the
// toast. Tiles and filler rows are bars. Icons are Tabler, as in the app.

type Pane = 'widgets' | 'skills'
type S = {
  menu: boolean
  skills: 'closed' | 'opening' | 'open'
  active: Pane
  ghost: { at: Point; show: boolean }
  over: boolean
  dragging: boolean
  toast: boolean
}

const initial: S = {
  menu: false,
  skills: 'closed',
  active: 'widgets',
  ghost: { at: { x: 0, y: 0 }, show: false },
  over: false,
  dragging: false,
  toast: false,
}
const poster: S = { ...initial, skills: 'open', active: 'skills' }

const I = { size: 16, stroke: 1.75 }

async function script(a: Act<S>) {
  await a.wait(900)

  // 1. + opens the view menu
  a.mark('plus')
  await a.move({ at: 'plus', x: 0.55, y: 0.6 })
  await a.click()
  await a.set({ menu: true })
  await a.wait(700)

  // 2. Skills opens as a tab
  a.mark('pick')
  await a.move({ at: 'item-skills', x: 0.82, y: 0.55 })
  await a.wait(250)
  await a.click()
  await a.set({ menu: false, skills: 'opening' })
  await a.wait(300)
  await a.set({ skills: 'open', active: 'skills' })
  a.mark('open')
  await a.move({ at: 'rest', x: 0.5, y: 0.5 })
  await a.wait(2000)

  // 3. Drag the tab onto Factory in the sidebar
  a.mark('drag')
  const tab = a.rect('tab-skills')
  const grip = { x: tab.x + tab.width * 0.86, y: tab.y + tab.height * 0.55 }
  const off = { x: grip.x - tab.x, y: grip.y - tab.y }
  await a.move(grip)
  await a.wait(200)
  const factory = a.rect('space-factory')
  const drop = { x: factory.x + factory.width * 0.97, y: factory.y + factory.height * 0.5 }
  await a.drag(
    drop,
    (at) => {
      const over = at.x > factory.x && at.x < factory.x + factory.width && at.y > factory.y - 4 && at.y < factory.y + factory.height + 4
      a.put({ dragging: true, over, ghost: { at: { x: at.x - off.x, y: at.y - off.y }, show: true } })
    },
    { duration: 1300 },
  )

  // 4. Dropped: the tab leaves Vault, the toast confirms
  a.mark('drop')
  await a.set((s) => ({ dragging: false, over: false, ghost: { ...s.ghost, show: false }, active: 'widgets' }))
  await a.wait(120)
  await a.set({ skills: 'closed', toast: true })
  await a.move({ at: 'rest', x: 0.5, y: 0.5 })
  await a.wait(1800)
  await a.set({ toast: false })
  await a.snap({ ghost: initial.ghost })
  await a.wait(500)
}

function NavRow({ icon, label, active, target, over }: { icon: ReactNode; label: string; active?: boolean; target?: string; over?: boolean }) {
  return (
    <div className="mh-nav" data-active={active || undefined} data-over={over || undefined} data-target={target}>
      {icon}
      <Text className="mh-nav__label">{label}</Text>
    </div>
  )
}

function Sidebar({ s }: { s: S }) {
  return (
    <aside className="mh-side">
      <div className="mh-brand">
        <span className="mh-brand__name">miso.</span>
        <IconLayoutSidebarLeftCollapse size={18} stroke={1.75} className="mh-icon" />
      </div>
      <nav className="mh-spaces">
        <NavRow icon={<IconSoup {...I} />} label="miso." />
        <NavRow icon={<IconVault {...I} />} label="Vault" active />
        <NavRow icon={<IconBuildingFactory2 {...I} />} label="Factory" target="space-factory" over={s.over} />
      </nav>
      <div className="mh-foot">
        <NavRow icon={<IconPlug {...I} />} label="Connectors" />
        <NavRow icon={<IconDatabase {...I} />} label="Data map" />
        <NavRow icon={<IconUsers {...I} />} label="People & access" />
        <div className="mh-rule" />
        <NavRow icon={<IconCompass {...I} />} label="Take the tour" />
        <NavRow icon={<IconMessageReport {...I} />} label="Feedback" />
        <div className="mh-me">
          <span className="mh-me__avatar">A</span>
          <Text className="mh-me__mail">ana@northwind.co</Text>
          <IconLogout {...I} className="mh-icon" />
        </div>
      </div>
    </aside>
  )
}

function Tab({ icon, label, active, dragging, target }: { icon: ReactNode; label: string; active: boolean; dragging?: boolean; target?: string }) {
  return (
    <div className="mh-tab" data-active={active || undefined} data-dragging={dragging || undefined} data-target={target} data-cursor={target ? 'open' : undefined}>
      <span aria-hidden className="mh-tab__edge" />
      <span className="mh-tab__body">
        {icon}
        <span>{label}</span>
      </span>
      <span className="mh-tab__dots">
        <IconDots size={12} stroke={1.75} />
      </span>
    </div>
  )
}

function Widgets() {
  return (
    <div className="mh-grid">
      <div className="mh-tile">
        <Text className="mh-tile__title">Notes</Text>
        <div className="mh-big">1,284</div>
        <div className="mh-delta">+38 this week</div>
      </div>
      <div className="mh-tile mh-tile--wide">
        <Text className="mh-tile__title">Activity</Text>
        <Chart kind="bars" data={[4, 6, 5, 9, 7, 11, 8, 12, 10, 14, 9, 13]} width={380} height={86} className="mh-chart" />
      </div>
      <div className="mh-tile mh-tile--wide">
        <Text className="mh-tile__title">Recent notes</Text>
        {[150, 118, 172].map((w, i) => (
          <div className="mh-line" key={i}>
            <IconFolder size={14} stroke={1.75} className="mh-icon-faint" />
            <Bar w={w} h={6} tone={3} />
            <span className="mh-line__spacer" />
            <Bar w={34} h={5} tone={2} />
          </div>
        ))}
      </div>
      <div className="mh-tile">
        <Text className="mh-tile__title">Inbox</Text>
        <div className="mh-big mh-big--small">7</div>
        <Bar w={84} h={5} tone={2} />
      </div>
    </div>
  )
}

const SKILLS: [string, string][] = [
  ['/research', 'Researches a question properly.'],
  ['/unbox', 'Files everything in the Inbox where it belongs.'],
  ['/handoff', 'Writes the session handoff for the next session.'],
]

function Skills() {
  return (
    <div className="mh-skills">
      <div className="mh-head">
        <span className="mh-head__title">Skills</span>
        <span className="mh-head__count">24 skills</span>
      </div>
      <div className="mh-search">Search skills</div>
      <div className="mh-list">
        {SKILLS.map(([cmd, text]) => (
          <div className="mh-skill" key={cmd}>
            <div className="mh-skill__text">
              <code className="mh-code">{cmd}</code>
              <span>{text}</span>
            </div>
            <IconCopy {...I} className="mh-icon" />
          </div>
        ))}
        <div className="mh-skill">
          <div className="mh-skill__text">
            <Bar w={64} h={14} r={4} tone={1} style={{ marginBottom: 6 }} />
            <Bar w={230} h={6} tone={3} />
          </div>
          <IconCopy {...I} className="mh-icon" />
        </div>
      </div>
    </div>
  )
}

function Menu() {
  const item = (icon: ReactNode, label: string, extra?: ReactNode, target?: string) => (
    <div className="mh-item" data-target={target} key={label}>
      {icon}
      <span className="mh-item__label">{label}</span>
      {extra}
    </div>
  )
  return (
    <>
      <div className="mh-menu__label">Vault (this space)</div>
      {item(<IconFolder {...I} />, 'Vault overview', <span className="mh-item__open">Open</span>)}
      {item(<IconSparkles {...I} />, 'Skills', undefined, 'item-skills')}
      <div className="mh-menu__label">Factory</div>
      {item(<IconTarget {...I} />, 'Backlog')}
      {item(<IconTool {...I} />, 'Jobs')}
      <div className="mh-menu__label">miso.</div>
      {item(<IconListCheck {...I} />, 'How miso works')}
    </>
  )
}

export default function MisoHero() {
  return (
    <Stage width={960} height={540} initial={initial} poster={poster} script={script} cursor={{ at: { at: 'rest', x: 0.5, y: 0.5 } }} className="mh-stage">
      {(s, rect) => {
        const plus = rect('plus')
        return (
          <>
            <Window url="localhost:13380/vault" urlShape="pill" className="mh-window" body={{ className: 'mh-body' }}>
              <div className="mh-app">
                <Sidebar s={s} />
                <div className="mh-main">
                  <header className="mh-header">
                    <div className="mh-tabs">
                      <Tab icon={<IconLayoutGrid {...I} />} label="Widgets" active={s.active === 'widgets'} />
                      <Tab icon={<IconFolder {...I} />} label="Vault overview" active={false} />
                      <div className="mh-tabwrap" data-open={s.skills !== 'closed' || undefined} data-settled={s.skills === 'open' || undefined}>
                        <div className="mh-tabwrap__inner">
                          <Tab icon={<IconSparkles {...I} />} label="Skills" active={s.active === 'skills'} dragging={s.dragging} target="tab-skills" />
                        </div>
                      </div>
                      <div className="mh-plus" data-target="plus" data-open={s.menu || undefined}>
                        <IconPlus {...I} />
                      </div>
                    </div>
                  </header>
                  <main className="mh-sheet">
                    <div className="mh-pane" data-show={s.active === 'widgets' || undefined}>
                      <Widgets />
                    </div>
                    <div className="mh-pane" data-show={s.active === 'skills' || undefined}>
                      <Skills />
                    </div>
                    <span className="mh-rest" data-target="rest" />
                    <div className="mh-toast" data-show={s.toast || undefined}>
                      <IconCircleCheck {...I} className="mh-toast__ok" />
                      <span>Moved to Factory</span>
                      <IconX size={14} stroke={1.75} className="mh-icon" />
                    </div>
                  </main>
                </div>
              </div>
            </Window>

            <Popover show={s.menu} className="mh-menu" style={{ left: plus.x - 4, top: plus.y + plus.height + 6 }}>
              <Menu />
            </Popover>

            <div className="mh-ghost" data-show={s.ghost.show || undefined} style={{ left: s.ghost.at.x, top: s.ghost.at.y }}>
              <IconSparkles {...I} />
              <span>Skills</span>
            </div>
          </>
        )
      }}
    </Stage>
  )
}
