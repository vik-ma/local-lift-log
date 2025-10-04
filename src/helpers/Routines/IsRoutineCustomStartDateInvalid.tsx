import { Routine } from "../../typings";

export const IsRoutineCustomStartDateInvalid = (routine: Routine) => {
  return (
    routine.schedule_type === "Custom" &&
    routine.custom_schedule_start_date === null
  );
};
