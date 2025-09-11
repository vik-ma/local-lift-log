import { ListSortCategory, StoreRef, ListStoreKey } from "../../typings";

export const GetSortCategoryFromStore = async <T extends ListSortCategory>(
  store: StoreRef,
  defaultSortCategory: T,
  storeKey: ListStoreKey
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
