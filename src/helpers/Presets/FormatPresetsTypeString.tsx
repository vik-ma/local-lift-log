import { PresetsType } from "../../typings";

export const FormatPresetsTypeString = (presetsType: PresetsType) => {
  if (presetsType === "equipment") return "Equipment Weights";

  if (presetsType === "distance") return "Distances";

  return "";
};
