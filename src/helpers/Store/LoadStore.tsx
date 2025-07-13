import { load } from "@tauri-apps/plugin-store";
import { StoreRef } from "../../typings";

export const LoadStore = async (storeRef: StoreRef) => {
  if (storeRef.current !== null) return;

  const store = await load("store.json", { autoSave: true });

  storeRef.current = store;
};
