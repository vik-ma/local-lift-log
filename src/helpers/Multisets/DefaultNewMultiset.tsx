import { Multiset } from "../../typings";

export const DefaultNewMultiset = () => {
  const defaultNewMultiset: Multiset = {
    id: 0,
    multiset_type: 0,
    set_order: "",
    is_template: 1,
    note: "",
    setList: [],
    isExpanded: false,
  };

  return defaultNewMultiset;
};
