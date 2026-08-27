import { BrowserRouter, Route, Routes } from "react-router-dom";

import { LandingPage } from "@/pages/LandingPage";
import { NewRecoveryPage } from "@/pages/NewRecoveryPage";
import { ResumeCasePage } from "@/pages/ResumeCasePage";
import { RecoveryWorkspacePage } from "@/pages/RecoveryWorkspacePage";
import { RecoveriesPage } from "@/pages/RecoveriesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/recoveries" element={<RecoveriesPage />} />
        <Route path="/new" element={<NewRecoveryPage />} />
        <Route path="/resume" element={<ResumeCasePage />} />
        <Route path="/cases/:caseId" element={<RecoveryWorkspacePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;