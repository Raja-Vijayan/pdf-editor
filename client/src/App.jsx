import { useEffect } from 'react';
import './App.css';
import ApplicationRoutes from './Routers/routes';

function App() {

  useEffect(() => {
    window.addEventListener('beforeunload', function () {
      sessionStorage.removeItem('currentPosition');
      this.sessionStorage.removeItem('currentPreview');
    })
  }, []);

  return <ApplicationRoutes />
}

export default App;

