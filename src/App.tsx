import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { Choice, GameState, RollResult, Voice } from "./game/types";
import { LOCS } from "./game/types";
import {
  appendVoice, choose, clearSave, clockOf, dayOf, enterFromId, evaluate, hasSave,
  loadEndingsMeta, loadGame, newGame, periodName, periodOf, rollCheck, saveGame, addEndingMeta, weatherOf,
} from "./game/engine";
import { ENDINGS, NODES } from "./game/content";
import TitleScreen from "./components/TitleScreen";
import CodexView from "./components/CodexView";
import DialogueLog from "./components/DialogueLog";
import Sidebar from "./components/Sidebar";
import SkillCheckOverlay from "./components/SkillCheckOverlay";
import Ambient from "./components/Ambient";
import { IMG_SHRINE, IMG_TITLE, IMG_VILLAGE } from "./components/images";

type Screen = "title" | "codex" | "game";

type Action =
  | { type: "NEW"; buildId: string }
  | { type: "LOAD"; state: GameState }
  | { type: "CHOOSE"; choice: Choice; roll: RollResult | null }
  | { type: "VOICE"; voice: Voice };

function reducer(prev: GameState | null, action: Action): GameState | null {
  switch (action.type) {
    case "NEW": {
      const fresh = newGame(action.buildId);
      return enterFromId(fresh, "arr.1");
    }
    case "LOAD":
      return action.state;
    case "CHOOSE":
      if (!prev) return prev;
      return choose(prev, NODES[prev.nodeId], action.choice, action.roll);
    case "VOICE": {
      if (!prev) return prev;
      const match = prev.pendingVoices.some((v) => v.skill === action.voice.skill && v.text === action.voice.text);
      if (!match) return prev;
      return appendVoice(prev, action.voice);
    }
  }
}

const WEATHER_META: Record<string, { kanji: string; label: string }> = {
  clear: { kanji: "晴", label: "Clear" },
  fog: { kanji: "霧", label: "Mist" },
  rain: { kanji: "雨", label: "Rain" },
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("title");
  const [state, dispatch] = useReducer(reducer, null);
  const [overlay, setOverlay] = useState<{ choice: Choice; roll: RollResult } | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const [hasSaveData, setHasSaveData] = useState(false);
  const [endingsMeta, setEndingsMeta] = useState(loadEndingsMeta());
  const seenEndings = useRef<Set<string>>(new Set());

  useEffect(() => setHasSaveData(hasSave()), [screen]);

  /* voice scheduling — staggered interjections after each node entry */
  useEffect(() => {
    if (!state || state.pendingVoices.length === 0) return;
    const voices = [...state.pendingVoices];
    const timers = voices.map((v, i) =>
      window.setTimeout(() => dispatch({ type: "VOICE", voice: v }), 550 + i * 1050),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.beat]);

  /* autosave on every state change while playing */
  useEffect(() => {
    if (screen === "game" && state && !state.done) saveGame(state);
  }, [state, screen]);

  /* record endings meta once reached */
  useEffect(() => {
    if (!state) return;
    for (const id of state.endings) {
      if (seenEndings.current.has(id)) continue;
      seenEndings.current.add(id);
      const meta = ENDINGS.find((e) => e.id === id);
      if (meta) addEndingMeta(meta.id, meta.title);
    }
    setEndingsMeta(loadEndingsMeta());
  }, [state?.endings, state]);

  const node = state ? NODES[state.nodeId] : null;

  const visibleChoices = useMemo(() => {
    if (!state || !node) return [] as Choice[];
    return node.choices.filter((c) => evaluate(state, c.cond) || c.locked);
  }, [state, node]);

  const onPick = useCallback(
    (c: Choice) => {
      if (!state) return;
      if (c.check) {
        const roll = rollCheck(state, c.check);
        setOverlay({ choice: c, roll });
      } else {
        dispatch({ type: "CHOOSE", choice: c, roll: null });
      }
    },
    [state],
  );

  const onOverlayContinue = useCallback(() => {
    if (!overlay) return;
    dispatch({ type: "CHOOSE", choice: overlay.choice, roll: overlay.roll });
    setOverlay(null);
  }, [overlay]);

  /* keyboard: 1..9 pick choices; Enter confirms dice */
  useEffect(() => {
    if (screen !== "game") return;
    const onKey = (e: KeyboardEvent) => {
      if (overlay) return; // overlay handles its own keys
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 9 && visibleChoices[n - 1]) {
        const c = visibleChoices[n - 1];
        if (evaluate(state!, c.cond)) onPick(c);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, visibleChoices, overlay, onPick, state]);

  const onLeave = useCallback(() => {
    clearSave();
    setHasSaveData(false);
    setScreen("title");
    dispatch({ type: "LOAD", state: null as unknown as GameState });
  }, []);

  /* ------------------------------- title views ------------------------------- */
  if (screen === "title") {
    return (
      <TitleScreen
        hasSaveData={hasSaveData}
        endingsFound={endingsMeta}
        onNew={(buildId) => {
          dispatch({ type: "NEW", buildId });
          setScreen("game");
        }}
        onContinue={() => {
          const loaded = loadGame();
          if (loaded) {
            dispatch({ type: "LOAD", state: loaded });
            setScreen("game");
          } else {
            setHasSaveData(false);
          }
        }}
        onCodex={() => setScreen("codex")}
      />
    );
  }
  if (screen === "codex") return <CodexView onBack={() => setScreen("title")} />;
  if (!state || !node) return null;

  /* -------------------------------- game view -------------------------------- */
  const weather = weatherOf(state);
  const wmeta = WEATHER_META[weather];
  const loc = LOCS[state.loc];
  const bgGroup = state.loc === "road" ? "title" : state.loc === "path" || state.loc === "shrine" ? "shrine" : "village";
  const endingMeta = state.done ? ENDINGS.find((e) => e.id === state.endings[state.endings.length - 1]) : undefined;

  return (
    <div className="relative h-full w-full overflow-hidden bg-ink-950">
      {/* layered crossfading backgrounds */}
      <div className="absolute inset-0">
        <img src={IMG_TITLE} alt="" className={`anim-kenburns absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${bgGroup === "title" ? "opacity-45" : "opacity-0"}`} />
        <img src={IMG_VILLAGE} alt="" className={`anim-kenburns absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${bgGroup === "village" ? "opacity-45" : "opacity-0"}`} style={{ animationDelay: "-14s" }} />
        <img src={IMG_SHRINE} alt="" className={`anim-kenburns absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${bgGroup === "shrine" ? "opacity-50" : "opacity-0"}`} style={{ animationDelay: "-27s" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/70 via-transparent to-ink-950/70" />
        {weather === "fog" && <div className="absolute inset-0 bg-[#c9c2ae]/[0.05]" />}
        {weather === "rain" && (
          <div
            className="absolute inset-0 opacity-25"
            style={{
              background: "repeating-linear-gradient(115deg, transparent 0 7px, rgba(190,205,215,0.35) 7px 8px)",
              animation: "rainShift 0.6s linear infinite",
            }}
          />
        )}
        <style>{`@keyframes rainShift { from { background-position: 0 0; } to { background-position: -24px 48px; } }`}</style>
      </div>
      <Ambient embers={weather === "rain" ? 6 : 16} mist dim={weather === "rain"} />

      {/* top bar */}
      <div className="relative z-20 flex items-center justify-between border-b border-ink-700/70 bg-ink-950/70 px-4 py-2.5 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center border border-gold-700/60 bg-ink-900 font-display text-sm font-bold text-gold-400">
            {loc.kanji}
          </span>
          <div>
            <div className="font-display text-sm font-bold tracking-[0.15em] text-paper-100">{loc.name.toUpperCase()}</div>
            <div className="font-body text-[10px] uppercase tracking-[0.25em] text-paper-700">
              Day {dayOf(state.minutes)} · {clockOf(state.minutes)} · {periodName(periodOf(state.minutes))}
            </div>
          </div>
          <span
            className="ml-2 flex items-center gap-1.5 border border-ink-600 bg-ink-900/70 px-2 py-1 font-body text-[10px] uppercase tracking-[0.2em] text-paper-500"
            title={`Weather: ${wmeta.label}`}
          >
            <span className="font-display text-xs text-gold-400">{wmeta.kanji}</span>
            {wmeta.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              saveGame(state);
              setSaveFlash(true);
              window.setTimeout(() => setSaveFlash(false), 1400);
            }}
            className={`border px-3 py-1.5 font-body text-[10px] uppercase tracking-[0.25em] transition-all duration-300 ${
              saveFlash
                ? "border-moss-400/70 text-moss-400"
                : "border-ink-600 text-paper-500 hover:border-gold-500/60 hover:text-gold-300"
            }`}
          >
            {saveFlash ? "Recorded ✓" : "Record 記録"}
          </button>
          <button
            onClick={() => setShowSidebar((v) => !v)}
            className="border border-ink-600 px-3 py-1.5 font-body text-[10px] uppercase tracking-[0.25em] text-paper-500 transition-colors hover:border-gold-500/60 hover:text-gold-300 lg:hidden"
          >
            Panels 面
          </button>
          <button
            onClick={() => {
              saveGame(state);
              setScreen("title");
            }}
            className="border border-ink-600 px-3 py-1.5 font-body text-[10px] uppercase tracking-[0.25em] text-paper-500 transition-colors hover:border-shu-500/60 hover:text-shu-300"
          >
            Gate 門
          </button>
        </div>
      </div>

      {/* main row */}
      <div className="relative z-10 flex h-[calc(100%-53px)]">
        <div className="min-w-0 flex-1">
          <DialogueLog
            state={state}
            choices={node.choices}
            onPick={onPick}
            done={state.done}
            endingKanji={endingMeta?.kanji}
            endingTitle={endingMeta?.title}
            onLeave={onLeave}
          />
        </div>
        <div className="hidden w-[330px] shrink-0 border-l border-ink-700/70 bg-ink-950/80 backdrop-blur-sm lg:block">
          <Sidebar state={state} />
        </div>
        {showSidebar && (
          <div className="absolute inset-y-0 right-0 z-30 w-[320px] max-w-[85vw] border-l border-ink-700 bg-ink-950/95 shadow-[-20px_0_60px_rgba(0,0,0,0.6)] backdrop-blur-md lg:hidden">
            <button
              onClick={() => setShowSidebar(false)}
              className="absolute right-2 top-2 z-10 font-display text-sm text-paper-700 hover:text-gold-400"
            >
              ✕
            </button>
            <Sidebar state={state} />
          </div>
        )}
      </div>

      {/* dice overlay */}
      {overlay && <SkillCheckOverlay choice={overlay.choice} roll={overlay.roll} onContinue={onOverlayContinue} />}
    </div>
  );
}
