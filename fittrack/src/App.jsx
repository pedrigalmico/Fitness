import { useState, lazy, Suspense } from "react";
import { HashRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { Home as HomeIcon, Dumbbell, UtensilsCrossed, Brain, UserCircle, RotateCcw } from "lucide-react";
import { AuthProvider } from "./AuthContext";
import { seedDemoData } from "./seedDemoData";

const Home       = lazy(() => import("./pages/Home"));
const Workout    = lazy(() => import("./pages/Workout"));
const Diet       = lazy(() => import("./pages/Diet"));
const Coach      = lazy(() => import("./pages/Coach"));
const Profile    = lazy(() => import("./pages/Profile"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

function PageShimmer() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span
        className="text-[11px] font-bold tracking-widest uppercase animate-pulse"
        style={{ color: "#FF6B35" }}
      >
        Loading…
      </span>
    </div>
  );
}

const DEMO_PREFIX = "demo_";

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
    <div
      className="flex items-center justify-between px-4 py-2 text-xs font-bold"
      style={{ background: "#FF6B35", color: "#fff" }}
    >
      <span>DEMO MODE — data is local only</span>
      <button
        onClick={resetDemo}
        className="flex items-center gap-1 px-2 py-1 rounded"
        style={{ background: "rgba(0,0,0,0.2)" }}
      >
        <RotateCcw size={12} />
        Reset
      </button>
    </div>
  );
}

function AppShell() {
  const [ready, setReady] = useState(hasCompletedOnboarding);

  function handleOnboardingComplete(profile) {
    seedDemoData(profile);
    setReady(true);
  }

  if (!ready) {
    return (
      <Suspense fallback={<PageShimmer />}>
        <Onboarding onComplete={handleOnboardingComplete} />
      </Suspense>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen pb-20" style={{ background: "#0A0A12" }}>
        <DemoBanner />
        <div className="max-w-[480px] mx-auto px-4 pt-6">
          <Suspense fallback={<PageShimmer />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/workout" element={<Workout />} />
              <Route path="/diet" element={<Diet />} />
              <Route path="/coach" element={<Coach />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </div>

        <nav
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
          style={{ background: "#0F0F1E", borderTop: "1px solid #1A1A2E" }}
        >
          <div className="flex max-w-[480px] w-full">
            {[
              { to: "/", icon: <HomeIcon size={20} />, label: "Home" },
              { to: "/workout", icon: <Dumbbell size={20} />, label: "Workout" },
              { to: "/diet", icon: <UtensilsCrossed size={20} />, label: "Diet" },
              { to: "/coach", icon: <Brain size={20} />, label: "Coach" },
              { to: "/profile", icon: <UserCircle size={20} />, label: "Profile" },
            ].map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === "/"}
                className="flex-1 flex flex-col items-center py-3 gap-0.5 no-underline"
                style={({ isActive }) => ({
                  color: isActive ? "#FF6B35" : "#555",
                })}
              >
                {tab.icon}
                <span className="text-[10px] font-bold">{tab.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
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
