import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { WorkflowEditorPage } from './pages/WorkflowEditorPage';
import { NodeLibraryPage } from './pages/NodeLibraryPage';
import { RunsPage } from './pages/RunsPage';
import { LogsPage } from './pages/LogsPage';
import { AISettingsPage } from './pages/AISettingsPage';
import { PlaceholderSettingsPage } from './pages/PlaceholderSettingsPage';
import { SystemSettingsPage } from './pages/SystemSettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="workflow" element={<WorkflowEditorPage />} />
          <Route path="workflow/:projectId" element={<WorkflowEditorPage />} />
          <Route path="nodes" element={<NodeLibraryPage />} />
          <Route path="runs" element={<RunsPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="ai" element={<AISettingsPage />} />
          <Route path="mcp" element={<PlaceholderSettingsPage title="MCP 配置" />} />
          <Route path="proxy" element={<PlaceholderSettingsPage title="代理配置" />} />
          <Route path="git" element={<PlaceholderSettingsPage title="Git 配置" />} />
          <Route path="servers" element={<PlaceholderSettingsPage title="服务器配置" />} />
          <Route path="settings" element={<SystemSettingsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
