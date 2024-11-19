import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { UseExerciseListReturnType } from "../typings";
import { UpdateShowSecondaryExerciseGroups } from "../helpers";

type ExerciseListOptionsProps = {
  useExerciseList: UseExerciseListReturnType;
  userSettingsId: number;
};

export const ExerciseListOptions = ({
  useExerciseList,
  userSettingsId,
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

  const handleShowSecondaryButton = async () => {
    const newValue = !showSecondaryExerciseGroups;
    const newValueNum = newValue ? 1 : 0;

    setShowSecondaryExerciseGroups(newValue);

    await UpdateShowSecondaryExerciseGroups(newValueNum, userSettingsId);
  };

  return (
    <div className="flex gap-1">
      <Button
        className="z-1"
        variant="flat"
        color={showSecondaryExerciseGroups ? "secondary" : "default"}
        size="sm"
        onPress={handleShowSecondaryButton}
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
