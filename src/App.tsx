import { useThemeHandler } from "./Hooks/useThemeHandler";
import { useSiteHandler } from "./Hooks/useSiteHandler";
import Main from "./Sites/Main";
import Consulting from "./Sites/Consulting";

const App = () => {
  useThemeHandler();
  const isConsulting = useSiteHandler();
  
  return isConsulting ? <Consulting /> : <Main />;
};

export default App;
