import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { LandingPage } from "@/pages/LandingPage";
import { NewRecoveryPage } from "@/pages/NewRecoveryPage";
import { ResumeCasePage } from "@/pages/ResumeCasePage";
import { RecoveryWorkspacePage } from "@/pages/RecoveryWorkspacePage";
import { RecoveriesPage } from "@/pages/RecoveriesPage";
import { useAuth } from "@/context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/recoveries" element={<RecoveriesPage />} />
        <Route path="/new" element={<NewRecoveryPage />} />
        <Route path="/resume" element={<ResumeCasePage />} />
        <Route path="/cases/:caseId" element={<RecoveryWorkspacePage />} />
      </Routes>
    </BrowserRouter>
  );
}

function RootRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafafa]">
        <p className="text-sm font-light text-zinc-500">
          Checking sign-in...
        </p>
      </main>
    );
  }

  if (user) {
    return <Navigate to="/recoveries" replace />;
  }

  return <LandingPage />;
}

export default App;
