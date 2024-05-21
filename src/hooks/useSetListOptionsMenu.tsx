import { useMemo } from "react";
import { SetListOptionsItem } from "../typings";

export const useSetListOptionsMenu = (isTemplate: boolean) => {
  const setListOptionsMenu: SetListOptionsItem[] = useMemo(() => {
    if (isTemplate) {
      return [
        { key: "edit", label: "Edit" },
        { key: "remove-set", label: "Remove", className: "text-danger" },
      ];
    }

    return [
      { key: "edit", label: "Edit" },
      { key: "delete-set", label: "Delete", className: "text-danger" },
    ];
  }, [isTemplate]);

  return setListOptionsMenu;
};
