import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { UseRoutineListReturnType } from "../../typings";

type RoutineListOptionsProps = {
  useRoutineList: UseRoutineListReturnType;
};

export const RoutineListOptions = ({
  useRoutineList,
}: RoutineListOptionsProps) => {
  const {
    sortCategory,
    handleSortOptionSelection,
    listFilters,
    handleOpenFilterButton,
  } = useRoutineList;

  const { filterMap } = listFilters;

  return (
    <div className="flex gap-1 pr-0.5">
      <Button
        className="z-1"
        variant="flat"
        color={filterMap.size > 0 ? "secondary" : "default"}
        size="sm"
        onPress={handleOpenFilterButton}
      >
        Filter
      </Button>
      <Dropdown shouldBlockScroll={false}>
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
          <DropdownItem key="name">Name (A-Z)</DropdownItem>
          <DropdownItem key="num-workouts-desc">
            Number Of Workouts (High-Low)
          </DropdownItem>
          <DropdownItem key="num-workouts-asc">
            Number Of Workouts (Low-High)
          </DropdownItem>
          <DropdownItem key="num-days-desc">
            Number Of Days (High-Low)
          </DropdownItem>
          <DropdownItem key="num-days-asc">
            Number Of Days (Low-High)
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
