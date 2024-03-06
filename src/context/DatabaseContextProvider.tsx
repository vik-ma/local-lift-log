import { useState, useEffect, ReactNode } from "react";
import Database from "tauri-plugin-sql-api";
import { UserSettings } from "../typings";
import { DatabaseContext } from "./DatabaseContext";

export const DatabaseContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [db, setDb] = useState<Database | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    const loadDatabase = async () => {
      const databaseUrl: string = import.meta.env.VITE_DATABASE_URL_FULL;

      try {
        const db = await Database.load(databaseUrl);
        setDb(db);
      } catch (error) {
        console.log(error);
      }
    };

    loadDatabase();
  }, []);

  useEffect(() => {
    if (db === null) return;

    const getUserSettings = async () => {
      try {
        const result: UserSettings[] = await db.select(
          "SELECT * FROM user_settings LIMIT 1"
        );

        if (result.length !== 1) {
          await createDefaultUserSettings();
        }
      } catch (error) {
        console.log(error);
      }
    };

    const createDefaultUserSettings = async () => {
      const show_timestamp_on_completed_set: boolean = false;
      const active_routine_id: number = 0;

      try {
        const result = await db.execute(
          "INSERT into user_settings (show_timestamp_on_completed_set, active_routine_id) VALUES ($1, $2)",
          [show_timestamp_on_completed_set, active_routine_id]
        );

        const id: number = result.lastInsertId;

        const userSettings: UserSettings = {
          id: id,
          show_timestamp_on_completed_set: show_timestamp_on_completed_set,
          active_routine_id: active_routine_id,
        };

        setUserSettings(userSettings);
      } catch (error) {
        console.log(error);
      }
    };

    getUserSettings();
  }, [db]);

  return (
    <DatabaseContext.Provider
      value={{
        db,
        userSettings,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};
