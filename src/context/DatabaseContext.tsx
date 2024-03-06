import Database from "tauri-plugin-sql-api";
import { Dispatch, SetStateAction, createContext } from "react";
import { UserSettings } from "../typings";

type DatabaseContextProps = {
  db: Database | null;
  userSettings: UserSettings | null;
  setUserSettings: Dispatch<SetStateAction<UserSettings | null>>;
};

export const DatabaseContext = createContext<DatabaseContextProps>({
  db: null,
  userSettings: null,
  setUserSettings: () => {},
});
