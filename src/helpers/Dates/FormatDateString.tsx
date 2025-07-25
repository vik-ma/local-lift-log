import { parseAbsoluteToLocal } from "@internationalized/date";

export const FormatDateString = (
  dateISOString: string,
  doNotIncludeDay?: boolean
) => {
  try {
    const formattedDate = parseAbsoluteToLocal(dateISOString)
      .toDate()
      .toDateString();

    if (doNotIncludeDay) {
      return formattedDate.substring(4);
    }

    return formattedDate;
  } catch {
    return "Invalid Date";
  }
};
