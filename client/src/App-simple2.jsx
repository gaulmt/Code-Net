import { useState } from 'react';
import Landing from './components/Landing';
import './App.css';

function App() {
  const [showLanding, setShowLanding] = useState(true);

  const handleCreateProject = (username, projectId) => {
    console.log('Create project:', username, projectId);
    setShowLanding(false);
  };

  const handleJoinProject = (username, projectId) => {
    console.log('Join project:', username, projectId);
    setShowLanding(false);
  };

  if (showLanding) {
    return <Landing onCreateProject={handleCreateProject} onJoinProject={handleJoinProject} />;
  }

  return (
    <div style={{ padding: '2rem', background: '#1e1e1e', minHeight: '100vh', color: 'white' }}>
      <h1>Code Net</h1>
      <p>Main app will load here...</p>
    </div>
  );
}

export default App;
