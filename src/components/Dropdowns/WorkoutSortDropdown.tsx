import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { WorkoutSortCategory } from "../../typings";

type WorkoutSortDropdownProps = {
  sortCategory: WorkoutSortCategory;
  handleSortOptionSelection: (key: string) => void;
};

export const WorkoutSortDropdown = ({
  sortCategory,
  handleSortOptionSelection,
}: WorkoutSortDropdownProps) => {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button className="z-1" variant="flat" size="sm">
          Sort By
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Sort Workouts Dropdown Menu"
        selectionMode="single"
        selectedKeys={[sortCategory]}
        onAction={(key) => handleSortOptionSelection(key as string)}
      >
        <DropdownItem key="date-desc">Date (Newest First)</DropdownItem>
        <DropdownItem key="date-asc">Date (Oldest First)</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
