/* ============================================================
   KIRIFUSHI — narrative content (data, not logic)
   The vertical slice: the village of Kagerou and the
   Mistbound Shrine. All authoring lives here.
   ============================================================ */

import type { Choice, Condition, GNode, SkillId, Voice } from "./types";
import { bindNodeLookup, validateContent } from "./engine";

const v = (skill: SkillId, text: string, cond?: Condition): Voice =>
  cond ? { skill, text, cond } : { skill, text };

const c = (id: string, text: string, next: string, extra: Partial<Choice> = {}): Choice =>
  ({ id, text, next, ...extra });

const N = (id: string, loc: GNode["loc"], text: string, choices: Choice[], x: Partial<GNode> = {}): GNode =>
  ({ id, loc, text, choices, ...x });

const CLUES: string[] = ["clue_sleeve", "drawings", "kenta_sister", "ledger_gap", "seal_charms", "genji_moon", "sayo_motive"];

/* ================================ ARRIVAL ================================== */

const ARRIVAL: GNode[] = [
  N("arr.1", "road",
    "The road ends where the mist begins, and there is a moment — just a moment — when you stand at the edge of the world as it was and the world as it will be. Below you, the village of Kagerou crouches in its valley like a held breath, like a secret kept too long. Smoke rises from a dozen chimneys, thin and blue and patient, and lanterns are waking in the windows like eyes opening one by one. Every roof is turned carefully away from the mountain, the way a sleeper turns away from a dream they cannot quite remember but know was terrible.\n\nYour circuit writ names this place *prosperous, unremarkable, behind on its paper*. Three words that mean nothing and everything. The capital wants its history recorded, the way a child wants a story told before bed — not because the story matters, but because the telling is a kind of keeping. But the mountain, you think, the mountain wants something else. The air tastes of cedar and woodsmoke and something older than both — stone, perhaps, or the memory of stone, or the ghost of a name spoken so long ago it has worn a hole in the world.\n\nYou have walked many roads to many villages, and you have learned to read them the way a musician reads a score: the pitch of the bells, the rhythm of the hammers, the silence between one sound and the next. This village is different. This village feels *watched*. Not by you. By something else. Something patient. Something that has been waiting for a very long time, and is not in any particular hurry to begin.",
    [c("a1", "Shoulder your pack and go down.", "arr.2", { say: "(Down the mountain road, into the mist. Into the story that has been waiting for you.)" })],
    {
      voices: [
        v("perception", "The guide-rope along the cliff is new. Cut this season, the fibers still pale and stiff, not yet softened by wind or rain. Someone expects travellers to *stay on the path*. The rope is braided from seven strands, each a different age — the outermost white and bright, the next grey, the next brown, the next almost black, and three more so dark they are nearly the colour of shadow. A rope renewed for decades, one layer at a time, the way you might renew a promise, or a debt. Whatever died up there, the village keeps paying its funeral costs. The arithmetic of grief is patient, and it is precise."),
        v("lore", "Kagerou. 'Heat-haze.' A village named for the thing you can almost, but never quite, see — the shimmer above the road on a summer day, the way the world bends when the air is thick with warmth and distance. The name is a warning, or a confession, or both. It says: *we are here, but we are not quite real. We are the thing you see when you are not looking directly at us.* There are villages like this. They are rare, and they are dangerous, and they are always, always hiding something."),
        v("empathy", "The village is afraid. Not of you — not yet, though that will come. Of something else. The roofs are turned away from the mountain the way children turn away from a sleeping dog, the way a lover turns away from a bed where someone has died. Respect, or fear, or something older than both. The air here is thick with it, thick as the mist itself, and you can taste it on your tongue: the taste of a secret kept too long, the taste of a debt that has come due."),
      ],
    }),
  N("arr.2", "road",
    "Halfway down, you pass a stone Jizō, moss-shouldered and smiling. Someone has tied a fresh paper charm to its staff. Then another road branches off — narrower, climbing, closed with a rope of braided straw so old it has turned the colour of bone. The village lies below. The rope lies behind you, patient as arithmetic.",
    [
      c("a2", "Continue to the village gate.", "gate.meet", { say: "(To the gate.)" }),
      c("a3", "Examine the sealed road a moment longer.", "arr.rope", { cond: { t: "notflag", id: "saw_rope" } }),
    ],
    { fx: [{ t: "questStart", id: "names_under_stones", title: "The Names Under the Stone" }, { t: "questStage", id: "names_under_stones", stage: 0 }] }),
  N("arr.rope", "road",
    "The straw rope is seven strands deep, each strand a different colour of age — a rope renewed for decades, one layer at a time. On the post, a wooden notice: *BY ORDER OF THE ELDER — THIS PATH DIED IN THE LANDSLIDE. LET IT STAY DEAD.* The landslide, according to your writ, was forty years ago. Ropes do not renew themselves.",
    [c("a4", "File that away, and go to the gate.", "gate.meet", { say: "(To the gate.)" })],
    { fx: [{ t: "flag", id: "saw_rope" }, { t: "mod", skill: "lore", d: 1, label: "You have read the rope's years" }],
      voices: [v("reason", "Forty years of renewal. Whatever died up there, the village keeps paying its funeral costs.")] }),
];

/* ================================= GATE ==================================== */

const GATE: GNode[] = [
  N("gate.meet", "gate",
    "The gate is a thick timber affair, dark with age and weather, and there is a brazier on either side of it, burning with a fire that smells of cedar and something else — something sharp and metallic, like the taste of a coin held too long on the tongue. The man between them is thicker still, broad-shouldered and solid as the gate itself, and he stands the way a man stands when he has been standing in the same place for a very long time: with his weight settled deep, his feet planted wide, his hands resting easy on the spear that leans against the wall beside him.\n\nA torch catches the planes of his face: old soldier, new wariness. The kind of face that has seen things it cannot unsee, the kind of eyes that have learned to watch without looking. He looks at your writ, then at you, then at your hands — the way men look at hands that might be holding something, the way a musician looks at another musician's fingers before they've played a single note. He is reading you, and he is not in any hurry to finish.",
    [c("g0", "Meet his gaze.", "gate.hub", { say: "I'm the circuit archivist. The capital wants Kagerou's history for the record." })],
    { speaker: "Genji, the Gatekeeper", kanji: "源", at: 15,
      voices: [
        v("perception", "His hands are scarred, but not from battle — from rope, from wood, from the kind of work that leaves its mark in calluses and old cuts. The spear is well-oiled, the blade bright, but the shaft is worn smooth in the places where his hands rest. He has held this spear for a long time. He has held it in this place, in this light, in this mist, for longer than you have been alive."),
        v("empathy", "He is not afraid of you. He is afraid *for* you. There is a difference, and it is important. He has seen others come this way — paper men with their writs and their questions — and he has seen what happens to them when they ask the wrong questions in the wrong places. He is deciding, even now, whether you are worth the warning."),
      ] }),
  N("gate.hub", "gate",
    "“Records,” Genji repeats, handing the writ back without reading the seals. “The capital sends paper men to measure what isn't theirs. Kagerou keeps its own history, archivist. *Inside the walls* it can be discussed.” He does not move from the gate.",
    [
      c("g1", "Press the writ's authority — politely, precisely.", "x", {
        say: "The writ carries the Privy Seal. Refusing an archivist is a sentence the elder will not enjoy reading aloud.",
        check: { skill: "persuasion", dc: 10, pass: "gate.pass", fail: "gate.deny" },
      }),
      c("g2", "His left sleeve is damp. Ask about it.", "x", {
        cond: { t: "notknow", id: "clue_sleeve" },
        check: { skill: "perception", dc: 10, pass: "gate.sleeve", fail: "gate.sleeve_f" },
      }),
      c("g3", "Tell him you are a tax assessor, here early.", "x", {
        say: "Actually — the archive is a formality. I'm the assessor. The tax column is what concerns me.",
        check: { skill: "deception", dc: 12, pass: "gate.tax", fail: "gate.tax_f" },
      }),
      c("g4", "Lay your hand on your sword. “Open the gate.”", "x", {
        cond: { t: "notflag", id: "dueled" },
        check: { skill: "swordsmanship", dc: 12, pass: "gate.duel_win", fail: "gate.duel_lose" },
      }),
      c("g5", "Withdraw to the roadside and wait for dark.", "gate.wait", {
        cond: { t: "not", of: { t: "period", oneOf: ["evening", "night"] } },
        say: "(You bow, step off the road, and let the afternoon do its slow work.)",
      }),
      c("g6", "Slip through the drainage culvert under the wall.", "x", {
        cond: { t: "all", of: [{ t: "period", oneOf: ["evening", "night"] }, { t: "notflag", id: "entered" }] },
        check: {
          skill: "perception", dc: 11, pass: "gate.sneak", fail: "gate.sneak_f",
          mods: [{ cond: { t: "know", id: "clue_sleeve" }, d: 1, label: "You know which paths stay wet" }],
        },
      }),
      c("g7", "Doubt his claim about Kagerou's history.", "gate.doubt", {
        say: "You say Kagerou keeps its own history. But the capital's writ mentions a landslide forty years ago. That's not in your records, is it?",
        cond: { t: "notdoubt", id: "gate_history" },
      }),
    ],
    {
      voices: [
        v("empathy", "He isn't being difficult. He's being *posted*. There is a difference, and it is fear."),
        v("perception", "His left sleeve is damp to the elbow. It hasn't rained in three days.", { t: "notknow", id: "clue_sleeve" }),
      ],
    }),
  N("gate.doubt", "gate",
    "You let the word *history* hang in the air between you. \"The capital's writ mentions a landslide forty years ago. Six dead. That's not in your records, is it?\" Genji's face goes very still — the kind of stillness that is not calm but *calculation*. \"The capital's records are incomplete,\" he says slowly. \"They always are. A village that keeps its own history keeps the *whole* history — the parts that don't make the ledger, too.\" He meets your eyes, and for the first time there is something like respect in his gaze. \"You ask the right questions, paper man. The wrong ones, but the *right* ones. Go. The elder will decide if you're clever enough to survive the answers.\"",
    [c("g7", "Enter Kagerou, carrying the doubt.", "hub.village")],
    { speaker: "Genji, the Gatekeeper", kanji: "源", fx: [
      { t: "flag", id: "entered" }, { t: "questStage", id: "names_under_stones", stage: 1 },
      { t: "doubt", id: "gate_history", statement: "The capital's records are incomplete. A village that keeps its own history keeps the parts that don't make the ledger.", npc: "genji" },
      { t: "ency", id: "landslide", title: "The Landslide of the Third Year", text: "The capital's writ mentions a landslide forty years ago, six dead. The village's official history makes no mention of it. Either the capital is wrong, or the village is lying.", category: "History" },
      { t: "rel", npc: "genji", dim: "respect", d: 10 }, { t: "rel", npc: "genji", dim: "suspicion", d: 5 },
      { t: "memory", npc: "genji", text: "Asked about the landslide. The capital's records, the village's silence. He's already connecting threads. Dangerous, or useful.", w: 3 },
    ], voices: [
      v("reason", "The capital's records are incomplete. The village's history is edited. Both are true. The truth is in the gap."),
      v("lore", "A village that keeps its own history is a village that edits it. The question is not whether the landslide happened. The question is why the village forgot it."),
    ]}),
  N("gate.pass", "gate",
    "Something in the way you hold the writ — or the way you hold yourself behind it — lands. Genji's jaw works once. “Paper beats steel this decade, then.” He pulls the gate open with a groan of green timber. “The elder will want a word. They always want a word.” Beyond him, Kagerou smells of cedar smoke and river water and something faintly sweet you cannot place.",
    [c("g7", "Enter Kagerou.", "hub.village")],
    { speaker: "Genji, the Gatekeeper", kanji: "源", fx: [
      { t: "flag", id: "entered" }, { t: "questStage", id: "names_under_stones", stage: 1 },
      { t: "rel", npc: "genji", dim: "respect", d: 10 },
    ]}),
  N("gate.deny", "gate",
    "“The Privy Seal,” he says, flat as a stone. “Last man who waved seals at this gate was a magistrate. The mountain kept his horse.” He spits into the brazier. The flames jump green for a heartbeat. “Come back when your paper grows teeth, archivist.”",
    [c("g8", "Consider your options.", "gate.hub")],
    { speaker: "Genji, the Gatekeeper", kanji: "源", fx: [{ t: "rel", npc: "genji", dim: "suspicion", d: 5 }] }),
  N("gate.sleeve", "gate",
    "You let your eyes rest on the dark stain climbing his forearm. “Long walk from the well, gatekeeper.” He follows your gaze down, and for one unguarded second his face is a door swinging open: *caught*. “I inspect the wall,” he says, too quickly. “Walls sweat.” Walls do not leave mountain mud under a man's nails — and his nails are rimmed with grey clay, the kind that only comes from above the tree line.",
    [c("g9", "Say nothing. Keep it.", "gate.hub", { say: "(You nod as if satisfied. You are not satisfied.)" })],
    { fx: [
      { t: "know", id: "clue_sleeve", label: "Genji's sleeve is wet with mountain water, and grey clay under his nails — he climbs the sealed path." },
      { t: "rel", npc: "genji", dim: "suspicion", d: 10 },
    ], voices: [v("reason", "The sealed path. The sleeve. The gatekeeper guards a gate — or reports on everyone who approaches one.")] }),
  N("gate.sleeve_f", "gate",
    "You look a half-second too long. Genji pulls his sleeve down with a snap of cloth. “Gate sweats,” he says. “So do walls. So, apparently, do archivists' imaginations.” His hand has drifted to the spear leaning by the brazier, casually as a man reaching for a cup.",
    [c("g10", "Let it rest.", "gate.hub")],
    { fx: [{ t: "rel", npc: "genji", dim: "suspicion", d: 10 }] }),
  N("gate.tax", "gate",
    "The word *assessor* does what the Privy Seal could not. Genji's face goes through three seasons in a second — surprise, annoyance, and a wary respect for anyone who carries money's wrath. “Why didn't the writ *say*.” He waves you through and immediately sends a boy running ahead toward the elder's house. You have entered Kagerou as a lie. The lie will get around before you do.",
    [c("g11", "Walk in before the story grows.", "hub.village")],
    { speaker: "Genji, the Gatekeeper", kanji: "源", fx: [
      { t: "flag", id: "entered" }, { t: "flag", id: "lied_tax" }, { t: "questStage", id: "names_under_stones", stage: 1 },
      { t: "memory", npc: "genji", text: "Came in calling himself a tax assessor. The writ says archivist. One of them is a lie, and I know which one I fear less.", w: 3 },
      { t: "rel", npc: "genji", dim: "suspicion", d: 20 }, { t: "rel", npc: "genji", dim: "fear", d: 10 },
    ]}),
  N("gate.tax_f", "gate",
    "“Assessor,” Genji says, and extends one broad palm. “Assessment ledger, then. Stamp of the Revenue Office. You people never travel without the *ledger*.” He smiles without his eyes. “Funny. Your writ says archivist, and your boots say road, and your hands say — well. Try again, paper man. Truthfully this time.”",
    [c("g12", "Reconsider your approach.", "gate.hub")],
    { fx: [{ t: "rel", npc: "genji", dim: "suspicion", d: 15 }] }),
  N("gate.duel_win", "gate",
    "You do not draw. You only rest your hand there, and the gate goes very quiet — until a young voice cracks behind you: “*Genji, step aside!*” A boy-warrior comes off the wall with a bokken like a falling branch. What follows lasts four heartbeats: his cut, your pivot, your palm finding his shoulder, the dust where he was standing. He sits up blinking. Genji opens the gate without a word, and does not meet your eyes as you pass.",
    [c("g13", "Offer the boy a hand up, then enter.", "hub.village", { say: "Good cut. Your footwork is honest. Tell the elder the archivist has arrived." })],
    { fx: [
      { t: "flag", id: "entered" }, { t: "flag", id: "dueled" }, { t: "questStage", id: "names_under_stones", stage: 1 },
      { t: "rel", npc: "kenta", dim: "respect", d: 20 }, { t: "rel", npc: "kenta", dim: "fear", d: 5 },
      { t: "rel", npc: "genji", dim: "fear", d: 20 }, { t: "faction", id: "village", d: -10 },
      { t: "memory", npc: "kenta", text: "Put me in the dust at the gate with an open hand. Clean work, no cruelty. I would follow that grip.", w: 3 },
      { t: "memory", npc: "genji", text: "Came through the gate over Kenta's body. Politely. That is somehow worse.", w: 2 },
    ]}),
  N("gate.duel_lose", "gate",
    "The blow comes from behind and above — a bokken cracking across your wrist like a magistrate's gavel. Your sword stays in its scabbard, which is where it will remain, because the boy-warrior on the wall has a second strike already chambered and the patience of someone who has practised it ten thousand times. “Sword stays sheathed in Kagerou,” he says, almost gently. Genji escorts you off the road with one hand on your elbow, firm as a coffin lid.",
    [c("g14", "Accept the lesson. For now.", "gate.roadside")],
    { fx: [
      { t: "flag", id: "dueled" }, { t: "flag", id: "bruised" }, { t: "mod", skill: "swordsmanship", d: -1, label: "Bruised wrist" },
      { t: "rel", npc: "kenta", dim: "respect", d: 5 }, { t: "memory", npc: "kenta", text: "Drew on the gate. Lost to my first strike. Bold, anyway.", w: 2 },
    ], voices: [v("willpower", "Remember the angle of his cut. Humiliation is also a teacher — the strictest kind.")] }),
  N("gate.roadside", "gate",
    "The road accepts you back without comment. Your wrist throbs in time with your pride. Through the gate timbers you can hear the village: a hammer, a child laughing, water. All of it on the other side of a wall you could climb, if you were the kind of person who climbs walls at night.",
    [
      c("g15", "Show the writ again — humbly this time.", "x", {
        check: { skill: "persuasion", dc: 9, pass: "gate.pass", fail: "gate.deny" },
      }),
      c("g16", "Wait for nightfall.", "gate.wait", { cond: { t: "not", of: { t: "period", oneOf: ["evening", "night"] } } }),
    ]),
  N("gate.wait", "gate",
    "You make a small fire off the road, boil tea, and let the light fail. The village closes itself like an evening flower — shutters, bolts, one long bell from somewhere above the roofs. And then the mist comes up out of the valley, and the gate's braziers become two drowning lanterns, and the wall becomes a rumour of a wall.",
    [c("g17", "Move.", "gate.hub")],
    { fx: [{ t: "time", minutes: 420 }], voices: [v("perception", "Past the east brazier — a dark mouth at the wall's base. A drainage culvert, wide enough for a person who doesn't mind being wet.")] }),
  N("gate.sneak", "gate",
    "The culvert is wet, low, and mercifully short. You come up behind a stack of cedar shingles with river water in your boots and the village spread around you like a held secret: lantern-lit lanes, a sleeping well, the dark shoulder of the mountain overhead. Nobody saw you arrive. That will matter — what is unseen is either worthless or dangerous, and Kagerou will have to decide which you are.",
    [c("g18", "Get your bearings.", "hub.village")],
    { fx: [{ t: "flag", id: "entered" }, { t: "flag", id: "snuck" }, { t: "questStage", id: "names_under_stones", stage: 1 }] }),
  N("gate.sneak_f", "gate",
    "You are halfway through the culvert when a torch blooms at the far end, and Genji's face fills the dark like a moon with opinions. “Drainage,” he says, hauling you out by the collar with terrible courtesy. “Carries water. Also rats. Also *archivists*.” He marches you through the waking village with a hand on your shoulder, and every shutter you pass opens an eye. “The elder will decide what you are.”",
    [c("g19", "Straighten your coat. Meet the elder.", "elder.meet")],
    { fx: [
      { t: "flag", id: "entered" }, { t: "flag", id: "escorted" }, { t: "questStage", id: "names_under_stones", stage: 1 },
      { t: "rel", npc: "genji", dim: "suspicion", d: 15 },
      { t: "memory", npc: "genji", text: "Crawled through the culvert in the dark like a debt come to collect.", w: 2 },
    ]}),
];

/* ============================== VILLAGE HUB ================================ */

const HUB: GNode[] = [
  N("hub.village", "village",
    "Kagerou Square is a postcard that has learned to watch you back. A stone well at the centre, cedar houses with deep eaves, the elder's house on the rise, a temple stair climbing away to the north. Everyone is polite. Everyone is also, you notice, *inside* — conversations happening behind paper screens, eyes through slats. A village prosperous, unremarkable, and thoroughly on guard.",
    [
      c("h_elder", "Call on Elder Ochiba.", "elder.meet", { cond: { t: "notflag", id: "elder_met" } }),
      c("h_elder2", "Visit the elder again.", "elder.hub", { cond: { t: "flag", id: "elder_met" } }),
      c("h_kenta", "Approach the young guard at the well.", "kenta.meet", {
        cond: { t: "all", of: [{ t: "notflag", id: "kenta_met" }, { t: "period", oneOf: ["dawn", "morning", "noon", "evening"] }] },
      }),
      c("h_kenta2", "Find Kenta at the well.", "kenta.hub", {
        cond: { t: "all", of: [{ t: "flag", id: "kenta_met" }, { t: "period", oneOf: ["dawn", "morning", "noon", "evening"] }] },
      }),
      c("h_jikai", "Climb to the mountain temple.", "jikai.meet", {
        cond: { t: "all", of: [{ t: "notflag", id: "jikai_met" }, { t: "not", of: { t: "period", oneOf: ["night"] } }] },
        locked: "The temple bell has gone dark for the night. Monks sleep — presumably.",
      }),
      c("h_jikai2", "Seek out the monk Jikai.", "jikai.hub", {
        cond: { t: "all", of: [{ t: "flag", id: "jikai_met" }, { t: "not", of: { t: "period", oneOf: ["night"] } }] },
        locked: "The temple bell has gone dark for the night. Monks sleep — presumably.",
      }),
      c("h_ran", "Browse Ran's stall.", "ran.meet", {
        cond: { t: "all", of: [{ t: "notflag", id: "ran_met" }, { t: "period", oneOf: ["morning", "noon"] }] },
        locked: "The stall is shuttered. Trade happens in daylight, in Kagerou.",
      }),
      c("h_ran2", "Talk to Ran at her stall.", "ran.hub", {
        cond: { t: "all", of: [{ t: "flag", id: "ran_met" }, { t: "period", oneOf: ["morning", "noon"] }] },
        locked: "The stall is shuttered. Trade happens in daylight, in Kagerou.",
      }),
      c("h_sayo", "Walk out to the camp beyond the south wall.", "sayo.meet", { cond: { t: "notflag", id: "sayo_met" } }),
      c("h_sayo2", "Return to Sayo's camp.", "sayo.hub", { cond: { t: "flag", id: "sayo_met" } }),
      c("h_well", "Watch the children drawing by the well.", "well.children", { cond: { t: "notflag", id: "children_seen" } }),
      c("h_path", "Take the sealed path up the mountain.", "path.gate", {
        cond: { t: "knowsCount", ids: CLUES, n: 2 },
        locked: "Something is up there — but the mountain keeps its counsel. Gather more threads before you climb.",
      }),
      c("h_rest", "Rest until morning.", "hub.rest", {
        cond: { t: "period", oneOf: ["evening", "night"] },
        locked: "The day is not done with you yet.",
      }),
    ],
    {
      voices: [
        v("empathy", "Politeness this even is a manufactured product. Somebody here issued instructions."),
        v("perception", "No children's grave markers in the temple stair shrine row. Odd, for forty years of 'unremarkable'."),
      ],
      at: 20,
    }),
  N("hub.rest", "village",
    "You take a room above the storehouse — the only room offered, and you notice the window faces the mountain. Sleep comes in thin layers. Somewhere past midnight the mist presses against the paper screen like a palm, and you dream of six stones in a row, patient as teeth. You wake with the taste of iron on your tongue, and the certainty that something has been *counting* you.",
    [
      c("h_r1", "Wake with the bell.", "hub.village"),
      c("h_r2", "Remember the dream more clearly.", "hub.dream", {
        cond: { t: "all", of: [{ t: "notflag", id: "dream_six_stones_seen" }, { t: "any", of: [{ t: "know", id: "drawings" }, { t: "know", id: "clue_sleeve" }] }] },
        say: "(You lie still. The dream is not finished. The stones are waiting.)",
      }),
    ],
    { fx: [{ t: "time", minutes: 600 }] }),
  N("hub.dream", "village",
    "The dream returns, unbidden: six stones in a row, patient as teeth. You walk among them, and each stone has a name carved into it — names you have not yet read, but will. The seventh stone is blank, and it is *waiting*. A voice — not a voice, a *presence* — says: *The arithmetic is assembling itself. You are the seventh variable.* You wake with your hand on the window frame, and the mist outside is shaped like a hand pressing against the glass. The dream is not a dream. It is a *message*, and the sender is patient.",
    [c("h_r3", "Rise. The day is waiting.", "hub.village")],
    { fx: [
      { t: "dream", id: "six_stones", title: "The Six Stones" },
      { t: "flag", id: "dream_six_stones_seen" },
      { t: "ency", id: "dream_six_stones", title: "The Dream of Six Stones", text: "Six stones in a row, patient as teeth. The seventh is blank, and it is waiting. The arithmetic is assembling itself. You are the seventh variable. The dream is not a dream. It is a message, and the sender is patient.", category: "Dreams" },
    ], voices: [
      v("reason", "The dream is not random. It is *structured*. Six stones, seven variables. The arithmetic is assembling itself, and you are part of it."),
      v("empathy", "The presence in the dream is not hostile. It is *waiting*. It has been waiting for forty years, and it can wait a little longer."),
      v("lore", "The seventh stone is blank. In the old rites, the seventh pillar was always the one who *chose*. The others were given. The seventh volunteered."),
    ]}),
  N("well.children", "village",
    "Three children sit by the well with charcoal and paper, drawing with the dead seriousness of people documenting something important. As your shadow crosses their work, the papers vanish up three sleeves in perfect unison — a drill, practised. The youngest is not fast enough. You see it for one second: a shrine on a ridge, a rope around it, and *six figures* standing beneath the roof. Small figures. The children look at you with eyes that are already negotiating.",
    [
      c("w1", "Kneel to their height. Ask about the drawing — softly.", "x", {
        check: { skill: "empathy", dc: 9, pass: "well.ask", fail: "well.ask_f" },
      }),
      c("w2", "Name what you saw, plainly. “That's the shrine on the ridge.”", "x", {
        check: { skill: "lore", dc: 10, pass: "well.name", fail: "well.ask_f" },
      }),
    ],
    { fx: [{ t: "flag", id: "children_seen" }] }),
  N("well.ask", "village",
    "The youngest — a girl with ink-stained fingers — decides you are safe the way children decide: instantly and for reasons no adult can audit. “It's the *real* house,” she whispers. “The one on the mountain. Six people live there. They're very old and very quiet and my grandmother says we feed them so they stay asleep.” The older children grab her shoulders. “We weren't drawing anything,” says one, with enormous dignity. They run. The abandoned paper stays: six figures, a rope, and a seventh figure — sketched, then furiously crossed out.",
    [c("w3", "Pocket the drawing.", "hub.village", { say: "(The drawing goes into your sleeve. Evidence of a game. Or of a census.)" })],
    { fx: [
      { t: "know", id: "drawings", label: "The children draw a shrine that doesn't exist — six sleepers beneath it, and a seventh figure crossed out." },
      { t: "ency", id: "childrens_drawings", title: "The Children's Drawings", text: "The children of Kagerou draw a shrine that does not exist on any map. Six figures sleep beneath it, and a seventh is crossed out. They are taught silence about it. The curriculum includes fear.", category: "Village Life" },
    ] }),
  N("well.name", "village",
    "The word *shrine* lands like a dropped bowl. The eldest child studies you for a long moment, then delivers, in the flat tone of someone passing on cargo: “Grandmother says the shrine ate the old road and six people with it, and the rope is its mouth tied shut. Also we aren't allowed to talk to you.” They leave in a flock. The youngest drops her paper on purpose, you think. Deliberate losses have a certain style.",
    [c("w4", "Take the paper.", "hub.village")],
    { fx: [{ t: "know", id: "drawings", label: "The children draw a shrine that doesn't exist — six sleepers beneath it, and a seventh figure crossed out." }] }),
  N("well.ask_f", "village",
    "Whatever you do — the height, the tone, the word — it's the wrong key. The children fold like paper fans and scatter, and you are left alone by the well holding nothing but the smell of charcoal and the certainty that you have just been *reported*.",
    [c("w5", "Note the reaction.", "hub.village")],
    { voices: [v("reason", "Children don't coordinate silence. They're taught it. There is a curriculum in this village, and you are not on it.")] }),
];

/* ================================== RAN ==================================== */

const RAN: GNode[] = [
  N("ran.meet", "village",
    "Ran's stall is the loudest square metre in Kagerou: bolts of indigo, combs, dried persimmon, a cage of furious quail. Ran herself is a small woman conducting all of it like an orchestra, and she clocks you the way merchants clock weather — what are you carrying, and what are you likely to buy. “Stranger! The road treated you badly, I can tell by the boots. Sit, sit — everything is for sale, including my opinions.”",
    [
      c("r1", "Ask about the village.", "ran.talk"),
      c("r2", "Buy a warding charm from the rack.", "ran.buy", { cond: { t: "notitem", id: "charm" } }),
      c("r3", "Ask about the mountain.", "ran.mountain", {
        cond: { t: "any", of: [{ t: "know", id: "drawings" }, { t: "know", id: "clue_sleeve" }] },
        locked: "She reads your face, laughs, and changes the subject. Merchants sell to trust; earn a thread first.",
      }),
      c("r4", "Take your leave.", "hub.village"),
    ],
    { speaker: "Ran, the Merchant", kanji: "蘭", fx: [{ t: "flag", id: "ran_met" }], at: 25 }),
  N("ran.talk", "village",
    "“Kagerou?” She arranges combs she has already arranged. “Forty good years. Best rice in the province, ask anyone, ask *the rice*. Elder keeps the ledger, monk keeps the bell, Genji keeps the gate, and I keep everyone supplied in things they don't need.” She leans in, merchant to merchant. “You want the one true thing in this village, archivist? It's that the elder's ledger has a lock on it. Ledgers don't have locks. *Doors* do.”",
    [c("r5", "Ask what she sells for the mountain.", "x", {
      check: { skill: "perception", dc: 10, pass: "ran.charms", fail: "ran.charms_f" },
    })],
    { speaker: "Ran, the Merchant", kanji: "蘭", fx: [{ t: "rel", npc: "ran", dim: "trust", d: 5 }] }),
  N("ran.charms", "village",
    "Your eyes walk the rack of warding charms — and count. “Twelve hooks,” you say. “Two charms.” Ran's smile performs a small, impressed bow. “Bought. All of them, inside the month. People want paper between them and… whatever the bell rings for these days.” She glances toward the mountain with the speed of someone checking a stove. “I don't ask who buys. I'm a merchant, not a *historian*.” The words are light. The glance was not.",
    [c("r6", "Let her have the last word.", "ran.hub")],
    { fx: [{ t: "know", id: "seal_charms", label: "Every warding charm in Kagerou was bought within a month. Fear is moving through the village like a season." }] }),
  N("ran.charms_f", "village",
    "“Sell for the mountain?” She laughs a shade too brightly. “The mountain doesn't shop, stranger. Next question.” But her hand has drifted to the charm rack, arranging what is nearly bare — and she catches herself, and stops arranging.",
    [c("r7", "Move on.", "ran.hub")],
    { voices: [v("perception", "The rack is nearly empty. Recently. She just showed you without meaning to.")] }),
  N("ran.buy", "village",
    "The charm is a knot of folded paper around a sliver of temple bell-bronze. “Monk blesses them, I sell them, the mountain ignores them — that's the whole economy,” Ran says, taking your coins with genuine cheer. “Wear it where you can see it. Things that mean you harm hate to be *noticed* doing it.”",
    [c("r8", "Wear it where you can see it.", "ran.hub")],
    { fx: [{ t: "item", id: "charm", add: true, label: "Warding charm — knotted paper over temple bronze" }, { t: "rel", npc: "ran", dim: "affection", d: 5 }] }),
  N("ran.mountain", "village",
    "The cheer drains out of her like water from a tilted cup. “You've been asking the wrong questions in the right places,” she murmurs, hands still busy with combs for anyone watching. “So here's one for free: Genji climbs the mountain every new moon. Comes back smelling of incense and river clay, and won't eat till morning. And the map-woman outside the wall — the one with the red thread on her maps — she pays *double* for anyone who'll draw the upper ridge. Double, archivist. Nobody pays double for scenery.”",
    [c("r9", "Thank her, quietly.", "ran.hub")],
    { speaker: "Ran, the Merchant", kanji: "蘭", fx: [
      { t: "know", id: "genji_moon", label: "Genji climbs the sealed path every new moon, and returns smelling of incense and clay." },
      { t: "rel", npc: "ran", dim: "trust", d: 5 },
    ]}),
  N("ran.hub", "village",
    "Ran is back to conducting her small orchestra of goods, but her eyes keep finding the mountain between transactions, the way a mother's keep finding a cradle.",
    [
      c("r10", "Ask about the village ledger.", "ran.talk", { cond: { t: "notknow", id: "seal_charms" } }),
      c("r11", "Ask about the mountain.", "ran.mountain", {
        cond: { t: "all", of: [
          { t: "notknow", id: "genji_moon" },
          { t: "any", of: [{ t: "know", id: "drawings" }, { t: "know", id: "clue_sleeve" }] },
        ] },
      }),
      c("r12", "Buy a warding charm.", "ran.buy", { cond: { t: "notitem", id: "charm" } }),
      c("r13", "Leave the stall.", "hub.village"),
    ]),
];

/* ================================= KENTA =================================== */

const KENTA: GNode[] = [
  N("kenta.meet", "village",
    "The guard at the well is barely out of boyhood — Kenta, by the look of the family jaw he shares with no one visible. He carries a real sword the way beginners carry real swords: carefully, and a little proud. He watches you approach with his hand resting on the tsuka, which is either protocol or nerves. In Kagerou you suspect the two are cousins. “Well water's for villagers,” he announces. “Looking's free.”",
    [
      c("k1", "Ask him about the well.", "kenta.well"),
      c("k2", "Ask about the village.", "kenta.talk"),
      c("k3", "Propose a friendly bout — steel against his bokken.", "x", {
        cond: { t: "notflag", id: "kenta_friend" },
        check: { skill: "swordsmanship", dc: 11, pass: "kenta.spar_win", fail: "kenta.spar_lose" },
      }),
      c("k4", "Leave him to his post.", "hub.village"),
    ],
    { speaker: "Kenta, Well-Guard", kanji: "健", fx: [{ t: "flag", id: "kenta_met" }], at: 25,
      voices: [v("empathy", "He guards the well. Look again — his eyes keep going to the mountain. He is guarding the well *from* the mountain.")] }),
  N("kenta.well", "village",
    "“The well?” He straightens, glad of doctrine. “Deepest in the province. Never dropped, even the drought years. Elder says the mountain *gives* it.” A pause. Then, quieter, for you alone: “Some mornings the water tastes of iron. Faint. Like a coin held on the tongue. No one says it out loud, so I'll say it once to a stranger and never again: *iron*, archivist.” His hand tightens on the well-rope. “My sister used to say water remembers what it flows over.”",
    [c("k5", "Ask about his sister.", "x", {
      check: { skill: "empathy", dc: 10, pass: "kenta.sister", fail: "kenta.sister_f" },
    })],
    { speaker: "Kenta, Well-Guard", kanji: "健", fx: [{ t: "rel", npc: "kenta", dim: "trust", d: 5 }] }),
  N("kenta.sister", "village",
    "The words come out of him like something he has carried a long way without being allowed to set down. “Miyo. Ten years gone. Went to the capital for work, the elder said, and the capital is big and people get lost in it.” He is looking at the water. “Except her hairpin turned up on the mountain path. The *sealed* path, where nothing walks. I climbed up to get it and Genji caught me and I was sick for the elder's kindness — 'boys imagine things.'” He finally looks at you. “I don't imagine things, archivist. I found the pin *above* the rope. Someone put it there. Or someone left it running.”",
    [c("k6", "Say nothing. Let it stand.", "kenta.hub", { say: "I'm a historian, Kenta. Finding things that were left is the whole of my trade." })],
    { fx: [
      { t: "know", id: "kenta_sister", label: "Kenta's sister Miyo vanished ten years ago. Her hairpin was found above the seal-rope, on the sealed path." },
      { t: "flag", id: "kenta_opened" }, { t: "rel", npc: "kenta", dim: "trust", d: 10 },
      { t: "memory", npc: "kenta", text: "Listened to the whole thing about Miyo and didn't once look away. First person who hasn't.", w: 3 },
    ]}),
  N("kenta.sister_f", "village",
    "The shutter comes down so fast you can almost hear it click. “She's in the capital,” he says, in the flat voice of a recited thing. “The capital is big.” He goes back to watching the square, and you understand that the conversation is over and has been over for ten years, and that you were not included in it.",
    [c("k7", "Withdraw.", "kenta.hub")],
    { fx: [{ t: "rel", npc: "kenta", dim: "suspicion", d: 5 }] }),
  N("kenta.talk", "village",
    "“Village is fine.” The recitation is well practised: good harvests, good water, good elder, good mountain. Then the boy gets the better of the guard: “Forty years of *good*. My grandfather used to say a field that never fails is a field that's being fed by somebody else. Elder heard him say it once. Grandfather stopped saying things after that.” Kenta shrugs with one shoulder, pretending it was nothing. It was not nothing.",
    [c("k8", "Nod, and remember it.", "kenta.hub")],
    { speaker: "Kenta, Well-Guard", kanji: "健", fx: [{ t: "rel", npc: "kenta", dim: "respect", d: 5 }] }),
  N("kenta.spar_win", "village",
    "He is quick — quicker than the village has any right to produce — but quickness is a currency you carry in bulk. You give him three clean exchanges, let him feel the edge of a real answer, then take his bokken apart with a disarming that is almost polite. He stares at his empty hands, then at you, then *grins*, the whole face at once. “Again tomorrow,” he says. It is not a question. The square has gathered an audience; several of them look displeased that you won. Several look relieved.",
    [c("k9", "Bow to him properly.", "kenta.hub", { say: "Your speed is real, Kenta. Someone taught you to be afraid of nothing but wasted motion. Keep that." })],
    { fx: [
      { t: "flag", id: "kenta_friend" }, { t: "rel", npc: "kenta", dim: "respect", d: 20 }, { t: "rel", npc: "kenta", dim: "affection", d: 5 },
      { t: "memory", npc: "kenta", text: "Crossed steel at the well and won like it was a gift, not a beating. I would follow that grip anywhere. Even up.", w: 3 },
    ]}),
  N("kenta.spar_lose", "village",
    "The bokken finds your wrist, your ribs, and finally the flat of your blade with a crack that ends the argument. Kenta steps back, horrified at his own competence. “I— you were *humouring* me.” He isn't sure. You let him believe it, which is a kindness and therefore, in your trade, a small lie. He watches you go with an expression that is half gratitude and half something he doesn't have a name for yet.",
    [c("k10", "Wave off the bruise.", "kenta.hub")],
    { fx: [
      { t: "flag", id: "kenta_friend" }, { t: "rel", npc: "kenta", dim: "respect", d: 10 }, { t: "rel", npc: "kenta", dim: "affection", d: 10 },
      { t: "memory", npc: "kenta", text: "Fought me and lost on purpose to give me the win. Kind. Kindness is rarer here than he knows.", w: 2 },
    ]}),
  N("kenta.hub", "village",
    "Kenta is back at the well, but his posture has changed — he stands differently around you now, the way people stand near someone who has seen them without flinching.",
    [
      c("k11", "Ask about the well again.", "kenta.well", { cond: { t: "notflag", id: "kenta_opened" } }),
      c("k12", "Spar again.", "x", {
        cond: { t: "notflag", id: "kenta_friend" },
        check: { skill: "swordsmanship", dc: 11, pass: "kenta.spar_win", fail: "kenta.spar_lose" },
      }),
      c("k13", "Tell him what the names on the pillar said.", "kenta.truth", {
        cond: { t: "all", of: [{ t: "flag", id: "kenta_opened" }, { t: "know", id: "the_names" }, { t: "notflag", id: "told_kenta" }] },
      }),
      c("k14", "Ask him to speak for you at the rope gate.", "kenta.ask_escort", {
        cond: { t: "all", of: [{ t: "flag", id: "kenta_friend" }, { t: "notflag", id: "kenta_escort" }] },
      }),
      c("k15", "Return to the square.", "hub.village"),
    ]),
  N("kenta.truth", "village",
    "You tell him plainly — the pillar, the six names and their forty years, and the two newer cuts, and the one among them that is *Miyo*. You do not soften it; he asked you once, with his eyes, not to be lied to, and you have kept records too long to ruin the habit now. Kenta takes it the way a wall takes a ram: standing, silently, and then all at once not standing. He is quiet for a long time. “Ten years,” he says finally. “I guarded the water she was under.” He wipes his face with the back of his hand, furiously. “When you go up — I'll be at the rope gate. Genji lets *me* pass. Nobody asks why.”",
    [c("k16", "Stand with him until it passes.", "kenta.hub")],
    { fx: [
      { t: "flag", id: "told_kenta" }, { t: "flag", id: "kenta_escort" },
      { t: "rel", npc: "kenta", dim: "trust", d: 25 }, { t: "rel", npc: "kenta", dim: "respect", d: 15 },
      { t: "memory", npc: "kenta", text: "Told me the truth about Miyo. The whole truth, unsoftened, because I asked. I owe that forever.", w: 5 },
      { t: "faction", id: "village", d: -5 },
    ], voices: [v("empathy", "Grief and gratitude, arriving together. He will be loyal to you now, which is a weight — carry it carefully.")] }),
  N("kenta.ask_escort", "village",
    "“The rope gate.” He says it like a man accepting a duel. “Genji reports every crossing to the elder, and I… I'm allowed up. Nobody asks why, and I've never asked either, which tells you something about this village.” He looks at you for a long moment. “You're going to look at what they buried.” Not a question. “All right. When you climb, I'll be there. Genji lets me pass, and what I bring with me is my business.”",
    [c("k17", "Accept.", "kenta.hub")],
    { fx: [
      { t: "flag", id: "kenta_escort" }, { t: "rel", npc: "kenta", dim: "trust", d: 10 },
      { t: "memory", npc: "kenta", text: "Asked me to help reach the mountain instead of sneaking past everyone. Trusts me. That is… new.", w: 3 },
    ]}),
];

/* ================================= JIKAI =================================== */

const JIKAI: GNode[] = [
  N("jikai.meet", "temple",
    "The temple is older than the village's memory of itself: moss eating stone, a bell green as a pond. The monk sweeping the stair is old in the way mountains are old — not frail, merely unhurried. He does not look up. “Sweeping,” he says, to no one, to you. “The stair grows a little longer each year. Or I grow a little shorter. The bell disagrees with both of us.” Only when you have stood in silence for a respectful while does he raise his eyes. “Jikai. And you are the one everyone is whispering about. The paper man. Come to write down what we *don't* remember.”",
    [
      c("j1", "Ask what sleeps under the shrine.", "jikai.riddle"),
      c("j2", "Quote the old foundation sutra, from memory.", "x", {
        check: { skill: "lore", dc: 11, pass: "jikai.sutra", fail: "jikai.sutra_f" },
      }),
      c("j3", "Sit down on the stair, and say nothing at all.", "x", {
        check: { skill: "willpower", dc: 10, pass: "jikai.silence", fail: "jikai.silence_f" },
      }),
      c("j4", "Bow, and climb back down.", "hub.village"),
    ],
    { speaker: "Jikai, the Monk", kanji: "慈", fx: [{ t: "flag", id: "jikai_met" }], at: 30 }),
  N("jikai.riddle", "temple",
    "The broom pauses. “What sleeps under the shrine,” he repeats, tasting it. “Everyone asks *what*. Nobody asks *who*, which is the honest question, and nobody asks *why it sleeps*, which is the kind one.” He resumes sweeping. “I will give you one stone to carry, paper man. What sleeps under the shrine is *gratitude*. A village's gratitude, forty years deep, for a harvest that never fails. Gratitude is the heaviest thing there is. It is the worst thing that ever sleeps.” The broom lifts a small grey leaf and lets it down again, gently, like something being buried.",
    [c("j5", "Carry the stone down the stair.", "jikai.hub")],
    { speaker: "Jikai, the Monk", kanji: "慈", voices: [v("lore", "Hitobashira. Human pillars. Foundations sealed with a life so the structure above would never fall. Outlawed in the old codes — and remembered in the old *rhymes*.")] }),
  N("jikai.sutra", "temple",
    "The words come out of you in the old tongue, halting but true: *that which is given beneath is held beneath; the stone forgets, the harvest remembers*. The broom stops entirely. Jikai looks at you for the first time as a person rather than a weather. “You can actually read it. The real script, not the copies.” He sets the brook against the wall with ceremony. “Then you can read what your writ does not say: this temple's oldest sutra speaks of *pillars beneath the stones*. Foundations, archivist. This village was not built *on* the mountain. It was built *with* it.”",
    [c("j6", "Ask to see the sutra.", "jikai.hub")],
    { speaker: "Jikai, the Monk", kanji: "慈", fx: [
      { t: "know", id: "old_script", label: "The temple's oldest sutra speaks of 'pillars beneath the stones' — foundation sacrifices, an outlawed rite." },
      { t: "ency", id: "foundation_sutra", title: "The Foundation Sutra", text: "The temple's oldest sutra speaks of 'pillars beneath the stones' — foundation sacrifices, an outlawed rite. The sutra is in the old script, and only three people in forty years have been able to read it. The village built itself *with* the mountain, not *on* it.", category: "Lore" },
      { t: "rel", npc: "jikai", dim: "respect", d: 15 }, { t: "rel", npc: "jikai", dim: "trust", d: 5 },
      { t: "memory", npc: "jikai", text: "Read the old script unprompted. In forty years of sweeping, I have met three who could. Be the third good one.", w: 3 },
    ]}),
  N("jikai.sutra_f", "temple",
    "You reach for the old tongue and bring up a handful of near-misses. Jikai listens with the patience of a man who has heard every mispronunciation since the founding. “Close,” he says, not unkindly. “The sutra does not open for tourists, paper man. Come back when the words are yours.” He sweeps. The audience, clearly, is over.",
    [c("j7", "Accept the lesson.", "jikai.hub")],
    { fx: [{ t: "rel", npc: "jikai", dim: "respect", d: 5 }] }),
  N("jikai.silence", "temple",
    "You sit. He sweeps. The mist moves through the temple grounds like a slow tide, and you let the hour happen without fighting it — no questions, no archive, no capital. It is harder than any skill check you have ever failed. Eventually Jikai sets down the broom, pours tea from a blackened pot, and sits beside you as though you had been expected all along. From his sleeve he produces a knot of folded paper around temple bronze. “For the road you haven't told anyone about yet. The rope remembers the hand that tied it. If anyone asks — the mountain asked.”",
    [c("j8", "Accept the amulet with both hands.", "jikai.hub")],
    { fx: [
      { t: "item", id: "amulet", add: true, label: "Jikai's amulet — knotted paper over temple bronze, warm as a held hand" },
      { t: "rel", npc: "jikai", dim: "trust", d: 15 }, { t: "faction", id: "temple", d: 10 },
      { t: "memory", npc: "jikai", text: "Sat with me in silence for an hour without once reaching for the pen. The mountain noticed. So did I.", w: 3 },
    ]}),
  N("jikai.silence_f", "temple",
    "You sit. The silence lasts exactly as long as your discipline does — which is to say, not long. Your knee aches, your mind files reports, your fingers itch for the pen. Jikai chuckles without stopping his sweep. “The body sits, the paper man paces. Come back when the two of you agree on a destination.”",
    [c("j9", "Rise, bow, descend.", "jikai.hub")],
    { fx: [{ t: "rel", npc: "jikai", dim: "affection", d: 5 }] }),
  N("jikai.hub", "temple",
    "The monk has returned to his stair, but the sweeping has become companionable — you are part of the temple's weather now, and the bell seems to hold its note a little longer when you pass beneath it.",
    [
      c("j10", "Ask what sleeps under the shrine.", "jikai.riddle", { cond: { t: "notknow", id: "old_script" } }),
      c("j11", "Sit in silence again.", "jikai.silence", { cond: { t: "notitem", id: "amulet" } }),
      c("j12", "Ask about the Silent Keepers.", "jikai.keepers", {
        cond: { t: "all", of: [{ t: "know", id: "old_script" }, { t: "notknow", id: "keepers" }] },
        locked: "He will not speak of orders to a stranger. Prove you can read what this mountain writes.",
      }),
      c("j13", "Ask what he knows of the map-woman.", "jikai.sayo", {
        cond: { t: "all", of: [{ t: "flag", id: "sayo_met" }, { t: "notknow", id: "sayo_line" }] },
      }),
      c("j14", "Descend to the square.", "hub.village"),
    ]),
  N("jikai.keepers", "temple",
    "The broom goes still. When Jikai speaks, it is in the voice men use for things that are said once. “The seal is not rope, archivist. Rope is a *gesture*. The seal is a promise kept by a handful of people, each generation, who know the arithmetic: six given beneath, forty years of harvest above. We are the Silent Keepers — the elder's line, my line, the gatekeeper's. We weigh the price every new moon and we keep the ledger honest, because a village that forgets what it paid will pay *double*.” He meets your eyes. “You may write about many things. If you write about us, you had best be one of us.”",
    [c("j15", "“What does it cost, to be one of you?”", "jikai.oath", {
      cond: { t: "rel", npc: "jikai", dim: "trust", gte: 10 },
      locked: "He studies you and finds the ink not yet dry enough. Earn more of his trust.",
    })],
    { fx: [{ t: "know", id: "keepers", label: "The Silent Keepers — elder, monk, gatekeeper — renew the seal each new moon, and keep the ledger of what the village paid." }] }),
  N("jikai.oath", "temple",
    "“Everything,” Jikai says simply. “You would know the names and carry them, and never again sleep fully on the side of the village that forgets. You would weigh the price with us each new moon. You would be *trusted* with the worst arithmetic in the province.” He pours you tea — the gesture, you realise, is the question. “The mountain asks. That is how it is phrased. The mountain asks, and you answer with your whole life, or not at all.”",
    [c("j16", "Leave the tea undrunk. For now.", "jikai.hub")],
    { speaker: "Jikai, the Monk", kanji: "慈", fx: [
      { t: "faction", id: "keepers", d: 15 }, { t: "rel", npc: "jikai", dim: "trust", d: 5 },
      { t: "memory", npc: "jikai", text: "Asked the cost of the Keepers' vow without flinching. The mountain has begun asking about this one.", w: 3 },
    ]}),
  N("jikai.sayo", "temple",
    "Jikai is quiet for long enough that the mist crosses the courtyard. “The map-woman. Yes. I know her bloodline, though she does not know that I know it.” He turns a bead on some unseen rosary. “Her grandmother was Aki. Aki of the east field, who sang when the lots were drawn, because someone had decided the mountain deserved a song. The village wrote *landslide*. The child writes *maps*. The mountain, I suspect, writes neither.” He looks at you sharply. “She is owed a truth. The question is whether a truth, given, will function as a *gift* or a *blade*. You will decide that, paper man. You are exactly the sort of hand this village fears.”",
    [c("j17", "Let the weight of it settle.", "jikai.hub")],
    { fx: [
      { t: "know", id: "sayo_line", label: "Sayo's grandmother was Aki — one of the six names under the stone, who sang when the lots were drawn." },
      { t: "rel", npc: "jikai", dim: "respect", d: 5 },
    ]}),
];

/* ================================= ELDER =================================== */

const ELDER: GNode[] = [
  N("elder.meet", "village",
    "Elder Ochiba receives you in a room that is almost empty by choice: one scroll, one ikebana of severe beauty, one low table with tea already poured — she knew you were coming before you did. She is seventy and sits like a woman of fifty who has decided to be seventy. Her eyes go through your writ, your boots, your hands, and your *face*, in that order, and file everything. “The circuit archivist. Sit. Kagerou is honoured to be recorded.” The sentence is perfect. So is the temperature of the tea. You are being handled by a professional.",
    [
      c("e0", "(Bow, and apologise for the unorthodox arrival.)", "elder.purpose", {
        cond: { t: "flag", id: "escorted" }, say: "Elder. My arrival was not what I intended, nor what the gate intended. I apologise to your gatekeeper and your wall.",
      }),
      c("e1", "State your purpose.", "elder.purpose", { say: "The circuit record must include Kagerou: harvests, founding, the ledger of the years. I write what the village shows me — and only what it shows me." }),
      c("e2", "Compliment the village's prosperity, and watch her receive it.", "x", {
        say: "Forty years of harvest without a single failure. The capital calls that luck. I suspect it's administration.",
        check: { skill: "persuasion", dc: 10, pass: "elder.warm", fail: "elder.cool" },
      }),
      c("e3", "Ask about the village's history.", "elder.history", { cond: { t: "notknow", id: "ledger_gap" } }),
    ],
    { speaker: "Elder Ochiba", kanji: "落", fx: [{ t: "flag", id: "elder_met" }], at: 30,
      voices: [
        v("perception", "The tea is already poured. She knew you were coming. The question is not whether she expected you. The question is what she expected you to *do*."),
        v("empathy", "She is afraid. Not of you — not yet. Of something else. Her hands are still, but her eyes are not. She is holding something up, and she is tired."),
        v("lore", "The room is empty by choice. A woman who keeps an empty room is a woman who has something to hide, or something to protect. Sometimes they are the same thing."),
      ] }),
  N("elder.purpose", "village",
    "“Then we understand each other,” she says, with the warmth of a door closing politely. “Kagerou will show you its *official* history: the founding, the river works, the great harvests. You will find us prosperous and unremarkable, and your record will say so, and everyone will be satisfied.” She pours more tea. “A village is a story the living agree to tell, archivist. Be careful which pages you turn. Some of them are still *wet*.”",
    [c("e4", "Accept the tea.", "elder.hub")],
    { speaker: "Elder Ochiba", kanji: "落", fx: [{ t: "questStage", id: "names_under_stones", stage: 1 }] }),
  N("elder.warm", "village",
    "For a heartbeat — less — the mask thins, and you see something under it that is not pride. It looks like a person standing under a very large roof, listening for rain. “Administration,” she repeats. “Yes. Let us call it that. My family has administered this village's *story* for three generations, and I will tell you what my mother told me: a story is a roof, archivist. It does not matter whether it is true. It matters whether it *holds*.” The mask returns, perfectly fitted. “More tea?”",
    [c("e5", "Accept the tea.", "elder.hub")],
    { speaker: "Elder Ochiba", kanji: "落", fx: [
      { t: "rel", npc: "ochiba", dim: "trust", d: 10 }, { t: "rel", npc: "ochiba", dim: "respect", d: 5 },
      { t: "memory", npc: "ochiba", text: "Called our prosperity 'administration' to my face — and meant it kindly. Perceptive. Dangerous, or useful.", w: 2 },
    ]}),
  N("elder.cool", "village",
    "“Luck,” she says, and sets down her cup with a click that ends the subject. “The capital is welcome to its superstitions. Kagerou works its fields.” The temperature of the room has dropped by exactly the amount required to be deniable.",
    [c("e6", "Note it, and continue.", "elder.hub")],
    { fx: [{ t: "rel", npc: "ochiba", dim: "suspicion", d: 5 }] }),
  N("elder.history", "village",
    "She produces the ledger — the *outer* ledger, you suspect — bound in blue cloth, pages dense with forty years of grain. “Founding, river works, harvest tables. Copy what you need.” She watches you work with the stillness of a person auditing an audit. The pages are beautiful. The handwriting is three hands across three generations. It is also, you notice as your eyes move down a column, *too* beautiful: a village that has never had a bad year, a lean spring, a flooded field. A story with the weather removed.",
    [c("e7", "Study the columns closely.", "x", {
      check: {
        skill: "lore", dc: 11, pass: "elder.gap", fail: "elder.gap_f",
        mods: [{ cond: { t: "know", id: "seal_charms" }, d: 1, label: "You know what fear looks like in a market" }],
      },
    })],
    { speaker: "Elder Ochiba", kanji: "落" }),
  N("elder.gap", "village",
    "You find it in the third column of the oldest section, where the first generation's hand grows hurried: a season *skipped*. Not a bad harvest recorded — a season simply missing, the page numbering jumping over it like a stone over water. The same season, you calculate, as the landslide the writ mentions in one line. Villages do not forget seasons. Ledgers do not skip. *Hands* skip — hands that are being watched, or hands that are shaking.",
    [
      c("e8", "Close the ledger gently.", "elder.hub", { say: "(You close the ledger with the care of a man handling a sleeping animal.)" }),
      c("e8b", "Form a theory about the missing season.", "elder.theory", {
        cond: { t: "all", of: [{ t: "know", id: "ledger_gap" }, { t: "any", of: [{ t: "know", id: "clue_sleeve" }, { t: "know", id: "drawings" }] }, { t: "nottheory", id: "prosperity_rent" }] },
        say: "(You sit very still. The arithmetic is assembling itself: a missing season, a sealed path, children drawing a shrine that doesn't exist. The prosperity is not free. It is *rented*.)",
      }),
    ],
    { fx: [
      { t: "know", id: "ledger_gap", label: "The official ledger skips an entire season — the same season as the 'landslide', forty years ago." },
      { t: "rel", npc: "ochiba", dim: "suspicion", d: 5 },
    ], voices: [v("reason", "One missing season. Six missing names, if the children draw true. The arithmetic is assembling itself whether you help it or not.")] }),
  N("elder.theory", "village",
    "The theory forms in your mind like a sentence you have been trying to write for years: *The prosperity is rented. The rent is paid. The payment is not grain.* You do not say it aloud — not yet, not here, not to the woman whose hands are so still they could be carved from the same wood as the table. But you write it in the margin of your record, in the small careful hand you use for things that might get you killed: *Theory: Prosperity Rent. The village's harvest is not free. The sealed path leads to something that is being paid for. The payment is not grain.*",
    [c("e8c", "File the theory away.", "elder.hub")],
    { fx: [
      { t: "theory", id: "prosperity_rent", title: "Prosperity Rent", description: "The village's harvest is not free. The sealed path leads to something that is being paid for. The payment is not grain." },
      { t: "ency", id: "prosperity_rent", title: "The Arithmetic of Gratitude", text: "Prosperity is never free. It is rented. The rent is paid, has always been paid, will always be paid. The question is not whether the village pays. The question is what the village pays *with*.", category: "Theories" },
    ], voices: [
      v("reason", "The theory is formed. It is not yet proven, but it is *plausible*. The arithmetic is assembling itself."),
      v("empathy", "You have named the thing the village fears. The elder's hands are still, but her eyes are not. She knows you know."),
    ]}),
  N("elder.gap_f", "village",
    "The columns swim. Forty years of grain is a lot of arithmetic, and Ochiba's tea is doing something suspicious to your focus. When you look up, the ledger is being gently, firmly removed. “The light is poor for copying,” she says. “Come back when your eyes are fresher, archivist.” Her smile does not reach anywhere near her eyes.",
    [c("e9", "Accept the dismissal.", "elder.hub")],
    { fx: [{ t: "rel", npc: "ochiba", dim: "suspicion", d: 10 }] }),
  N("elder.hub", "village",
    "The elder's room waits behind its paper doors — scroll, ikebana, and the particular silence of a woman who has been holding a roof up for thirty years and would very much like to know whether you are rain.",
    [
      c("e10", "Study the ledger again.", "elder.history", { cond: { t: "notknow", id: "ledger_gap" } }),
      c("e11", "Mention the gatekeeper's mountain mud.", "elder.sleeve", {
        cond: { t: "all", of: [{ t: "know", id: "clue_sleeve" }, { t: "notknow", id: "elder_fear" }] },
      }),
      c("e12", "Ask, quietly, what the village fears.", "elder.fears", {
        cond: { t: "all", of: [{ t: "knowsCount", ids: CLUES, n: 3 }, { t: "notknow", id: "prosperity_price" }] },
        locked: "She will not open this door for a stranger with thin evidence. Gather more threads.",
      }),
      c("e13", "Ask about the outsider map-woman.", "elder.sayo", {
        cond: { t: "all", of: [{ t: "flag", id: "sayo_met" }, { t: "notflag", id: "elder_warned" }] },
      }),
      c("e14", "Take your leave.", "hub.village"),
    ]),
  N("elder.sleeve", "village",
    "You say it lightly, a garnish on small talk: mud on the gatekeeper's sleeve, grey clay, the colour of the path above the tree line. The room changes. Ochiba's hands do not move — that is the tell; a person surprised moves, a person *frightened* goes very, very still. “Genji inspects the wall,” she says, one half-second too late. “The walls sweat.” She has said the lie herself, and you both know it, and she knows you know, and the tea between you is suddenly a border. “You are a thorough man, archivist,” she says softly. “Thoroughness is a virtue. In *records*. Not in villages.”",
    [c("e15", "Bow, and file the fear away.", "elder.hub")],
    { fx: [
      { t: "know", id: "elder_fear", label: "Elder Ochiba is afraid of what is on the mountain — you saw it in the stillness of her hands." },
      { t: "rel", npc: "ochiba", dim: "fear", d: 10 }, { t: "rel", npc: "ochiba", dim: "suspicion", d: 10 },
      { t: "memory", npc: "ochiba", text: "Named the clay on Genji's sleeve to my face, smiling. Knows too much, and knows that I know. Watch him.", w: 4 },
    ]}),
  N("elder.fears", "village",
    "You have laid enough threads on the table — drawings, mud, gaps, charms — that the question cannot be refused, only answered in her way. Ochiba is silent long enough for the ikebana to feel crowded. “You want to know what Kagerou fears. I will tell you the truth I am *allowed*. This village has been prosperous for forty years, and prosperity is never free, archivist. It is *rented*. The rent is paid, has always been paid, will always be paid. The only question a village ever faces is whether to *look at the receipt*.” Her eyes find yours and hold them. “My advice, as your host: do not look at the receipt. Write your harvest tables. Go home honoured.”",
    [c("e16", "Say nothing. Let her hear the silence.", "elder.hub")],
    { fx: [
      { t: "know", id: "prosperity_price", label: "The elder half-confessed: prosperity is rented, and the rent is paid. The village's whole law is 'do not look at the receipt'." },
      { t: "rel", npc: "ochiba", dim: "respect", d: 5 },
      { t: "memory", npc: "ochiba", text: "Heard the word 'rent' and did not blink. Either very brave or already decided. Both are dangerous.", w: 3 },
    ]}),
  N("elder.sayo", "village",
    "At the map-woman's name, something shutters behind Ochiba's eyes. “Sayo. Yes. The guild sends her, she says, to map rivers. She maps *everything* but rivers — fence lines, footpaths, the upper ridge.” A thin, wintry smile. “A map is just a grave with coordinates, archivist. Remember that, if you find yourself tempted by her red thread. Some people come to a village to record its history. She has come to *exhume* ours.”",
    [c("e17", "Note the fear wearing the mask of contempt.", "elder.hub")],
    { fx: [
      { t: "flag", id: "elder_warned" }, { t: "rel", npc: "ochiba", dim: "suspicion", d: 5 },
      { t: "memory", npc: "ochiba", text: "Asked about Sayo without being prompted. Either she has charmed him, or he is cleverer than his boots.", w: 2 },
    ]}),
];

/* ================================= SAYO ==================================== */

const SAYO: GNode[] = [
  N("sayo.meet", "village",
    "The camp beyond the south wall is one tent, one fire, and a map table weighted with stones, covered in a map of the valley stitched together from a dozen failed attempts — because every map of Kagerou, you see as you approach, has the same wound: the mountain above the village is *blank*. Deliberately blank. The woman at the table does not look up. “Guild eyes on me since dawn, so you might as well have the good seat. I'm Sayo. Cartographer. And before you ask — no, I haven't been inside the walls. Some villages you have to learn from the *outside*.”",
    [
      c("s1", "Ask what she's mapping.", "sayo.talk"),
      c("s2", "“You're not mapping rivers, are you.”", "x", {
        cond: { t: "all", of: [{ t: "knowsCount", ids: CLUES, n: 2 }, { t: "notflag", id: "sayo_opened" }] },
        check: { skill: "empathy", dc: 11, pass: "sayo.truth", fail: "sayo.truth_f" },
      }),
      c("s3", "Share your warding charm's tea, and some dried persimmon.", "sayo.gift", { cond: { t: "item", id: "charm" } }),
      c("s4", "Leave her to the blank mountain.", "hub.village"),
    ],
    { speaker: "Sayo, the Cartographer", kanji: "小", at: 25, fx: [{ t: "flag", id: "sayo_met" }],
      voices: [v("perception", "Her inkwell is capped but the brushes are wet. She stopped drawing *moments* before you arrived. She was sketching the blank space.")] }),
  N("sayo.talk", "village",
    "“Rivers,” she says, without a flicker. “The guild pays for rivers. Rivers are safe — they go where they're told by gravity.” She unrolls the big map and taps the blank above Kagerou with one ink-stained finger. “But look at the contour lines *around* the blank. The land flows toward that mountain like a crowd toward a fire. Streams that aren't on any ledger. Terraces abandoned in a season no ledger mentions. I map what the paper refuses, archivist. I'm told that makes me a liar.” She rolls the map shut with a snap. “I've been told a lot of things, in a lot of villages. Yours is just better dressed.”",
    [c("s5", "Ask to see the upper ridge.", "x", {
      say: "Show me what you've pieced together.",
      check: { skill: "persuasion", dc: 10, pass: "sayo.map", fail: "sayo.map_f" },
    })],
    { speaker: "Sayo, the Cartographer", kanji: "小" }),
  N("sayo.map", "village",
    "She hesitates — a long, weighing look, the kind that has been practised on a hundred strangers and saved for perhaps two. Then she draws a second map from her coat, this one stitched with red thread along its folds. “The ridge above the seal-rope. Assembled from three farmers' fences, a charcoal-burner's walk, and one very drunk gatekeeper, four months ago.” The thread traces a path — *the* path — up to a mark she has drawn as a small square with a rope across it. “Take a copy. I've learned more from people who come back than people who stay loyal.”",
    [c("s6", "Take the copy.", "sayo.hub")],
    { fx: [
      { t: "item", id: "map", add: true, label: "Sayo's map of the upper ridge — the sealed path traced in red thread" },
      { t: "rel", npc: "sayo", dim: "trust", d: 15 },
      { t: "memory", npc: "sayo", text: "Gave him the ridge map. The one with the red thread. I never give anyone the red thread.", w: 3 },
    ]}),
  N("sayo.map_f", "village",
    "“No.” Flat, final, a door with no handle. “The map is my licence, my leverage, and my only copy. You want the mountain, archivist? Ask the mountain.” She goes back to capping inks, and the audience dissolves into the smell of lamp oil.",
    [c("s7", "Respect the door.", "sayo.hub")],
    { fx: [{ t: "rel", npc: "sayo", dim: "suspicion", d: 5 }] }),
  N("sayo.truth", "village",
    "The word lands, and for a moment the cartographer's face is simply a woman's face. “No,” she says quietly. “I'm not mapping rivers. I'm mapping a grave.” She pulls a small paper from her coat — old, soft as cloth from folding: a village census page, forty-plus years gone, one line ringed in faded ink. *Aki, of the east field. Age 19.* “My grandmother. The village says landslide, six dead, and built a memorial that lists five names and leaves the sixth *blank*. I have been to the memorial. I have counted. I have counted four times.” Her voice is steady; her hands are not. “The guild pays for rivers. I am being paid by *her*, archivist. I always have been.”",
    [c("s8", "Tell her what you know — all of it.", "sayo.hub", { say: "Then we are doing the same work, you and I. The mountain keeps a ledger too. I intend to read it." })],
    { fx: [
      { t: "know", id: "sayo_motive", label: "Sayo's grandmother Aki is on a census page, aged 19, gone in the 'landslide' year — and the memorial lists six dead with the sixth name blank." },
      { t: "flag", id: "sayo_opened" },
      { t: "rel", npc: "sayo", dim: "trust", d: 25 }, { t: "rel", npc: "sayo", dim: "affection", d: 5 },
      { t: "memory", npc: "sayo", text: "Saw through the rivers in one conversation. Then told me the truth back, unasked. I have waited ten years for one such person.", w: 5 },
      { t: "faction", id: "guild", d: 10 },
    ]}),
  N("sayo.truth_f", "village",
    "The temperature of the camp drops by several seasons. “Careful,” Sayo says, very evenly, rolling the map with precise violence. “Guessing at people's grief is a cheap trade, archivist, and the margins are terrible.” You have misjudged — the door exists, but you knocked on it wearing the wrong face.",
    [c("s9", "Apologise, and go.", "sayo.hub")],
    { fx: [{ t: "rel", npc: "sayo", dim: "suspicion", d: 15 }, { t: "memory", npc: "sayo", text: "Poked at the grave before earning the shovel. Smooth voice, wrong hands.", w: 2 }] }),
  N("sayo.gift", "village",
    "You set the persimmon on her map table like a treaty. Sayo looks at it, then at you, with the specific surprise of someone who has been braced for transactions and been handed a gift. She splits it with her knife, gives you the larger half, and eats with the focus of a person who has dined alone at a thousand campfires. “Kagerou won't sell to me,” she says, around it. “Genji burns my firewood permits. The children are *forbidden* to wave at me, which they do anyway, heroically. So. Persimmon diplomacy. The elder would be furious, which means it's working.”",
    [c("s10", "Sit with her until the fire burns low.", "sayo.hub")],
    { fx: [
      { t: "rel", npc: "sayo", dim: "affection", d: 15 }, { t: "rel", npc: "sayo", dim: "trust", d: 10 },
      { t: "memory", npc: "sayo", text: "Brought persimmon and stayed for the fire. First kindness inside ten miles of mountain.", w: 3 },
    ]}),
  N("sayo.hub", "village",
    "The camp smells of lamp oil and pine resin. Sayo's brushes are out again, working at the edge of the blank — the mountain watching the map, the map watching back.",
    [
      c("s11", "Ask for a copy of the ridge map.", "x", {
        cond: { t: "notitem", id: "map" },
        check: { skill: "persuasion", dc: 10, pass: "sayo.map", fail: "sayo.map_f" },
      }),
      c("s12", "Ask about her grandmother.", "x", {
        cond: { t: "all", of: [{ t: "knowsCount", ids: CLUES, n: 2 }, { t: "notflag", id: "sayo_opened" }] },
        check: { skill: "empathy", dc: 11, pass: "sayo.truth", fail: "sayo.truth_f" },
      }),
      c("s13", "Tell her about the gatekeeper's new-moon climbs.", "sayo.genji", {
        cond: { t: "all", of: [{ t: "know", id: "genji_moon" }, { t: "notknow", id: "newmoon_lights" }] },
      }),
      c("s14", "Return through the wall.", "hub.village"),
    ]),
  N("sayo.genji", "village",
    "Sayo goes very still — then reaches under the map table and produces a night-log, pages dense with small precise handwriting. “New moon, third month: lights on the ridge, two lanterns, moving *up*. New moon, fourth month: same. Fifth month: I climbed to the first terrace to look, and the mist *moved against the wind*, archivist. I have been a cartographer for eleven years. Mist does not move against the wind.” She closes the log. “He goes up to pay something. I would stake the red thread on it. And whatever is being paid — it is overdue, or it is *hungry*, because the lights have started coming down partway. Meeting him.”",
    [c("s15", "Commit her nights to memory.", "sayo.hub")],
    { fx: [
      { t: "know", id: "newmoon_lights", label: "On new moons, lanterns climb the ridge — and lately, lights come down partway to meet them." },
      { t: "rel", npc: "sayo", dim: "trust", d: 5 },
    ]}),
];

/* ============================== THE SEALED PATH ============================= */

const PATH: GNode[] = [
  N("path.gate", "path",
    "The sealed path climbs through cedar so old the light comes down green. An hour up, the trees give way to a shoulder of grey rock — and across the path, stretched between two stones, the rope. Shimenawa, thick as a forearm, with paper streamers gone the colour of bone. Genji stands before it with a lantern he does not need, because he is not holding it for light. “Archivist,” he says, not surprised. Nobody in this village is ever surprised. “The path died in the landslide. You read the notice.”",
    [
      c("p1", "Hold up Jikai's amulet.", "path.amulet", { cond: { t: "item", id: "amulet" } }),
      c("p2", "Let Kenta speak.", "path.kenta", { cond: { t: "flag", id: "kenta_escort" } }),
      c("p3", "“The elder sent me to inspect the ropes.”", "x", {
        say: "Routine survey, Genji. The elder wants the seal's condition for the record. You know how she is about the record.",
        check: {
          skill: "deception", dc: 12, pass: "path.bluff", fail: "path.bluff_f",
          mods: [{ cond: { t: "know", id: "elder_fear" }, d: 2, label: "You know exactly how the elder sounds when she is afraid" }],
        },
      }),
      c("p4", "Walk past him. Simply walk.", "x", {
        check: { skill: "willpower", dc: 13, pass: "path.walk", fail: "path.turned" },
      }),
      c("p5", "Draw steel — the slow way, so he can reconsider.", "x", {
        check: { skill: "swordsmanship", dc: 13, pass: "path.fight_win", fail: "path.fight_lose" },
      }),
      c("p6", "Turn back to the village.", "hub.village", { say: "(Down the green-dark stair of cedars, back to the lanterns.)" }),
    ],
    { speaker: "Genji, the Gatekeeper", kanji: "源", at: 60,
      voices: [
        v("perception", "His lantern is unlit. He carried an unlit lantern up a mountain at dusk. It's a *prop* — or an offering."),
        v("empathy", "He doesn't want to stop you. He wants you to give him a reason he can *report*. There is a difference, and it is fear."),
      ] }),
  N("path.amulet", "path",
    "You lift the knotted paper, and the dusk seems to lean in to look at it. Genji's face goes through its seasons: duty, recognition, and something older than both. “Jikai's knot.” He does not touch it. “So the temple has asked, and you have answered.” He steps aside — not far, but enough, which in gatekeeper arithmetic is everything. “Go then. And archivist — when you come down, *whatever you saw, the rope saw it first*. It will decide what to do with you. It usually lets the mountain's guests pass. Usually.”",
    [c("p7", "Pass the rope.", "shrine.approach")],
    { speaker: "Genji, the Gatekeeper", kanji: "源", fx: [
      { t: "rel", npc: "genji", dim: "respect", d: 10 }, { t: "rel", npc: "genji", dim: "fear", d: 5 },
      { t: "memory", npc: "genji", text: "Went up carrying Jikai's knot. The temple's business, then — not the archive's. I can live with that.", w: 2 },
    ]}),
  N("path.kenta", "path",
    "Kenta steps out of the cedars like he grew there. “He's with me, Genji.” The gatekeeper looks at the boy — looks *long* — and you watch the entire secret administration of this village pass between them in silence: who knows, who carries, who has decided. “Your post is the well,” Genji says finally, weakly. “My post,” says Kenta, “is the truth. Go,” he tells you, and his voice is steady in a way that took ten years to build. Genji steps aside and does not watch you pass, which is his own kind of mercy.",
    [c("p8", "Climb.", "shrine.approach", { say: "(Up. Where the cedars end and the rope begins.)" })],
    { fx: [
      { t: "rel", npc: "genji", dim: "suspicion", d: 10 },
      { t: "memory", npc: "genji", text: "Kenta broke his post to bring the archivist up. The boy chose. Gods help us, the boy *chose*.", w: 3 },
    ]}),
  N("path.bluff", "path",
    "You say it in Ochiba's voice — the level one, the roof-that-holds one, the voice she uses when the receipt is being looked at anyway. Genji hesitates exactly one heartbeat too long, and in that heartbeat you are already lifting the rope's lower strand. “The elder will hear of this,” he says, to your back. “*Count on it*,” you say, and do not look back, because your spine is performing arithmetic your face cannot afford.",
    [c("p9", "Keep climbing before doubt catches up.", "shrine.approach")],
    { fx: [
      { t: "rel", npc: "genji", dim: "suspicion", d: 10 },
      { t: "memory", npc: "genji", text: "Went up on the elder's supposed order. Either it was real or he can imitate her to the bone. Both frighten me.", w: 2 },
    ]}),
  N("path.bluff_f", "path",
    "Genji listens with his head tilted, the way men listen to rain deciding whether to become a flood. “The elder,” he says slowly, “has not left her house since the morning bell. I *know*, because I stood her watch.” The lantern — unlit, you notice again — comes up an inch. “Go down, archivist. Gently. Before I decide you are the kind of thing I report *upward*, and not everything that lives up there is the elder.”",
    [c("p10", "Descend.", "path.turned")],
    { fx: [{ t: "rel", npc: "genji", dim: "suspicion", d: 15 }] }),
  N("path.walk", "path",
    "You simply walk. It is the oldest violence there is — the refusal to acknowledge a boundary as a boundary. Genji's hand comes up, hesitates, falls; the whole administration of Kagerou flickers behind his eyes and cannot find a clause that covers this. You duck under the rope, and the paper streamers brush your shoulder like dry hands, and for three steps you are certain something under the rock has *turned to look*. Then the path takes you, and Genji's voice, behind you, very small: “The elder will know by nightfall. I hope she is enough to be afraid of.”",
    [c("p11", "Up.", "shrine.approach")],
    { fx: [
      { t: "rel", npc: "genji", dim: "fear", d: 15 },
      { t: "memory", npc: "genji", text: "Walked past the rope like it was smoke. I have guarded that rope for twenty years and it has never once been *smoke*.", w: 3 },
    ]}),
  N("path.fight_win", "path",
    "He is strong and he is honest and he is forty years of standing in one place, but you are the road itself. Two exchanges — his spear-shaft cracking the air where your head was, your blade flat across his wrists, the lantern rolling. He goes down on one knee, breathing hard, staring at his empty hands as though they have resigned. “Go,” he says, with a kind of ruined relief. “If you can take the rope from me, maybe you can take what's *past* it. The village needed to know. Now it does.”",
    [c("p12", "Step over the rope.", "shrine.approach")],
    { fx: [
      { t: "rel", npc: "genji", dim: "fear", d: 25 }, { t: "faction", id: "village", d: -10 },
      { t: "memory", npc: "genji", text: "Took the rope from me by steel. I am not ashamed. Something had to test him, and it should not have been the mountain.", w: 3 },
    ]}),
  N("path.fight_lose", "path",
    "Twenty years of guarding a gate teaches a man one thing perfectly: how to end a fight in the doorway. The spear shaft catches your elbow, your knee, the back of your neck, in a rhythm that is almost apologetic, and the world tilts green, then grey, then level again — with you on the lower path and Genji standing over you, breathing like a bellows. “The mountain doesn't want clumsy,” he says. “Go down. Heal. And if you come back, come back *invited*.”",
    [c("p13", "Limp down the cedars.", "path.turned")],
    { fx: [
      { t: "flag", id: "bruised" }, { t: "mod", skill: "swordsmanship", d: -1, label: "Beaten at the rope gate" },
      { t: "rel", npc: "genji", dim: "respect", d: 10 },
      { t: "memory", npc: "genji", text: "Drew steel at the rope and lost honestly. There is a kind of courage in that, even a fool kind.", w: 2 },
    ]}),
  N("path.turned", "path",
    "The descent is longer than the climb; descents always are, when the mountain has made its opinion of you clear. The cedars close overhead like a verdict. Behind you, very faintly, you think you hear the rope's streamers rustling in wind that is not there.",
    [c("p14", "Return to the square.", "hub.village")]),
];

/* ================================ THE SHRINE ================================ */

const SHRINE: GNode[] = [
  N("shrine.approach", "shrine",
    "The path ends in a clearing the mist keeps like a held breath, like a secret kept too long, like the silence after a song has ended but before anyone has clapped. And there it is: the shrine that is not on any map, the shrine that the children draw with charcoal and fear, the shrine that the village has been paying for forty years.\n\nIt is small — smaller than the fear of it, smaller than the story, smaller than the weight of the names you are about to read. A torii the colour of old blood, dark and deep and patient, wrapped in shimenawa rope so many times the gate looks *bandaged*, the way you might bandage a wound that will not heal, the way you might wrap a promise that has been broken too many times to count. Paper streamers, seven layers deep, each layer a different decade of weather — the outermost white and bright, the next grey, the next brown, the next almost black, and three more so dark they are nearly the colour of shadow. A rope renewed for decades, one layer at a time, the way you might renew a debt, or a grief, or a promise to the dead.\n\nNo sound. That is the wrong part — no birds, no insects, not even wind. Just the mist, turning slowly, and the feeling of being read, the way a page is read by eyes that have been reading it for a very long time, the way a song is read by an audience that has been listening in silence, the way a story is read by someone who knows how it ends but is still waiting for you to begin.",
    [
      c("sh1", "Read the names on the pillar.", "shrine.names", { cond: { t: "notknow", id: "the_names" } }),
      c("sh2", "Circle the shrine's back.", "x", {
        check: { skill: "perception", dc: 11, pass: "shrine.back", fail: "shrine.back_f" },
      }),
      c("sh3", "Approach the inner door.", "shrine.door", { cond: { t: "know", id: "the_names" } }),
    ],
    { at: 45, voices: [
      v("perception", "The outermost rope layer is white. *New*. This year. The seal is being renewed — regularly, recently, by hands that are still warm, by hands that are still alive, by hands that have not yet learned to stop. The arithmetic of grief is patient, and it is precise, and it does not stop until the debt is paid."),
      v("lore", "Shimenawa binds sacred ground. This much shimenawa binds something *under* sacred ground, something that is not quite dead and not quite alive, something that is waiting in the silence between one breath and the next, something that has been waiting for a very long time and is not in any particular hurry to begin."),
      v("empathy", "By the step: a child's sandal, half-rotten, placed neatly, the way a child might place a toy before bed, the way a lover might place a flower on a grave. Someone still comes here to grieve. Quietly. On schedule. The grief is patient, and it is precise, and it does not stop until the debt is paid, and the debt is paid in names, and the names are carved in stone, and the stone is patient, and the stone is waiting, and the stone is reading you, even now, even as you stand here, even as you breathe."),
    ] }),
  N("shrine.names", "shrine",
    "The pillar is granite, waist-high, and the names are cut into it in the old script — six of them, worn to ghosts by forty years of weather, worn to the shape of the wind, worn to the shape of the rain, worn to the shape of the silence that has been keeping them company for longer than you have been alive. You kneel and read with your fingers as much as your eyes, the way you might read a page that has been written in a language you almost know, the way you might read a song that has been sung so many times the words have worn a hole in the air.\n\n*Aki of the east field.* The first name is the oldest, and it is the most worn, and it is the name of someone who sang when the lots were drawn, someone who knew what was coming and chose to meet it with a song. *Gorō the boatwright.* The second name is the name of someone who built things, who understood the shape of wood and water, who knew that everything floats if you build it right. *Two of the miller's line.* The third and fourth names are the names of children, or of young men, or of both, and they are cut close together, the way siblings might stand in a line, the way lovers might stand in a line, the way the living stand in a line for the dead. *The ferryman.* The fifth name is the name of someone who carried things across, who understood the shape of rivers and the weight of passage, who knew that every crossing is a kind of death and every death is a kind of crossing. *And Ise, aged eleven.* The sixth name is the name of a child, and it is the youngest, and it is the most terrible, and it is the name that will stay with you for the rest of your life, the name that will wake you in the night, the name that will remind you that the arithmetic of grief is patient, and it is precise, and it does not stop until the debt is paid.\n\nBelow them, cut deeper — newer, sharper, defying the weather with fresh edges, the way a new wound defies the old scars — two more names. The first you recognise from a census page and a boy's ten-year silence: *Miyo*. The name of Kenta's sister, the name of the girl who went to the capital and never came back, the name of the girl whose hairpin was found on the sealed path, the name of the girl who is not in the capital, who is not anywhere, who is here, in the stone, in the silence, in the mist, in the arithmetic of grief. The second is half-finished. The chisel stopped mid-stroke. Whoever began the seventh name has not come back to end it, has not yet decided whether to finish the sentence, whether to pay the debt, whether to add one more name to the list, one more stone to the pillar, one more silence to the shrine.",
    [
      c("sh4", "Say the names aloud, all of them.", "x", {
        check: { skill: "willpower", dc: 10, pass: "shrine.spoken", fail: "shrine.spoken_f" },
      }),
      c("sh5", "Copy the names into your record, precisely.", "shrine.copied"),
    ],
    { fx: [
      { t: "know", id: "the_names", label: "Six names under the stone — Aki, Gorō, the miller's two, the ferryman, Ise aged eleven. Two fresh cuts: Miyo, and a seventh name left half-finished." },
      { t: "flag", id: "saw_names" }, { t: "questStage", id: "names_under_stones", stage: 2 },
      { t: "ency", id: "the_six_names", title: "The Six Names Under the Stone", text: "Six names under the stone: Aki of the east field, Gorō the boatwright, two of the miller's line, the ferryman, and Ise aged eleven. Two fresh cuts: Miyo, and a seventh name left half-finished. The arithmetic is assembling itself.", category: "The Shrine" },
      { t: "thought", id: "what_the_mist_keeps", label: "What the Mist Keeps", skill: "lore", d: 1 },
    ], voices: [
      v("empathy", "One of them was *eleven*. Say it again, inside. Do not let the arithmetic make you forget the eleven."),
      v("reason", "Forty years of harvest. Divided by six. Divided again by a tenth year. This is not a haunting, archivist. It is a *budget*."),
      v("willpower", "Your hand is shaking. Good. Hands that don't shake at this are the hands that signed it."),
    ] }),
  N("shrine.spoken", "shrine",
    "You say them. All of them, aloud, into the listening quiet — Aki, Gorō, the miller's children, the ferryman, Ise, Miyo — and your voice does not echo, because the mist *takes* it, gently, the way water takes a stone. And then something answers. Not a sound. A *thinning*: the mist around the shrine draws back one step, precisely one, and holds. For a moment the clearing is almost clear, and you feel it — not menace. *Attention*. Six kinds of patience, and something older wearing them like a coat. The half-finished name catches the weak light, waiting.",
    [c("sh6", "Breathe. Continue.", "shrine.copied")],
    { fx: [
      { t: "flag", id: "names_spoken" },
      { t: "mod", skill: "willpower", d: 1, label: "The shrine heard you, and did not refuse" },
    ] }),
  N("shrine.spoken_f", "shrine",
    "You open your mouth, and your voice — your professional, capital-trained voice — comes out as a croak. The mist does not move. The names do not move. But you feel, with the certainty of a man stepping onto a stair that isn't there, that the clearing has just become *more crowded*, and that politeness — yours, specifically — is being weighed in some enormous hand.",
    [c("sh7", "Try again, softer.", "shrine.copied")],
    { voices: [v("willpower", "Fear is information, not instruction. Note it, file it, continue.")] }),
  N("shrine.copied", "shrine",
    "You unroll your record and copy the names with the full ceremony of your trade — brush upright, strokes honest, dates where dates can be proven and a careful *unknown* where they cannot. The record has never felt so heavy. This is what the writ actually meant, you understand suddenly: not harvest tables, not founding myths. *This*. A village's receipt, waiting forty years for someone literate enough in grief to read it.",
    [c("sh8", "Approach the inner door.", "shrine.door")],
    { fx: [{ t: "flag", id: "names_copied" }] }),
  N("shrine.back", "shrine",
    "Behind the shrine, half-swallowed by moss, a flat stone — and on it, impossibly neat in the wet grey: a cup of rice, a pinch of salt, a chrysanthemum with its stem cut *this morning*. The offering is facing the shrine's back wall, where you now see, almost invisible under the moss, a seventh carving: not a name. A *count*. Seven tally marks. One of them is new.",
    [c("sh9", "Return to the front.", "shrine.names", { cond: { t: "notknow", id: "the_names" } }),
       c("sh10", "Return to the front.", "shrine.door", { cond: { t: "know", id: "the_names" } })],
    { fx: [{ t: "know", id: "offering_fresh", label: "Someone leaves monthly offerings behind the shrine — and a seventh tally mark has been freshly cut." }] }),
  N("shrine.back_f", "shrine",
    "The mist behind the shrine is thicker — walk three steps and the torii is gone, walk three more and *you* are nearly gone, your own hands grey and doubtful. You turn back by feel, and arrive at the front again with your heart knocking and the distinct impression that the clearing *escorted* you.",
    [c("sh11", "Stay where you can see the names.", "shrine.names", { cond: { t: "notknow", id: "the_names" } }),
       c("sh12", "Stay where you can see the names.", "shrine.door", { cond: { t: "know", id: "the_names" } })],
    { voices: [v("perception", "The mist moved. Against the wind. Sayo's log was right.")] }),
  N("shrine.door", "shrine",
    "The inner door stands a hand's width open — not broken, *kept*. Inside there is no altar, no idol, no monster. There is a well: the old well, the first well, dry as a bone and deeper than your lantern can argue with. And beside it, on a stand of black lacquer that has been dusted recently, a cedar box. The lock is open. Inside the box: a ledger. Not the elder's blue-cloth ledger — the *other* one. The one with the season that was skipped. You open it standing, and read forty years of arithmetic: lots drawn, names chosen, a village's signature under each — three generations of hands, the last one trembling.",
    [c("sh13", "Read to the end.", "shrine.choice")],
    { fx: [
      { t: "know", id: "true_ledger", label: "The true ledger, kept beside the dry well: forty years of lots drawn and names chosen, signed by the village each time." },
      { t: "flag", id: "found_ledger" }, { t: "questStage", id: "names_under_stones", stage: 3 },
    ], voices: [
      v("reason", "The elder's father drew the first lots. Ochiba keeps the box. Genji climbs at the new moon. It is not a haunting. It is *paperwork*."),
      v("empathy", "The last signature is trembling. She does not want this. She has simply never been allowed to stop."),
      v("lore", "The rent is due again. The half-finished name. The seventh tally. The village is already choosing — it simply hasn't told itself yet."),
    ] }),
  N("shrine.choice", "shrine",
    "The mist stands at the edge of the clearing like a congregation waiting for a sermon, like an audience waiting for a song, like the silence after a story has been told but before anyone has moved, the way you might stand at the edge of a stage after the last note has been played, the way you might stand at the edge of a grave after the last word has been spoken, the way you might stand at the edge of a decision that will change everything and nothing at the same time.\n\nIn your hands: the true ledger, the ledger of names, the ledger of debts, the ledger of the arithmetic of grief. In your sleeve: the names, the six names and the seventh that is not yet finished, the names that have been waiting for someone to read them, the names that have been waiting for someone to speak them, the names that have been waiting for someone to choose what happens next. In your memory: a boy at a well, guarding water that tastes of iron, an old woman under a roof she calls a story, holding it up with hands that are tired, a monk's broom on an endless stair, sweeping the same leaves for forty years, a cartographer's red thread, tracing a path that leads to a grave, a gatekeeper's unlit lantern, carried up a mountain in the dark, a merchant's fear, moving through the village like a season, a child's sandal, placed neatly by the step, a dream of six stones, patient as teeth, and a seventh that is waiting.\n\nThe capital is waiting for a record. The mountain is waiting for a decision. *Both are the same decision.* Both are the shape of the silence, both are the weight of the names, both are the arithmetic of grief, both are the question that has been waiting for you to ask it, the question that has been waiting for you to answer, the question that will change everything and nothing at the same time. What does the archive of Kagerou say? What does the story say? What does the song say? What does the silence say? What do *you* say?",
    [
      c("d1", "Burn Sayo's map and seal the truth. The roof holds; the rent goes on.", "end.quiet", {
        cond: { t: "item", id: "map" },
        say: "(You hold the red-thread map over the lantern flame until the ridge, the path, and the little square shrine are only light.)",
      }),
      c("d2", "Write the truth into the circuit record. Every name, every signature.", "end.truth", {
        cond: { t: "any", of: [{ t: "item", id: "map" }, { t: "know", id: "true_ledger" }, { t: "know", id: "the_names" }] },
        say: "(You sit down on the shrine step, open the record, and begin with the word *six*.)",
      }),
      c("d3", "Cut the ropes. Break the seal. Whatever the price, end the arithmetic.", "x", {
        say: "(You draw steel, and lay the edge against forty years of rope.)",
        check: {
          skill: "swordsmanship", dc: 13, pass: "end.broken", fail: "shrine.unbroken",
          mods: [{ cond: { t: "flag", id: "names_spoken" }, d: 2, label: "The shrine heard your voice, and steadies your hand" }],
        },
      }),
      c("d4", "Carry the ledger down to Jikai. Ask the mountain. Join the Keepers.", "end.keepers", {
        cond: { t: "all", of: [{ t: "know", id: "keepers" }, { t: "item", id: "amulet" }] },
        say: "(You wrap the ledger in your coat, knot Jikai's amulet over it, and begin the long stair down — not to the village. To the temple.)",
      }),
      c("d5", "Close the box. Walk away. Some stories are not yours to finish.", "end.walk", {
        say: "(You close the box, bow once to the pillar — to all of them — and take the path down while the mist politely holds its breath.)",
      }),
    ]),
  N("shrine.unbroken", "shrine",
    "The blade bites the outer rope — and stops, in something that is not rope. The edge rings like it has struck water. The mist thickens a full arm's length in one breath, and from the dry well behind the door comes a sound you will be cataloguing for years: not a voice. A *settling*, the way a house settles, the way a debt settles — patient, structural, aware. Your arm is numb to the shoulder. The rope is uncut. The arithmetic, it seems, does not accept resignation.",
    [c("sh14", "Step back. Decide differently.", "shrine.choice")],
    { voices: [v("willpower", "The rope is not rope anymore. It is forty years of hands holding on. Steel cannot cut what grief has knotted.")] }),
];

/* ================================ EPILOGUES ================================ */

const EPILOGUES: GNode[] = [
  N("end.quiet", "shrine",
    "The map burns like a small bright animal, and when it is gone the clearing seems to exhale. You write your record: *Kagerou. Founded in the third year of the era. Prosperous. Unremarkable. Nothing further.* Ochiba reads it standing, and her hands — you watch them, it is your trade now — do not shake. “The village will remember this,” she says, and you both know the sentence has two meanings. Sayo's tent is gone by the time you reach the south wall, packed in the night, the fire ring still warm. On the stone where her table stood, weighted under a pebble: one red thread, cut clean, the way a line is cut from a life.",
    [c("eq1", "Return to the road.", "@end", { say: "(Down the mountain. The mist closes behind you, like a book.)" })],
    { fx: [
      { t: "ending", id: "quiet_ledger", title: "The Quiet Ledger" },
      { t: "questDone", id: "names_under_stones", outcome: "You sealed the truth, and the rent goes on." },
      { t: "flag", id: "truth_buried" }, { t: "item", id: "map", add: false, label: "" },
      { t: "faction", id: "village", d: 30 }, { t: "faction", id: "guild", d: -20 },
      { t: "rel", npc: "ochiba", dim: "trust", d: 25 }, { t: "rel", npc: "ochiba", dim: "debt", d: 20 },
      { t: "rel", npc: "sayo", dim: "trust", d: -40 }, { t: "rel", npc: "sayo", dim: "suspicion", d: 30 },
      { t: "rel", npc: "jikai", dim: "respect", d: -10 },
      { t: "memory", npc: "ochiba", text: "Burned the map and wrote us clean. The roof holds. I will not ask what it cost him.", w: 5 },
      { t: "memory", npc: "sayo", text: "Chose the village over the names. Over *her*. I will map other mountains, and none of them will be forgiven.", w: 5 },
      { t: "memory", npc: "jikai", text: "Kept the silence. The mountain thanks him. I am less certain I can.", w: 3 },
      { t: "thought", id: "the_weight_of_names", label: "The Weight of Unwritten Names", skill: "empathy", d: 1 },
    ], voices: [v("empathy", "You chose a roof over a receipt. Both hold. Ask yourself, on the long road down, which one you sleep under.")] }),
  N("end.truth", "shrine",
    "You write for three days. Ochiba does not stop you — perhaps cannot; the ledger's own signatures are in your record now, her father's hand and hers, and there is no argument left that isn't also a confession. When the courier takes the sealed circuit record down the mountain, the whole village watches from doorways, and no one waves. Sayo walks with you to the first milestone. She does not thank you — she does something rarer: she shows you the map she is already drawing of what happens next. “Landslide, six dead,” she says, “becomes *Aki, Gorō, the miller's two, the ferryman, Ise, and Miyo*. You understand what that is? That's the whole war, archivist. Names against arithmetic. And you brought names.” Jikai rings the temple bell at dusk, long and low, the way bells are rung when a debt is finally *named*.",
    [c("et1", "Return to the road.", "@end", { say: "(Down the mountain, with a record that weighs more than your pack.)" })],
    { fx: [
      { t: "ending", id: "ink_and_stone", title: "Ink Heavier Than Stone" },
      { t: "questDone", id: "names_under_stones", outcome: "The truth goes to the capital, in your hand." },
      { t: "faction", id: "village", d: -25 }, { t: "faction", id: "guild", d: 25 }, { t: "faction", id: "temple", d: 15 },
      { t: "rel", npc: "ochiba", dim: "trust", d: -30 }, { t: "rel", npc: "ochiba", dim: "fear", d: 20 },
      { t: "rel", npc: "sayo", dim: "trust", d: 40 }, { t: "rel", npc: "sayo", dim: "affection", d: 15 },
      { t: "rel", npc: "jikai", dim: "respect", d: 15 }, { t: "rel", npc: "kenta", dim: "respect", d: 15 },
      { t: "memory", npc: "sayo", text: "Wrote her name — all their names — into the record of the realm. Ten years of grave-robbing, ended by one honest hand.", w: 5 },
      { t: "memory", npc: "ochiba", text: "Wrote us into the ground with a brush. May the capital's roof hold better than ours did.", w: 5 },
      { t: "memory", npc: "jikai", text: "Named the debt aloud. The broom and I are both old enough to hope it was mercy.", w: 4 },
      { t: "thought", id: "the_weight_of_names", label: "The Weight of Names", skill: "reason", d: 1 },
    ], voices: [v("reason", "Names against arithmetic. File that. It is the entire science of this mountain, and now it is yours to carry.")] }),
  N("end.broken", "shrine",
    "The rope parts — all seven strands, all seven decades, in one long sound like a held breath finally released — and the world *tilts*. Not the ground. The weather. Rain arrives in seconds from a sky that was empty, warm rain, impossible rain, and the mist doesn't disperse so much as *stand down*. From the dry well comes a sound of water rising — slowly, patiently, tasting of nothing now, not even iron. You look at the pillar before you leave: the six names are still there, but paler, as though moved further away. The seventh name — the half-finished one — has stopped being half-finished. It is simply *gone*. On the way down you pass the children at the well, drawing. The shrine in the picture has no rope. There are seven figures under its roof. They are waving.",
    [c("eb1", "Return to the road.", "@end", { say: "(Down the mountain, in the rain, with the sound of water behind you.)" })],
    { fx: [
      { t: "ending", id: "unbound_mist", title: "The Unbound Mist" },
      { t: "questDone", id: "names_under_stones", outcome: "The seal is broken. What was kept is loose." },
      { t: "flag", id: "shrine_destroyed" },
      { t: "faction", id: "village", d: -10 }, { t: "faction", id: "keepers", d: -30 },
      { t: "rel", npc: "genji", dim: "fear", d: 20 }, { t: "rel", npc: "jikai", dim: "fear", d: 15 },
      { t: "rel", npc: "kenta", dim: "fear", d: 10 }, { t: "rel", npc: "sayo", dim: "suspicion", d: 10 },
      { t: "memory", npc: "jikai", text: "Cut the rope. May whatever was grateful stay grateful. I am too old to run, so I will sweep.", w: 5 },
      { t: "memory", npc: "kenta", text: "The well tastes of *nothing* now. I don't know which frightens me more — the iron, or the clean water.", w: 4 },
    ], voices: [v("perception", "The children are drawing seven figures. There were never seven names. *Count again.*")] }),
  N("end.keepers", "temple",
    "Jikai is on the stair when you come up, as though the temple knew before the mountain did. He looks at the ledger in your coat and closes his eyes — grief, relief, and something like a shift change. “So,” he says. “The mountain asked, and you answered.” The oath is not dramatic. It is tea, and a knot of paper, and your name entered in a ledger older than the village's lie, in the column headed *those who carry*. You learn the arithmetic that night: the rent, the schedule, the half-finished name that the Keepers will now — together, *knowingly* — decide the fate of. In your circuit record, Kagerou remains: *prosperous, unremarkable, nothing further*. But the nothing further has a roster now, and you are seventh on it.",
    [c("ek1", "Take the broom. Begin the stair.", "@end", { say: "(The stair grows a little longer each year. You have time. That is the point.)" })],
    { fx: [
      { t: "ending", id: "vows_in_fog", title: "Vows in the Fog" },
      { t: "questDone", id: "names_under_stones", outcome: "You joined the Silent Keepers, and the ledger gains a seventh hand." },
      { t: "faction", id: "keepers", d: 50 }, { t: "faction", id: "temple", d: 20 }, { t: "faction", id: "village", d: 10 },
      { t: "rel", npc: "jikai", dim: "trust", d: 25 }, { t: "rel", npc: "jikai", dim: "respect", d: 20 },
      { t: "rel", npc: "genji", dim: "trust", d: 15 }, { t: "rel", npc: "ochiba", dim: "trust", d: 10 },
      { t: "memory", npc: "jikai", text: "Carried the box down and asked the question with his whole life. The seventh keeper. The stair is shorter with two brooms.", w: 5 },
      { t: "memory", npc: "genji", text: "One of us now. The lantern stays unlit; he knows why. That is the whole welcome.", w: 3 },
    ], voices: [v("lore", "Every order is a story agreed to in the dark. You have simply chosen which darkness gets your signature.")] }),
  N("end.walk", "road",
    "You go down the mountain with the ledger unburned, unwritten, *unowned* — back on its lacquer stand, box closed, lock open, patient as it has always been. At the gate, Genji watches you pass without a word, and his lantern, for the first time, is lit. Sayo's fire is still burning beyond the south wall; you do not stop. The milestone takes your back, the road takes your feet, and Kagerou shrinks behind you into its valley: smoke, lanterns, roofs turned carefully away from the mountain. Your record will say what records say. *Prosperous. Unremarkable. Nothing further.* The mist does not follow you. That is the unsettling part. It lets you go — the way one lets go of a hand one has decided, for now, not to hold.",
    [c("ew1", "Walk on.", "@end", { say: "(The road. The road is also a kind of answer.)" })],
    { fx: [
      { t: "ending", id: "travellers_road", title: "A Traveller's Road" },
      { t: "questDone", id: "names_under_stones", outcome: "You left the mountain its secret, and kept your road." },
      { t: "rel", npc: "sayo", dim: "suspicion", d: 10 },
      { t: "memory", npc: "sayo", text: "Went up, saw everything, and walked away. Perhaps the road is his grave, and he just hasn't reached it yet.", w: 3 },
      { t: "memory", npc: "genji", text: "Left the rope tied. Whatever he is, he is not ours to fear. Yet.", w: 2 },
    ], voices: [v("perception", "Your sleeve is wet. You did not notice when. The mist has been touching you for an hour, and you have been letting it.")] }),
];

/* ================================= ASSEMBLY ================================= */

export const QUEST_STAGES: Record<string, string[]> = {
  names_under_stones: [
    "Reach Kagerou — by writ, by lie, by steel, or by the culvert.",
    "The village is prosperous and silent. Gather threads: the gatekeeper's mud, the children's drawings, the well's iron, the elder's ledger, the outsider's map.",
    "You have read the names under the stone. The inner door stands open — kept, not broken.",
    "The true ledger is in your hands. Decide what the record will say.",
  ],
};

export const ENDINGS: { id: string; title: string; kanji: string; blurb: string }[] = [
  { id: "quiet_ledger", title: "The Quiet Ledger", kanji: "静", blurb: "The roof holds. The rent goes on." },
  { id: "ink_and_stone", title: "Ink Heavier Than Stone", kanji: "墨", blurb: "Names against arithmetic, sent to the capital." },
  { id: "unbound_mist", title: "The Unbound Mist", kanji: "霧", blurb: "The seal is cut. The rain arrives. The children draw seven." },
  { id: "vows_in_fog", title: "Vows in the Fog", kanji: "誓", blurb: "Seventh on the roster of those who carry." },
  { id: "travellers_road", title: "A Traveller's Road", kanji: "旅", blurb: "The road is also a kind of answer." },
];

/* ================================ NEW LOCATIONS =============================== */

const FOREST: GNode[] = [
  N("forest.enter", "forest",
    "The forest begins where the village ends, and the transition is so sudden it feels like stepping through a door. One moment you are in the open, the next you are surrounded by cedar and pine so thick the sky is just a memory of blue above. The air is different here — cooler, damper, smelling of moss and old wood and something else, something that might be mushrooms or might be the ghost of rain that fell a week ago.\n\nThe path through the forest is narrow and winding, marked by old stones that have been here longer than the village. Some of them have carvings, worn almost smooth by time and weather. You can just make out the shapes — they look like hands, or maybe branches, or maybe something in between.",
    [
      c("f1", "Follow the path deeper.", "forest.deep"),
      c("f2", "Examine the carved stones.", "x", {
        check: { skill: "lore", dc: 10, pass: "forest.stones", fail: "forest.stones_f" },
      }),
      c("f3", "Listen to the forest.", "x", {
        check: { skill: "perception", dc: 11, pass: "forest.listen", fail: "forest.listen_f" },
      }),
      c("f4", "Return to the road.", "hub.village"),
    ],
    { at: 30, voices: [
      v("perception", "The forest is watching. Not in the way the village watches — this is older, less personal. The forest does not care about you. It simply notices."),
      v("empathy", "There is grief here. Not recent grief, but the kind that has settled into the wood and stone, the kind that has become part of the landscape."),
    ] }),
  N("forest.deep", "forest",
    "The path leads deeper, and the trees grow taller, their branches intertwining overhead until the forest becomes a cathedral of green and shadow. The light here is different — filtered, dappled, moving in slow patterns as the wind moves the branches above. You can hear water somewhere, the sound of a stream or river, and the forest seems to lean toward it, the way people lean toward music.\n\nAfter a while, the path opens into a small clearing, and there, in the center, is a stone well. Not the village well — this one is older, smaller, and the stones around its base are carved with the same symbols you saw on the path markers. The water inside is dark and still, and when you lean over the edge, you cannot see the bottom.",
    [
      c("f5", "Drop a stone into the well.", "forest.well"),
      c("f6", "Examine the carvings around the well.", "x", {
        check: { skill: "lore", dc: 12, pass: "forest.carvings", fail: "forest.carvings_f" },
      }),
      c("f7", "Return to the forest path.", "forest.enter"),
    ],
    { voices: [
      v("lore", "Forest wells are old. Older than villages, older than roads. They are places where the world is thin, where the boundary between what is and what was is not quite solid."),
      v("perception", "The water is not still. There is a current, deep below, moving in a direction that does not match the land above."),
    ] }),
  N("forest.well", "forest",
    "You drop a stone. It falls in silence for a long time — longer than it should, longer than the well is deep — and then there is a sound. Not a splash. A *voice*. Or something like a voice, something that might be the echo of a voice from a long time ago, caught in the stone and water and released now by the weight of your stone.\n\nThe sound is gone before you can be sure of it, but you felt it — a vibration in the air, in the stone, in your bones. The forest is very quiet now, as if it is listening too.",
    [c("f8", "Step back from the well.", "forest.deep")],
    { fx: [
      { t: "stability", d: -5, reason: "The well spoke, and you heard it." },
      { t: "ency", id: "forest_well", title: "The Forest Well", text: "A well in the forest, older than the village, with water that has no bottom. When you drop a stone, it does not splash. It speaks, or something like it speaks. The forest listens.", category: "Locations" },
    ], voices: [
      v("empathy", "The well is lonely. It has been waiting for someone to drop a stone for a very long time. It is grateful, in its way, but also sad. It knows you will not stay."),
    ] }),
  N("forest.stones", "forest",
    "The carvings are old — very old, older than the village, older than the temple. They are not the work of the people who live here now. They are the work of someone else, someone who understood the forest in a way the current villagers do not.\n\nThe symbols are not quite language, not quite pictures. They are something in between — a way of recording something that cannot be recorded in words. You recognize some of them from the old sutras, from the foundation texts that speak of pillars and bindings. These stones are markers, you realize. They are marking a path, or a boundary, or a warning.",
    [c("f9", "Note the symbols and continue.", "forest.deep")],
    { fx: [
      { t: "know", id: "forest_symbols", label: "The forest stones are carved with old symbols — markers or warnings from before the village." },
      { t: "ency", id: "forest_stones", title: "The Forest Markers", text: "Stones along the forest path, carved with symbols older than the village. They are not language, not pictures, but something in between. They mark a path, or a boundary, or a warning.", category: "Lore" },
    ] }),
  N("forest.stones_f", "forest",
    "The carvings are old, but their meaning is lost to you. You can see the shapes — hands, or branches, or something else — but you cannot read them. They are a language you do not know, a story you cannot understand. The forest keeps its secrets well.",
    [c("f10", "Move on.", "forest.deep")],
    { voices: [v("lore", "The stones are old. Very old. They were here before the village, before the temple, before the road. They will be here after, too. They do not need you to understand them.")] }),
  N("forest.listen", "forest",
    "You close your eyes and listen. The forest is not silent — it is full of sound. The wind in the branches, the creak of old wood, the distant sound of water. But underneath it all, there is something else. A rhythm. A pattern. The forest is breathing, and you can feel it in your chest, in your bones.\n\nWhen you open your eyes, the light has changed. It is later than it was, or earlier, or the same — you cannot tell. But the forest feels different now, as if it has accepted you, as if you are part of it for a moment.",
    [c("f11", "Let the feeling pass.", "forest.deep")],
    { fx: [
      { t: "stability", d: 5, reason: "The forest accepted you, for a moment." },
      { t: "mod", skill: "perception", d: 1, label: "Forest-touched" },
    ], voices: [
      v("empathy", "The forest is old, and it is tired, and it is grateful for your attention. It does not ask for much. Just to be heard, once in a while."),
    ] }),
  N("forest.listen_f", "forest",
    "You listen, but the forest is just a forest. The wind, the wood, the water. There is nothing more, or if there is, it is not for you. The forest does not speak to everyone, and you are not one of the ones it chooses.",
    [c("f12", "Continue walking.", "forest.deep")],
    { voices: [v("perception", "The forest is quiet. Not silent — quiet. There is a difference. Silence is the absence of sound. Quiet is the presence of listening.")] }),
  N("forest.carvings", "forest",
    "The carvings around the well are the same as the ones on the path markers, but more detailed, more complex. They tell a story, or part of a story — a story of binding, of sacrifice, of a debt that was paid in stone and water and something else, something that cannot be named.\n\nYou recognize the patterns now. They are the same patterns you saw on the shrine, on the rope, on the names carved in the pillar. This well is connected to the shrine, to the village, to the arithmetic of grief. It is part of the same story, the same debt, the same silence.",
    [c("f13", "Step back from the well.", "forest.deep")],
    { fx: [
      { t: "know", id: "well_connection", label: "The forest well is connected to the shrine — part of the same story, the same debt." },
      { t: "ency", id: "well_shrine_connection", title: "The Well and the Shrine", text: "The forest well is carved with the same symbols as the shrine. It is part of the same story, the same debt, the same silence. The village is built on more than stone. It is built on water, and wood, and sacrifice.", category: "Theories" },
    ], voices: [
      v("reason", "The well is connected to the shrine. The symbols are the same. The story is the same. The village is not just a village. It is a monument, a memorial, a payment."),
    ] }),
  N("forest.carvings_f", "forest",
    "The carvings are intricate, but their meaning escapes you. You can see the patterns, the repetitions, the care with which they were made, but you cannot read them. They are a language you do not know, a story you cannot understand. The well keeps its secrets, as wells do.",
    [c("f14", "Step back.", "forest.deep")],
    { voices: [v("lore", "The carvings are old. Very old. They were made by hands that understood something you do not. They will be here after you are gone, too. They do not need you to understand them.")] }),
];

const RIVER: GNode[] = [
  N("river.bank", "river",
    "The river is not large, but it is deep, and the water is dark — not the dark of mud or shadow, but the dark of iron, of something that has been in the earth too long and has taken on its qualities. The banks are steep, lined with smooth stones that have been polished by centuries of water, and the sound of the river is constant, a low murmur that is almost speech, almost song.\n\nThere is a bridge here, old and wooden, spanning the river at its narrowest point. The wood is grey with age, and the planks creak under your weight, but it holds. On the other side, the forest continues, but there is something different about it — a quality of attention, of waiting, that makes you hesitate.",
    [
      c("r1", "Cross the bridge.", "river.cross"),
      c("r2", "Examine the water.", "x", {
        check: { skill: "perception", dc: 11, pass: "river.water", fail: "river.water_f" },
      }),
      c("r3", "Follow the river upstream.", "river.upstream"),
      c("r4", "Return to the village.", "hub.village"),
    ],
    { at: 20, voices: [
      v("perception", "The water is iron-tasted. The children were right — the well water tastes of this. The river and the well are connected, somehow."),
      v("lore", "Rivers are boundaries. They separate one thing from another, one story from another. This river is separating the village from something else, something older."),
    ] }),
  N("river.cross", "river",
    "You cross the bridge, and the wood creaks and groans under your weight, but it holds. On the other side, the forest is different — darker, quieter, more attentive. The trees are older here, their trunks wider, their branches higher, and the light that filters through is green and thick, like the light in a cathedral.\n\nThe path continues, but it is narrower now, and it winds between the trees in a way that feels deliberate, as if it is leading you somewhere specific. You can hear the river behind you, constant and patient, and you know that when you turn back, it will still be there, still flowing, still keeping its secrets.",
    [
      c("r5", "Follow the path.", "river.deep"),
      c("r6", "Turn back.", "river.bank"),
    ],
    { voices: [
      v("empathy", "The forest on this side is older, and it remembers. It remembers things the village has forgotten, things the village is trying to forget. It is not hostile, but it is not welcoming either. It is simply watching."),
    ] }),
  N("river.deep", "river",
    "The path leads deeper into the forest, and the trees grow taller, their branches intertwining overhead until the sky is just a memory. The air is cooler here, and damper, and the sound of the river is distant now, a murmur at the edge of hearing.\n\nAfter a while, the path opens into a small clearing, and there, in the center, is a stone circle. Not a circle of standing stones, like the ones you might find in the north, but a circle of boulders, arranged with deliberate care, their surfaces smooth and worn by time. In the center of the circle is a single stone, taller than the others, and on its surface is a carving — a single symbol, worn but still visible.\n\nThe symbol is the same one you saw on the well, on the path markers, on the shrine. It is the symbol of binding, of debt, of sacrifice. This place is part of the same story.",
    [
      c("r7", "Touch the central stone.", "x", {
        check: { skill: "willpower", dc: 12, pass: "river.stone", fail: "river.stone_f" },
      }),
      c("r8", "Study the symbol.", "x", {
        check: { skill: "lore", dc: 13, pass: "river.symbol", fail: "river.symbol_f" },
      }),
      c("r9", "Return to the river.", "river.cross"),
    ],
    { voices: [
      v("lore", "This is a place of binding. The stones are arranged to hold something, to keep something in, or out. The symbol is the same one on the shrine. This place is part of the same story, the same debt."),
      v("perception", "The air here is thick, heavy with meaning. The stones are old, very old, and they are waiting. They have been waiting for a long time."),
    ] }),
  N("river.stone", "forest",
    "You touch the stone, and it is cold — colder than stone should be, colder than the air, colder than the water in the river. The cold goes into your hand, into your arm, into your chest, and for a moment you feel it — the weight of the debt, the weight of the names, the weight of the silence that has been kept for forty years.\n\nThe feeling passes, but the cold remains, a reminder of what you touched, of what you learned. The stone is part of the story, and now you are part of it too.",
    [c("r10", "Step back.", "river.deep")],
    { fx: [
      { t: "stability", d: -10, reason: "You touched the binding stone, and it touched you back." },
      { t: "know", id: "binding_stone", label: "You touched the binding stone in the forest. It is cold, and it remembers." },
      { t: "ency", id: "binding_stone", title: "The Binding Stone", text: "A stone in a circle of boulders, carved with the symbol of binding. It is cold, colder than it should be, and when you touch it, you feel the weight of the debt, the names, the silence. It is part of the story, and now you are too.", category: "The Shrine" },
    ], voices: [
      v("empathy", "The stone is lonely. It has been waiting for someone to touch it for a very long time. It is grateful, in its way, but also sad. It knows you will not stay."),
    ] }),
  N("river.stone_f", "river",
    "You reach for the stone, but something stops you — not a physical barrier, but a feeling, a sense of wrongness, of crossing a line you should not cross. Your hand trembles, and you pull it back, and the feeling passes, but the knowledge remains: the stone is not for you. Not yet. Maybe not ever.",
    [c("r11", "Step back.", "river.deep")],
    { fx: [{ t: "stability", d: -5, reason: "The stone rejected you, or you rejected it." }], voices: [
      v("willpower", "The stone is not for you. Not yet. Maybe not ever. Some things are not meant to be touched, only witnessed."),
    ] }),
  N("river.symbol", "river",
    "The symbol is complex, more complex than you first thought. It is not just a symbol of binding — it is a symbol of exchange, of debt, of sacrifice. It tells a story, or part of a story: something was given, something was taken, and the balance must be maintained. The symbol is a promise, and a warning.\n\nYou recognize it now, from the old texts, from the foundation sutras. It is the symbol of hitobashira — the human pillar, the foundation sacrifice. The village was built on this. The prosperity was bought with this. The debt is still being paid.",
    [c("r12", "Note the symbol and step back.", "river.deep")],
    { fx: [
      { t: "know", id: "hitobashira_symbol", label: "The symbol on the stone is hitobashira — the human pillar, the foundation sacrifice. The village was built on this." },
      { t: "ency", id: "hitobashira", title: "Hitobashira", text: "The symbol of hitobashira — the human pillar, the foundation sacrifice. The village was built on this. The prosperity was bought with this. The debt is still being paid.", category: "Lore" },
    ], voices: [
      v("lore", "Hitobashira. The human pillar. The foundation sacrifice. It was outlawed centuries ago, but the symbol is here, on the stone, in the forest. The village is built on something old, something terrible, something that cannot be undone."),
    ] }),
  N("river.symbol_f", "river",
    "The symbol is complex, but its meaning escapes you. You can see the lines, the curves, the care with which it was carved, but you cannot read it. It is a language you do not know, a story you cannot understand. The stone keeps its secrets, as stones do.",
    [c("r13", "Step back.", "river.deep")],
    { voices: [v("lore", "The symbol is old. Very old. It was carved by hands that understood something you do not. It will be here after you are gone, too. It does not need you to understand it.")] }),
  N("river.water", "river",
    "You kneel by the river and look into the water. It is dark, but not opaque — you can see shapes moving beneath the surface, not fish, not debris, but something else. Shadows, maybe, or reflections of things that are not there. The water is iron-tasted, you realize, and the taste is familiar — it is the taste of the well water, the taste the children mentioned, the taste that no one speaks of.\n\nThe river and the well are connected. The water flows from one to the other, or maybe they both flow from the same source, the same deep place in the earth where the iron is strong and the memories are long.",
    [c("r14", "Rise and continue.", "river.bank")],
    { fx: [
      { t: "know", id: "river_well_connection", label: "The river water tastes of iron, like the well. They are connected, somehow." },
      { t: "ency", id: "river_well", title: "The River and the Well", text: "The river water tastes of iron, like the well water. They are connected, somehow — the water flows from one to the other, or maybe they both flow from the same source. The village is built on more than stone. It is built on water, and iron, and memory.", category: "Theories" },
    ], voices: [
      v("perception", "The water is iron-tasted. The children were right. The well water tastes of this. The river and the well are connected, somehow."),
    ] }),
  N("river.water_f", "river",
    "You look into the water, but it is just water — dark, deep, moving. There is nothing more, or if there is, it is not for you. The river keeps its secrets, as rivers do.",
    [c("r15", "Rise and continue.", "river.bank")],
    { voices: [v("perception", "The water is just water. Dark, deep, moving. There is nothing more, or if there is, it is not for you. The river keeps its secrets.")] }),
  N("river.upstream", "river",
    "You follow the river upstream, and the banks grow steeper, the water swifter, the forest denser. The sound of the water is louder here, a constant rush that fills the air, and the mist is thicker, clinging to the trees and the stones and your skin.\n\nAfter a while, the river narrows, and you can see its source — a spring, bubbling up from the earth, clear and cold and strong. The water here is not iron-tasted. It is pure, clean, untainted. This is where the river begins, before it flows down to the village, before it picks up the iron, before it becomes what it becomes.\n\nThe spring is small, barely a meter across, but it is deep, and the water is cold, and there is something about it that feels old, older than the village, older than the forest, older than the mountain itself.",
    [c("r16", "Note the source and return.", "river.bank")],
    { fx: [
      { t: "ency", id: "river_source", title: "The River's Source", text: "The river begins at a spring, small and deep and cold. The water here is pure, clean, untainted. This is where the river begins, before it flows down to the village, before it picks up the iron, before it becomes what it becomes.", category: "Locations" },
    ], voices: [
      v("perception", "The spring is pure. Clean. Untainted. This is where the river begins, before it becomes what it becomes. The iron is picked up downstream, in the village, in the well, in the debt."),
    ] }),
];

const MILL: GNode[] = [
  N("mill.approach", "mill",
    "The old mill stands at the edge of the village, where the river slows and widens before it reaches the valley below. It is a large building, larger than it needs to be, with a waterwheel that has not turned in years — the wood is grey and cracked, the blades broken, the whole structure leaning slightly to one side as if it is tired of standing.\n\nThe mill was once the heart of the village, the place where grain was ground, where the harvest was processed, where the prosperity of the village was made real. Now it is empty, abandoned, a monument to a time before the seal, before the silence, before the debt came due.\n\nThe door is unlocked, and it opens with a groan of old wood, and inside, the air is thick with dust and the smell of old grain, and the sound of the river outside is constant, patient, waiting.",
    [
      c("m1", "Enter the mill.", "mill.inside"),
      c("m2", "Examine the waterwheel.", "x", {
        check: { skill: "perception", dc: 10, pass: "mill.wheel", fail: "mill.wheel_f" },
      }),
      c("m3", "Return to the village.", "hub.village"),
    ],
    { at: 25, voices: [
      v("lore", "The mill is old. Older than the village, maybe. It was here before the seal, before the silence, before the debt. It remembers what the village has forgotten."),
      v("empathy", "The mill is tired. It has been standing for a long time, and it is tired of standing. It wants to fall, but it cannot, not yet. It is waiting for something, or someone, to let it go."),
    ] }),
  N("mill.inside", "mill",
    "Inside, the mill is a cathedral of wood and shadow. The beams are massive, older than the village, older than the temple, and they are carved with symbols — not the symbols of binding, but the symbols of work, of harvest, of prosperity. This was a place of plenty, once, a place where the village's wealth was made real, where the grain was ground and the flour was sifted and the bread was baked.\n\nNow it is empty. The grinding stones are still, the hoppers are empty, the sacks are gone. The only sound is the drip of water from a leak in the roof, and the constant murmur of the river outside. The mill is a monument to what was, and what is no longer.",
    [
      c("m4", "Search for anything left behind.", "x", {
        check: { skill: "perception", dc: 11, pass: "mill.search", fail: "mill.search_f" },
      }),
      c("m5", "Examine the carvings on the beams.", "x", {
        check: { skill: "lore", dc: 12, pass: "mill.carvings", fail: "mill.carvings_f" },
      }),
      c("m6", "Return outside.", "mill.approach"),
    ],
    { voices: [
      v("perception", "The mill is empty, but it is not abandoned. There is a difference. Abandoned means forgotten. Empty means waiting."),
    ] }),
  N("mill.search", "mill",
    "You search the mill, carefully, methodically, and in the back, in a corner where the dust is thickest, you find something. A ledger. Not the elder's ledger, not the true ledger, but a different one — the miller's ledger, the record of what was ground, what was stored, what was distributed.\n\nThe ledger is old, older than the elder, older than the village's current prosperity. The entries are meticulous, the handwriting careful, and they tell a story — a story of plenty, of harvest, of prosperity. But then, halfway through, the entries change. The handwriting becomes hurried, the entries shorter, and then they stop. The last entry is a single line: *The debt is called. The mill is closed. The silence begins.*\n\nThe ledger is a record of the village's prosperity, and its end.",
    [c("m7", "Take the ledger.", "mill.inside")],
    { fx: [
      { t: "item", id: "mill_ledger", add: true, label: "The miller's ledger — a record of prosperity, and its end." },
      { t: "know", id: "mill_ledger", label: "The miller's ledger records the village's prosperity, and its end. The last entry: 'The debt is called. The mill is closed. The silence begins.'" },
      { t: "ency", id: "mill_ledger_entry", title: "The Miller's Ledger", text: "A ledger found in the old mill, recording the village's prosperity and its end. The last entry: 'The debt is called. The mill is closed. The silence begins.' The mill was the heart of the village, and when it closed, the village changed.", category: "History" },
    ], voices: [
      v("reason", "The ledger is a record of the village's prosperity, and its end. The mill was the heart of the village, and when it closed, the village changed. The debt was called, and the silence began."),
    ] }),
  N("mill.search_f", "mill",
    "You search the mill, but it is empty. The dust is thick, the cobwebs are old, and there is nothing left. The mill has been abandoned for a long time, and everything of value has been taken, or has rotted away. The only thing left is the silence, and the sound of the river outside.",
    [c("m8", "Continue searching.", "mill.inside")],
    { voices: [v("perception", "The mill is empty. Everything of value has been taken, or has rotted away. The only thing left is the silence, and the sound of the river.")] }),
  N("mill.carvings", "mill",
    "The carvings on the beams are old, older than the village, older than the temple. They are not the symbols of binding, but the symbols of work, of harvest, of prosperity. They tell a story — a story of plenty, of harvest, of prosperity. But then, halfway along the beam, the carvings change. The symbols become different, darker, and then they stop. The last carving is a single symbol — the symbol of binding, of debt, of sacrifice.\n\nThe mill was built before the seal, before the silence, before the debt. It was a place of plenty, and then it became a place of debt, and then it was abandoned. The carvings tell the story, if you know how to read them.",
    [c("m9", "Note the carvings.", "mill.inside")],
    { fx: [
      { t: "know", id: "mill_carvings", label: "The mill beams are carved with symbols of prosperity, and then binding. The mill was built before the seal, and abandoned after." },
      { t: "ency", id: "mill_carvings_entry", title: "The Mill Carvings", text: "The mill beams are carved with symbols of prosperity, and then binding. The mill was built before the seal, before the silence, before the debt. It was a place of plenty, and then it became a place of debt, and then it was abandoned.", category: "Lore" },
    ], voices: [
      v("lore", "The carvings tell the story. The mill was built before the seal, before the silence, before the debt. It was a place of plenty, and then it became a place of debt, and then it was abandoned. The carvings tell the story, if you know how to read them."),
    ] }),
  N("mill.carvings_f", "mill",
    "The carvings are old, but their meaning escapes you. You can see the shapes, the patterns, the care with which they were made, but you cannot read them. They are a language you do not know, a story you cannot understand. The mill keeps its secrets, as mills do.",
    [c("m10", "Move on.", "mill.inside")],
    { voices: [v("lore", "The carvings are old. Very old. They were made by hands that understood something you do not. They will be here after you are gone, too. They do not need you to understand them.")] }),
  N("mill.wheel", "mill",
    "The waterwheel is massive, larger than you expected, and it is old — very old, the wood grey and cracked, the blades broken, the whole structure leaning slightly to one side. It has not turned in years, maybe decades, and the river flows past it, constant and patient, ignoring the wheel that was built to harness it.\n\nThe wheel is a monument to what was, and what is no longer. It was built to grind grain, to process the harvest, to make the village's prosperity real. Now it is just wood and iron and silence, and the river flows past it, constant and patient, waiting for nothing.",
    [c("m11", "Note the wheel.", "mill.approach")],
    { fx: [
      { t: "ency", id: "mill_wheel", title: "The Mill Waterwheel", text: "The mill waterwheel is massive, old, and broken. It has not turned in years, maybe decades. It was built to grind grain, to process the harvest, to make the village's prosperity real. Now it is just wood and iron and silence.", category: "Locations" },
    ], voices: [
      v("perception", "The wheel is old. Very old. It was built to harness the river, to make the village's prosperity real. Now it is just wood and iron and silence. The river flows past it, constant and patient, waiting for nothing."),
    ] }),
  N("mill.wheel_f", "mill",
    "The waterwheel is old, broken, silent. It has not turned in years, and the river flows past it, constant and patient, ignoring the wheel that was built to harness it. The wheel is a monument to what was, and what is no longer.",
    [c("m12", "Move on.", "mill.approach")],
    { voices: [v("perception", "The wheel is old. Broken. Silent. It has not turned in years. The river flows past it, constant and patient, waiting for nothing.")] }),
];

const CAVE: GNode[] = [
  N("cave.entrance", "cave",
    "The cave is hidden in the mountainside, above the village, above the temple, above the sealed path. It is small, barely large enough for a person to enter, and the entrance is concealed by a curtain of moss and ferns that makes it almost invisible unless you are looking for it.\n\nThe cave is not on any map, and the villagers do not speak of it, but you found it — or it found you. The entrance is dark, and the air that flows from it is cold and damp, smelling of stone and water and something else, something older, something that might be the ghost of a fire that burned a long time ago.\n\nThe cave is a place of secrets, and you are about to learn what they are.",
    [
      c("c1", "Enter the cave.", "cave.inside"),
      c("c2", "Examine the entrance.", "x", {
        check: { skill: "perception", dc: 12, pass: "cave.entrance_exam", fail: "cave.entrance_exam_f" },
      }),
      c("c3", "Return to the mountain.", "hub.village"),
    ],
    { at: 40, voices: [
      v("perception", "The cave is hidden, but not well. Someone wanted it to be found, but only by someone who was looking. You are looking, and so you found it."),
      v("empathy", "The cave is lonely. It has been waiting for someone to enter for a very long time. It is grateful, in its way, but also sad. It knows you will not stay."),
    ] }),
  N("cave.inside", "cave",
    "Inside, the cave is small, but it is deep, and the walls are smooth, polished by water and time. The air is cold and damp, and the sound of your breathing is loud in the silence. There is no light, except the faint glow from the entrance behind you, and as you move deeper, even that fades, and you are in darkness.\n\nBut the darkness is not complete. There is a light, somewhere ahead, a faint glow that might be phosphorescent moss, or might be something else, something older, something that has been waiting for you.\n\nYou follow the light, and the cave narrows, and then opens, and you are in a chamber, small and round, and in the center of the chamber is a stone, and on the stone is a book.",
    [
      c("c4", "Approach the book.", "cave.book"),
      c("c5", "Examine the chamber.", "x", {
        check: { skill: "perception", dc: 13, pass: "cave.chamber", fail: "cave.chamber_f" },
      }),
      c("c6", "Return to the entrance.", "cave.entrance"),
    ],
    { voices: [
      v("lore", "The cave is old. Very old. Older than the village, older than the temple, older than the mountain. It was here before the first stone was laid, before the first tree grew, before the first person came. It is a place of memory, and the book is a record of that memory."),
    ] }),
  N("cave.book", "cave",
    "The book is old, older than anything you have seen, and it is bound in leather that has cracked and faded with time. The pages are thin, almost translucent, and the writing is in a script you do not recognize — not the old script of the temple, not the script of the capital, but something else, something older, something that was old when the village was young.\n\nYou cannot read it, but you can feel it — the weight of the words, the weight of the story, the weight of the memory. The book is a record of the cave, and the village, and the debt, and the silence. It is a record of everything, and nothing, and the story it tells is the story of the mountain, and the village, and the people who came before, and the people who will come after.\n\nThe book is the memory of the mountain, and you are holding it in your hands.",
    [c("c7", "Close the book.", "cave.inside")],
    { fx: [
      { t: "ency", id: "cave_book", title: "The Book in the Cave", text: "A book in a cave, older than anything you have seen. The writing is in a script you do not recognize, but you can feel the weight of the words, the story, the memory. The book is a record of the cave, the village, the debt, the silence. It is the memory of the mountain.", category: "Lore" },
      { t: "stability", d: -5, reason: "You held the memory of the mountain, and it changed you." },
    ], voices: [
      v("lore", "The book is the memory of the mountain. It is older than the village, older than the temple, older than the mountain itself. It is a record of everything, and nothing, and the story it tells is the story of the world."),
    ] }),
  N("cave.chamber", "cave",
    "The chamber is small, but it is perfect — round, smooth, polished by water and time. The walls are covered in carvings, not the symbols of binding, but the symbols of memory, of story, of history. They tell a story, or part of a story — a story of the mountain, and the village, and the people who came before, and the people who will come after.\n\nThe carvings are old, very old, and they are beautiful, and they are sad. They tell a story of loss, of sacrifice, of debt, and they tell it in a language you do not know, but you can feel it, in your bones, in your heart, in your memory.\n\nThe chamber is a place of memory, and you are standing in it, and the memory is changing you.",
    [c("c8", "Step back.", "cave.inside")],
    { fx: [
      { t: "ency", id: "cave_chamber", title: "The Chamber of Memory", text: "A chamber in the cave, covered in carvings that tell a story of the mountain, the village, the people who came before, and the people who will come after. The carvings are old, beautiful, and sad. They tell a story of loss, of sacrifice, of debt. The chamber is a place of memory.", category: "Locations" },
      { t: "stability", d: 5, reason: "You stood in the chamber of memory, and it accepted you." },
    ], voices: [
      v("empathy", "The chamber is beautiful, and it is sad. It tells a story of loss, of sacrifice, of debt, and it tells it in a language you do not know, but you can feel it, in your bones, in your heart, in your memory."),
    ] }),
  N("cave.chamber_f", "cave",
    "The chamber is small, and dark, and cold. You cannot see much, and what you can see is just stone, and shadow, and silence. There is nothing more, or if there is, it is not for you. The cave keeps its secrets, as caves do.",
    [c("c9", "Step back.", "cave.inside")],
    { voices: [v("perception", "The chamber is just stone, and shadow, and silence. There is nothing more, or if there is, it is not for you. The cave keeps its secrets.")] }),
  N("cave.entrance_exam", "cave",
    "The entrance is hidden, but not well. The moss and ferns are arranged deliberately, to conceal the entrance from casual observers, but to reveal it to someone who is looking. The stones around the entrance are carved with the same symbols you saw in the forest, on the well, on the shrine. They are markers, or warnings, or both.\n\nThe cave is a place of secrets, and the entrance is a test — a test of perception, of attention, of intention. You passed the test, and now you are here, and the cave is waiting for you.",
    [c("c10", "Enter the cave.", "cave.inside")],
    { fx: [
      { t: "know", id: "cave_entrance", label: "The cave entrance is hidden, but deliberately so. It is a test of perception, and you passed." },
      { t: "ency", id: "cave_entrance_entry", title: "The Cave Entrance", text: "The cave entrance is hidden by moss and ferns, but deliberately so. The stones around the entrance are carved with symbols — markers, or warnings, or both. The cave is a place of secrets, and the entrance is a test.", category: "Locations" },
    ], voices: [
      v("perception", "The entrance is hidden, but not well. It is a test of perception, of attention, of intention. You passed the test, and now you are here."),
    ] }),
  N("cave.entrance_exam_f", "cave",
    "The entrance is hidden, and you cannot see how it is concealed. The moss and ferns are just moss and ferns, the stones are just stones, and there is nothing more, or if there is, it is not for you. The cave keeps its secrets, as caves do.",
    [c("c11", "Try again.", "cave.entrance")],
    { voices: [v("perception", "The entrance is hidden, and you cannot see how. The cave keeps its secrets, as caves do.")] }),
];

/* ================================= ASSEMBLY ================================= */

export const NODES: Record<string, GNode> = Object.fromEntries(
  [...ARRIVAL, ...GATE, ...HUB, ...RAN, ...KENTA, ...JIKAI, ...ELDER, ...SAYO, ...PATH, ...SHRINE, ...EPILOGUES, ...FOREST, ...RIVER, ...MILL, ...CAVE].map(
    (n) => [n.id, n],
  ),
);

bindNodeLookup((id) => NODES[id]);

const CONTENT_ERRORS = validateContent(NODES);
if (CONTENT_ERRORS.length > 0) {
  // Fail loudly on invalid authoring data.
  console.error("[kirifushi] content validation failed:\n" + CONTENT_ERRORS.join("\n"));
}
export const contentErrors: string[] = CONTENT_ERRORS;
