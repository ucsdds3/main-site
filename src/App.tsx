import { useThemeHandler } from "./Hooks/useThemeHandler";
import { useSiteHandler } from "./Hooks/useSiteHandler";
import { useAuth } from "./Hooks/useAuth";

import Members from "./Sites/Members/Members";
import Main from "./Sites/Main/Main";

const App = () => {
  useAuth();
  useThemeHandler();
  const { subdomain } = useSiteHandler();

  const sites = {
    members: <Members />,
    main: <Main />,
  };

  return sites[subdomain as keyof typeof sites];
};

export default App;
