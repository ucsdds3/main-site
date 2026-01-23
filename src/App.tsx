import { useThemeHandler } from "./Hooks/useThemeHandler";
import { useSiteHandler } from "./Hooks/useSiteHandler";
import { useAuth } from "./Hooks/useAuth";

import Consulting from "./Sites/Consulting/Consulting";
import Members from "./Sites/Members/Members";
import Main from "./Sites/Main/Main";

const App = () => {
  useAuth();
  useThemeHandler();
  const { subdomain } = useSiteHandler();

  const sites = {
    consulting: <Consulting />,
    members: <Members />,
    main: <Main />,
  };

  return sites[subdomain as keyof typeof sites];
};

export default App;
