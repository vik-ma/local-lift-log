import { useEffect, useRef, useState } from "react";
import { Checkbox, Button } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import { useNavigate } from "react-router-dom";
import { UserSettings } from "../typings";
import { UpdateUserSettings } from "../helpers/UserSettings/UpdateUserSettings";
import { GetUserSettings } from "../helpers/UserSettings/GetUserSettings";
import { CreateDefaultUserSettings } from "../helpers/UserSettings/CreateDefaultUserSettings";
import { CreateDefaultExerciseList } from "../helpers/Exercises/CreateDefaultExerciseList";

export default function HomePage() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const navigate = useNavigate();

  const initialized = useRef(false);

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const settings: UserSettings | undefined = await GetUserSettings();
        if (settings !== undefined) {
          // If UserSettings exists
          setUserSettings(settings);
        } else {
          // If no UserSettings exists

          // TODO: REMOVE LATER?
          // Stop useEffect running twice in dev
          if (!initialized.current) {
            initialized.current = true;
          } else return;

          const defaultUserSettings: UserSettings | undefined =
            await CreateDefaultUserSettings();

          // Create Default User Settings
          if (defaultUserSettings !== undefined) {
            await UpdateUserSettings(defaultUserSettings);
            setUserSettings(defaultUserSettings);
          }

          // Create Default Exercise List
          await CreateDefaultExerciseList();
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadUserSettings();
  }, []);

  const addRoutine = async () => {
    const db = await Database.load(import.meta.env.VITE_DB);

    try {
      const result = await db.execute(
        "INSERT into routines (name, is_schedule_weekly, num_days_in_schedule) VALUES ($1, $2, $3)",
        ["test", true, 7]
      );

      console.log("Success:", result);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const testFunction = async () => {
    const updatedSettings: UserSettings = {
      ...userSettings!,
      active_routine_id: 33,
    };

    await UpdateUserSettings(updatedSettings);
    setUserSettings(updatedSettings);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
        <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
          Home
        </h1>
      </div>
      <div className="flex flex-col justify-center items-center gap-2">
        <Checkbox defaultSelected>Option</Checkbox>
        <Button
          className="text-lg"
          size="lg"
          color="primary"
          onPress={addRoutine}
        >
          Add Routine
        </Button>
        <Button
          className="text-lg"
          size="lg"
          color="primary"
          onPress={() => navigate(`/asd`)}
        >
          Test Not Found
        </Button>
        <Button
          className="text-lg"
          size="lg"
          color="primary"
          onPress={testFunction}
        >
          Update Settings
        </Button>
        <p>Settings Id: {userSettings?.id}</p>
        <p>Active Routine Id: {userSettings?.active_routine_id}</p>
      </div>
    </div>
  );
}
