import { ListStoreKey, StoreRef } from "../../typings";

export const HandleListPaginationPageChange = async (
  page: number,
  store: StoreRef,
  setPaginationPage: React.Dispatch<React.SetStateAction<number>>,
  storeKey: ListStoreKey
) => {
  if (store.current === null) return;

  setPaginationPage(page);

  await store.current.set(`pagination-page-${storeKey}`, {
    value: page,
  });
};
