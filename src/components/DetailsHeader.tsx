import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { CrossIcon, EditIcon, VerticalMenuIcon } from "../assets";
import { UseDetailsHeaderOptionsMenuReturnType } from "../typings";
import { ReactNode, useMemo } from "react";
import { FavoriteButton } from "./FavoriteButton";

type DetailsHeaderProps<T> = {
  header: string;
  subHeader: string;
  note: string | null;
  detailsType: string;
  editButtonAction: () => void;
  useDetailsHeaderOptions: UseDetailsHeaderOptionsMenuReturnType;
  extraContent?: ReactNode;
  isFavorite?: boolean;
  item?: T;
  toggleFavorite?: (item: T, key?: string) => void;
};

export const DetailsHeader = <T,>({
  header,
  subHeader,
  note,
  detailsType,
  editButtonAction,
  useDetailsHeaderOptions,
  extraContent,
  isFavorite,
  item,
  toggleFavorite,
}: DetailsHeaderProps<T>) => {
  const { showNote, setShowNote, menuItems, handleOptionMenuSelection } =
    useDetailsHeaderOptions;

  const showMenuButton = useMemo(() => {
    const keys = Object.keys(menuItems);

    if (keys.length === 0) return false;

    if (keys.length === 1 && keys[0] === "toggle-note" && note === null)
      return false;

    return true;
  }, [menuItems, note]);

  const showFavoriteButton =
    isFavorite !== undefined &&
    item !== undefined &&
    toggleFavorite !== undefined;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="relative w-full flex">
        <div className="absolute left-0 top-0">
          {showFavoriteButton && (
            <FavoriteButton
              name={header}
              isFavorite={isFavorite}
              item={item}
              toggleFavorite={toggleFavorite}
              isInDetailsHeader
            />
          )}
        </div>
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
        <div className="relative flex flex-col bg-default-100 w-full px-2 py-1.5 rounded-xl border-2 border-default-300">
          <h3 className="break-all font-medium leading-snug text-lg">
            {detailsType} Note
          </h3>
          <Button
            className="absolute right-0.5 top-0.5"
            isIconOnly
            size="sm"
            variant="light"
            radius="lg"
            onPress={() => setShowNote(false)}
          >
            <CrossIcon color="#808080" size={20} />
          </Button>
          <span className="break-words text-foreground-600 text-sm">
            {note}
          </span>
        </div>
      )}
      {extraContent}
    </div>
  );
};
