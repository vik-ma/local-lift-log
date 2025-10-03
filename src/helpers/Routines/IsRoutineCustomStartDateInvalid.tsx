import { Routine } from "../../typings";

export const IsRoutineCustomStartDateInvalid = (routine: Routine) => {
  return (
    routine.schedule_type === 1 && routine.custom_schedule_start_date === null
  );
};
