import { Route, Routes, useNavigate } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";
import {
  HomePage,
  RoutineListPage,
  RoutineDetailsPage,
  NotFound,
  SetListPage,
  ExerciseListPage,
  ExerciseDetailsPage,
  SettingsPage,
  WorkoutTemplateListPage,
  WorkoutTemplateDetailsPage,
} from "./pages";
import SiteHeader from "./components/SiteHeader";

function App() {
  const navigate = useNavigate();

  return (
    <>
      <NextUIProvider navigate={navigate}>
        <SiteHeader />
        <main className="flex justify-center p-5">
          <div className="w-[400px]">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/routines">
                <Route index element={<RoutineListPage />} />
                <Route path=":id" element={<RoutineDetailsPage />} />
              </Route>
              <Route path="/sets" element={<SetListPage />} />
              <Route path="/exercises">
                <Route index element={<ExerciseListPage />} />
                <Route path=":id" element={<ExerciseDetailsPage />} />
              </Route>
              <Route path="/workout-templates">
                <Route index element={<WorkoutTemplateListPage />} />
                <Route path=":id" element={<WorkoutTemplateDetailsPage />} />
              </Route>
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </NextUIProvider>
    </>
  );
}

export default App;
