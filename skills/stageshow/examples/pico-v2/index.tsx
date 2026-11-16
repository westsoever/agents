import { Stage, Phone, Collapse, Roll, States, type Act } from '../../kit'
import { ArrowUpRight, ChevronLeft, Heart, SlidersHorizontal, Star, Check } from 'lucide-react'
import './pico.css'

import daybreak from './img/pontes-coffee-daybreak.jpg'
import guji from './img/kontra-ethiopia-guji.png'
import kigari from './img/prolog-kigari-aa.png'
import kieni from './img/coffee-collective-kieni.png'
import megadu from './img/la-cabra-megadu.png'
import momentum from './img/kaffevaerk-momentum.png'
import twinRivers from './img/pontes-coffee-twin-rivers.jpg'

// Pico v2, a design-review mockup. Three screens of the redesign on a snow
// ground, whole phones as the brief's references show them: Discover (photo-led
// feed, floating nav, Scan one tap away), a coffee (the bag as the hero, rating
// in the sheet) and Journal (your rated coffees as a photo grid).
//
// One story runs across them: on the coffee, a tap gives Ethiopia Guji four
// stars, Save to Journal confirms on itself, and the coffee lands at the top of
// the Journal beside it while the count rolls. Plays once; the poster is the
// saved state.
//
// Names, roasters, origins, tasting notes and bag photos are real catalog data.
// The match percentages are illustrative (Pico has a similarity score, but these
// values are made up), and the counts in Journal are sample data.

type S = { stars: number; saved: boolean }
const START: S = { stars: 0, saved: false }
const POSTER: S = { stars: 4, saved: true }

const script = async (a: Act<S>) => {
  await a.wait(1400)
  a.mark('rate')
  await a.click('star-4')
  for (let i = 1; i <= 4; i++) {
    a.put({ stars: i })
    await a.wait(70)
  }
  await a.wait(1100)
  a.mark('save')
  await a.click('save')
  a.put({ saved: true })
  await a.wait(2600)
}

const RATING_WORDS = ['Tap to rate', 'Not for me', 'It’s okay', 'Good cup', 'Really good', 'Loved it']

/* Pico's own icons (src/components/ui/Icons.tsx), stroke 1.8 */
const ico = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 1.8, viewBox: '0 0 24 24', width: 22, height: 22, 'aria-hidden': true } as const
const DiscoverIcon = () => (
  <svg {...ico}><circle cx="12" cy="12" r="8.25" /><path d="m14.7 9.3-1.5 3.9-3.9 1.5 1.5-3.9 3.9-1.5Z" /></svg>
)
const JournalIcon = () => (
  <svg {...ico}><path d="M6.25 4.25h10.5a1.5 1.5 0 0 1 1.5 1.5v14H7.75a2 2 0 0 1-2-2v-12a1.5 1.5 0 0 1 .5-1.12" /><path d="M8.75 4.25v15.5M11.75 8.25h3.5M11.75 11.25h3.5" /></svg>
)
const TasteIcon = () => (
  <svg {...ico}><path d="M4.75 9.25h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5v-4.5Z" /><path d="M15.75 10.25h1.5a2.5 2.5 0 0 1 0 5h-1.9M8.75 3.75c-.6.8-.6 1.7 0 2.5M12.25 3.75c-.6.8-.6 1.7 0 2.5" /></svg>
)
const SearchIcon = () => (
  <svg {...ico}><circle cx="10.75" cy="10.75" r="6.5" /><path d="m15.5 15.5 4 4" /></svg>
)
const CameraIcon = () => (
  <svg {...ico}><path d="M4.25 8.25a1.5 1.5 0 0 1 1.5-1.5h2.1l1.4-2h5.5l1.4 2h2.1a1.5 1.5 0 0 1 1.5 1.5v9.5a1.5 1.5 0 0 1-1.5 1.5H5.75a1.5 1.5 0 0 1-1.5-1.5v-9.5Z" /><circle cx="12" cy="13" r="3.5" /></svg>
)

function Nav({ active }: { active: 0 | 1 | 2 }) {
  const items = [
    { icon: <DiscoverIcon />, label: 'Discover' },
    { icon: <JournalIcon />, label: 'Journal' },
    { icon: <TasteIcon />, label: 'Taste' },
  ]
  return (
    <div className="pc-nav">
      <div className="pc-nav__pill">
        {items.map((it, i) => (
          <span key={it.label} className="pc-nav__item" data-on={i === active || undefined} aria-label={it.label}>
            {it.icon}
          </span>
        ))}
      </div>
      <span className="pc-nav__scan" aria-label="Scan a bag">
        <CameraIcon />
      </span>
    </div>
  )
}

function Stars({ n, size = 12 }: { n: number; size?: number }) {
  return (
    <span className="pc-mini-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} strokeWidth={0} fill={i <= n ? 'currentColor' : 'rgba(17,20,24,.14)'} />
      ))}
    </span>
  )
}

/* ---------- Discover ---------- */
function Discover() {
  return (
    <div className="pc-screen pc-discover">
      <div className="pc-head">
        <span className="pc-eyebrow">75 coffees from 21 Danish roasters</span>
        <span className="pc-title">Find your next cup</span>
      </div>
      <div className="pc-search">
        <SearchIcon />
        <span className="pc-search__ph">Coffee, roaster, flavor</span>
        <span className="pc-search__filter">
          <SlidersHorizontal size={18} strokeWidth={1.8} />
        </span>
      </div>
      <div className="pc-chips">
        {['For you', 'Fruity', 'Chocolate', 'Floral', 'Nutty'].map((c, i) => (
          <span key={c} className="pc-chip" data-on={i === 0 || undefined}>{c}</span>
        ))}
      </div>
      <div className="pc-carousel">
        <div className="pc-feature">
          <img src={daybreak} alt="" className="pc-feature__img" />
          <span className="pc-glass pc-feature__match">92% match</span>
          <span className="pc-glass pc-glass--round pc-feature__heart"><Heart size={18} strokeWidth={1.8} /></span>
          <div className="pc-feature__foot">
            <span className="pc-feature__roaster">Pontes Coffee · Honduras</span>
            <span className="pc-feature__name">Daybreak</span>
            <span className="pc-feature__notes">Nougat, toffee, baked apple</span>
            <span className="pc-feature__go"><ArrowUpRight size={20} strokeWidth={1.8} /></span>
          </div>
        </div>
        <div className="pc-feature pc-feature--peek">
          <img src={kigari} alt="" className="pc-feature__img" />
        </div>
      </div>
      <Nav active={0} />
    </div>
  )
}

/* ---------- Coffee ---------- */
function Coffee({ s, layout }: { s: S; layout: 'wide' | 'compact' }) {
  return (
    <div className="pc-screen pc-coffee" data-layout={layout}>
      <div className="pc-hero">
        <span className="pc-hero__floor" />
        <img src={guji} alt="" className="pc-hero__bag" />
        <span className="pc-glass pc-glass--round pc-hero__back"><ChevronLeft size={22} strokeWidth={1.8} /></span>
        <span className="pc-glass pc-glass--round pc-hero__heart"><Heart size={20} strokeWidth={1.8} /></span>
      </div>
      <div className="pc-sheet">
        <span className="pc-sheet__grab" />
        <div className="pc-sheet__top">
          <span className="pc-roaster">Kontra Coffee</span>
          <span className="pc-match">94% match</span>
        </div>
        <span className="pc-name">Ethiopia Guji</span>
        <span className="pc-meta">Ethiopia · Natural · Light roast · 2,000–2,200 m</span>

        <div className="pc-rate">
          <span className="pc-rate__label">Your rating</span>
          <span className="pc-rate__word">
            <States value={String(s.stars)} align="end" states={Object.fromEntries(RATING_WORDS.map((w, i) => [String(i), w]))} />
          </span>
          <div className="pc-rate__stars">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="pc-star" data-target={`star-${i}`} data-on={i <= s.stars || undefined} style={{ transitionDelay: `${i * 40}ms` }}>
                <Star size={34} strokeWidth={1.6} />
              </span>
            ))}
          </div>
        </div>

        <span className="pc-section">Tasting notes</span>
        <div className="pc-notes">
          <span className="pc-note"><i style={{ background: '#f4a36c' }} />Peach</span>
          <span className="pc-note"><i style={{ background: '#9bc25a' }} />Kiwi</span>
          <span className="pc-note"><i style={{ background: '#a8775a' }} />Milk chocolate</span>
        </div>

        <div className="pc-cta">
          <span className="pc-cta__roaster" aria-label="View at roaster"><ArrowUpRight size={22} strokeWidth={1.8} /></span>
          <span className="pc-cta__save" data-target="save" data-saved={s.saved || undefined}>
            <States
              value={s.saved ? 'saved' : 'save'}
              states={{
                save: <>Save to Journal</>,
                saved: (
                  <>
                    <Check size={20} strokeWidth={2.2} /> Saved to Journal
                  </>
                ),
              }}
            />
          </span>
        </div>
      </div>
    </div>
  )
}

/* ---------- Journal ---------- */
const GRID = [
  { img: kieni, name: 'Kieni', roaster: 'Coffee Collective', stars: 5 },
  { img: megadu, name: 'Megadu', roaster: 'La Cabra', stars: 4 },
  { img: twinRivers, name: 'Twin Rivers', roaster: 'Pontes Coffee', stars: 4, photo: true },
  { img: momentum, name: 'Momentum', roaster: 'Kaffevaerk', stars: 3 },
]

function Journal({ s }: { s: S }) {
  return (
    <div className="pc-screen pc-journal">
      <div className="pc-head">
        <span className="pc-eyebrow">
          <Roll delay={500}>{s.saved ? '5' : '4'}</Roll> coffees · <Roll delay={500}>{s.saved ? '4.0' : '4.0'}</Roll> average
        </span>
        <span className="pc-title">Journal</span>
      </div>
      <div className="pc-chips">
        {['All', 'Top rated', 'Fruity', 'Espresso'].map((c, i) => (
          <span key={c} className="pc-chip" data-on={i === 0 || undefined}>{c}</span>
        ))}
      </div>
      <div className="pc-flow">
      <Collapse open={s.saved} reveal="drop">
        <div className="pc-latest">
          <span className="pc-latest__thumb"><img src={guji} alt="" /></span>
          <span className="pc-latest__text">
            <span className="pc-latest__tag">Just rated</span>
            <span className="pc-latest__name">Ethiopia Guji</span>
            <span className="pc-latest__roaster">Kontra Coffee</span>
          </span>
          <Stars n={4} size={14} />
        </div>
      </Collapse>
      <div className="pc-grid">
        {GRID.map((c) => (
          <div key={c.name} className="pc-tile">
            <span className="pc-tile__img" data-photo={c.photo || undefined}>
              <img src={c.img} alt="" />
              <span className="pc-glass pc-tile__stars"><Star size={12} strokeWidth={0} fill="currentColor" /> {c.stars}</span>
            </span>
            <span className="pc-tile__name">{c.name}</span>
            <span className="pc-tile__roaster">{c.roaster}</span>
          </div>
        ))}
      </div>
      </div>
      <Nav active={1} />
    </div>
  )
}

// Snow: a fixed scatter (x %, y %, size px, soft), denser in the margins
const FLAKES: [number, number, number, boolean?][] = Array.from({ length: 90 }, (_, i) => {
  const rnd = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1
  const soft = rnd(3) > 0.78
  return [rnd(1) * 100, rnd(2) * 100, soft ? 10 + rnd(4) * 14 : 3 + rnd(4) * 4, soft]
})

export default function PicoV2() {
  return (
    <Stage<S>
      width={1240}
      height={820}
      compact={{ below: 900, width: 358, height: 700 }}
      initial={START}
      poster={POSTER}
      script={script}
      play="once"
      cursor={{ at: { wide: { x: 820, y: 700 }, compact: { x: 300, y: 600 } }, style: 'touch' }}
      className="pc"
    >
      {(s, _rect, layout) => (
        <>
          <div className="pc-snow">
            {FLAKES.map(([x, y, r, soft], i) => (
              <span key={i} className="pc-flake" data-soft={soft || undefined} style={{ left: `${x}%`, top: `${y}%`, width: r, height: r }} />
            ))}
          </div>
          {layout === 'wide' ? (
            <>
              <Phone width={340} className="pc-phone pc-phone--left"><Discover /></Phone>
              <Phone width={340} className="pc-phone pc-phone--right"><Journal s={s} /></Phone>
              <Phone width={360} className="pc-phone pc-phone--center"><Coffee s={s} layout={layout} /></Phone>
            </>
          ) : (
            <Phone width={310} className="pc-phone pc-phone--solo"><Coffee s={s} layout={layout} /></Phone>
          )}
        </>
      )}
    </Stage>
  )
}
