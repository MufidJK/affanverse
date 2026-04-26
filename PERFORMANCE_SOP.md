# AFFANVERSE: STRICT PERFORMANCE & ANTI-LEAK SOP
**Developer:** Jeka
**Stack:** Next.js 16 (Turbopack), React, Three.js (R3F), Supabase, Tailwind CSS.

## 🎯 CORE OBJECTIVE
This project is a continuously expanding ecosystem with massive, interconnected features. The development server (`npm run dev`) and Production server (`npm run start`) MUST remain lightweight regardless of how many new complex features, multimedia elements, or heavy logic systems are added in the future. Any new code generated for this project MUST strictly adhere to the following memory management rules. Do not prioritize brief code over safe memory handling.

---

## 🛑 RULE 1: SUPABASE & DATABASE SINGLETON (RAM SAVER)
Never instantiate the Supabase client directly inside components or API routes without a Singleton pattern. Turbopack's Fast Refresh will spawn thousands of connections and cause "JavaScript heap out of memory".
* **Enforcement:** Always use the `globalThis` pattern in the database initialization file. 
* **Data Fetching:** For heavy payloads (image arrays, deep novel chapters, or large JSON data), prevent aggressive Next.js caching by using `cache: 'no-store'` or precise revalidation tags unless explicitly needed.

## 🛑 RULE 2: STRICT REACT CLEANUP (CPU SAVER)
No stray closures or unmanaged loops. 
* **Enforcement:** EVERY `useEffect` that mounts a listener, interval, timeout, or animation frame MUST have a `return () => cleanup()` function.
* **Prohibited:** Using `requestAnimationFrame` to update React state at 60FPS. Use native browser events to throttle state updates.

## 🛑 RULE 3: THREE.JS / WEBGL MEMORY DISPOSAL (GPU SAVER)
Unmounted 3D models do not automatically clear from GPU VRAM. They will stack and crash the browser.
* **Enforcement:** Whenever a `<Canvas>`, Scene, or 3D model unmounts or swaps out, you MUST explicitly call:
  - `geometry.dispose()`
  - `material.dispose()` (Loop through arrays if it's a multi-material)
  - `texture.dispose()`
* **Resolution Limit:** ALL `<Canvas>` components must have `dpr={[1, 1.5]}` to prevent over-rendering on high-refresh-rate (165Hz/200Hz) or 4K monitors.

## 🛑 RULE 4: INTERSECTION OBSERVER FOR 3D (FPS STABILIZER)
WebGL rendering must pause when out of the user's viewport to free up resources for CSS animations.
* **Enforcement:** Use `IntersectionObserver` or `useInView`. If the 3D canvas is not on screen, dynamically set its prop to `frameloop="demand"`. Set back to `frameloop="always"` when visible.

## 🛑 RULE 5: HARDWARE ACCELERATION FOR UI (CSS SMOOTHNESS)
Heavy CSS animations will cause stuttering (FPS drops) if not handed off to the GPU.
* **Enforcement:** Use Tailwind classes `will-change-transform` and `transform-gpu` (or `[transform:translateZ(0)]`) on any continuously animating DOM element. 
* **Animation Rules:** ONLY animate `transform` (scale, translate) and `opacity`. NEVER animate `width`, `height`, `top`, `left`, or `box-shadow` on continuous loops. Minimize `backdrop-blur` on moving elements.

## 🛑 RULE 6: MEDIA & AUDIO CONTEXT
* **Enforcement:** AudioContexts and HTML5 `<audio>` or `<video>` instances must be paused, their streams closed, and properly unmounted when navigating away from the page.

---
**AI PROMPT DIRECTIVE:**
When generating ANY new code, component, page, or system for Affanverse—regardless of the feature's scope or complexity—you MUST read and apply this SOP first. Output the code ensuring ALL cleanup functions, memory disposals, correct caching strategies, and hardware accelerations are fully integrated from the very first draft.