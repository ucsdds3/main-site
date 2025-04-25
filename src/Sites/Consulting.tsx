import { Route, Routes } from "react-router"
import ConsultingPage from "../Pages/Consulting/ConsultingPage"

const Consulting = () => {
  return (
    <Routes>
      <Route index element={<ConsultingPage />} />
    </Routes>
  )
}

export default Consulting
