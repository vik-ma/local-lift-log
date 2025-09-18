import { ListStoreKey, StoreRef } from "../../typings";
import { IsNumberValidInteger } from "../Numbers/IsNumberValidInteger";

export const GetPaginationPageFromStore = async (
  store: StoreRef,
  storeKey: ListStoreKey,
  itemsPerPaginationPage: number,
  numItemsInList: number
) => {
  const minValue = 1;

  if (store.current === null) return minValue;

  const val = await store.current.get<{ value: number }>(
    `pagination-page-${storeKey}`
  );

  if (val === undefined || !IsNumberValidInteger(val.value, minValue))
    return minValue;

  const totalPaginationPages = Math.ceil(
    numItemsInList / itemsPerPaginationPage
  );

  if (val.value > totalPaginationPages) return minValue;

  return val.value;
};
