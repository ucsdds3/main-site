import { useThemeHandler } from "./Hooks/useThemeHandler";
import { useSiteHandler } from "./Hooks/useSiteHandler";
import { useAuth } from "./Hooks/Members/Auth/useAuth";

import Consulting from "./Pages/Consulting/Consulting";
import Members from "./Pages/Members/Members";
import Main from "./Pages/Main/Main";

const App = () => {
  useAuth();
  useThemeHandler();
  const { subdomain } = useSiteHandler();
  
  const sites = {
    consulting: <Consulting />,
    members: <Members />,
    main: <Main />,
  }

  return sites[subdomain as keyof typeof sites];
};

export default App;
