import { createContext, useState, useEffect, ReactNode } from "react";
import Database from "tauri-plugin-sql-api";
import { UserSettings } from "../typings";

type DatabaseContextProps = {
  db: Database | null;
  isDatabaseLoaded: boolean;
  userSettings: UserSettings | null;
};

export const DatabaseContext = createContext<DatabaseContextProps>({
  db: null,
  isDatabaseLoaded: false,
  userSettings: null,
});

export const DatabaseContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [db, setDb] = useState<Database | null>(null);
  const [isDatabaseLoaded, setIsDatabaseLoaded] = useState<boolean>(false);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    const loadDatabase = async () => {
      const databaseUrl: string = import.meta.env.VITE_DATABASE_URL_FULL;

      try {
        const db = await Database.load(databaseUrl);
        setDb(db);
        setIsDatabaseLoaded(true);
      } catch (error) {
        console.log(error);
        setIsDatabaseLoaded(false);
      }
    };

    loadDatabase();
  }, []);

  useEffect(() => {
    if (!isDatabaseLoaded) return;
  }, [isDatabaseLoaded]);

  return (
    <DatabaseContext.Provider
      value={{
        db,
        isDatabaseLoaded,
        userSettings,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};
