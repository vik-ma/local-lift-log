import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { EditIcon, VerticalMenuIcon } from "../assets";
import { UseDetailsHeaderOptionsMenuReturnType } from "../typings";

type DetailsHeaderProps = {
  header: string;
  subHeader: string;
  note: string | null;
  detailsType: string;
  editButtonAction: () => void;
  useDetailsHeaderOptions: UseDetailsHeaderOptionsMenuReturnType;
};

export const DetailsHeader = ({
  header,
  subHeader,
  note,
  detailsType,
  editButtonAction,
  useDetailsHeaderOptions,
}: DetailsHeaderProps) => {
  const { showNote, menuItems, handleOptionMenuSelection } =
    useDetailsHeaderOptions;

  return (
    <div className="flex flex-col gap-4 pb-4">
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
                  const className =
                    note === null && key === "toggle-note" ? "hidden" : "";

                  return (
                    <DropdownItem className={className} key={key}>
                      {value.text}
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
      {showNote && note !== null && (
        <div className="flex justify-center w-full">
          <span className="break-all font-medium text-stone-500">{note}</span>
        </div>
      )}
    </div>
  );
};
