import { load, Store } from "@tauri-apps/plugin-store";

export const LoadStore = async (storeRef: React.RefObject<Store | null>) => {
  const store = await load("store.json", { autoSave: true });

  storeRef.current = store;
};
