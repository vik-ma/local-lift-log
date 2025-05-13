import { useState, useMemo } from "react";
import {
  DetailHeaderOptionItem,
  UseDetailsHeaderOptionsMenuReturnType,
} from "../typings";

export const useDetailsHeaderOptionsMenu = (
  detailsType: string,
  additionalMenuItems?: DetailHeaderOptionItem,
  isNoteComment?: boolean
): UseDetailsHeaderOptionsMenuReturnType => {
  const [showNote, setShowNote] = useState<boolean>(false);

  const menuItems = useMemo(() => {
    const menuItems: DetailHeaderOptionItem = {
      "toggle-note": {
        text: `${showNote ? "Hide" : "Show"} ${detailsType} ${
          isNoteComment ? "Comment" : "Note"
        }`,
        function: () => setShowNote(!showNote),
      },
      ...additionalMenuItems,
    };

    return menuItems;
  }, [showNote, additionalMenuItems, detailsType, isNoteComment]);

  const handleOptionMenuSelection = (key: string) => {
    if (menuItems[key] === undefined) return;

    menuItems[key].function();
  };

  return { showNote, setShowNote, menuItems, handleOptionMenuSelection };
};
