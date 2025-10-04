import { IsYmdDateStringValid } from "..";
import {
  NUM_DAYS_IN_SCHEDULE_OPTIONS,
  ROUTINE_SCHEDULE_TYPES,
} from "../../constants";
import { Routine } from "../../typings";

export const ValidateAndModifyRoutineSchedule = (routine: Routine) => {
  if (!ROUTINE_SCHEDULE_TYPES.includes(routine.schedule_type)) {
    routine.schedule_type = ROUTINE_SCHEDULE_TYPES[0];
  }

  if (!NUM_DAYS_IN_SCHEDULE_OPTIONS.includes(routine.num_days_in_schedule)) {
    routine.num_days_in_schedule = NUM_DAYS_IN_SCHEDULE_OPTIONS[0];
  }

  const isNullAllowedCustomScheduleStartDate = true;

  if (
    !IsYmdDateStringValid(
      routine.custom_schedule_start_date,
      isNullAllowedCustomScheduleStartDate
    )
  ) {
    routine.custom_schedule_start_date = null;
  }
};
