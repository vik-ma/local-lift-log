import { Route, Routes } from "react-router-dom";
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
  LoggingIndexPage,
  PresetsPage,
  MeasurementListPage,
  TestPage,
  MultisetsPage,
  TimePeriodListPage,
  DietLogListPage,
  AnalyticsPage,
  BodyMeasurementsListPage,
} from "./pages";
import { SiteHeader } from "./components";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 1200,
          style: {
            maxWidth: 350,
            overflow: "hidden",
          },
        }}
      />
      <SiteHeader />
      <main className="flex justify-center pt-2">
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
            <Route path="/logging">
              <Route index element={<LoggingIndexPage />} />
              <Route
                path="body-measurement-list"
                element={<BodyMeasurementsListPage />}
              />
              <Route
                path="measurement-list"
                element={<MeasurementListPage />}
              />
              <Route path="diet-log-list" element={<DietLogListPage />} />
            </Route>
            <Route path="/presets" element={<PresetsPage />} />
            <Route path="/time-periods" element={<TimePeriodListPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
    </>
  );
}

export default App;
