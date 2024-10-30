import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { VerticalMenuIcon } from "../assets";
import { UserWeight } from "../typings";

type UserWeightListItemProps = {
  userWeight: UserWeight;
  handleUserWeightOptionSelection: (
    key: string,
    userWeight: UserWeight
  ) => void;
};

export const UserWeightListItem = ({
  userWeight,
  handleUserWeightOptionSelection,
}: UserWeightListItemProps) => {
  return (
    <div
      className="flex justify-between items-center cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
      onClick={() => handleUserWeightOptionSelection("edit", userWeight)}
      key={`user-weight-${userWeight.id}`}
    >
      <div className="flex flex-col justify-start items-start">
        <span className="w-[20.75rem] truncate text-left">
          {userWeight.weight} {userWeight.weight_unit}
        </span>
        <span className="text-xs text-secondary text-left">
          {userWeight.formattedDate}
        </span>
        <span className="w-[20.75rem] break-all text-xs text-stone-400 text-left">
          {userWeight.comment}
        </span>
      </div>
      <Dropdown>
        <DropdownTrigger>
          <Button
            aria-label={`Toggle ${userWeight.formattedDate} Weight Entry Options Menu`}
            isIconOnly
            className="z-1"
            radius="lg"
            variant="light"
          >
            <VerticalMenuIcon size={19} color="#888" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label={`Option Menu For ${userWeight.formattedDate} Body Weight Entry`}
          onAction={(key) =>
            handleUserWeightOptionSelection(key as string, userWeight)
          }
        >
          <DropdownItem key="edit">Edit</DropdownItem>
          <DropdownItem key="delete" className="text-danger">
            Delete
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};