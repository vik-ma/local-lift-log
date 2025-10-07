import { MULTISET_TYPES } from ".";
import { Multiset } from "../typings";

export const DEFAULT_MULTISET: Multiset = {
  id: 0,
  multiset_type: MULTISET_TYPES[0],
  set_order: "",
  is_template: 1,
  note: "",
  setList: [],
  isExpanded: false,
};
