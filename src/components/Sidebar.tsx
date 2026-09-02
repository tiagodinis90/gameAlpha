import { useState } from "react";
import type { FactionId, GameState, NpcId, RelDim, SkillId } from "../game/types";
import { FACTIONS, NPCS, REL_DIMS, SKILLS } from "../game/types";
import { effectiveSkill } from "../game/engine";
import { QUEST_STAGES } from "../game/content";

type Tab = "self" | "bonds" | "fates" | "journal";

const TABS: { id: Tab; label: string; kanji: string }[] = [
  { id: "self", label: "Self", kanji: "己" },
  { id: "bonds", label: "Bonds", kanji: "縁" },
  { id: "fates", label: "Fates", kanji: "旗" },
  { id: "journal", label: "Journal", kanji: "書" },
];

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-[3px] w-full bg-ink-700">
      <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function FactionBar({ value }: { value: number }) {
  // -100..100 centred scale
  const half = Math.abs(value) / 2;
  return (
    <div className="relative h-[5px] w-full bg-ink-700">
      <div className="absolute left-1/2 top-0 h-full w-px bg-paper-700/60" />
      <div
        className="absolute top-0 h-full transition-all duration-700"
        style={{
          left: value >= 0 ? "50%" : `${50 - half}%`,
          width: `${half}%`,
          background: value >= 0 ? "#a9c29b" : "#cf5136",
        }}
      />
    </div>
  );
}

function SelfTab({ s }: { s: GameState }) {
  const attrs: { name: string; kanji: string; v: number }[] = [
    { name: "Body", kanji: "体", v: Math.round((effectiveSkill(s, "swordsmanship") + effectiveSkill(s, "willpower")) / 2) },
    { name: "Mind", kanji: "知", v: Math.round((effectiveSkill(s, "reason") + effectiveSkill(s, "lore")) / 2) },
    { name: "Spirit", kanji: "魂", v: Math.round((effectiveSkill(s, "empathy") + effectiveSkill(s, "willpower")) / 2) },
    { name: "Presence", kanji: "在", v: Math.round((effectiveSkill(s, "persuasion") + effectiveSkill(s, "deception")) / 2) },
  ];
  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="font-display text-base font-bold text-paper-100">Circuit Archivist</div>
        <div className="font-body text-[11px] italic text-paper-700">of the Capital Records Office</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {s.traits.map((t) => (
            <span key={t} className="border border-pine-600/60 bg-pine-600/10 px-1.5 py-0.5 font-body text-[10px] tracking-wider text-pine-400">{t}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {attrs.map((a) => (
          <div key={a.name} className="border border-ink-700 bg-ink-900/50 px-1 py-2 text-center">
            <div className="font-display text-lg font-bold text-gold-300">{a.v}</div>
            <div className="font-body text-[9px] uppercase tracking-wider text-paper-700">{a.kanji} {a.name}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-2 font-body text-[10px] uppercase tracking-[0.3em] text-paper-700">Skills · effective</div>
        <div className="flex flex-col gap-2">
          {(Object.keys(SKILLS) as SkillId[]).map((sk) => {
            const eff = effectiveSkill(s, sk);
            const base = s.skills[sk];
            return (
              <div key={sk}>
                <div className="mb-0.5 flex items-baseline justify-between">
                  <span className="font-body text-[11.5px] text-paper-300">
                    <span className="mr-1.5 font-display text-[11px]" style={{ color: SKILLS[sk].color }}>{SKILLS[sk].kanji}</span>
                    {SKILLS[sk].name}
                  </span>
                  <span className="font-display text-xs font-bold" style={{ color: eff !== base ? "#e8c97e" : "#ddd0b4" }}>
                    {eff}{eff !== base && <span className="text-[9px] text-paper-700"> ({base})</span>}
                  </span>
                </div>
                <Bar value={eff} max={10} color={SKILLS[sk].color} />
              </div>
            );
          })}
        </div>
      </div>

      {s.thoughts.length > 0 && (
        <div>
          <div className="mb-2 font-body text-[10px] uppercase tracking-[0.3em] text-paper-700">Thoughts internalised</div>
          <div className="flex flex-col gap-2">
            {s.thoughts.map((t) => (
              <div key={t.id} className="border border-gold-700/40 bg-ink-900/60 p-2.5">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-[12.5px] font-bold text-gold-300">{t.label}</span>
                  <span className="font-body text-[10px] text-moss-400">{t.d >= 0 ? `+${t.d}` : t.d} {SKILLS[t.skill].name}</span>
                </div>
                <p className="mt-1 font-body text-[10.5px] leading-relaxed text-paper-500 italic">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 font-body text-[10px] uppercase tracking-[0.3em] text-paper-700">Carried</div>
        {Object.keys(s.items).length === 0 ? (
          <p className="font-body text-[11px] italic text-paper-700">Only the writ, the brush, and the road.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {Object.entries(s.items).map(([id, label]) => (
              <div key={id} className="flex items-center gap-2 border border-ink-700 bg-ink-900/50 px-2 py-1.5">
                <span className="font-display text-sm text-gold-400">物</span>
                <span className="font-body text-[11.5px] leading-snug text-paper-300">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BondsTab({ s }: { s: GameState }) {
  return (
    <div className="flex flex-col gap-4">
      {(Object.keys(NPCS) as NpcId[]).map((id) => {
        const npc = NPCS[id];
        const rel = s.rel[id];
        const activeDims = (Object.keys(REL_DIMS) as RelDim[]).filter((d) => rel[d] !== 0);
        const mems = [...s.memories[id]].sort((a, b) => b.w - a.w).slice(0, 3);
        const met = activeDims.length > 0 || mems.length > 0;
        return (
          <div key={id} className={`border border-ink-700 bg-ink-900/40 p-3 transition-opacity ${met ? "" : "opacity-40"}`}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center border border-gold-700/50 bg-ink-800 font-display text-sm font-bold text-gold-400">
                {npc.kanji}
              </span>
              <div>
                <div className="font-display text-[13px] font-bold text-paper-100">{npc.name}</div>
                <div className="font-body text-[10px] text-paper-700">{met ? npc.role : "Not yet met"}</div>
              </div>
            </div>
            {met && activeDims.length > 0 && (
              <div className="mt-2.5 flex flex-col gap-1.5">
                {activeDims.map((d) => (
                  <div key={d} className="flex items-center gap-2">
                    <span className="w-16 font-body text-[10px] uppercase tracking-wider text-paper-500">{REL_DIMS[d].kanji} {REL_DIMS[d].name}</span>
                    <div className="flex-1"><Bar value={Math.abs(rel[d])} max={100} color={rel[d] >= 0 ? "#a9c29b" : "#cf5136"} /></div>
                    <span className={`w-8 text-right font-display text-[11px] font-bold ${rel[d] >= 0 ? "text-moss-400" : "text-shu-300"}`}>{rel[d]}</span>
                  </div>
                ))}
              </div>
            )}
            {mems.length > 0 && (
              <div className="mt-2.5 border-t border-ink-700 pt-2">
                <div className="font-body text-[9px] uppercase tracking-[0.3em] text-paper-700">They remember</div>
                {mems.map((m, i) => (
                  <p key={i} className="mt-1 font-body text-[10.5px] leading-relaxed text-paper-500 italic">“{m.text}”</p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FatesTab({ s }: { s: GameState }) {
  return (
    <div className="flex flex-col gap-4">
      {(Object.keys(FACTIONS) as FactionId[]).map((id) => {
        const f = FACTIONS[id];
        const hidden = f.hiddenUntil && !(f.hiddenUntil in s.knowledge);
        if (hidden) return null;
        const v = s.factions[id];
        const stance = v >= 40 ? "Favourable" : v >= 15 ? "Warm" : v > -15 ? "Wary" : v > -40 ? "Cold" : "Hostile";
        return (
          <div key={id} className="border border-ink-700 bg-ink-900/40 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display text-base text-gold-400">{f.kanji}</span>
                <span className="font-display text-[13px] font-bold text-paper-100">{f.name}</span>
              </div>
              <span className={`font-body text-[10px] uppercase tracking-[0.2em] ${v >= 15 ? "text-moss-400" : v <= -15 ? "text-shu-300" : "text-paper-700"}`}>{stance}</span>
            </div>
            <div className="mt-2.5"><FactionBar value={v} /></div>
            <div className="mt-1 flex justify-between font-body text-[9px] uppercase tracking-wider text-paper-700">
              <span>hostile</span>
              <span className="font-display text-[11px] normal-case text-paper-300">{v > 0 ? `+${v}` : v}</span>
              <span>favour</span>
            </div>
          </div>
        );
      })}
      <p className="font-body text-[10.5px] leading-relaxed text-paper-700 italic">
        Choices can move several banners at once. A village's gratitude and a guild's grievance are often the same coin.
      </p>
    </div>
  );
}

function JournalTab({ s }: { s: GameState }) {
  const quests = Object.entries(s.quests);
  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-2 font-body text-[10px] uppercase tracking-[0.3em] text-paper-700">Quests</div>
        {quests.length === 0 && <p className="font-body text-[11px] italic text-paper-700">No thread pulled yet.</p>}
        <div className="flex flex-col gap-3">
          {quests.map(([id, q]) => {
            const stages = QUEST_STAGES[id] ?? [];
            return (
              <div key={id} className="border border-ink-700 bg-ink-900/40 p-3">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-[13px] font-bold text-gold-300">{q.title}</span>
                  <span className={`font-body text-[9px] uppercase tracking-[0.25em] ${q.status === "done" ? "text-moss-400" : "text-shu-300"}`}>
                    {q.status === "done" ? "resolved" : "active"}
                  </span>
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  {stages.map((st, i) => {
                    const done = q.status === "done" || q.stage > i;
                    const current = q.status === "active" && q.stage === i;
                    return (
                      <div key={i} className="flex gap-2">
                        <span className={`font-display text-[11px] ${done ? "text-moss-400" : current ? "text-gold-400" : "text-ink-500"}`}>
                          {done ? "✓" : current ? "◈" : "○"}
                        </span>
                        <span className={`font-body text-[11px] leading-snug ${done ? "text-paper-500 line-through decoration-ink-600" : current ? "text-paper-100" : "text-ink-500"}`}>{st}</span>
                      </div>
                    );
                  })}
                </div>
                {q.outcome && <p className="mt-2 border-t border-ink-700 pt-1.5 font-body text-[10.5px] italic text-gold-300/90">{q.outcome}</p>}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 font-body text-[10px] uppercase tracking-[0.3em] text-paper-700">
          Knowledge · {Object.keys(s.knowledge).length} threads
        </div>
        {Object.keys(s.knowledge).length === 0 ? (
          <p className="font-body text-[11px] italic text-paper-700">The record is still blank. Watch, listen, doubt.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {Object.entries(s.knowledge).map(([id, label]) => (
              <div key={id} className="flex gap-2 border border-ink-700 bg-ink-900/40 px-2.5 py-2">
                <span className="font-display text-[11px] text-gold-400">知</span>
                <p className="font-body text-[11px] leading-relaxed text-paper-300">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({ state }: { state: GameState }) {
  const [tab, setTab] = useState<Tab>("self");
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid grid-cols-4 border-b border-ink-700">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-col items-center gap-0.5 py-2.5 transition-colors duration-200 ${
              tab === t.id ? "bg-ink-800 text-gold-300" : "text-paper-700 hover:bg-ink-850 hover:text-paper-300"
            }`}
          >
            <span className="font-display text-base leading-none">{t.kanji}</span>
            <span className="font-body text-[9px] uppercase tracking-[0.2em]">{t.label}</span>
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3.5">
        {tab === "self" && <SelfTab s={state} />}
        {tab === "bonds" && <BondsTab s={state} />}
        {tab === "fates" && <FatesTab s={state} />}
        {tab === "journal" && <JournalTab s={state} />}
      </div>
    </div>
  );
}
