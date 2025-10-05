import { FormatISODateStringToCalendarAriaLabelString } from "..";
import { SimpleRoutineScheduleItem } from "../../typings";

export const CreateDateRoutineScheduleListMap = (
  routineScheduleList: SimpleRoutineScheduleItem[],
  operatingYearMonth: string,
  locale: string
) => {
  const dateRoutineScheduleMap = new Map<string, SimpleRoutineScheduleItem[]>();

  const [yearString, monthString] = operatingYearMonth.split("-");
  const year = parseInt(yearString, 10);
  const month = parseInt(monthString, 10) - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = FormatISODateStringToCalendarAriaLabelString(
      date.toISOString(),
      locale
    );

    const weekday = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    const weekdayRoutineScheduleList = routineScheduleList.filter(
      (item) => item.day === weekday
    );

    if (weekdayRoutineScheduleList.length > 0) {
      dateRoutineScheduleMap.set(dateKey, weekdayRoutineScheduleList);
    }
  }

  return dateRoutineScheduleMap;
};
