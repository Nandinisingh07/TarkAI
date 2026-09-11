import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { TaskProvider } from './context/TaskContext';
import { SystemTopbar } from './components/SystemTopbar';
import { DefenseNav } from './components/DefenseNav';
import { Footer } from './components/Footer';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { R1AirGappedPage } from './pages/R1AirGappedPage';
import { R2RouterPage } from './pages/R2RouterPage';
import { R3ReActPage } from './pages/R3ReActPage';
import { R4ToolsPage } from './pages/R4ToolsPage';
import { R5DeliverablesPage } from './pages/R5DeliverablesPage';
import { R6RAGPage } from './pages/R6RAGPage';
import { R7NetworkProofPage } from './pages/R7NetworkProofPage';

export const App: React.FC = () => {
  return (
    <TaskProvider>
      <BrowserRouter>
        <div className="app-container">
          {/* Top Persistent Identity Strip */}
          <SystemTopbar />

          {/* Workbench Body Layout */}
          <div className="workbench-shell">
            {/* Left-Fixed Vertical Rail Navigation */}
            <DefenseNav />

            {/* Main Console Viewport */}
            <main className="main-viewport">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/requirements/r1" element={<R1AirGappedPage />} />
                <Route path="/requirements/r2" element={<R2RouterPage />} />
                <Route path="/requirements/r3" element={<R3ReActPage />} />
                <Route path="/requirements/r4" element={<R4ToolsPage />} />
                <Route path="/requirements/r5" element={<R5DeliverablesPage />} />
                <Route path="/requirements/r6" element={<R6RAGPage />} />
                <Route path="/requirements/r7" element={<R7NetworkProofPage />} />
              </Routes>

              <Footer />
            </main>
          </div>
        </div>
      </BrowserRouter>
    </TaskProvider>
  );
};

export default App;
