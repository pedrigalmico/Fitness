import { useContext, useCallback } from "react";
import { HashRouter, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { Home as HomeIcon, Dumbbell, UtensilsCrossed } from "lucide-react";
import { AuthContext, AuthProvider } from "./AuthContext";
import { useStorage } from "./hooks/useStorage";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Workout from "./pages/Workout";
import Diet from "./pages/Diet";
import TemplateBrowser from "./pages/TemplateBrowser";
import Settings from "./pages/Settings";

const DEMO_MODE = new URLSearchParams(window.location.search).has("seed");

// Runs synchronously before React mounts so useStorage reads seeded values on first render
if (DEMO_MODE) {
  const today = new Date();
  const d = (n) => { const dt = new Date(today); dt.setDate(today.getDate() - n); return dt.toISOString().split("T")[0]; };
  localStorage.setItem("ft_onboarded", "true");
  localStorage.setItem("ft_stats", JSON.stringify({ name: "Demo", age: 27, weight: 75, height: 178 }));
  localStorage.setItem("ft_equipment", JSON.stringify(["barbell", "dumbbell", "bodyweight"]));
  localStorage.setItem("ft_template", '"recomp"');
  localStorage.setItem("ft_template_start", JSON.stringify(d(28)));
  localStorage.setItem("ft_logs", JSON.stringify({
    [d(1)]: { day: "A", completed: true, ts: Date.now() },
    [d(3)]: { day: "B", completed: true, ts: Date.now() },
    [d(5)]: { day: "C", completed: true, ts: Date.now() },
    [d(7)]: { day: "D", completed: true, ts: Date.now() },
    [d(8)]: { day: "A", completed: true, ts: Date.now() },
    [d(10)]: { day: "B", completed: true, ts: Date.now() },
  }));
  localStorage.setItem("ft_weight", JSON.stringify([
    { date: d(14), kg: 76.2 }, { date: d(11), kg: 75.8 },
    { date: d(7), kg: 75.5 },  { date: d(4), kg: 75.1 },
    { date: d(1), kg: 74.9 },
  ]));
}

function seedDemoData() {
  const today = new Date();
  const d = (offset) => {
    const dt = new Date(today);
    dt.setDate(today.getDate() - offset);
    return dt.toISOString().split("T")[0];
  };
  if (!localStorage.getItem("ft_onboarded")) {
    localStorage.setItem("ft_onboarded", "true");
    localStorage.setItem("ft_stats", JSON.stringify({ name: "Demo", age: 27, weight: 75, height: 178 }));
    localStorage.setItem("ft_equipment", JSON.stringify(["barbell", "dumbbell", "bodyweight"]));
    localStorage.setItem("ft_template", '"recomp"');
    localStorage.setItem("ft_template_start", JSON.stringify(d(28)));
    localStorage.setItem("ft_logs", JSON.stringify({
      [d(1)]: { day: "A", completed: true, ts: Date.now() },
      [d(3)]: { day: "B", completed: true, ts: Date.now() },
      [d(5)]: { day: "C", completed: true, ts: Date.now() },
      [d(7)]: { day: "D", completed: true, ts: Date.now() },
      [d(8)]: { day: "A", completed: true, ts: Date.now() },
      [d(10)]: { day: "B", completed: true, ts: Date.now() },
    }));
    localStorage.setItem("ft_weight", JSON.stringify([
      { date: d(14), kg: 76.2 }, { date: d(11), kg: 75.8 },
      { date: d(7), kg: 75.5 },  { date: d(4), kg: 75.1 },
      { date: d(1), kg: 74.9 },
    ]));
  }
}

function MainApp() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-20" style={{ background: "#0A0A12" }}>
      <div className="w-full max-w-[480px] lg:max-w-[520px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/programs" element={<TemplateBrowser onBack={() => navigate(-1)} />} />
          <Route path="/settings" element={<Settings onBack={() => navigate(-1)} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
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
  );
}

function AppShell() {
  const { user } = useContext(AuthContext);
  const [onboarded, setOnboarded] = useStorage("ft_onboarded", false);
  const [, setStats] = useStorage("ft_stats", {});
  const [, setEquipment] = useStorage("ft_equipment", []);
  const [, setTemplate] = useStorage("ft_template", "recomp");
  const [, setTemplateStart] = useStorage("ft_template_start", null);

  const handleOnboardingComplete = useCallback(({ stats, equipment, templateId }) => {
    setStats(stats);
    setEquipment(equipment);
    setTemplate(templateId);
    setTemplateStart(new Date().toISOString().split("T")[0]);
    setOnboarded(true);
  }, [setStats, setEquipment, setTemplate, setTemplateStart, setOnboarded]);

  if (DEMO_MODE || (user && onboarded)) {
    return (
      <HashRouter>
        <MainApp />
      </HashRouter>
    );
  }

  if (!user) return <Login />;
  return <Onboarding onComplete={handleOnboardingComplete} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
