import { UserWeight } from "../../typings";

export const DefaultNewUserWeight = () => {
  const defaultNewUserWeight: UserWeight = {
    id: 0,
    weight: 0,
    weight_unit: "kg",
    date: "",
    formattedDate: "",
    comment: null,
  };

  return defaultNewUserWeight;
};
