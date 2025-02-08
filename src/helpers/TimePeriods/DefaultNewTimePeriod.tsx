import { TimePeriod } from "../../typings";

export const DefaultNewTimePeriod = () => {
  const defaultNewTimePeriod: TimePeriod = {
    id: 0,
    name: "",
    start_date: null,
    end_date: null,
    note: null,
    diet_phase: null,
    injury: null,
  };

  return defaultNewTimePeriod;
};
