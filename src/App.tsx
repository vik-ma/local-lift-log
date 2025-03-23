import { Route, Routes, useNavigate } from "react-router-dom";
import { HeroUIProvider } from "@heroui/react";
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
  BodyMeasurementsPage,
  UserWeightListPage,
  PresetsPage,
  ExerciseHistoryPage,
  MeasurementListPage,
  TestPage,
  UserMeasurementListPage,
  MultisetsPage,
  TimePeriodListPage,
  DietLogIndexPage,
  DietLogListPage,
  AnalyticsPage,
} from "./pages";
import { SiteHeader } from "./components";
import { Toaster } from "react-hot-toast";

function App() {
  const navigate = useNavigate();

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <HeroUIProvider navigate={navigate}>
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
                <Route path=":id">
                  <Route index element={<ExerciseDetailsPage />} />
                  <Route path="history" element={<ExerciseHistoryPage />} />
                </Route>
              </Route>
              <Route path="/multisets" element={<MultisetsPage />} />
              <Route path="/workout-templates">
                <Route index element={<WorkoutTemplateListPage />} />
                <Route path=":id" element={<WorkoutTemplateDetailsPage />} />
              </Route>
              <Route path="/workouts">
                <Route index element={<WorkoutIndexPage />} />
                <Route path="list" element={<WorkoutListPage />} />
                <Route path=":id" element={<WorkoutDetailsPage />} />
              </Route>
              <Route path="/analytics">
                <Route index element={<AnalyticsPage />} />
              </Route>
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/measurements">
                <Route index element={<BodyMeasurementsPage />} />
                <Route
                  path="measurement-list"
                  element={<MeasurementListPage />}
                />
                <Route
                  path="body-weight-list"
                  element={<UserWeightListPage />}
                />
                <Route
                  path="user-measurement-list"
                  element={<UserMeasurementListPage />}
                />
              </Route>
              <Route path="/presets" element={<PresetsPage />} />
              <Route path="/time-periods" element={<TimePeriodListPage />} />
              <Route path="/diet-log">
                <Route index element={<DietLogIndexPage />} />
                <Route path="list" element={<DietLogListPage />} />
              </Route>
              <Route path="/test" element={<TestPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </HeroUIProvider>
    </>
  );
}

export default App;
