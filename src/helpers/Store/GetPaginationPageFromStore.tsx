import { ListStoreKey, StoreRef } from "../../typings";

export const GetPaginationPageFromStore = async (
  store: StoreRef,
  storeKey: ListStoreKey,
  itemsPerPaginationPage: number,
  numItemsInList: number
) => {
  if (store.current === null) return 1;

  const val = await store.current.get<{ value: number }>(
    `pagination-page-${storeKey}`
  );

  if (val === undefined) return 1;

  const totalPaginationPages = Math.ceil(
    numItemsInList / itemsPerPaginationPage
  );

  if (val.value > totalPaginationPages) return 1;

  return val.value;
};
