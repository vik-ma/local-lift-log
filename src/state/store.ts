import { configureStore } from "@reduxjs/toolkit";
import userSettingsReducer from "./user_settings/userSettingsSlice";

export const store = configureStore({ reducer: {
    userSettings: userSettingsReducer,
}});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;