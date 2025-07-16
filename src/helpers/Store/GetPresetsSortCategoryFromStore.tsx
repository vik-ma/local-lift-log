import { StoreRef } from "../../typings";

export const GetPresetsSortCategoryFromStore = async (
  store: StoreRef,
  isWeight: boolean
) => {
  let sortCategory = "favorite";

  if (store.current !== null) {
    const val = await store.current.get<{
      value: string;
    }>(isWeight ? "sort-category-equipment-weights" : "sort-category-distance");

    if (val !== undefined) {
      sortCategory = val.value;
    }
  }

  return sortCategory;
};
