import { useEffect } from "react";
import { Checkbox, Button } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { UserSettings } from "../typings";
import { addUserSettings } from "../state/user_settings/userSettingsSlice";

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userSettings = useSelector(
    (state: RootState) => state.userSettings.userSettings
  );

  useEffect(() => {
    const getUserSettings = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result: UserSettings[] = await db.select(
          "SELECT * FROM user_settings LIMIT 1"
        );

        if (result.length === 1) {
          const userSettings: UserSettings = result[0];
          dispatch(addUserSettings(userSettings));
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (userSettings === undefined) getUserSettings();
  }, [dispatch, userSettings]);

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
    return;
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
          Test
        </Button>
        <p>Settings Id: {userSettings?.id}</p>
      </div>
    </div>
  );
}
