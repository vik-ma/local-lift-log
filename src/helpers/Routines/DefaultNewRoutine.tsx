import { Routine } from "../../typings";

export const DefaultNewRoutine = () => {
  const defaultNewRoutine: Routine = {
    id: 0,
    name: "",
    note: "",
    schedule_type: 0,
    num_days_in_schedule: 7,
    custom_schedule_start_date: null,
    workout_template_order: null,
  };

  return defaultNewRoutine;
};
