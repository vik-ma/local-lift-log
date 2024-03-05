import Database from "tauri-plugin-sql-api";
import { createContext } from "react";
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