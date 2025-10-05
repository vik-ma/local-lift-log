import { FormatISODateStringToCalendarAriaLabelString } from "..";
import { Routine, SimpleRoutineScheduleItem } from "../../typings";

export const CreateDateRoutineScheduleListMap = (
  activeRoutine: Routine,
  operatingYearMonth: string,
  locale: string,
  isCurrentMonth: boolean
) => {
  const dateRoutineScheduleMap = new Map<string, SimpleRoutineScheduleItem[]>();

  const [yearString, monthString] = operatingYearMonth.split("-");
  const year = parseInt(yearString, 10);
  const month = parseInt(monthString, 10) - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let startDay = 1;

  if (isCurrentMonth) {
    const today = new Date();
    startDay = today.getDate();
  }

  const isWeeklySchedule = activeRoutine.schedule_type === "Weekly";

  for (let day = startDay; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = FormatISODateStringToCalendarAriaLabelString(
      date.toISOString(),
      locale
    );

    if (isWeeklySchedule) {
      const weekday = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
      const weekdayRoutineScheduleList =
        activeRoutine.routineScheduleList!.filter(
          (item) => item.day === weekday
        );

      if (weekdayRoutineScheduleList.length > 0) {
        dateRoutineScheduleMap.set(dateKey, weekdayRoutineScheduleList);
      }
    } else {
    }
  }

  return dateRoutineScheduleMap;
};
