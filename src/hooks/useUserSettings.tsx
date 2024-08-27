import { useEffect, useState } from "react";
import { GetUserSettings } from "../helpers";
import { UserSettings } from "../typings";

export const useUserSettings = () => {
  const [userSettings, setUserSettings] = useState<UserSettings>();

  useEffect(() => {
    const getUserSettings = async () => {
      const settings = await GetUserSettings();
      if (settings !== undefined) {
        setUserSettings(settings);
      }
    };

    getUserSettings();
  }, []);

  return { userSettings, setUserSettings };
};
