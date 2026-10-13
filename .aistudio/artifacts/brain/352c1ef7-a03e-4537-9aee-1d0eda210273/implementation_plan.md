# Daily Mission System & Mobile Dash UI Optimization

Architectural blueprint for implementing a persistent calendar-day Daily Mission system with procedural objectives, randomized score rewards, slide-out HUD mission tracker drawer, and mobile touch interface refinement that removes redundant top dash prompts while anchoring the dedicated dash button to the bottom-right.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural parameters were confirmed during the planning clarification phase:
> - **Refresh Schedule**: Reset once per calendar day (based on local YYYY-MM-DD date key in `localStorage`) with persistent completion tracking so completed missions stay claimed for the rest of the day.
> - **In-Game HUD Integration**: Compact slide-out mission panel accessible via a dedicated cyberpunk icon button in the HUD (top-right next to telemetry), avoiding visual obstruction of the 3D runner track during intense runs.
> - **Mobile Dash Layout**: Remove the top trigger prompt/button from `DimensionBoostGauge` on mobile viewports (`hidden sm:flex`) and retain the tactile action button in the bottom-right corner (`VirtualJoystick`).

- **Confirmed Decision 1**: Calendar-day date-keyed seed generation ensures deterministic daily objectives (e.g., orb quotas, distance thresholds, combo streaks, dimension shift triggers) that persist across refreshes.
- **Confirmed Decision 2**: Randomized point reward (e.g., 2,500 – 10,000 bonus score points) awarded with animated celebratory HUD banner and sound synthesizer chime when the objective condition is satisfied.
- **Confirmed Decision 3**: Slide-out drawer with Cyberpunk/Brutalist aesthetic (#000000 background, #FF003C / #E056FD accents, monospace typography, real-time progress bar).

---

## 1. Overview & Core Concept

- **What It Does**: 
  - Every calendar day, a procedural daily directive is assigned to the player (e.g., *"Collect 50 orbs in a single run"*, *"Travel 1,500 meters"*, *"Achieve a 5x Combo Streak"*, or *"Trigger Dimension Shift 2 times"*).
  - The mission tracks live run progress. Upon hitting 100%, it awards a random bonus score (e.g., 2,500 to 10,000 points) with a sonic celebration via `AudioSynth`, marks the mission completed for that day, and preserves status in `localStorage`.
  - Players can check their active mission and progress anytime from both the Start Screen and an in-game slide-out drawer opened via a target icon button in the HUD.
  - On mobile devices, the top dash button prompt inside the center boost gauge is suppressed to eliminate screen clutter, keeping the tactile dash button cleanly docked in the bottom-right thumb zone.
- **Target Audience / Persona**: High-speed endless runner players seeking immediate progression hooks and mobile touch players wanting an unobstructed view of incoming barriers.
- **Key Value**: Increases daily player retention with tangible reward feedback while streamlining the mobile touch HUD layout.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Start Screen Inspection**:
   - On game launch, the Start Screen displays a "DAILY DIRECTIVE" terminal widget alongside the mission brief and top runners list.
   - Shows the current objective, status (`ACTIVE` vs `COMPLETED`), current best progress, and prospective reward bracket.
2. **In-Run Progress & Slide-Out Panel**:
   - In the top HUD bar, a compact `[TARGET / MISSION]` icon button with a subtle status pip is located next to the telemetry badges.
   - Clicking/tapping the button slides open a sleek Brutalist drawer (`bg-black/95 border-l-2 border-[#FF003C]`) from the right edge with:
     - Daily Mission title & objective description.
     - Live progress bar (`current / target`).
     - Real-time run telemetry.
     - Close button (`[X] ESC / CLOSE`).
3. **Mission Completion Climax**:
   - When the objective is achieved mid-run, an alert banner flashes across the screen: `MISSION ACCOMPLISHED // +[X,XXX] PTS GRANTED`, accompanied by a victory chime from `AudioSynth`.
   - Score is immediately credited to the current run score and top score.
4. **Mobile Ergonomics**:
   - On screens `< 640px` (mobile), the prompt button beneath the top `DimensionBoostGauge` is hidden.
   - The bottom-right `SHIFT / PHASE` circular button in `VirtualJoystick` remains fully responsive with thumb tap and active animation states.

### Visual Identity & Theme Tokens

- **Dominant Neutral Canvas (60%)**: `#000000` (Pure Black backdrop, high contrast).
- **Structural Surfaces (30%)**: `#0a0a0a` to `#111111` containers, hairline `#333` dividers, `#FF003C` alert borders.
- **Accent Budget (10%)**: Cyber-Red (`#FF003C`) for primary alerts/actions; Red-Violet (`#E056FD`) for progress indicators and telemetry accents.
- **Typography**: Monospace (`JetBrains Mono`, `font-mono tabular-nums`).
- **Watermark**: Preserved at bottom-right (`ARCHITECT // VOID_WEAVER`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Deterministic Calendar-Day Seed vs. Pure Random Roll**
  - *Chosen Approach*: Deterministic pseudo-random seed generated from the current date string (`YYYY-MM-DD`).
  - *Why*: Ensures that if a player reloads or re-opens the game on the same day, their mission objective and progress remain completely consistent and cannot be gamed by refreshing.
  - *Alternatives Considered*: Pure random mission on every reload — rejected as it disrupts goal consistency and enables reroll exploitation.
- **Decision 2: In-Run Objective Evaluation vs. End-of-Run Evaluation**
  - *Chosen Approach*: Real-time in-run evaluation. As soon as the condition is met (e.g. 50th orb collected), the player receives immediate rewarding feedback.
  - *Why*: Immediate dopamine feedback during gameplay rather than waiting until collision/game over.
- **Decision 3: Slide-Out Drawer vs. Persistent Top HUD Widget**
  - *Chosen Approach*: Slide-out drawer accessible via an icon button, as chosen by the user in Phase 1.
  - *Why*: Keeps the high-speed 3D viewport clean while providing in-depth objective details on demand.

---

## 4. Technical Architecture & Data Strategy

### Component Hierarchy & System Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                              App.tsx                                   │
│  - Three.js 3D Viewport                                                │
│  - Start Screen & Game Over Screens                                    │
│  - Dual PC & Mobile Input Orchestration                               │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────┐
│              Navbar.tsx              │  │      VirtualJoystick.tsx      │
│  ┌────────────────────────────────┐  │  │  - Mobile D-Pad (Left)        │
│  │ Telemetry Badges (Shield/Speed)│  │  │  - Bottom-Right Dash Button   │
│  ├────────────────────────────────┤  │  │    (Dedicated Shift Action)   │
│  │ DimensionBoostGauge (Top)      │  │  └───────────────────────────────┘
│  │   * Mobile prompt hidden!      │  │
│  ├────────────────────────────────┤  │
│  │ DailyMissionButton (Trigger)   │  │
│  └────────────────────────────────┘  │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────┐
│       DailyMissionDrawer.tsx         │  │       useGameStore.ts         │
│  - Slide-out Cyberpunk Panel         │  │  - dailyMission state         │
│  - Live Target Progress Bar          │  │  - checkMissionProgress()     │
│  - Reward Badge & Claim Status       │  │  - claimMissionReward()       │
└──────────────────────────────────────┘  │  - localStorage Persistence   │
                                          └───────────────┬───────────────┘
                                                          │
                                                          ▼
                                          ┌───────────────────────────────┐
                                          │        AudioSynth.ts          │
                                          │  - playMissionComplete()      │
                                          │  - Multi-tier Basslines       │
                                          └───────────────────────────────┘
```

### Daily Mission Data Model (`src/types/index.ts` & `src/store/useGameStore.ts`)

```typescript
export type MissionType = 'ORBS_SINGLE_RUN' | 'DISTANCE_SINGLE_RUN' | 'COMBO_STREAK' | 'DIMENSION_SHIFTS';

export interface DailyMission {
  id: string;               // e.g., "mission-2026-10-13"
  dateKey: string;          // "YYYY-MM-DD"
  type: MissionType;
  title: string;            // e.g. "DATA PURGE"
  description: string;      // e.g. "Recover 50 Orbs in a single run"
  targetValue: number;      // e.g. 50
  currentProgress: number;  // Run / daily progress
  completed: boolean;       // Status flag
  rewardPoints: number;     // e.g. 4500 (randomized 2,500 - 10,000)
  rewardClaimed: boolean;   // Claimed flag
}
```

### Daily Mission Objectives Catalog

1. **Data Harvest**: Collect $N$ orbs in a single run (35 to 60 orbs).
2. **Deep Infiltration**: Reach $N$ meters in a single run (1,200 to 2,500 meters).
3. **Harmonic Resonance**: Achieve a combo streak of $N$ orbs (12 to 24 consecutive orbs).
4. **Phase Overdrive**: Trigger Dimension Shift $N$ times (2 to 4 times).

### Real-Time Evaluation Pipeline

- `collectOrb`: Increments run orbs and active combo streak $\rightarrow$ checks `ORBS_SINGLE_RUN` and `COMBO_STREAK`.
- `updateTick`: Distance progresses $\rightarrow$ checks `DISTANCE_SINGLE_RUN`.
- `triggerDimensionShift`: Shift activated $\rightarrow$ checks `DIMENSION_SHIFTS`.
- Once `currentProgress >= targetValue` and `!completed`:
  - Award `rewardPoints` directly to score and top score.
  - Trigger audio cue `audioSynth.playMissionComplete()`.
  - Set `completed: true`, `rewardClaimed: true`.
  - Persist to `localStorage.getItem('void_runner_daily_mission')`.
  - Display alert banner in HUD.
