import { Route, Routes, useNavigate } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";
import { HomePage, RoutineListPage } from "./pages";
import SiteHeader from "./components/SiteHeader";

function App() {
  const navigate = useNavigate();

  return (
    <>
      <NextUIProvider navigate={navigate}>
        <SiteHeader />
        <main className="flex justify-center p-5">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/routines" element={<RoutineListPage />} />
          </Routes>
        </main>
      </NextUIProvider>
    </>
  );
}

export default App;
