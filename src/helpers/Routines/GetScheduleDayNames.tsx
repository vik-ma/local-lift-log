export const GetScheduleDayNames = (
  numDays: number,
  isScheduleWeekly: boolean
): string[] => {
  if (isScheduleWeekly)
    return [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

  const customScheduleDayList: string[] = [];
  for (let i = 1; i < numDays + 1; i++) {
    customScheduleDayList.push(`Day ${i}`);
  }
  return customScheduleDayList;
};
