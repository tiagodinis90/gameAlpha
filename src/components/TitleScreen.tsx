import { useMemo, useState } from "react";
import { BUILDS } from "../game/engine";
import type { GameState } from "../game/types";
import { ENDINGS } from "../game/content";
import { IMG_TITLE } from "./images";
import Ambient from "./Ambient";

interface Props {
  hasSaveData: boolean;
  endingsFound: { id: string; title: string }[];
  onNew: (buildId: string) => void;
  onContinue: () => void;
  onCodex: () => void;
}

export default function TitleScreen({ hasSaveData, endingsFound, onNew, onContinue, onCodex }: Props) {
  const [view, setView] = useState<"menu" | "build">("menu");
  const [preview, setPreview] = useState<string>(BUILDS[0].id);

  const build = BUILDS.find((b) => b.id === preview) ?? BUILDS[0];
  const previewSkills = useMemo(() => {
    const skills = { perception: 5, reason: 4, empathy: 4, willpower: 3, lore: 3, persuasion: 3, deception: 2, swordsmanship: 2 } as GameState["skills"];
    for (const [k, v] of Object.entries(build.bonuses)) skills[k as keyof typeof skills] += v ?? 0;
    return skills;
  }, [build]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-ink-950">
      {/* background */}
      <div className="absolute inset-0">
        <img src={IMG_TITLE} alt="" className="anim-kenburns h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/30 to-ink-950/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/80 via-transparent to-ink-950/50" />
      </div>
      <Ambient embers={26} mist />

      {/* vertical title column */}
      <div className="pointer-events-none absolute right-6 top-0 hidden h-full flex-col items-center gap-6 md:flex lg:right-14">
        <div className="vertical-jp font-display text-6xl font-bold tracking-[0.35em] text-paper-100/90 text-shadow-hard lg:text-7xl">
          霧伏
        </div>
        <div className="h-24 w-px bg-gradient-to-b from-gold-500/70 to-transparent" />
        <div className="vertical-jp font-body text-xs tracking-[0.5em] text-gold-400/80">山は覚えている</div>
      </div>

      {/* hanko seal */}
      <div className="pointer-events-none absolute right-8 top-8 hidden md:block lg:right-16">
        <div className="anim-hanko flex h-14 w-14 items-center justify-center rounded-sm border-2 border-shu-500 bg-shu-500/90 shadow-[0_0_30px_rgba(185,62,40,0.4)]">
          <span className="font-display text-2xl font-bold text-paper-100">伏</span>
        </div>
      </div>

      <div className="relative z-10 flex h-full flex-col items-start justify-center px-8 md:px-16 lg:px-24">
        {view === "menu" ? (
          <div className="anim-fade-up max-w-2xl">
            <p className="font-body text-xs font-medium tracking-[0.6em] text-gold-400">A NARRATIVE RPG VERTICAL SLICE</p>
            <h1 className="anim-title font-display mt-4 text-6xl font-extrabold leading-none tracking-[0.14em] text-paper-100 text-shadow-hard md:text-8xl">
              KIRIFUSHI
            </h1>
            <p className="font-display mt-3 text-lg font-medium text-paper-300/90 md:text-xl">
              霧伏 · <span className="italic text-gold-300">The Mistbound Shrine</span>
            </p>
            <p className="mt-6 max-w-lg font-body text-sm leading-relaxed text-paper-500">
              A mountain village with forty perfect harvests, a road sealed with rope, and a circuit
              archivist whose only weapon is the record. The world remembers what you do. Your mind
              will not stay quiet about it.
            </p>

            <div className="mt-10 flex flex-col gap-3">
              <button
                onClick={() => setView("build")}
                className="group bracketed panel-lacquer flex w-72 items-center justify-between px-5 py-3.5 text-left transition-all duration-300 hover:translate-x-1 hover:border-gold-400/60"
              >
                <span className="font-display text-lg font-semibold tracking-[0.2em] text-paper-100">NEW STORY</span>
                <span className="font-display text-gold-500 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
              {hasSaveData && (
                <button
                  onClick={onContinue}
                  className="group bracketed panel-lacquer flex w-72 items-center justify-between px-5 py-3.5 text-left transition-all duration-300 hover:translate-x-1 hover:border-gold-400/60"
                >
                  <span className="font-display text-lg font-semibold tracking-[0.2em] text-paper-100">CONTINUE</span>
                  <span className="font-display text-gold-500 transition-transform duration-300 group-hover:translate-x-1">→</span>
                </button>
              )}
              <button
                onClick={onCodex}
                className="group bracketed panel-lacquer flex w-72 items-center justify-between px-5 py-3.5 text-left transition-all duration-300 hover:translate-x-1 hover:border-gold-400/60"
              >
                <span className="font-display text-lg font-semibold tracking-[0.2em] text-paper-100">ARCHITECTURE</span>
                <span className="font-display text-gold-500 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            </div>

            <div className="mt-12 flex items-center gap-4">
              <span className="font-body text-[11px] uppercase tracking-[0.3em] text-paper-700">Endings found</span>
              <div className="flex gap-2">
                {ENDINGS.map((e) => {
                  const found = endingsFound.some((f) => f.id === e.id);
                  return (
                    <div
                      key={e.id}
                      title={found ? e.title : "Undiscovered"}
                      className={`flex h-9 w-9 items-center justify-center border font-display text-sm transition-colors duration-500 ${
                        found
                          ? "border-shu-500/80 bg-shu-700/30 text-paper-100"
                          : "border-ink-600 bg-ink-900/60 text-ink-600"
                      }`}
                    >
                      {found ? e.kanji : "？"}
                    </div>
                  );
                })}
              </div>
              <span className="font-body text-xs text-paper-700">{endingsFound.length} / {ENDINGS.length}</span>
            </div>
          </div>
        ) : (
          <div className="anim-fade-up max-w-3xl">
            <button
              onClick={() => setView("menu")}
              className="font-body text-xs uppercase tracking-[0.3em] text-paper-700 transition-colors hover:text-gold-400"
            >
              ← Back to the gate
            </button>
            <h2 className="font-display mt-4 text-4xl font-bold tracking-wide text-paper-100 md:text-5xl">
              Who walks the road?
            </h2>
            <p className="mt-2 font-body text-sm text-paper-500">
              Your past shapes your skills, your traits, and which inner voices speak loudest.
            </p>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {BUILDS.map((b) => {
                const active = preview === b.id;
                return (
                  <button
                    key={b.id}
                    onMouseEnter={() => setPreview(b.id)}
                    onClick={() => setPreview(b.id)}
                    className={`bracketed group relative px-5 py-5 text-left transition-all duration-300 ${
                      active ? "panel-lacquer translate-y-[-4px] border-gold-400/60" : "border border-ink-700 bg-ink-900/50 hover:border-ink-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`font-display text-3xl transition-colors ${active ? "text-gold-300" : "text-ink-500"}`}>{b.kanji}</span>
                      {active && <span className="anim-pulse-glow h-2 w-2 rounded-full bg-shu-400" />}
                    </div>
                    <div className="font-display mt-2 text-base font-bold leading-tight text-paper-100">{b.name}</div>
                    <p className="mt-2 font-body text-xs leading-relaxed text-paper-500">{b.desc}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {b.traits.map((t) => (
                        <span key={t} className="border border-pine-600/60 bg-pine-600/10 px-1.5 py-0.5 font-body text-[10px] tracking-wider text-pine-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bracketed panel-lacquer mt-6 px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="font-body text-[11px] uppercase tracking-[0.3em] text-paper-700">Starting record</span>
                <span className="font-display text-sm text-gold-400">{build.name}</span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-x-6 gap-y-2 md:grid-cols-8">
                {(Object.keys(previewSkills) as (keyof typeof previewSkills)[]).map((sk) => (
                  <div key={sk} className="text-center">
                    <div className="font-display text-lg font-bold text-paper-100">{previewSkills[sk]}</div>
                    <div className="font-body text-[10px] uppercase tracking-wider text-paper-700">{sk.slice(0, 6)}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNew(build.id)}
              className="group bracketed panel-lacquer mt-8 flex items-center justify-between border-shu-700/60 px-8 py-4 transition-all duration-300 hover:border-shu-400 hover:shadow-[0_0_40px_rgba(185,62,40,0.25)]"
            >
              <span className="font-display text-lg font-bold tracking-[0.25em] text-paper-100">BEGIN THE CIRCUIT</span>
              <span className="font-display text-xl text-shu-400 transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </button>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-4 left-0 right-0 z-10 flex justify-center">
        <p className="font-body text-[10px] uppercase tracking-[0.4em] text-paper-700/70">
          data-driven narrative engine · internal voices · 2d6 skill checks · npc memory · factions · save system
        </p>
      </div>

    </div>
  );
}
