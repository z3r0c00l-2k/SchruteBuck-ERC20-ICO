import { AppContextProvider } from './contexts/AppContext';
import HomePage from './pages/HomePage';

const App = () => (
  <AppContextProvider>
    <HomePage />
  </AppContextProvider>
);

export default App;
