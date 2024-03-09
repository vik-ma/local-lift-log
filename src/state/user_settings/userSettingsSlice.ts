import { UserSettings } from "../../typings";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import UpdateUserSettings from "../../helpers/UpdateUserSettings";

interface UserSettingsState {
  userSettings: UserSettings | undefined;
}

const initialState: UserSettingsState = {
  userSettings: undefined,
};

const userSettingsSlice = createSlice({
  name: "userSettings",
  initialState,
  reducers: {
    addUserSettings: (state, action: PayloadAction<UserSettings>) => {
      state.userSettings = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      updateUserSettingsAsync.fulfilled,
      (state, action: PayloadAction<UserSettings>) => {
        state.userSettings = action.payload;
      }
    );
  },
});

export const updateUserSettingsAsync = createAsyncThunk(
  "userSettings/updateUserSettingsAsync",
  async (userSettings: UserSettings) => {
    await UpdateUserSettings({ userSettings: userSettings });
    return userSettings;
  }
);

export const { addUserSettings } = userSettingsSlice.actions;

export default userSettingsSlice.reducer;
