import { useState, useMemo } from "react";
import { DetailHeaderOptionItem } from "../typings";

export const useDetailsHeaderOptionsMenu = () => {
  const [showNote, setShowNote] = useState<boolean>(false);

  const menuItems = useMemo(() => {
    const menuItems: DetailHeaderOptionItem = {
      "toggle-note": {
        text: "Toggle Note",
        function: () => setShowNote(!showNote),
      },
    };

    return menuItems;
  }, [showNote]);

  const handleOptionMenuSelection = (key: string) => {
    if (menuItems[key] === undefined) return;

    menuItems[key].function();
  };

  return { showNote, menuItems, handleOptionMenuSelection };
};
