import { Fragment, useEffect, useMemo, useRef } from "react";
import type { Choice, GameState, LogEntry } from "../game/types";
import { SKILLS } from "../game/types";
import { checkChance, difficultyLabel, evaluate } from "../game/engine";

/* ------------------------- tiny BBCode-ish formatter ------------------------ */

function fmt(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) parts.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
    else parts.push(<em key={k++}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>);
}

/* ------------------------------- entry views ------------------------------- */

function EntryView({ e }: { e: LogEntry }) {
  switch (e.kind) {
    case "narr":
      return (
        <div className="anim-fade-up prose-game font-display text-[15px] leading-[1.9] text-paper-300/90">
          {fmt(e.text)}
        </div>
      );
    case "npc":
      return (
        <div className="anim-fade-up">
          <div className="mb-1.5 flex items-baseline gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center border border-gold-700/50 bg-ink-800 font-display text-xs font-bold text-gold-400">
              {e.kanji ?? "話"}
            </span>
            <span className="font-display text-sm font-bold tracking-[0.12em] text-gold-300 uppercase">{e.speaker}</span>
            <span className="h-px flex-1 bg-gradient-to-r from-gold-700/40 to-transparent" />
          </div>
          <p className="prose-game pl-8 font-body text-[14.5px] leading-[1.85] text-paper-100/95">{fmt(e.text)}</p>
        </div>
      );
    case "player":
      return (
        <div className="anim-fade-up">
          <div className="mb-1.5 flex items-baseline gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center border border-shu-500/60 bg-shu-700/25 font-display text-xs font-bold text-shu-300">
              汝
            </span>
            <span className="font-display text-sm font-bold tracking-[0.12em] text-shu-300 uppercase">You</span>
            <span className="h-px flex-1 bg-gradient-to-r from-shu-700/40 to-transparent" />
          </div>
          <p className="prose-game pl-8 font-body text-[14.5px] leading-[1.85] text-paper-300 italic">{fmt(e.text)}</p>
        </div>
      );
    case "voice": {
      const sk = e.skill ? SKILLS[e.skill] : null;
      return (
        <div className="anim-voice-in my-1 border-l-2 py-1 pl-4" style={{ borderColor: sk?.color ?? "#888" }}>
          <div className="mb-0.5 flex items-center gap-2">
            <span className="font-display text-[11px] font-bold tracking-[0.25em] uppercase" style={{ color: sk?.color }}>
              {sk?.kanji} {sk?.name}
            </span>
          </div>
          <p className="font-body text-[13.5px] leading-relaxed italic" style={{ color: `${sk?.color}cc` }}>
            {fmt(e.text)}
          </p>
        </div>
      );
    }
    case "system":
      return (
        <div className="anim-fade-up my-1 flex items-center gap-3">
          <span className="h-px w-8 bg-ink-600" />
          <p className={`font-body text-[11px] uppercase tracking-[0.22em] ${e.tone === "good" ? "text-moss-400" : e.tone === "bad" ? "text-shu-300" : "text-paper-700"}`}>
            {e.text}
          </p>
          <span className="h-px flex-1 bg-ink-600" />
        </div>
      );
    case "chapter":
      return (
        <div className="anim-fade-up my-3 text-center">
          <span className="anim-brush inline-block border-b-2 border-gold-500/70 px-2 pb-1 font-display text-sm font-bold tracking-[0.2em] text-gold-300">
            {e.text}
          </span>
        </div>
      );
    case "know":
      return (
        <div className="anim-stamp my-2 inline-flex items-center gap-2.5 self-start border border-gold-700/60 bg-ink-800/80 px-3 py-2">
          <span className="flex h-7 w-7 rotate-[-8deg] items-center justify-center border-2 border-gold-500 font-display text-xs font-bold text-gold-400">
            知
          </span>
          <p className="max-w-md font-body text-[12.5px] leading-snug text-gold-300">{e.text}</p>
        </div>
      );
    case "check": {
      const sk = e.skill ? SKILLS[e.skill] : null;
      const good = e.tone === "good";
      return (
        <div className="anim-stamp my-2 inline-flex items-center gap-3 self-start border px-3 py-2" style={{ borderColor: good ? "rgba(169,194,155,0.5)" : "rgba(207,81,54,0.55)", background: "rgba(13,11,9,0.8)" }}>
          <span
            className="flex h-7 w-7 rotate-[-8deg] items-center justify-center border-2 font-display text-[10px] font-bold"
            style={{ borderColor: good ? "#a9c29b" : "#cf5136", color: good ? "#a9c29b" : "#cf5136" }}
          >
            {sk?.kanji ?? "判"}
          </span>
          <p className="font-body text-[12px] tracking-wide" style={{ color: good ? "#c8d8bd" : "#e0907c" }}>
            {e.text}
          </p>
        </div>
      );
    }
  }
}

/* ------------------------------ choices panel ------------------------------ */

interface ChoicePanelProps {
  state: GameState;
  choices: Choice[];
  onPick: (c: Choice) => void;
  done: boolean;
  endingKanji?: string;
  endingTitle?: string;
  onLeave: () => void;
}

export function ChoicePanel({ state, choices, onPick, done, endingKanji, endingTitle, onLeave }: ChoicePanelProps) {
  if (done) {
    return (
      <div className="anim-fade-up mx-auto max-w-xl pb-2 pt-4 text-center">
        <div className="font-display text-[11px] uppercase tracking-[0.5em] text-paper-700">The record closes on</div>
        <div className="mt-3 flex items-center justify-center gap-4">
          <span className="anim-hanko flex h-14 w-14 items-center justify-center border-2 border-shu-500 bg-shu-500/85 font-display text-2xl font-bold text-paper-100">
            {endingKanji ?? "終"}
          </span>
          <span className="font-display text-3xl font-bold tracking-wide text-paper-100">{endingTitle ?? "An Ending"}</span>
        </div>
        <button
          onClick={onLeave}
          className="group bracketed panel-lacquer mx-auto mt-6 flex items-center justify-between px-8 py-3.5 transition-all duration-300 hover:border-shu-400"
        >
          <span className="font-display text-sm font-bold tracking-[0.3em] text-paper-100">RETURN TO THE ROAD</span>
          <span className="ml-6 text-shu-400 transition-transform duration-300 group-hover:translate-x-1">→</span>
        </button>
      </div>
    );
  }

  const visible = choices
    .map((c, idx) => ({ c, idx, ok: evaluate(state, c.cond) }))
    .filter((x) => x.ok || x.c.locked);

  return (
    <div className="pt-3">
      <div className="mb-2 flex items-center gap-3">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-ink-500 to-ink-500" />
        <span className="font-body text-[10px] uppercase tracking-[0.4em] text-paper-700">What do you do</span>
        <span className="h-px flex-1 bg-ink-500" />
      </div>
      <div className="flex flex-col gap-1">
        {visible.map(({ c, idx, ok }, order) => {
          const chance = c.check ? checkChance(state, c.check) : null;
          const sk = c.check ? SKILLS[c.check.skill] : null;
          if (!ok) {
            return (
              <div key={c.id} className="group/choice flex cursor-not-allowed items-start gap-3 px-3 py-2 opacity-45">
                <span className="mt-0.5 font-display text-xs font-bold text-ink-500">{order + 1}</span>
                <div>
                  <div className="flex items-center gap-2 font-body text-[13.5px] text-paper-700">
                    <svg width="11" height="12" viewBox="0 0 11 12" fill="none" className="shrink-0">
                      <rect x="1" y="5" width="9" height="6.5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M3 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    {c.text}
                  </div>
                  {c.locked && <div className="mt-0.5 pl-5 font-body text-[11px] italic text-paper-700">{c.locked}</div>}
                </div>
              </div>
            );
          }
          return (
            <button
              key={c.id}
              onClick={() => onPick(c)}
              className="group/choice flex items-start gap-3 px-3 py-2 text-left transition-all duration-200 hover:bg-ink-800/70 hover:pl-5"
            >
              <span className="mt-0.5 font-display text-xs font-bold text-shu-400/80 transition-colors group-hover/choice:text-shu-300">
                {order + 1}
              </span>
              <span className="flex-1">
                <span className="choice-brush font-body text-[13.5px] leading-snug text-paper-100/90 transition-colors group-hover/choice:text-paper-100">
                  {c.text}
                </span>
                {c.check && sk && chance !== null && (
                  <span className="mt-1 flex flex-wrap items-center gap-2">
                    <span
                      className="border px-1.5 py-0.5 font-display text-[10px] font-bold tracking-[0.18em]"
                      style={{ borderColor: `${sk.color}88`, color: sk.color }}
                    >
                      {sk.kanji} {sk.name.toUpperCase()}
                    </span>
                    <span className="font-body text-[11px] uppercase tracking-[0.15em] text-paper-700">
                      {difficultyLabel(chance)} {c.check.dc}
                    </span>
                    <span className={`font-display text-xs font-bold ${chance >= 55 ? "text-moss-400" : chance >= 25 ? "text-gold-400" : "text-shu-300"}`}>
                      {chance}%
                    </span>
                    <span className="font-body text-[10px] italic text-paper-700/80">— failure opens another road</span>
                  </span>
                )}
              </span>
              <span className="mt-1 font-display text-sm text-gold-500 opacity-0 transition-all duration-200 group-hover/choice:translate-x-0.5 group-hover/choice:opacity-100">
                →
              </span>
            </button>
          );
        })}
        {visible.length === 0 && (
          <p className="px-3 py-2 font-body text-sm italic text-paper-700">(The road offers nothing here. Turn back.)</p>
        )}
      </div>
      <div className="mt-2 flex justify-end pr-3">
        <span className="font-body text-[10px] uppercase tracking-[0.3em] text-ink-500">keys 1–{Math.max(visible.length, 1)} choose</span>
      </div>
    </div>
  );
}

/* -------------------------------- main log --------------------------------- */

interface Props {
  state: GameState;
  choices: Choice[];
  onPick: (c: Choice) => void;
  done: boolean;
  endingKanji?: string;
  endingTitle?: string;
  onLeave: () => void;
}

export default function DialogueLog({ state, choices, onPick, done, endingKanji, endingTitle, onLeave }: Props) {
  const tailRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const entryCount = state.log.length;
  const nodeId = state.nodeId;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // smooth, bottom-anchored scroll whenever new text arrives
    const t = window.setTimeout(() => {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      tailRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
    }, 40);
    return () => window.clearTimeout(t);
  }, [entryCount, nodeId, done]);

  const entries = useMemo(() => state.log.slice(-160), [state.log]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 pt-6 md:px-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {entries.map((e) => (
            <EntryView key={e.key} e={e} />
          ))}
          <div ref={tailRef} className="h-px" />
        </div>
        <div className="mx-auto max-w-2xl pb-6">
          <ChoicePanel
            state={state}
            choices={choices}
            onPick={onPick}
            done={done}
            endingKanji={endingKanji}
            endingTitle={endingTitle}
            onLeave={onLeave}
          />
        </div>
      </div>
    </div>
  );
}
