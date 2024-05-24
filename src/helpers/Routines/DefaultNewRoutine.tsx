import { Routine } from "../../typings";

export const DefaultNewRoutine = () => {
  const defaultNewRoutine: Routine = {
    id: 0,
    name: "",
    note: "",
    is_schedule_weekly: 1,
    num_days_in_schedule: 7,
    custom_schedule_start_date: null,
  };

  return defaultNewRoutine;
};
