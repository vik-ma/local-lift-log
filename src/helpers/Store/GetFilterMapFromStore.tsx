import { ListStoreKey, StoreRef } from "../../typings";

export const GetFilterMapFromStore = async (
  store: StoreRef,
  storeKey: ListStoreKey
) => {
  if (store.current === null) return new Map();

  const val = await store.current.get<{ value: string }>(
    `filter-map-${storeKey}`
  );

  if (val === undefined) return new Map();

  try {
    const filterMap = new Map<string, string>(JSON.parse(val.value));

    return filterMap;
  } catch {
    return new Map();
  }
};
