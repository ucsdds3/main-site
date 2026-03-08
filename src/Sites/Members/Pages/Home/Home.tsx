import Page from "src/Shared/Page/Page";
import Events from "./Sections/Events";
import Header from "./Sections/Header";
import Leaderboard from "./Sections/Leaderboard";

const Home = () => {
  return (
    <Page>
      <Header />
      <Events />
      <Leaderboard />
    </Page>
  );
};

export default Home;
