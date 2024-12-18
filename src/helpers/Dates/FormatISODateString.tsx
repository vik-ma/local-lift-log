import { parseAbsoluteToLocal } from "@internationalized/date";

export const FormatISODateString = (
  dateISOString: string | null,
  locale: string
) => {
  if (dateISOString === null) return null;

  try {
    const dateString = parseAbsoluteToLocal(dateISOString)
      .toDate()
      .toLocaleDateString(locale);

    return dateString;
  } catch {
    return null;
  }
};
