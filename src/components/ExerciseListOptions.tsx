import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { UseExerciseListReturnType } from "../typings";

type ExerciseListOptionsProps = {
  useExerciseList: UseExerciseListReturnType;
};

export const ExerciseListOptions = ({
  useExerciseList,
}: ExerciseListOptionsProps) => {
  const {
    showSecondaryExerciseGroups,
    setShowSecondaryExerciseGroups,
    areExerciseGroupsFiltered,
    handleSortOptionSelection,
    sortCategory,
    exerciseGroupModal,
  } = useExerciseList;

  const handleFilterExerciseGroupsButton = () => {
    exerciseGroupModal.onOpen();
  };

  return (
    <div className="flex gap-1">
      <Button
        className="z-1 w-[7.5rem]"
        variant="flat"
        color={showSecondaryExerciseGroups ? "secondary" : "default"}
        size="sm"
        onPress={() =>
          setShowSecondaryExerciseGroups(!showSecondaryExerciseGroups)
        }
      >
        Show Secondary
      </Button>
      <Button
        className="z-1"
        variant="flat"
        color={areExerciseGroupsFiltered ? "secondary" : "default"}
        size="sm"
        onPress={handleFilterExerciseGroupsButton}
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
          aria-label="Sort Exercises Dropdown Menu"
          selectionMode="single"
          selectedKeys={[sortCategory]}
          onAction={(key) => handleSortOptionSelection(key as string)}
        >
          <DropdownItem key="favorite">Favorites First</DropdownItem>
          <DropdownItem key="name">Exercise Name (A-Z)</DropdownItem>
          <DropdownItem key="num-sets">Number Of Sets Completed</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
