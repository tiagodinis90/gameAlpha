import { contentErrors } from "../game/content";
import { NODES } from "../game/content";

interface Props {
  onBack: () => void;
}

const LAYERS = [
  { name: "CONTENT DATA", kanji: "文", desc: "All narrative lives in data: dialogue nodes, voices, choices, conditions, effects, quest stages. Nothing is hard-coded into logic." },
  { name: "GAME STATE", kanji: "状", desc: "One authoritative, serialisable state: flags, knowledge, skills, relationships, memories, factions, quests, time, log." },
  { name: "SYSTEMS", kanji: "系", desc: "Pure services — condition evaluator, effect applier, 2d6 skill-check engine with modifier pipeline, time & weather, validation." },
  { name: "EVENTS", kanji: "事", desc: "Transitions are discrete actions (enter node, choose, voice, roll). State never mutates from the presentation layer." },
  { name: "PRESENTATION", kanji: "表", desc: "Dialogue stream, dice overlay, sidebar panels read state and send intent. UI owns pixels, never truth." },
];

const SYSTEMS: { group: string; items: [string, boolean][] }[] = [
  {
    group: "Narrative engine",
    items: [
      ["Data-driven dialogue graph (nodes, choices, effects)", true],
      ["Disco-style vertical log with hyperlinked choices", true],
      ["Internal voices — skill-gated, trait-gated, probabilistic", true],
      ["16 condition types incl. ALL / ANY / NOT composition", true],
      ["14 effect types incl. memory, thought, faction, ending", true],
      ["Content validation fails loudly on broken references", true],
    ],
  },
  {
    group: "RPG systems",
    items: [
      ["8 skills · 4 attributes · traits · 3 origin builds", true],
      ["Central 2d6 skill-check service (no scattered dice)", true],
      ["Outcomes: crit fail / fail / partial / success / crit success", true],
      ["Modifier pipeline: situational + conditional + weather + thoughts", true],
      ["Thought system with mechanical & narrative effects", true],
      ["Knowledge as epistemic state, distinct from items", true],
    ],
  },
  {
    group: "World simulation",
    items: [
      ["Multi-dimensional relationships (trust, respect, fear…)", true],
      ["NPC memory — weighted, dated, surfaced in Bonds", true],
      ["Factions with persistent reputation (incl. hidden faction)", true],
      ["Logical world clock: day, period, NPC schedule gates", true],
      ["Weather (clear / fog / rain) that alters checks", true],
      ["World flags that change locations & available content", true],
    ],
  },
  {
    group: "Persistence",
    items: [
      ["Versioned logical-state save (autosave + continue)", true],
      ["Migration chain stub for future save versions", true],
      ["Ending meta persists across stories", true],
      ["5 endings from one quest via branch → convergence", true],
    ],
  },
];

export default function CodexView({ onBack }: Props) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,162,75,0.06),transparent_60%)]" />
      <div className="relative z-10 mx-auto h-full max-w-5xl overflow-y-auto px-6 py-10 md:px-10">
        <button
          onClick={onBack}
          className="font-body text-xs uppercase tracking-[0.3em] text-paper-700 transition-colors hover:text-gold-400"
        >
          ← Back to the gate
        </button>
        <h2 className="font-display mt-4 text-4xl font-bold tracking-wide text-paper-100 md:text-5xl">
          Architecture <span className="text-gold-400">架構</span>
        </h2>
        <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-paper-500">
          This slice is a browser implementation of a data-driven narrative RPG architecture:
          simulation and state are separated from presentation, content is pure data, systems are
          pure and testable, and every persistent fact has a stable namespaced identity.
        </p>

        {/* layer diagram */}
        <div className="mt-10 flex flex-col gap-0">
          {LAYERS.map((l, i) => (
            <div key={l.name} className="group relative flex items-stretch gap-5 border-l border-ink-600 pl-6 pb-8 last:pb-0">
              <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rotate-45 border border-gold-500 bg-ink-900 transition-colors duration-300 group-hover:bg-gold-500" />
              <div className="w-10 shrink-0 pt-0.5">
                <span className="font-display text-2xl text-gold-400">{l.kanji}</span>
              </div>
              <div>
                <div className="font-display text-sm font-bold tracking-[0.25em] text-paper-100">
                  {String(i + 1).padStart(2, "0")} · {l.name}
                </div>
                <p className="mt-1 max-w-xl font-body text-[12.5px] leading-relaxed text-paper-500">{l.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* systems matrix */}
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {SYSTEMS.map((g) => (
            <div key={g.group} className="bracketed panel-lacquer p-5">
              <div className="font-display text-sm font-bold tracking-[0.2em] text-gold-300">{g.group.toUpperCase()}</div>
              <ul className="mt-3 flex flex-col gap-1.5">
                {g.items.map(([label, ok]) => (
                  <li key={label} className="flex items-start gap-2.5">
                    <span className={`mt-0.5 font-display text-[11px] ${ok ? "text-moss-400" : "text-ink-500"}`}>{ok ? "✓" : "○"}</span>
                    <span className="font-body text-[12px] leading-snug text-paper-300">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* validation report */}
        <div className="bracketed panel-lacquer mt-4 p-5">
          <div className="flex items-center justify-between">
            <div className="font-display text-sm font-bold tracking-[0.2em] text-gold-300">CONTENT VALIDATION REPORT</div>
            <div className="font-body text-[11px] text-paper-700">{Object.keys(NODES).length} nodes authored</div>
          </div>
          {contentErrors.length === 0 ? (
            <p className="mt-3 flex items-center gap-2 font-body text-[12.5px] text-moss-400">
              <span className="font-display">✓</span> All node references resolve. No missing speakers, duplicates, or broken next-node links.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1">
              {contentErrors.map((e, i) => (
                <li key={i} className="font-body text-[12px] text-shu-300">✗ {e}</li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-10 pb-6 text-center font-body text-[10px] uppercase tracking-[0.4em] text-paper-700/70">
          call down · signal up · the world remembers
        </p>
      </div>
    </div>
  );
}
