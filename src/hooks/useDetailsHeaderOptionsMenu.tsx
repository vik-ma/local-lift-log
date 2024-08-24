import { useState, useMemo } from "react";
import {
  DetailHeaderOptionItem,
  UseDetailsHeaderOptionsMenuReturnType,
} from "../typings";

export const useDetailsHeaderOptionsMenu = (
  detailsType: string,
  additionalMenuItems?: DetailHeaderOptionItem
): UseDetailsHeaderOptionsMenuReturnType => {
  const [showNote, setShowNote] = useState<boolean>(false);

  const menuItems = useMemo(() => {
    const menuItems: DetailHeaderOptionItem = {
      "toggle-note": {
        text: `Toggle ${detailsType} Note`,
        function: () => setShowNote(!showNote),
      },
      ...additionalMenuItems,
    };

    return menuItems;
  }, [showNote, additionalMenuItems, detailsType]);

  const handleOptionMenuSelection = (key: string) => {
    if (menuItems[key] === undefined) return;

    menuItems[key].function();
  };

  return { showNote, menuItems, handleOptionMenuSelection };
};
