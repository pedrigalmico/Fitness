# Demo Mode Playbook
*How to create an embeddable, auth-free demo of any React app for portfolio embedding.*

---

## Overview

This pattern creates a `demo/public-embed` branch of your app that:
- Skips login entirely (mock auth user injected)
- Seeds realistic localStorage data before React mounts
- Shows an onboarding wizard on first visit (makes the demo feel like a real product)
- Supports `?seed=1` to bypass onboarding for direct iframe embeds
- Isolates all demo data under a `demo_` prefix so it never touches real data
- Has a visible Reset button that wipes data and returns to onboarding

---

## Step 1 — Create the branch

```bash
git checkout main
git checkout -b demo/public-embed
git push -u origin demo/public-embed
```

Never commit demo changes to `main`.

---

## Step 2 — Stub out authentication

Replace your auth provider/context with a mock that injects a fake user and no-ops all auth methods. The key: **don't remove the provider** — every component that calls `useContext(AuthContext)` still needs it. Just short-circuit the state.

**`src/AuthContext.jsx`**
```jsx
import { createContext } from "react";

export const AuthContext = createContext(null);

const DEMO_USER = { uid: "demo", email: "demo@yourapp.com", username: "Demo User" };

export function AuthProvider({ children }) {
  return (
    <AuthContext.Provider value={{
      user: DEMO_USER,
      login: async () => {},
      register: async () => {},
      logout: async () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

If your app uses Firebase, Supabase, Auth0, etc. — also stub the SDK file so no network calls are made:

**`src/firebase.js`** (or equivalent)
```js
// Demo mode — SDK disabled
export const auth = null;
export const db = null;
```

---

## Step 3 — Strip cloud sync from your storage hook

Replace any hook that syncs to a backend (Firestore, Supabase, etc.) with pure localStorage. Use a `demo_` prefix on every key so demo data is isolated from any real user data.

**`src/hooks/useStorage.js`**
```js
import { useState, useCallback } from "react";

const DEMO_PREFIX = "demo_";

export function useStorage(key, initialValue) {
  const localKey = `${DEMO_PREFIX}${key}`;

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(localKey);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    setStoredValue((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      localStorage.setItem(localKey, JSON.stringify(next));
      return next;
    });
  }, [localKey]);

  return [storedValue, setValue];
}
```

---

## Step 4 — Write the seed function

This runs **before React mounts** (at module level). It writes realistic data into localStorage so every page looks populated on first render — not empty.

**`src/seedDemoData.js`**
```js
const P = "demo_";
const key = (k) => `${P}${k}`;

function dateStr(daysAgo) {
  const d = new Date(); // or pin to a fixed date if you want consistent screenshots
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

export function seedDemoData(profile = {}) {
  // Save the profile
  localStorage.setItem(key("your_profile_key"), JSON.stringify({
    ...profile,
    updatedAt: new Date().toISOString(),
  }));

  // Seed whatever your app tracks:
  // - activity logs, chart data, checklist state, etc.
  // Use dateStr(N) to backfill N days ago so charts look real

  const ts = Date.now();

  localStorage.setItem(key("your_logs_key"), JSON.stringify({
    [dateStr(7)]: { completed: true, ts },
    [dateStr(5)]: { completed: true, ts },
    [dateStr(3)]: { completed: true, ts },
    [dateStr(0)]: { completed: false, ts }, // today in progress
  }));

  // Mark seeded — prevents re-running
  localStorage.setItem(key("ft_seeded"), "1");
}
```

**Rules:**
- Always check for the seed flag first and bail early if already seeded
- Include a `ts` (timestamp) field on every entry if your app uses it to check completion
- Scale numeric data based on `profile` inputs (weight, goal, level) so it feels personalised

---

## Step 5 — Wire up App.jsx

Three things happen here:
1. `?seed=1` check runs at **module level** (before any component mounts) — bypasses onboarding for iframe embeds
2. `hasCompletedOnboarding()` gates the UI — shows onboarding wizard if not seeded
3. Demo banner with Reset button sits at the top of the app shell

**`src/App.jsx`**
```jsx
import { useState, lazy, Suspense } from "react";
import { HashRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { AuthProvider } from "./AuthContext";
import { seedDemoData } from "./seedDemoData";

// Lazy-load pages for faster initial load
const Home       = lazy(() => import("./pages/Home"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
// ... other pages

const DEMO_PREFIX = "demo_";

// ✅ Runs at module level — before React mounts
// ?seed=1 skips onboarding entirely (used by iframe embeds)
if (
  new URLSearchParams(window.location.search).has("seed") &&
  !localStorage.getItem(`${DEMO_PREFIX}ft_seeded`)
) {
  seedDemoData({ name: "Demo", age: 28, weight: 75, height: 175, goal: "recomp" });
}

function hasCompletedOnboarding() {
  return !!localStorage.getItem(`${DEMO_PREFIX}ft_seeded`);
}

function resetDemo() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(DEMO_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
  window.location.reload();
}

function DemoBanner() {
  return (
    <div style={{ background: "#FF6B35", color: "#fff" }}
         className="flex items-center justify-between px-4 py-2 text-xs font-bold">
      <span>DEMO MODE — data is local only</span>
      <button onClick={resetDemo} className="flex items-center gap-1 px-2 py-1 rounded"
              style={{ background: "rgba(0,0,0,0.2)" }}>
        <RotateCcw size={12} /> Reset
      </button>
    </div>
  );
}

function AppShell() {
  const [ready, setReady] = useState(hasCompletedOnboarding); // lazy init

  if (!ready) {
    return (
      <Suspense fallback={<div>Loading…</div>}>
        <Onboarding onComplete={(profile) => { seedDemoData(profile); setReady(true); }} />
      </Suspense>
    );
  }

  return (
    <HashRouter>
      {/* DemoBanner sits above everything */}
      <DemoBanner />
      <Suspense fallback={<div>Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* ... other routes */}
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
```

---

## Step 6 — Build the onboarding wizard

A simple multi-step form that collects the minimum info needed to personalise the seed data. On the final step, call `onComplete(profile)` which triggers `seedDemoData(profile)` and flips `ready` to true.

Structure:
- **Step 1 — Stats:** Name, age, weight, height, activity level
- **Step 2 — Goal:** e.g. Recomp / Cut / Bulk / Maintain
- **Step 3 — Level:** Beginner / Intermediate / Advanced
- **Step 4 — Ready:** Summary card + "Launch" CTA

Key UX details:
- Disable the Continue button until required fields are filled
- Show a progress bar across the top (one segment per step)
- On the Ready step, show a summary of what was entered

---

## Step 7 — Configure Vercel deployment

Add a `vercel.json` at the **repo root** (not inside the app subdirectory):

```json
{
  "buildCommand": "cd fittrack && npm install && npm run build",
  "outputDirectory": "fittrack/dist"
}
```

Replace `fittrack` with whatever your app subdirectory is called. If your app is at the repo root, you don't need this file at all.

**Do NOT use:**
- `"root"` — not a valid vercel.json field
- `"rootDirectory"` — project setting only (set it in Vercel UI, not vercel.json)

---

## Step 8 — Deploy

```bash
# Build to verify no errors
cd fittrack && npm run build

# Push branch (Vercel auto-deploys preview)
git add .
git commit -m "Demo mode: mock auth, localStorage seed, onboarding wizard"
git push

# Deploy to GitHub Pages (optional, if you also want gh-pages)
npx gh-pages -d dist
```

For GitHub Pages, set `base` in `vite.config.js`:
```js
export default defineConfig({
  base: "/your-repo-name/",  // matches github.io/your-repo-name/
  plugins: [react()],
});
```

---

## iframe embed URLs

Once deployed, use these URL formats in your portfolio CMS:

```
# Default — shows onboarding wizard first
https://<your-vercel-url>/

# Skip onboarding — land directly on home
https://<your-vercel-url>/?seed=1

# Skip onboarding — land on a specific page
https://<your-vercel-url>/?seed=1#/workout
https://<your-vercel-url>/?seed=1#/diet
https://<your-vercel-url>/?seed=1#/coach
https://<your-vercel-url>/?seed=1#/profile
```

Embed in your site:
```html
<iframe
  src="https://<your-vercel-url>/?seed=1"
  width="390"
  height="844"
  style="border: none; border-radius: 40px;"
></iframe>
```

---

## Reset behaviour

- Clicking **Reset** in the demo banner clears all `demo_*` localStorage keys and reloads
- This sends the visitor back to the onboarding wizard
- The `?seed=1` param re-seeds automatically on reload if it's in the URL

---

## Checklist for new projects

- [ ] Create `demo/public-embed` branch from `main`
- [ ] Stub auth context with mock user
- [ ] Stub SDK file (Firebase/Supabase/etc.) with null exports
- [ ] Replace storage hook with pure localStorage + `demo_` prefix
- [ ] Write `seedDemoData(profile)` with realistic backfilled data
- [ ] Add `?seed=1` module-level check to App.jsx
- [ ] Build onboarding wizard (4 steps max)
- [ ] Add DemoBanner with Reset button
- [ ] Add `vercel.json` if app is in a subdirectory
- [ ] Build, commit, push
- [ ] Verify both fresh-visit (wizard) and `?seed=1` (direct) flows work
