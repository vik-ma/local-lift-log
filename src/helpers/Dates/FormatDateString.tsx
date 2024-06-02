import {
  parseAbsoluteToLocal,
} from "@internationalized/date";

export const FormatDateString = (dateISOString: string): string => {
  try {
    const formattedDate = parseAbsoluteToLocal(dateISOString)
      .toDate()
      .toDateString();
    return formattedDate;
  } catch {
    return "Invalid Date";
  }
};
