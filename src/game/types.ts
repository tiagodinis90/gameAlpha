/* ============================================================
   KIRIFUSHI — data contracts
   Content data → Game state → Systems → Events → Presentation
   ============================================================ */

export type SkillId =
  | "perception"
  | "reason"
  | "empathy"
  | "willpower"
  | "lore"
  | "persuasion"
  | "deception"
  | "swordsmanship";

export type RelDim = "trust" | "respect" | "fear" | "suspicion" | "debt" | "affection";

export type FactionId = "village" | "temple" | "guild" | "keepers";

export type NpcId = "genji" | "ochiba" | "kenta" | "jikai" | "ran" | "sayo";

export type Loc = "road" | "gate" | "village" | "temple" | "path" | "shrine" | "forest" | "river" | "mill" | "cave";

export type Weather = "clear" | "fog" | "rain";

export type Period = "dawn" | "morning" | "noon" | "evening" | "night";

// Citizen Sleeper-inspired systems
export type StatusEffect = "exhausted" | "inspired" | "wounded" | "blessed" | "cursed" | "fearful" | "determined";

export interface StabilityState {
  current: number; // 0-100
  max: number;
  lastChange: string; // description of what changed it
}

/* ------------------------------ conditions -------------------------------- */

export type Condition =
  | { t: "flag"; id: string }
  | { t: "notflag"; id: string }
  | { t: "know"; id: string }
  | { t: "notknow"; id: string }
  | { t: "knowsCount"; ids: string[]; n: number }
  | { t: "skill"; skill: SkillId; gte: number }
  | { t: "trait"; id: string }
  | { t: "item"; id: string }
  | { t: "notitem"; id: string }
  | { t: "rel"; npc: NpcId; dim: RelDim; gte: number }
  | { t: "faction"; id: FactionId; gte: number }
  | { t: "questStage"; id: string; gte: number }
  | { t: "period"; oneOf: Period[] }
  | { t: "day"; gte: number }
  | { t: "all"; of: Condition[] }
  | { t: "any"; of: Condition[] }
  | { t: "not"; of: Condition }
  // Zero Parades / Disco Elysium inspired
  | { t: "doubt"; id: string }
  | { t: "notdoubt"; id: string }
  | { t: "theory"; id: string }
  | { t: "nottheory"; id: string }
  | { t: "dream"; id: string }
  | { t: "redcheck"; id: string };

/* -------------------------------- effects --------------------------------- */

export type Effect =
  | { t: "flag"; id: string }
  | { t: "unflag"; id: string }
  | { t: "know"; id: string; label: string }
  | { t: "item"; id: string; add: boolean; label: string }
  | { t: "rel"; npc: NpcId; dim: RelDim; d: number }
  | { t: "memory"; npc: NpcId; text: string; w: number }
  | { t: "faction"; id: FactionId; d: number }
  | { t: "questStart"; id: string; title: string }
  | { t: "questStage"; id: string; stage: number }
  | { t: "questDone"; id: string; outcome: string }
  | { t: "mod"; skill: SkillId; d: number; label: string }
  | { t: "thought"; id: string; label: string; skill: SkillId; d: number }
  | { t: "time"; minutes: number }
  | { t: "ending"; id: string; title: string }
  // Zero Parades / Disco Elysium inspired
  | { t: "doubt"; id: string; statement: string; npc: NpcId }
  | { t: "theory"; id: string; title: string; description: string }
  | { t: "ency"; id: string; title: string; text: string; category: string }
  | { t: "redcheck"; id: string; label: string }
  | { t: "dream"; id: string; title: string }
  // Citizen Sleeper inspired
  | { t: "stability"; d: number; reason: string }
  | { t: "energy"; d: number }
  | { t: "status"; effect: StatusEffect; add: boolean };

/* -------------------------------- dialogue -------------------------------- */

export interface CheckMod {
  cond: Condition;
  d: number;
  label: string;
}

export interface SkillCheckDef {
  skill: SkillId;
  dc: number;
  pass: string;
  fail: string;
  mods?: CheckMod[];
}

export interface Choice {
  id: string;
  text: string;
  next: string; // node id, or "@end" to leave the story
  say?: string; // player utterance appended to the log
  cond?: Condition; // visibility condition
  locked?: string; // when cond fails: show locked with this hint (otherwise hidden)
  check?: SkillCheckDef; // overrides routing with pass/fail nodes
  fx?: Effect[]; // applied when the choice is taken
}

export interface Voice {
  skill: SkillId;
  text: string;
  cond?: Condition;
  chance?: number; // 0..1, default 1
}

export interface GNode {
  id: string;
  speaker?: string; // undefined = narration
  kanji?: string;
  text: string;
  loc: Loc;
  at?: number; // minutes that pass on entering this node
  voices?: Voice[];
  fx?: Effect[]; // applied on entering this node
  choices: Choice[];
}

/* --------------------------------- state ---------------------------------- */

export type LogKind = "narr" | "npc" | "player" | "voice" | "system" | "check" | "know" | "chapter" | "doubt";

export interface LogEntry {
  key: number;
  kind: LogKind;
  speaker?: string;
  kanji?: string;
  text: string;
  skill?: SkillId;
  tone?: "good" | "bad" | "neutral";
}

export interface Memory {
  text: string;
  w: number; // importance
  day: number;
}

export interface ThoughtDef {
  id: string;
  label: string;
  skill: SkillId;
  d: number;
  description: string;
}

export interface GameState {
  version: number;
  buildId: string;
  nodeId: string;
  beat: number; // increments on every node entry (drives voice scheduling)
  flags: Record<string, boolean>;
  knowledge: Record<string, string>;
  skills: Record<SkillId, number>;
  mods: { skill: SkillId; d: number; label: string }[];
  traits: string[];
  thoughts: ThoughtDef[];
  items: Record<string, string>; // id -> label
  rel: Record<NpcId, Record<RelDim, number>>;
  memories: Record<NpcId, Memory[]>;
  factions: Record<FactionId, number>;
  quests: Record<string, { title: string; status: "active" | "done"; stage: number; outcome?: string }>;
  minutes: number; // day 1, 00:00 origin
  loc: Loc;
  log: LogEntry[];
  pendingVoices: Voice[];
  endings: string[]; // ending ids reached this run
  done: boolean;
  keySeq: number;
  // Zero Parades-inspired systems
  doubts: Record<string, { statement: string; npc: NpcId; day: number }>; // doubted statements
  theories: string[]; // theory ids formed
  encyclopaedia: Record<string, { title: string; text: string; category: string }>; // lore entries
  redChecks: string[]; // red check ids already attempted
  dreams: string[]; // dream sequence ids seen
  
  // Citizen Sleeper-inspired systems
  stability: StabilityState; // mental/physical stability
  statusEffects: StatusEffect[]; // current status effects
  energy: number; // 0-5, Citizen Sleeper-style dice pool
  maxEnergy: number;
}

export type Outcome = "crit-fail" | "fail" | "partial" | "success" | "crit-success";

export interface RollResult {
  d1: number;
  d2: number;
  total: number;
  dc: number;
  effective: number;
  mods: { label: string; d: number }[];
  outcome: Outcome;
  pass: boolean;
}

/* ------------------------------ static tables ------------------------------ */

export const SKILLS: Record<SkillId, { name: string; kanji: string; color: string; blurb: string }> = {
  perception: { name: "Perception", kanji: "知覚", color: "#a9c29b", blurb: "What the senses refuse to ignore." },
  reason: { name: "Reason", kanji: "理", color: "#d9b36a", blurb: "Arithmetic, pattern, cold deduction." },
  empathy: { name: "Empathy", kanji: "共感", color: "#e0907c", blurb: "The weather inside other people." },
  willpower: { name: "Willpower", kanji: "意志", color: "#cf5136", blurb: "The spine of the self." },
  lore: { name: "Lore", kanji: "学識", color: "#c9b8e0", blurb: "Everything the dead wrote down." },
  persuasion: { name: "Persuasion", kanji: "弁舌", color: "#e8c97e", blurb: "Doors opened with a voice." },
  deception: { name: "Deception", kanji: "虚言", color: "#8fa7b8", blurb: "The art of the useful untruth." },
  swordsmanship: { name: "Swordsmanship", kanji: "剣術", color: "#b8b8b8", blurb: "Argument, settled in steel." },
};

export const REL_DIMS: Record<RelDim, { name: string; kanji: string }> = {
  trust: { name: "Trust", kanji: "信" },
  respect: { name: "Respect", kanji: "敬" },
  fear: { name: "Fear", kanji: "畏" },
  suspicion: { name: "Suspicion", kanji: "疑" },
  debt: { name: "Debt", kanji: "恩" },
  affection: { name: "Affection", kanji: "慕" },
};

export const FACTIONS: Record<FactionId, { name: string; kanji: string; hiddenUntil?: string }> = {
  village: { name: "Kagerou Village", kanji: "村" },
  temple: { name: "The Mountain Temple", kanji: "寺" },
  guild: { name: "The Cartographers' Guild", kanji: "図" },
  keepers: { name: "The Silent Keepers", kanji: "守", hiddenUntil: "keepers" },
};

export const NPCS: Record<NpcId, { name: string; kanji: string; role: string }> = {
  genji: { name: "Genji", kanji: "源", role: "Gatekeeper of Kagerou" },
  ochiba: { name: "Elder Ochiba", kanji: "落", role: "Village elder, keeper of the ledger" },
  kenta: { name: "Kenta", kanji: "健", role: "Young warrior of the well-guard" },
  jikai: { name: "Monk Jikai", kanji: "慈", role: "Wandering monk of the mountain temple" },
  ran: { name: "Ran", kanji: "蘭", role: "Merchant of the south stall" },
  sayo: { name: "Sayo", kanji: "小", role: "The outsider cartographer" },
};

export const LOCS: Record<Loc, { name: string; kanji: string }> = {
  road: { name: "The Mountain Road", kanji: "道" },
  gate: { name: "The Village Gate", kanji: "門" },
  village: { name: "Kagerou Square", kanji: "村" },
  temple: { name: "The Mountain Temple", kanji: "寺" },
  path: { name: "The Sealed Path", kanji: "坂" },
  shrine: { name: "The Mistbound Shrine", kanji: "祠" },
  forest: { name: "The Whispering Forest", kanji: "森" },
  river: { name: "The Iron River", kanji: "川" },
  mill: { name: "The Old Mill", kanji: "臼" },
  cave: { name: "The Hermit's Cave", kanji: "穴" },
};

export const SAVE_KEY = "kirifushi.save.v1";
export const ENDINGS_KEY = "kirifushi.endings.v1";
export const SAVE_VERSION = 1;
