import { createContext, useState, useEffect, ReactNode } from "react";
import Database from "tauri-plugin-sql-api";

type DatabaseContextProps = {
  db: Database | null;
  isDatabaseLoaded: boolean;
  isLoading: boolean;
};

export const DatabaseContext = createContext<DatabaseContextProps>({
  db: null,
  isDatabaseLoaded: false,
  isLoading: false,
});

export const DatabaseContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [db, setDb] = useState<Database | null>(null);
  const [isDatabaseLoaded, setIsDatabaseLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadDatabase = async () => {
      const databaseUrl: string = import.meta.env.VITE_DATABASE_URL_FULL;

      setIsLoading(true);

      try {
        const db = await Database.load(databaseUrl);
        setDb(db);
        setIsDatabaseLoaded(true);
      } catch (error) {
        setIsDatabaseLoaded(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadDatabase();
  }, []);

  return (
    <DatabaseContext.Provider
      value={{
        db,
        isDatabaseLoaded,
        isLoading,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};
