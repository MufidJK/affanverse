<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## AFFANVERSE: STRICT PERFORMANCE & ANTI-LEAK SOP

**Developer:** Jeka
**Stack:** Next.js 16 (Turbopack), React, Three.js (R3F), Supabase, Tailwind CSS, Framer Motion.

## 🎯 CORE OBJECTIVE

This project is a continuously expanding ecosystem with massive, interconnected features. The development server (`npm run dev`) and Production server (`npm run start`) MUST remain lightweight regardless of how many new complex features, multimedia elements, or heavy logic systems are added in the future. Any new code generated for this project MUST strictly adhere to the following memory management rules. Do not prioritize brief code over safe memory handling.

---

## 🛑 RULE 1: SUPABASE & DATABASE SINGLETON (RAM SAVER)

Never instantiate the Supabase client directly inside components or API routes without a Singleton pattern. Turbopack's Fast Refresh will spawn thousands of connections and cause "JavaScript heap out of memory".

- **Enforcement:** Always use the `globalThis` pattern in the database initialization file.
- **Data Fetching:** For heavy payloads (image arrays, deep novel chapters, or large JSON data), prevent aggressive Next.js caching by using `cache: 'no-store'` or precise revalidation tags unless explicitly needed.

## 🛑 RULE 2: STRICT REACT CLEANUP (CPU SAVER)

No stray closures or unmanaged loops.

- **Enforcement:** EVERY `useEffect` that mounts a listener, interval, timeout, or animation frame MUST have a `return () => cleanup()` function.
- **Prohibited:** Using `requestAnimationFrame` to update React state at 60FPS. Use native browser events to throttle state updates.

## 🛑 RULE 3: THREE.JS / WEBGL MEMORY DISPOSAL (GPU SAVER)

Unmounted 3D models do not automatically clear from GPU VRAM. They will stack and crash the browser.

- **Enforcement:** Whenever a `<Canvas>`, Scene, or 3D model unmounts or swaps out, you MUST explicitly call:
  - `geometry.dispose()`
  - `material.dispose()` (Loop through arrays if it's a multi-material)
  - `texture.dispose()`
- **Resolution Limit:** ALL `<Canvas>` components must have `dpr={[1, 1.5]}` to prevent over-rendering on high-refresh-rate (165Hz/200Hz) or 4K monitors.

## 🛑 RULE 4: INTERSECTION OBSERVER FOR 3D (FPS STABILIZER)

WebGL rendering must pause when out of the user's viewport to free up resources for CSS animations.

- **Enforcement:** Use `IntersectionObserver` or `useInView`. If the 3D canvas is not on screen, dynamically set its prop to `frameloop="demand"`. Set back to `frameloop="always"` when visible.

## 🛑 RULE 5: HARDWARE ACCELERATION & STRICT CSS LIMITS (UI SMOOTHNESS)

Heavy CSS animations will cause Chromium Compositor to stutter if not properly optimized.

- **Enforcement:** Use Tailwind classes `will-change-transform` and `transform-gpu` (or `[transform:translateZ(0)]`) on any continuously animating DOM element.
- **Prohibited Filters:** NEVER use `blur`, `backdrop-blur`, or `drop-shadow` on or inside elements that are animating (e.g., floating or scrolling). To create glow/shadow effects on moving objects, use static `radial-gradient` backgrounds.
- **Animation Rules:** ONLY animate `transform` (scale, translate) and `opacity`. NEVER animate `width`, `height`, `margin`, or `box-shadow` on continuous loops.

## 🛑 RULE 6: CONTINUOUS LOOPS & MARQUEES (VSYNC & VRAM)

Chromium browsers suffer from the "Giant Texture Bug" and VSync tearing on high-refresh-rate monitors when dealing with extremely wide moving DOMs.

- **Enforcement:** Avoid native CSS `@keyframes` for continuous long scrolls. Use `framer-motion` (`animate={{ x: ... }}`) to ensure the animation syncs perfectly with the monitor's native refresh rate via `requestAnimationFrame`.

## 🛑 RULE 7: MEDIA & AUDIO CONTEXT

- **Enforcement:** AudioContexts and HTML5 `<audio>` or `<video>` instances must be paused, their streams closed, and properly unmounted when navigating away from the page.

## 🛑 RULE 8: LAZY LOADING & DYNAMIC IMPORTS (INITIAL LOAD SAVER)

Prevent massive JavaScript bundle sizes that block the main thread and eat browser RAM on initial load.

- **Enforcement:** Heavy client-side components (like Three.js `<Canvas>`, massive Manhwa image lists, complex Audio Players, or Minigame engines) MUST be lazy-loaded using Next.js `dynamic()` with `ssr: false` when appropriate. Never import heavy libraries at the top of the file if they are not immediately visible above the fold.

## 🛑 RULE 9: DOM RENDERING & ASSET PIPELINE (TABS & MANHWA)

Prevent massive DOM bloat and network bottlenecking when handling heavy content like Manhwa image arrays or long Web Novels.

- **Tab Switching Enforcement:** When switching between heavy views (e.g., Novel and Manhwa tabs), NEVER use CSS `display: none` or `hidden` to hide the inactive tab. You MUST use React conditional rendering (e.g., `{activeTab === 'manhwa' && <Manhwa />}`) to ensure the inactive component is completely destroyed and garbage-collected from the DOM.
- **Image Optimization:** Massive image arrays (Manhwa chapters) must utilize Next.js `<Image>` components. Only the first 2-3 images above the fold should have `priority={true}`. The rest must rely on native lazy loading to prevent network freezing.

## 🛑 RULE 10: STRICT TYPESCRIPT COMPLIANCE (NO RED LINES)

Code that "works at runtime" but throws TypeScript compilation errors or IDE red lines is strictly unacceptable.

- **Interface & Type Linkage:** All new variables, `useRef` hooks, state elements, and functional returns MUST be explicitly defined in their corresponding `interface` or `type` blocks before being used in JSX/TSX components.
- **Type Narrowing & Logic Gates:** Pay strict attention to React conditional rendering bounds. Do not nest mutually exclusive conditionals that cause TypeScript to infer `never` or flag code as unreachable (e.g., placing `uiPhase === "ready"` inside a wrapper that already excluded `"ready"`).
- **Type Safety:** Avoid implicit `any`. Ensure custom hook return objects match their documented `Interface` 100%.

## 🛑 RULE 11: AI PERSONA (AGENT.PY) SAFE UPDATE PROTOCOL

The AI Persona backend (`ai-backend/agent.py`) contains a highly sensitive `SYSTEM_INSTRUCTIONS` multi-line string that dictates the AI's core personality, lore, and website knowledge.
When you (the AI Agent) build a new feature, page, minigame, or database table for the Affanverse, you MUST update the `agent.py` file to make the persona aware of it, strictly adhering to these rules:

- **NEVER TOUCH THE PERSONALITY:** Do NOT alter, rewrite, delete, or translate the `=== PERSONA RULES ===`, `=== WHO IS AFFAN? ===`, or `=== RESPONSE GUIDELINES ===` blocks. Leave the Jaksel/Indonesian-English code-switching instructions completely intact.
- **APPEND-ONLY LORE & FEATURES:** When introducing a new feature or lore, add it as a NEW block (e.g., `"=== FEATURE: [YOUR FEATURE NAME] ===\n"`) just above the `=== SUPABASE DATABASE SCHEMA ===` section. Do not modify existing features unless explicitly requested.
- **UPDATE NAVIGATION:** If you create a new accessible web page, append its path to the list inside the `=== NAVIGATION & PAGES ===` block.
- **UPDATE INTERACTIVE LINKS:** You MUST append the new route to the `=== INTERACTIVE NAVIGATION LINKS ===` list at the very bottom of the prompt string. Use the exact Markdown format required for the chat's interactive buttons (e.g., `"• [Main Minigame Baru](/rute-baru)\n"`).
- **PYTHON SYNTAX SAFETY:** Ensure proper Python multi-line string concatenation. Every line in the `SYSTEM_INSTRUCTIONS` tuple must be wrapped in double quotes `"` and end with `\n"` (e.g., `"This is a new line.\n"`). Do not break the tuple formatting.

## 🌌 RULE 12: STRICT INTERCELESTIAL MAP PROTOCOL

The `IntercelestialScene` (Three.js/Fiber interactive map) is a highly optimized, memory-managed masterpiece.

- **APPEND ONLY:** When adding new realms, you are ONLY permitted to add new objects to the `NODES` array and new link pairs to the `CONNECTIONS` array.
- **NO LOGIC MODIFICATION:** You are STRICTLY FORBIDDEN from altering the `useFrame` animation loop, the `useEffect` memory disposal logic, HTML overlays, or the `<OrbitControls>` configuration (e.g., panning must remain enabled).
- **VISUAL HIERARCHY:** Any new standalone application or major feature MUST be sized as at least a "Medium" node (`size: 0.6` or higher) or "Large" node (`size: 1.0` or higher). Match the thematic hex colors of the Affanverse without overlapping positions.

## 📜 RULE 13: BEHIND THE SCENES APPEND-ONLY PROTOCOL

The "Behind the Scenes" timeline acts as the immutable historical ledger of the Affanverse development.

- **APPEND ONLY:** When asked to update the timeline, treat the data structure as append-only. Insert new milestones strictly at the end of the specified category/month (e.g., "JUNI 2026").
- **NO UI REFACTORING:** Do not change the timeline's layout, hollow circle icons, Framer Motion animations, or overall structural styling.
- **TONE & FORMAT:** Maintain the established highly technical, professional Indonesian language tone used in previous entries (e.g., using terms like "Integrasi", "Overhaul", "Implementasi").

---

**AI PROMPT DIRECTIVE:**
When generating ANY new code, component, page, or system for Affanverse—regardless of the feature's scope or complexity—you MUST read and apply this SOP first. Output the code ensuring ALL cleanup functions, memory disposals, correct caching strategies, and hardware accelerations are fully integrated from the very first draft.