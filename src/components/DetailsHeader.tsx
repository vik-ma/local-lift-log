import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { CrossIcon, EditIcon, VerticalMenuIcon } from "../assets";
import { UseDetailsHeaderOptionsMenuReturnType } from "../typings";
import { ReactNode, useMemo } from "react";

type DetailsHeaderProps = {
  header: string;
  subHeader: string;
  note: string | null;
  detailsType: string;
  editButtonAction: () => void;
  useDetailsHeaderOptions: UseDetailsHeaderOptionsMenuReturnType;
  extraContent?: ReactNode;
};

export const DetailsHeader = ({
  header,
  subHeader,
  note,
  detailsType,
  editButtonAction,
  useDetailsHeaderOptions,
  extraContent,
}: DetailsHeaderProps) => {
  const { showNote, setShowNote, menuItems, handleOptionMenuSelection } =
    useDetailsHeaderOptions;

  const showMenuButton = useMemo(() => {
    const keys = Object.keys(menuItems);

    if (keys.length === 0) return false;

    if (keys.length === 1 && keys[0] === "toggle-note" && note === null)
      return false;

    return true;
  }, [menuItems, note]);

  return (
    <div className="flex flex-col gap-3.5">
      <div className="relative w-full flex">
        <div className="flex flex-col gap-0.5 w-full">
          <div className="flex justify-center">
            <h1 className="text-3xl text-secondary font-semibold w-[20rem] truncate text-center">
              {header}
            </h1>
          </div>
          <div className="flex justify-center">
            <span className="text-stone-500 text-center font-semibold w-[20rem] break-words">
              {subHeader}
            </span>
          </div>
        </div>
        <div className="absolute right-0 top-0">
          <div className="flex flex-col gap-0.5">
            <Button
              aria-label="Edit Properties"
              isIconOnly
              className="z-1"
              size="sm"
              variant="light"
              onPress={editButtonAction}
            >
              <EditIcon size={22} color={"#808080"} />
            </Button>
            {showMenuButton && (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    aria-label={`Toggle ${detailsType} Options Menu`}
                    isIconOnly
                    className="z-1"
                    size="sm"
                    variant="light"
                  >
                    <VerticalMenuIcon size={18} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label={`${detailsType} Option Menu`}
                  onAction={(key) => handleOptionMenuSelection(key as string)}
                >
                  {Object.entries(menuItems).map(([key, value]) => {
                    let className = value.className ?? "";

                    if (note === null && key === "toggle-note") {
                      className = "hidden";
                    }

                    return (
                      <DropdownItem className={className} key={key}>
                        {value.text}
                      </DropdownItem>
                    );
                  })}
                </DropdownMenu>
              </Dropdown>
            )}
          </div>
        </div>
      </div>
      {showNote && note !== null && (
        <div className="flex flex-col bg-stone-100 w-full px-2 pt-1 pb-1.5 border-2 border-stone-500 rounded">
          <div className="flex justify-between items-center">
            <h3 className="break-all font-medium text-stone-700 text-lg">
              {detailsType} Note
            </h3>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => setShowNote(false)}
            >
              <CrossIcon color="#606060" size={20} />
            </Button>
          </div>
          <span className="break-words text-stone-500 text-sm">{note}</span>
        </div>
      )}
      {extraContent}
    </div>
  );
};
