import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home";
import RoutineListPage from "./pages/RoutineList";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="routines" element={<RoutineListPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
