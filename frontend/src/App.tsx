import { useState } from 'react';
import AppShell, { type View } from './layout/AppShell';
import UploadWizard from './pages/UploadWizard/UploadWizard';
import Dashboard from './pages/Dashboard/Dashboard';

function App() {
  const [view, setView] = useState<View>('upload');

  return (
    <AppShell view={view} onChangeView={setView}>
      {view === 'upload' ? <UploadWizard /> : <Dashboard />}
    </AppShell>
  );
}

export default App;
