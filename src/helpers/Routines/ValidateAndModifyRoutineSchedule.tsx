import { IsNumberValidInteger, IsYmdDateStringValid } from "..";
import {
  NUM_DAYS_IN_SCHEDULE_OPTIONS,
  ROUTINE_SCHEDULE_TYPES,
} from "../../constants";
import { Routine } from "../../typings";

export const ValidateAndModifyRoutineSchedule = (routine: Routine) => {
  if (!ROUTINE_SCHEDULE_TYPES.has(routine.schedule_type)) {
    routine.schedule_type = ROUTINE_SCHEDULE_TYPES.keys().next().value!;
  }

  if (!NUM_DAYS_IN_SCHEDULE_OPTIONS.includes(routine.num_days_in_schedule)) {
    routine.num_days_in_schedule = NUM_DAYS_IN_SCHEDULE_OPTIONS[0];
  }

  const startDayMinValue = 0;
  const startDayDoNotAllowMinValue = false;
  const startDayMaxValue = 6;

  if (
    !IsNumberValidInteger(
      routine.start_day,
      startDayMinValue,
      startDayDoNotAllowMinValue,
      startDayMaxValue
    )
  ) {
    routine.start_day = startDayMinValue;
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
