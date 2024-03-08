
import { UserSettings } from "../../typings";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserSettingsState {
    userSettings: UserSettings | undefined;
}

const initialState: UserSettingsState = {
    userSettings: undefined,
}

const userSettingsSlice = createSlice( {
    name: "userSettings",
    initialState,
    reducers: {
        addUserSettings: (state, action: PayloadAction<UserSettings>) => {
            state.userSettings = action.payload;
        }
    }}
)

export const { addUserSettings } = userSettingsSlice.actions;

export default userSettingsSlice.reducer;