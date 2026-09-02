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
    "The road ends where the mist begins. Below, the village of Kagerou crouches in its valley like a held breath — smoke rising, lanterns waking, every roof turned carefully away from the mountain. Your circuit writ names this place *prosperous, unremarkable, behind on its paper*. The capital wants its history recorded. The mountain, apparently, wants something else.",
    [c("a1", "Shoulder your pack and go down.", "arr.2", { say: "(Down the mountain road, into the mist.)" })],
    {
      voices: [
        v("perception", "The guide-rope along the cliff is new. Cut this season. Someone expects travellers to *stay on the path*."),
        v("lore", "Kagerou. 'Heat-haze.' A village named for the thing you can almost, but never quite, see."),
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
    "The gate is a thick timber affair with a brazier on either side, and the man between them is thicker still. A torch catches the planes of his face: old soldier, new wariness. He looks at your writ, then at you, then at your hands — the way men look at hands that might be holding something.",
    [c("g0", "Meet his gaze.", "gate.hub", { say: "I'm the circuit archivist. The capital wants Kagerou's history for the record." })],
    { speaker: "Genji, the Gatekeeper", kanji: "源", at: 15 }),
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
    ],
    {
      voices: [
        v("empathy", "He isn't being difficult. He's being *posted*. There is a difference, and it is fear."),
        v("perception", "His left sleeve is damp to the elbow. It hasn't rained in three days.", { t: "notknow", id: "clue_sleeve" }),
      ],
    }),
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
    "You take a room above the storehouse — the only room offered, and you notice the window faces the mountain. Sleep comes in thin layers. Somewhere past midnight the mist presses against the paper screen like a palm, and you dream of six stones in a row, patient as teeth.",
    [c("h_r1", "Wake with the bell.", "hub.village")],
    { fx: [{ t: "time", minutes: 600 }] }),
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
    { fx: [{ t: "know", id: "drawings", label: "The children draw a shrine that doesn't exist — six sleepers beneath it, and a seventh figure crossed out." }] }),
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
    { speaker: "Elder Ochiba", kanji: "落", fx: [{ t: "flag", id: "elder_met" }], at: 30 }),
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
    [c("e8", "Close the ledger gently.", "elder.hub", { say: "(You close the ledger with the care of a man handling a sleeping animal.)" })],
    { fx: [
      { t: "know", id: "ledger_gap", label: "The official ledger skips an entire season — the same season as the 'landslide', forty years ago." },
      { t: "rel", npc: "ochiba", dim: "suspicion", d: 5 },
    ], voices: [v("reason", "One missing season. Six missing names, if the children draw true. The arithmetic is assembling itself whether you help it or not.")] }),
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
    "The path ends in a clearing the mist keeps like a held breath, and there it is: the shrine that is not on any map. Small — smaller than the fear of it. A torii the colour of old blood, wrapped in shimenawa rope so many times the gate looks *bandaged*. Paper streamers, seven layers deep, each layer a different decade of weather. No sound. That is the wrong part — no birds, no insects, not even wind. Just the mist, turning slowly, and the feeling of being read.",
    [
      c("sh1", "Read the names on the pillar.", "shrine.names", { cond: { t: "notknow", id: "the_names" } }),
      c("sh2", "Circle the shrine's back.", "x", {
        check: { skill: "perception", dc: 11, pass: "shrine.back", fail: "shrine.back_f" },
      }),
      c("sh3", "Approach the inner door.", "shrine.door", { cond: { t: "know", id: "the_names" } }),
    ],
    { at: 45, voices: [
      v("perception", "The outermost rope layer is white. *New*. This year. The seal is being renewed — regularly, recently, by hands."),
      v("lore", "Shimenawa binds sacred ground. This much shimenawa binds something *under* sacred ground."),
      v("empathy", "By the step: a child's sandal, half-rotten, placed neatly. Someone still comes here to grieve. Quietly. On schedule."),
    ] }),
  N("shrine.names", "shrine",
    "The pillar is granite, waist-high, and the names are cut into it in the old script — six of them, worn to ghosts by forty years of weather. You kneel and read with your fingers as much as your eyes: *Aki of the east field. Gorō the boatwright. Two of the miller's line. The ferryman. And Ise, aged eleven.* Below them, cut deeper — newer, sharper, defying the weather with fresh edges — two more names. The first you recognise from a census page and a boy's ten-year silence: *Miyo*. The second is half-finished. The chisel stopped mid-stroke. Whoever began the seventh name has not come back to end it.",
    [
      c("sh4", "Say the names aloud, all of them.", "x", {
        check: { skill: "willpower", dc: 10, pass: "shrine.spoken", fail: "shrine.spoken_f" },
      }),
      c("sh5", "Copy the names into your record, precisely.", "shrine.copied"),
    ],
    { fx: [
      { t: "know", id: "the_names", label: "Six names under the stone — Aki, Gorō, the miller's two, the ferryman, Ise aged eleven. Two fresh cuts: Miyo, and a seventh name left half-finished." },
      { t: "flag", id: "saw_names" }, { t: "questStage", id: "names_under_stones", stage: 2 },
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
    "The mist stands at the edge of the clearing like a congregation waiting for a sermon. In your hands: the true ledger. In your sleeve: the names. In your memory: a boy at a well, an old woman under a roof she calls a story, a monk's broom on an endless stair, a cartographer's red thread, a gatekeeper's unlit lantern. The capital is waiting for a record. The mountain is waiting for a decision. *Both are the same decision.* What does the archive of Kagerou say?",
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

export const NODES: Record<string, GNode> = Object.fromEntries(
  [...ARRIVAL, ...GATE, ...HUB, ...RAN, ...KENTA, ...JIKAI, ...ELDER, ...SAYO, ...PATH, ...SHRINE, ...EPILOGUES].map(
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
