import faq from "../../Assets/Data/FAQ.json"
import FAQ from "../../Components/FAQ"
import Page from "../Page/Page"

const JoinUs = () => {
  return (
    <Page>
      <FAQ faq={faq.joinUs} />
    </Page>
  )
}

export default JoinUs