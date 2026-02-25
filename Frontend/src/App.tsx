import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScribllyHome from "@/pages/landing";
import GamePage from "@/pages/game";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScribllyHome />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
