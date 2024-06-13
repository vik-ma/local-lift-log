import { UserMeasurement } from "../../typings";

export const DefaultNewUserMeasurements = () => {
  const defaultNewUserMeasurements: UserMeasurement = {
    id: 0,
    date: "",
    comment: null,
    measurement_values: "{}",
    measurementListString: "",
    formattedDate: "",
    isExpanded: false,
    userMeasurementValues: {},
    isInvalid: false,
  };

  return defaultNewUserMeasurements;
};
