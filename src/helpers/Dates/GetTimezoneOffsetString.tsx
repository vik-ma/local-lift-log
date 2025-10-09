export const GetTimezoneOffsetString = () => {
  const offsetMinutes = new Date().getTimezoneOffset();
  const offsetHours = -offsetMinutes / 60;
  const timezoneOffset = `${offsetHours >= 0 ? "+" : ""}${offsetHours} hours`;

  return timezoneOffset;
};
