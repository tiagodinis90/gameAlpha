# KIRIFUSHI - Interactive Map System

## Overview

KIRIFUSHI now features a fully interactive map system that allows players to visually explore the village of Kagerou and travel between locations. The map integrates seamlessly with the existing narrative dialogue system, creating a hybrid exploration experience.

## Features

### 1. **Visual Map Interface**
- Stylized top-down map of Kagerou village with atmospheric ink-wash aesthetic
- Six explorable locations with unique kanji markers
- Walking paths connecting locations (with sealed paths shown as dashed lines)
- Compass rose and legend for navigation
- Atmospheric mist and ember effects matching the game's visual style

### 2. **Character Movement**
- Animated character sprite with traditional traveler appearance (kasa hat, red coat)
- Smooth walking animation between locations using cubic easing
- Character shadow and subtle bounce effect during movement
- Walking stick appears during travel for visual feedback

### 3. **Location System**
- **Mountain Road (道)**: Starting location, always accessible
- **Village Gate (門)**: Genji's post, always accessible
- **Kagerou Square (村)**: Village heart, unlocks after entering the village
- **Mountain Temple (寺)**: Jikai's temple, unlocks after entering the village
- **Sealed Path (坂)**: Rope gate to the shrine, unlocks with 2+ knowledge threads
- **Mistbound Shrine (祠)**: Final destination, unlocks after reading the names

### 4. **Progressive Discovery**
- Locations unlock based on game state (flags, knowledge, quest progress)
- Locked locations show "?" indicators and reduced opacity
- Sealed paths display red seal markers (封) until conditions are met
- Discovery counter shows exploration progress (X/6 locations)

### 5. **Interactive Elements**
- Click any unlocked location to travel there
- Hover over locations to see descriptions
- Current location pulses with golden glow
- Smooth fade transitions between map and dialogue views
- Location tooltips provide atmospheric context

### 6. **Integration with Dialogue System**
- Each location maps to a specific dialogue entry node
- Traveling to a location automatically transitions to that location's dialogue
- Map and dialogue views toggle seamlessly with fade animations
- Location name in top bar is clickable to open map
- "Map 図" / "Story 語" button toggles between views

## Technical Implementation

### MapView Component
- **File**: `src/components/MapView.tsx`
- Uses percentage-based positioning for responsive layout
- SVG overlay for path lines and seal markers
- RequestAnimationFrame for smooth character movement
- Memoized location data for performance

### State Integration
- Location unlocks tracked via `state.flags` and `state.knowledge`
- Character position synced with `state.loc`
- Location transitions use `enterFromId()` to load appropriate dialogue nodes
- Map state persisted in game state for save/load compatibility

### Visual Design
- Matches existing lacquer-ink/gold/vermilion aesthetic
- Uses Shippori Mincho B1 font for kanji markers
- Atmospheric effects (mist, embers) via existing Ambient component
- Bracketed panels and gold accents consistent with UI language

## Location Entry Points

```typescript
const LOCATION_ENTRY_NODES: Record<Loc, string> = {
  road: "arr.1",           // Mountain Road arrival
  gate: "gate.meet",       // Gatekeeper encounter
  village: "hub.village",  // Village square hub
  temple: "jikai.meet",    // Monk Jikai encounter
  path: "path.gate",       // Sealed path gate
  shrine: "shrine.approach", // Shrine approach
};
```

## Gameplay Flow

1. **Arrival**: Player starts on the Mountain Road
2. **Gate**: Travel to Village Gate to meet Genji
3. **Village**: Enter Kagerou Square to begin investigation
4. **Exploration**: Visit NPCs (Ran, Kenta, Jikai, Sayo, Elder)
5. **Discovery**: Gather knowledge threads to unlock Sealed Path
6. **Climax**: Travel to Mistbound Shrine for final confrontation
7. **Resolution**: Choose ending based on accumulated choices

## Future Enhancements

Potential additions for expanded gameplay:
- **NPC markers**: Show NPC locations on map when known
- **Time-based events**: Certain locations only accessible at specific times
- **Weather effects**: Rain/fog alter map visibility and path conditions
- **Fast travel**: Unlock fast travel between discovered locations
- **Map annotations**: Player can mark locations with notes
- **Hidden locations**: Secret areas revealed through specific actions
- **Dynamic paths**: Paths change based on world state (destroyed bridges, etc.)

## Accessibility

- Keyboard navigation support (Tab through locations)
- High contrast markers for visibility
- Descriptive tooltips for screen readers
- Reduced motion support for animations
- Clear visual feedback for locked/unlocked states

## Performance

- Memoized location calculations
- Efficient SVG rendering for paths
- Lazy loading of map assets
- Smooth 60fps animations
- Minimal re-renders on state changes

---

The map system transforms KIRIFUSHI from a purely text-based narrative into a hybrid exploration-adventure experience, while maintaining the deep literary prose and systemic reactivity that define the game's identity.
