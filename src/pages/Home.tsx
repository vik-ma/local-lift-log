import { useEffect, useRef } from "react";
import { Checkbox, Button } from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../state/store";
import { UserSettings } from "../typings";
import {
  addUserSettings,
  updateUserSettingsAsync,
} from "../state/user_settings/userSettingsSlice";

const createDefaultUserSettings = async () => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const show_timestamp_on_completed_set: boolean = true;
    const active_routine_id: number = 0;

    const result = await db.execute(
      "INSERT into user_settings (show_timestamp_on_completed_set, active_routine_id) VALUES ($1, $2)",
      [show_timestamp_on_completed_set, active_routine_id]
    );

    const id: number = result.lastInsertId;

    const defaultUserSettings: UserSettings = {
      id: id,
      show_timestamp_on_completed_set: show_timestamp_on_completed_set,
      active_routine_id: active_routine_id,
    };

    return defaultUserSettings;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const userSettings = useSelector(
    (state: RootState) => state.userSettings.userSettings
  );

  const initialized = useRef(false);

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
        } else {
          // TODO: REMOVE LATER?
          // Stop useEffect running twice in dev
          if (!initialized.current) {
            initialized.current = true;
          } else return;

          const defaultUserSettings: UserSettings | null =
            await createDefaultUserSettings();

          if (defaultUserSettings !== null)
            dispatch(addUserSettings(defaultUserSettings));
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
    const updatedSettings: UserSettings = {
      ...userSettings!,
      active_routine_id: 33,
    };

    dispatch(updateUserSettingsAsync(updatedSettings));
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
