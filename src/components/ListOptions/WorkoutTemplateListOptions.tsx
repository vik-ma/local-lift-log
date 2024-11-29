import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { UseWorkoutTemplateListReturnType } from "../../typings";

type WorkoutTemplateListOptionsProps = {
  useWorkoutTemplateList: UseWorkoutTemplateListReturnType;
};

export const WorkoutTemplateListOptions = ({
  useWorkoutTemplateList,
}: WorkoutTemplateListOptionsProps) => {
  const {
    sortCategory,
    handleSortOptionSelection,
    handleOpenFilterButton,
    listFilters,
  } = useWorkoutTemplateList;

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
      <Dropdown>
        <DropdownTrigger>
          <Button className="z-1" variant="flat" size="sm">
            Sort By
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Sort Workout Templates Dropdown Menu"
          selectionMode="single"
          selectedKeys={[sortCategory]}
          onAction={(key) => handleSortOptionSelection(key as string)}
        >
          <DropdownItem key="name">Name (A-Z)</DropdownItem>
          <DropdownItem key="num-sets-desc">
            Number Of Sets (High-Low)
          </DropdownItem>
          <DropdownItem key="num-sets-asc">
            Number Of Sets (Low-High)
          </DropdownItem>
          <DropdownItem key="num-exercises-desc">
            Number Of Exercises (High-Low)
          </DropdownItem>
          <DropdownItem key="num-exercises-asc">
            Number Of Exercises (Low-High)
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
