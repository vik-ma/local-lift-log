import { DietLog } from "../../typings";

export const DefaultNewDietLog = () => {
  const defaultNewDietLog: DietLog = {
    id: 0,
    date: "",
    calories: 0,
    fat: null,
    carbs: null,
    protein: null,
    note: null,
  };

  return defaultNewDietLog;
};
