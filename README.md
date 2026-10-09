> **Personal creative experiment.** This is an unfinished narrative/game-systems prototype, separate from my environmental engineering work. For the purpose, technical scope and limitations of these experiments, see [Creative experiments](https://github.com/tiagodinis90/tiagodinis90/blob/main/CREATIVE_EXPERIMENTS.md).

# KIRIFUSHI — narrative RPG prototype

**Status:** experimental browser game. **Implementation:** React, TypeScript and Vite, not Godot or GDScript.

KIRIFUSHI is a story-driven RPG set around the village of Kagerou and the Mistbound Shrine. The current source includes branching dialogue, condition/effect evaluation, skill checks, character state, locations, a map interface and browser save/load behaviour.

## Code structure

- `src/game/engine.ts` — state transitions, dice checks, conditions, time and weather.
- `src/game/content.ts` — narrative nodes, choices and outcomes.
- `src/game/types.ts` — game data types.
- `src/components/` — presentation, dialogue, map and interface components.
- `EXPANSION_SUMMARY.md` and `MAP_SYSTEM.md` — design and implementation notes.

## Run locally

```bash
npm install
npm run dev
```

For static checks and a production bundle, use `npm run typecheck` and `npm run build`. These commands are documented, not claimed to have passed here.

## Scope and limitations

This repository contains a browser-based TypeScript implementation. Despite the current repository URL, no Godot project or GDScript implementation was identified in the reviewed main-branch files. Gameplay and narrative content are under development. The documentation is not evidence of a completed game or production deployment.
