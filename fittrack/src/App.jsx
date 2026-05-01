import { useContext } from "react";
import { HashRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { Home as HomeIcon, Dumbbell, UtensilsCrossed, Brain, UserCircle, LayoutGrid } from "lucide-react";
import { AuthContext, AuthProvider } from "./AuthContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Workout from "./pages/Workout";
import Diet from "./pages/Diet";
import Coach from "./pages/Coach";
import Profile from "./pages/Profile";
import Programs from "./pages/Programs";

function AppShell() {
  const { user } = useContext(AuthContext);

  if (!user) return <Login />;

  return (
    <HashRouter>
      <div className="min-h-screen pb-20" style={{ background: "#0A0A12" }}>
        <div className="max-w-[480px] mx-auto px-4 pt-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/diet" element={<Diet />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/programs" element={<Programs />} />
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
