/* ============================================================
   KIRIFUSHI — game engine
   Pure, testable systems: conditions, effects, skill checks,
   time/weather, state transitions. Presentation lives elsewhere.
   ============================================================ */

import type {
  Choice, Condition, Effect, GameState, LogEntry, Loc, Outcome, Period,
  RelDim, RollResult, SkillCheckDef, SkillId, Voice, Weather,
} from "./types";
import { NPCS, REL_DIMS, SAVE_KEY, SAVE_VERSION } from "./types";

export const START_MINUTES = 9 * 60 + 30; // Day 1, 09:30

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* --------------------------------- time ----------------------------------- */

export function dayOf(minutes: number): number {
  return Math.floor(minutes / 1440) + 1;
}

export function clockOf(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function periodOf(minutes: number): Period {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = m / 60;
  if (h < 5) return "night";
  if (h < 8) return "dawn";
  if (h < 12) return "morning";
  if (h < 17) return "noon";
  if (h < 20.5) return "evening";
  return "night";
}

export function periodName(p: Period): string {
  switch (p) {
    case "dawn": return "Dawn";
    case "morning": return "Morning";
    case "noon": return "Noon";
    case "evening": return "Evening";
    case "night": return "Night";
  }
}

export function weatherOf(state: GameState): Weather {
  if (state.flags["shrine_destroyed"]) return "rain";
  const p = periodOf(state.minutes);
  if (p === "evening" || p === "night" || p === "dawn") return "fog";
  return "clear";
}

/* ------------------------------ skill values ------------------------------- */

export function effectiveSkill(state: GameState, skill: SkillId): number {
  let v = state.skills[skill] ?? 0;
  for (const m of state.mods) if (m.skill === skill) v += m.d;
  for (const t of state.thoughts) if (t.skill === skill) v += t.d;
  if (skill === "perception" && weatherOf(state) === "fog") v -= 1;
  if (skill === "swordsmanship" && weatherOf(state) === "rain") v -= 1;
  if (skill === "perception" && state.loc === "shrine") v += 1;
  return v;
}

export function situationalMods(state: GameState, skill: SkillId): { label: string; d: number }[] {
  const out: { label: string; d: number }[] = [];
  for (const m of state.mods) if (m.skill === skill) out.push({ label: m.label, d: m.d });
  for (const t of state.thoughts) if (t.skill === skill) out.push({ label: t.label, d: t.d });
  if (skill === "perception" && weatherOf(state) === "fog") out.push({ label: "Heavy fog", d: -1 });
  if (skill === "swordsmanship" && weatherOf(state) === "rain") out.push({ label: "Slippery rain", d: -1 });
  if (skill === "perception" && state.loc === "shrine") out.push({ label: "The shrine sharpens your eyes", d: 1 });
  return out;
}

/* ------------------------------ skill checks ------------------------------- */

const D6_DIST: Record<number, number> = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1 };

export function checkModsTotal(state: GameState, check: SkillCheckDef): { label: string; d: number }[] {
  const out: { label: string; d: number }[] = [];
  for (const m of check.mods ?? []) if (evaluate(state, m.cond)) out.push({ label: m.label, d: m.d });
  return out;
}

/** Chance (0..100) of passing a 2d6 + skill check. Snake eyes always fail, boxcars always pass. */
export function checkChance(state: GameState, check: SkillCheckDef): number {
  const eff = effectiveSkill(state, check.skill) + checkModsTotal(state, check).reduce((a, m) => a + m.d, 0);
  const need = check.dc - eff;
  let ways = 0;
  for (let s = 2; s <= 12; s++) if (s >= need) ways += D6_DIST[s];
  if (need <= 1) ways -= D6_DIST[2]; // snake eyes always fail
  if (12 < need) ways += D6_DIST[12]; // boxcars always pass
  return Math.round((clamp(ways, 0, 36) / 36) * 100);
}

export function difficultyLabel(chance: number): string {
  if (chance >= 90) return "Trivial";
  if (chance >= 75) return "Easy";
  if (chance >= 55) return "Medium";
  if (chance >= 40) return "Challenging";
  if (chance >= 25) return "Hard";
  if (chance >= 10) return "Dire";
  return "Desperate";
}

export function rollCheck(state: GameState, check: SkillCheckDef): RollResult {
  const situ = situationalMods(state, check.skill);
  const cond = checkModsTotal(state, check);
  const mods = [...situ.map((m) => ({ label: m.label, d: m.d })), ...cond];
  const effective = effectiveSkill(state, check.skill) + cond.reduce((a, m) => a + m.d, 0);
  const d1 = 1 + Math.floor(Math.random() * 6);
  const d2 = 1 + Math.floor(Math.random() * 6);
  const raw = d1 + d2 + effective;
  const snake = d1 === 1 && d2 === 1;
  const box = d1 === 6 && d2 === 6;
  let outcome: Outcome;
  if (snake) outcome = "crit-fail";
  else if (box) outcome = "crit-success";
  else if (raw >= check.dc) outcome = "success";
  else if (raw === check.dc - 1) outcome = "partial";
  else outcome = "fail";
  const pass = outcome === "success" || outcome === "crit-success" || outcome === "partial";
  return { d1, d2, total: raw, dc: check.dc, effective, mods, outcome, pass };
}

export const OUTCOME_LABEL: Record<Outcome, string> = {
  "crit-fail": "CRITICAL FAILURE",
  fail: "FAILURE",
  partial: "PARTIAL SUCCESS",
  success: "SUCCESS",
  "crit-success": "CRITICAL SUCCESS",
};

/* ------------------------------- conditions -------------------------------- */

export function evaluate(state: GameState, c: Condition | undefined): boolean {
  if (!c) return true;
  switch (c.t) {
    case "flag": return !!state.flags[c.id];
    case "notflag": return !state.flags[c.id];
    case "know": return c.id in state.knowledge;
    case "notknow": return !(c.id in state.knowledge);
    case "knowsCount": return c.ids.filter((id) => id in state.knowledge).length >= c.n;
    case "skill": return effectiveSkill(state, c.skill) >= c.gte;
    case "trait": return state.traits.includes(c.id);
    case "item": return c.id in state.items;
    case "notitem": return !(c.id in state.items);
    case "rel": return (state.rel[c.npc]?.[c.dim] ?? 0) >= c.gte;
    case "faction": return (state.factions[c.id] ?? 0) >= c.gte;
    case "questStage": {
      const q = state.quests[c.id];
      return !!q && q.stage >= c.gte;
    }
    case "period": return c.oneOf.includes(periodOf(state.minutes));
    case "day": return dayOf(state.minutes) >= c.gte;
    case "all": return c.of.every((x) => evaluate(state, x));
    case "any": return c.of.some((x) => evaluate(state, x));
    case "not": return !evaluate(state, c.of);
    // Zero Parades / Disco Elysium inspired
    case "doubt": return c.id in state.doubts;
    case "notdoubt": return !(c.id in state.doubts);
    case "theory": return state.theories.includes(c.id);
    case "nottheory": return !state.theories.includes(c.id);
    case "dream": return state.dreams.includes(c.id);
    case "redcheck": return state.redChecks.includes(c.id);
  }
}

/* --------------------------------- effects --------------------------------- */

function applyEffect(s: GameState, e: Effect): void {
  switch (e.t) {
    case "flag": s.flags[e.id] = true; break;
    case "unflag": delete s.flags[e.id]; break;
    case "know":
      if (!(e.id in s.knowledge)) {
        s.knowledge[e.id] = e.label;
        push(s, { kind: "know", text: e.label, tone: "neutral" });
      }
      break;
    case "item":
      if (e.add) s.items[e.id] = e.label;
      else delete s.items[e.id];
      break;
    case "rel": {
      const dims = s.rel[e.npc];
      dims[e.dim] = clamp(dims[e.dim] + e.d, -100, 100);
      const sign = e.d > 0 ? "+" : "";
      push(s, {
        kind: "system",
        text: `${NPCS[e.npc].name} — ${REL_DIMS[e.dim].name} ${sign}${e.d}`,
        tone: e.d > 0 ? "good" : "bad",
      });
      break;
    }
    case "memory":
      s.memories[e.npc].push({ text: e.text, w: e.w, day: dayOf(s.minutes) });
      break;
    case "faction": {
      s.factions[e.id] = clamp(s.factions[e.id] + e.d, -100, 100);
      break;
    }
    case "questStart":
      if (!s.quests[e.id]) {
        s.quests[e.id] = { title: e.title, status: "active", stage: 0 };
        push(s, { kind: "chapter", text: `Quest begun — ${e.title}` });
      }
      break;
    case "questStage":
      if (s.quests[e.id]) s.quests[e.id].stage = Math.max(s.quests[e.id].stage, e.stage);
      break;
    case "questDone":
      if (s.quests[e.id]) {
        s.quests[e.id].status = "done";
        s.quests[e.id].outcome = e.outcome;
        push(s, { kind: "chapter", text: `Quest resolved — ${e.outcome}` });
      }
      break;
    case "mod":
      s.mods.push({ skill: e.skill, d: e.d, label: e.label });
      break;
    case "thought": {
      if (!s.thoughts.some((t) => t.id === e.id)) {
        s.thoughts.push({ id: e.id, label: e.label, skill: e.skill, d: e.d, description: thoughtDescription(e.id) });
        push(s, { kind: "chapter", text: `A thought takes root — ${e.label}` });
      }
      break;
    }
    case "time":
      advanceTime(s, e.minutes);
      break;
    case "ending":
      if (!s.endings.includes(e.id)) s.endings.push(e.id);
      s.done = true;
      break;
    // Zero Parades / Disco Elysium inspired
    case "doubt":
      s.doubts[e.id] = { statement: e.statement, npc: e.npc, day: dayOf(s.minutes) };
      push(s, {
        kind: "system",
        text: `Doubt planted — "${e.statement.slice(0, 60)}${e.statement.length > 60 ? "…" : ""}"`,
        tone: "neutral",
      });
      break;
    case "theory":
      if (!s.theories.includes(e.id)) {
        s.theories.push(e.id);
        push(s, { kind: "chapter", text: `Theory formed — ${e.title}` });
      }
      break;
    case "ency":
      if (!(e.id in s.encyclopaedia)) {
        s.encyclopaedia[e.id] = { title: e.title, text: e.text, category: e.category };
        push(s, { kind: "know", text: `Encyclopaedia entry — ${e.title}`, tone: "neutral" });
      }
      break;
    case "redcheck":
      if (!s.redChecks.includes(e.id)) {
        s.redChecks.push(e.id);
        push(s, { kind: "chapter", text: `Red check marked — ${e.label}`, tone: "bad" });
      }
      break;
    case "dream":
      if (!s.dreams.includes(e.id)) {
        s.dreams.push(e.id);
        push(s, { kind: "chapter", text: `Dream remembered — ${e.title}`, tone: "neutral" });
      }
      break;
  }
}

export function thoughtDescription(id: string): string {
  const DESCS: Record<string, string> = {
    what_the_mist_keeps: "The fog is not weather. It is a village holding its breath. You carry that breath with you now, and it sharpens what you read.",
    the_weight_of_names: "Six names, six stones, and your signature under the truth of it. Ink is heavier than stone, if you write it honestly.",
    the_wanderers_path: "Every road you have ever taken is a single road. It teaches your eyes to notice what stays behind.",
    the_roof_that_holds: "A story is a roof. It does not matter whether it is true. It matters whether it holds. You have chosen to hold this one.",
    the_arithmetic_of_gratitude: "Prosperity is never free. It is rented. The rent is paid, has always been paid, will always be paid. You now know the price.",
    the_seventh_keeper: "The mountain asks. You answer with your whole life, or not at all. The ledger gains a seventh hand, and the stair grows a little shorter.",
    the_unbound_mist: "The seal is cut. The rain arrives. The children draw seven figures. You have broken the arithmetic, and something older than arithmetic is watching.",
    the_ink_heavier_than_stone: "Names against arithmetic, sent to the capital. The whole war of this mountain, ended by one honest hand. Or begun.",
    the_travellers_answer: "The road is also a kind of answer. Some stories are not yours to finish. The mist lets you go — that is the unsettling part.",
    the_debt_of_silence: "You chose a roof over a receipt. Both hold. Ask yourself, on the long road down, which one you sleep under.",
    the_iron_in_the_water: "The well tastes of iron. Or it tastes of nothing. Both are memories the village has chosen to forget. You have chosen to remember.",
    the_childrens_game: "Children do not coordinate silence. They are taught it. There is a curriculum in this village, and you are not on it — or you are, and that is worse.",
    the_merchants_fear: "Fear is moving through the village like a season. Every warding charm was bought within a month. The mountain is hungry, or the village is afraid, or both.",
    the_monks_broom: "The stair grows a little longer each year. Or the monk grows a little shorter. The bell disagrees with both. You have sat in this silence, and it has changed you.",
    the_cartographers_thread: "A map is just a grave with coordinates. She has come to exhume a village's history. You have given her the red thread, and she will never forgive you if it leads nowhere.",
    the_gatekeepers_lantern: "He carries an unlit lantern up a mountain at dusk. It is a prop — or an offering. You have learned to read the gatekeeper's arithmetic.",
    the_elders_receipt: "The rent is due again. The half-finished name. The seventh tally. The village is already choosing — it simply hasn't told itself yet.",
    the_well_guard_grief: "Ten years. He guarded the water she was under. Grief and gratitude, arriving together. He will be loyal to you now, which is a weight — carry it carefully.",
  };
  return DESCS[id] ?? "";
}

function advanceTime(s: GameState, minutes: number): void {
  const before = periodOf(s.minutes);
  const beforeDay = dayOf(s.minutes);
  s.minutes += minutes;
  const after = periodOf(s.minutes);
  const afterDay = dayOf(s.minutes);
  if (afterDay > beforeDay) {
    push(s, { kind: "system", text: `Night passes. Day ${afterDay} breaks over Kagerou.` });
  } else if (after !== before) {
    const lines: Partial<Record<Period, string>> = {
      noon: "The sun climbs. Shadows shorten over the square.",
      evening: "Evening comes down the mountain. Lanterns wake along the eaves.",
      night: "Night settles. The mist rises from the valley floor like something remembered.",
      dawn: "Grey dawn. The fog is still here, patient as a debt.",
      morning: "Morning light slants through the pines.",
    };
    push(s, { kind: "system", text: lines[after] ?? "Time moves on." });
  }
}

/* ------------------------------ log helpers -------------------------------- */

function push(s: GameState, e: Omit<LogEntry, "key">): void {
  s.keySeq += 1;
  s.log.push({ key: s.keySeq, ...e });
  if (s.log.length > 500) s.log.splice(0, s.log.length - 420);
}

/* ------------------------------ state factory ------------------------------ */

export interface BuildDef {
  id: string;
  name: string;
  kanji: string;
  desc: string;
  traits: string[];
  bonuses: Partial<Record<SkillId, number>>;
}

export const BUILDS: BuildDef[] = [
  {
    id: "scholar", name: "The Ink-Stained Scholar", kanji: "墨",
    desc: "Raised in the capital archives. You can date a lie by its grammar, and a village by its silences.",
    traits: ["Scholar", "Curious"],
    bonuses: { lore: 2, reason: 1, perception: 1 },
  },
  {
    id: "blade", name: "The Wandering Blade", kanji: "刃",
    desc: "A rōnin's road behind you, calluses where a past should be. Steel asks fewer questions than people do.",
    traits: ["Wanderer", "Hot-Blooded"],
    bonuses: { swordsmanship: 2, willpower: 2 },
  },
  {
    id: "tongue", name: "The Silver Tongue", kanji: "舌",
    desc: "Court runner, tea-house confidant, occasional other person entirely. Doors are a matter of conversation.",
    traits: ["Courtly", "Cynical"],
    bonuses: { persuasion: 2, deception: 2 },
  },
];

const BASE_SKILLS: Record<SkillId, number> = {
  perception: 5, reason: 4, empathy: 4, willpower: 3,
  lore: 3, persuasion: 3, deception: 2, swordsmanship: 2,
};

function zeroRel(): Record<RelDim, number> {
  return { trust: 0, respect: 0, fear: 0, suspicion: 0, debt: 0, affection: 0 };
}

export function newGame(buildId: string): GameState {
  const build = BUILDS.find((b) => b.id === buildId) ?? BUILDS[0];
  const skills = { ...BASE_SKILLS };
  for (const [k, v] of Object.entries(build.bonuses)) skills[k as SkillId] += v ?? 0;
  const s: GameState = {
    version: SAVE_VERSION,
    buildId: build.id,
    nodeId: "arr.1",
    beat: 0,
    flags: {},
    knowledge: {},
    skills,
    mods: [],
    traits: [...build.traits],
    thoughts: [],
    items: {},
    rel: { genji: zeroRel(), ochiba: zeroRel(), kenta: zeroRel(), jikai: zeroRel(), ran: zeroRel(), sayo: zeroRel() },
    memories: { genji: [], ochiba: [], kenta: [], jikai: [], ran: [], sayo: [] },
    factions: { village: 0, temple: 10, guild: 0, keepers: 0 },
    quests: {},
    minutes: START_MINUTES,
    loc: "road",
    log: [],
    pendingVoices: [],
    endings: [],
    done: false,
    keySeq: 0,
    // Zero Parades / Disco Elysium inspired
    doubts: {},
    theories: [],
    encyclopaedia: {},
    redChecks: [],
    dreams: [],
  };
  return s;
}

/* ------------------------------ transitions -------------------------------- */

export interface NodeLike {
  id: string;
  speaker?: string;
  kanji?: string;
  text: string;
  loc: Loc;
  at?: number;
  voices?: Voice[];
  fx?: Effect[];
}

export function enterNode(prev: GameState, node: NodeLike): GameState {
  const s: GameState = structuredClone(prev);
  s.beat += 1;
  s.nodeId = node.id;
  if (node.loc !== s.loc) {
    s.loc = node.loc;
  }
  if (node.at) advanceTime(s, node.at);
  for (const e of node.fx ?? []) applyEffect(s, e);
  push(s, { kind: node.speaker ? "npc" : "narr", speaker: node.speaker, kanji: node.kanji, text: node.text });
  // gather eligible internal voices
  const voices: Voice[] = [];
  for (const v of node.voices ?? []) {
    if (!evaluate(s, v.cond)) continue;
    if (v.chance !== undefined && Math.random() > v.chance) continue;
    voices.push(v);
  }
  s.pendingVoices = voices;
  return s;
}

export function appendVoice(prev: GameState, v: Voice): GameState {
  const s: GameState = structuredClone(prev);
  // remove by content, not identity — state is cloned between dispatches
  let removed = false;
  s.pendingVoices = s.pendingVoices.filter((x) => {
    if (!removed && x.skill === v.skill && x.text === v.text) {
      removed = true;
      return false;
    }
    return true;
  });
  push(s, { kind: "voice", skill: v.skill, text: v.text });
  return s;
}

export function choose(prev: GameState, node: NodeLike, choice: Choice, roll: RollResult | null): GameState {
  let s: GameState = structuredClone(prev);
  s.pendingVoices = [];
  if (choice.say) push(s, { kind: "player", speaker: "You", text: choice.say });
  if (roll && choice.check) {
    push(s, {
      kind: "check",
      skill: choice.check.skill,
      tone: roll.pass ? "good" : "bad",
      text: `${OUTCOME_LABEL[roll.outcome]} — ${choice.check.skill.toUpperCase()} check · ${roll.d1}+${roll.d2}+${roll.effective} = ${roll.total} vs ${roll.dc}`,
    });
  }
  for (const e of choice.fx ?? []) applyEffect(s, e);
  const next = roll && choice.check ? (roll.pass ? choice.check.pass : choice.check.fail) : choice.next;
  s = enterFromId(s, next);
  void node;
  return s;
}

/* node lookup is injected by content module to avoid a circular import */
let lookup: (id: string) => NodeLike | undefined = () => undefined;
export function bindNodeLookup(fn: (id: string) => NodeLike | undefined): void {
  lookup = fn;
}
export function enterFromId(prev: GameState, id: string): GameState {
  if (id === "@end") {
    const s = structuredClone(prev);
    s.done = true;
    return s;
  }
  const node = lookup(id);
  if (!node) {
    console.error(`[kirifushi] missing node reference: ${id}`);
    return prev;
  }
  return enterNode(prev, node);
}

/* -------------------------------- save/load -------------------------------- */

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, state }));
  } catch {
    /* storage unavailable — play on */
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { version: number; state: GameState };
    if (parsed.version !== SAVE_VERSION || !parsed.state) return null;
    return migrate(parsed.state);
  } catch {
    return null;
  }
}

export function clearSave(): void {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* noop */ }
}

export function hasSave(): boolean {
  try { return localStorage.getItem(SAVE_KEY) !== null; } catch { return false; }
}

/** Versioned migration chain: v1 → current. Future versions append steps here. */
function migrate(s: GameState): GameState {
  let out = s;
  if (!out.pendingVoices) out = { ...out, pendingVoices: [] };
  if (typeof out.beat !== "number") out = { ...out, beat: 0 };
  // v1 → v2: add Zero Parades / Disco Elysium systems
  if (!out.doubts) out = { ...out, doubts: {} };
  if (!out.theories) out = { ...out, theories: [] };
  if (!out.encyclopaedia) out = { ...out, encyclopaedia: {} };
  if (!out.redChecks) out = { ...out, redChecks: [] };
  if (!out.dreams) out = { ...out, dreams: [] };
  return out;
}

export function loadEndingsMeta(): { id: string; title: string }[] {
  try {
    const raw = localStorage.getItem("kirifushi.endings.v1");
    if (!raw) return [];
    return JSON.parse(raw) as { id: string; title: string }[];
  } catch {
    return [];
  }
}

export function addEndingMeta(id: string, title: string): void {
  try {
    const list = loadEndingsMeta();
    if (!list.some((e) => e.id === id)) {
      list.push({ id, title });
      localStorage.setItem("kirifushi.endings.v1", JSON.stringify(list));
    }
  } catch { /* noop */ }
}

/* ------------------------------ validation --------------------------------- */

export function validateContent(nodes: Record<string, NodeLike>): string[] {
  const errors: string[] = [];
  for (const [id, node] of Object.entries(nodes)) {
    if (!node.text) errors.push(`${id}: empty text`);
    const targets: string[] = [];
    for (const c of (node as { choices?: Choice[] }).choices ?? []) {
      // check-routed choices use a sentinel `next`; routing comes from pass/fail
      if (!c.check) targets.push(c.next);
      else targets.push(c.check.pass, c.check.fail);
    }
    for (const t of targets) {
      if (t === "@end") continue;
      if (!nodes[t]) errors.push(`${id}: broken reference → ${t}`);
    }
  }
  if (Object.keys(nodes).length === 0) errors.push("no nodes defined");
  return errors;
}
