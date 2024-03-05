import Database from "tauri-plugin-sql-api";
import { createContext } from "react";
import { UserSettings } from "../typings";

type DatabaseContextProps = {
  db: Database | null;
  userSettings: UserSettings | null;
};

export const DatabaseContext = createContext<DatabaseContextProps>({
  db: null,
  userSettings: null,
});
