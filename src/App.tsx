import { useThemeHandler } from "./Hooks/useThemeHandler";
import { useSiteHandler } from "./Hooks/useSiteHandler";
import Consulting from "./Pages/Consulting/Consulting";
import Members from "./Pages/Members/Members";
import Main from "./Pages/Main/Main";

const App = () => {
  useThemeHandler();
  const { subdomain } = useSiteHandler();

  return subdomain == "consulting" ? (
    <Consulting />
  ) : subdomain == "members" ? (
    <Members />
  ) : (
    <Main />
  );
};

export default App;
