import { useEffect, useState } from "react";
import type { Choice, RollResult } from "../game/types";
import { SKILLS } from "../game/types";
import { OUTCOME_LABEL } from "../game/engine";

function DiceFace({ n, rolling }: { n: number; rolling: boolean }) {
  const pipMap: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
    6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]],
  };
  return (
    <div className={`dice-face relative h-20 w-20 md:h-24 md:w-24 ${rolling ? "anim-dice" : ""}`}>
      {(pipMap[n] ?? pipMap[6]).map(([x, y], i) => (
        <span
          key={i}
          className="absolute h-[13%] w-[13%] rounded-full bg-ink-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.7)]"
          style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
        />
      ))}
    </div>
  );
}

interface Props {
  choice: Choice;
  roll: RollResult;
  onContinue: () => void;
}

export default function SkillCheckOverlay({ choice, roll, onContinue }: Props) {
  const check = choice.check!;
  const sk = SKILLS[check.skill];
  const [phase, setPhase] = useState<"rolling" | "done">("rolling");
  const [d1, setD1] = useState(roll.d1);
  const [d2, setD2] = useState(roll.d2);

  useEffect(() => {
    let ticks = 0;
    const iv = window.setInterval(() => {
      ticks += 1;
      setD1(1 + Math.floor(Math.random() * 6));
      setD2(1 + Math.floor(Math.random() * 6));
      if (ticks >= 14) {
        window.clearInterval(iv);
        setD1(roll.d1);
        setD2(roll.d2);
        setPhase("done");
      }
    }, 70);
    return () => window.clearInterval(iv);
  }, [roll]);

  useEffect(() => {
    if (phase !== "done") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") onContinue();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onContinue]);

  const pass = roll.pass;
  const resultColor = roll.outcome === "crit-fail" || roll.outcome === "fail" ? "#cf5136" : roll.outcome === "partial" ? "#d9b36a" : "#a9c29b";

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-[3px]">
      <div className="bracketed panel-lacquer anim-fade-up w-full max-w-lg px-6 py-7 md:px-8">
        <div className="flex items-baseline justify-between">
          <span className="font-body text-[10px] uppercase tracking-[0.5em] text-paper-700">Challenge</span>
          <span className="font-display text-xs tracking-[0.2em] text-paper-700">二六骰 · 2d6</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <span className="font-display text-3xl font-bold" style={{ color: sk.color }}>{sk.kanji}</span>
          <div>
            <div className="font-display text-xl font-bold tracking-wide text-paper-100">{sk.name}</div>
            <div className="font-body text-[11px] italic text-paper-500">{sk.blurb}</div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-6">
          <DiceFace n={d1} rolling={phase === "rolling"} />
          <span className="font-display text-2xl text-paper-700">+</span>
          <DiceFace n={d2} rolling={phase === "rolling"} />
          <div className="ml-2 text-left">
            <div className="font-display text-3xl font-extrabold text-paper-100">
              {phase === "done" ? roll.total : "··"}
            </div>
            <div className="font-body text-[10px] uppercase tracking-[0.25em] text-paper-700">vs {roll.dc}</div>
          </div>
        </div>

        {/* breakdown */}
        <div className="mt-5 border-t border-ink-700 pt-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-body text-[12px]">
            <div className="flex justify-between"><span className="text-paper-500">{sk.name} (base + situational)</span><span className="text-paper-100">{roll.effective}</span></div>
            {roll.mods.map((m, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-paper-700">{m.label}</span>
                <span className={m.d >= 0 ? "text-moss-400" : "text-shu-300"}>{m.d >= 0 ? `+${m.d}` : m.d}</span>
              </div>
            ))}
            <div className="flex justify-between"><span className="text-paper-500">Dice</span><span className="text-paper-100">{phase === "done" ? `${roll.d1} + ${roll.d2}` : "rolling…"}</span></div>
          </div>
          {roll.outcome === "crit-fail" && (
            <p className="mt-2 font-body text-[11px] italic text-shu-300/90">Snake eyes. The dice themselves refuse.</p>
          )}
          {roll.outcome === "crit-success" && (
            <p className="mt-2 font-body text-[11px] italic text-moss-400/90">Boxcars. The mountain leans in to watch.</p>
          )}
        </div>

        {/* result stamp */}
        <div className="mt-5 flex min-h-[64px] items-center justify-center">
          {phase === "done" ? (
            <div
              className="anim-stamp border-[3px] px-5 py-1.5 font-display text-xl font-extrabold tracking-[0.2em]"
              style={{ borderColor: resultColor, color: resultColor, textShadow: `0 0 24px ${resultColor}55` }}
            >
              {OUTCOME_LABEL[roll.outcome]}
            </div>
          ) : (
            <div className="anim-pulse-glow font-body text-[11px] uppercase tracking-[0.4em] text-paper-700">the dice decide…</div>
          )}
        </div>

        <button
          onClick={onContinue}
          disabled={phase !== "done"}
          className="group bracketed panel-lacquer mx-auto mt-4 flex items-center justify-between px-8 py-3 transition-all duration-300 enabled:hover:border-gold-400 disabled:opacity-40"
        >
          <span className="font-display text-sm font-bold tracking-[0.3em] text-paper-100">CONTINUE</span>
          <span className="ml-6 text-gold-400 transition-transform duration-300 group-hover:translate-x-1">→</span>
        </button>
      </div>
    </div>
  );
}
