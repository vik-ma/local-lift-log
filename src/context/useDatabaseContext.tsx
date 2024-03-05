import { useContext } from "react";
import { DatabaseContext } from "./DatabaseContext";

export const useDatabaseContext = () => useContext(DatabaseContext);
