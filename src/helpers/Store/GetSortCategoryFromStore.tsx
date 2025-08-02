import {
  ListSortCategory,
  StoreRef,
  ListCategoryStoreKey,
} from "../../typings";

export const GetSortCategoryFromStore = async <T extends ListSortCategory>(
  store: StoreRef,
  defaultSortCategory: T,
  storeKey: ListCategoryStoreKey
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
