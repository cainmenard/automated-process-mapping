import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { TemplatesPage } from './pages/TemplatesPage.js';
import { TemplateFormPage } from './pages/TemplateFormPage.js';
import { EditorPage } from './pages/EditorPage.js';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/templates/:templateId" element={<TemplateFormPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/editor/:processMapId" element={<EditorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
