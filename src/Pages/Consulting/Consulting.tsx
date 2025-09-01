import { Route, Routes } from "react-router"
import Home from "./Home/Home"

const Consulting = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
    </Routes>
  )
}

export default Consulting
