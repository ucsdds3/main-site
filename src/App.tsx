import { useThemeHandler } from "./Hooks/useThemeHandler";
import { useSiteHandler } from "./Hooks/useSiteHandler";
import { useAuth } from "./Hooks/Auth/useAuth";

import Consulting from "./Pages/Consulting/Consulting";
import Members from "./Pages/Members/Members";
import Main from "./Pages/Main/Main";

const App = () => {
  useAuth();
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
