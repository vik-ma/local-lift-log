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
