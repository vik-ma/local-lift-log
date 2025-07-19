import {
  ListSortCategory,
  StoreRef,
  ListSortCategoryStoreKey,
} from "../../typings";

export const GetSortCategory = async <T extends ListSortCategory>(
  store: StoreRef,
  defaultSortCategory: T,
  storeKey: ListSortCategoryStoreKey
) => {
  let sortCategory: T = defaultSortCategory;

  if (store.current !== null) {
    const val = await store.current.get<{ value: T }>(
      `sort-category-${storeKey}`
    );

    if (val !== undefined) {
      sortCategory = val.value;
    }
  }

  return sortCategory;
};
