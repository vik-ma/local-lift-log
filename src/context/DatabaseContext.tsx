import { createContext, useState, useEffect, ReactNode } from "react";
import Database from "tauri-plugin-sql-api";

type DatabaseContextProps = {
  db: Database | null;
  isDatabaseLoaded: boolean;
};

export const DatabaseContext = createContext<DatabaseContextProps>({
  db: null,
  isDatabaseLoaded: false,
});

export const DatabaseContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [db, setDb] = useState<Database | null>(null);
  const [isDatabaseLoaded, setIsDatabaseLoaded] = useState<boolean>(false);

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

  return (
    <DatabaseContext.Provider
      value={{
        db,
        isDatabaseLoaded,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};
