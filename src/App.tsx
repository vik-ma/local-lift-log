import { Route, Routes, useNavigate } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";
import {
  HomePage,
  RoutineListPage,
  RoutineDetailsPage,
  NotFound,
  ExerciseListPage,
  ExerciseDetailsPage,
  SettingsPage,
  WorkoutTemplateListPage,
  WorkoutTemplateDetailsPage,
  WorkoutIndexPage,
  WorkoutListPage,
  WorkoutDetailsPage,
  UserMeasurementsPage,
  UserWeightListPage,
  EquipmentWeightsPage,
} from "./pages";
import { SiteHeader } from "./components";

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
              <Route path="/exercises">
                <Route index element={<ExerciseListPage />} />
                <Route path=":id" element={<ExerciseDetailsPage />} />
              </Route>
              <Route path="/workout-templates">
                <Route index element={<WorkoutTemplateListPage />} />
                <Route path=":id" element={<WorkoutTemplateDetailsPage />} />
              </Route>
              <Route path="/workouts">
                <Route index element={<WorkoutIndexPage />} />
                <Route path="list" element={<WorkoutListPage />} />
                <Route path=":id" element={<WorkoutDetailsPage />} />
              </Route>
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/measurements">
                <Route index element={<UserMeasurementsPage />} />
                <Route
                  path="body-weight-list"
                  element={<UserWeightListPage />}
                />
              </Route>
              <Route path="/equipment-weights" element={<EquipmentWeightsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </NextUIProvider>
    </>
  );
}

export default App;
