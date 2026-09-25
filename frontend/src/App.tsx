import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { TaskProvider } from './context/TaskContext';
import { SystemTopbar } from './components/SystemTopbar';
import { SidebarNav } from './components/SidebarNav';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ModelRouterPage } from './pages/ModelRouterPage';
import { AgentReasoningPage } from './pages/AgentReasoningPage';
import { ToolRegistryPage } from './pages/ToolRegistryPage';
import { KnowledgeSearchPage } from './pages/KnowledgeSearchPage';
import { DeliverablesPage } from './pages/DeliverablesPage';
import { AirGapMonitorPage } from './pages/AirGapMonitorPage';
import { ModelOperationsPage } from './pages/ModelOperationsPage';
import { ApprovalGatePage } from './pages/ApprovalGatePage';

export const App: React.FC = () => {
  return (
    <TaskProvider>
      <BrowserRouter>
        <div className="app-container">
          <SystemTopbar />
          <div className="workbench-shell">
            <SidebarNav />
            <main className="main-viewport">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/assistant" element={<AIAssistantPage />} />
                <Route path="/router" element={<ModelRouterPage />} />
                <Route path="/reasoning" element={<AgentReasoningPage />} />
                <Route path="/tools" element={<ToolRegistryPage />} />
                <Route path="/knowledge" element={<KnowledgeSearchPage />} />
                <Route path="/deliverables" element={<DeliverablesPage />} />
                <Route path="/air-gap" element={<AirGapMonitorPage />} />
                <Route path="/operations" element={<ModelOperationsPage />} />
                <Route path="/approvals" element={<ApprovalGatePage />} />
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