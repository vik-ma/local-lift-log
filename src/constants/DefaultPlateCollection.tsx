import { PlateCollection } from "../typings";

export const DEFAULT_PLATE_COLLECTION: PlateCollection = {
  id: 0,
  name: "",
  handle_id: 0,
  available_plates_string: "",
  num_handles: 1,
  weight_unit: "kg",
  availablePlatesMap: new Map(),
};
