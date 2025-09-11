import { StoreRef } from "../../typings";

export const HandleListPaginationPageChange = async (
  page: number,
  store: StoreRef,
  setPaginationPage: React.Dispatch<React.SetStateAction<number>>,
  listPrefix: string
) => {
  if (store.current === null) return;

  setPaginationPage(page);

  await store.current.set(`${listPrefix}-page`, {
    value: page,
  });
};
