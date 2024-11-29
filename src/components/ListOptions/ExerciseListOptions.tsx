import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import {
  UseExerciseListReturnType,
  UseFilterExerciseListReturnType,
} from "../../typings";
import { UpdateShowSecondaryExerciseGroups } from "../../helpers";

type ExerciseListOptionsProps = {
  useExerciseList: UseExerciseListReturnType;
  useFilterExerciseList: UseFilterExerciseListReturnType;
  userSettingsId: number;
};

export const ExerciseListOptions = ({
  useExerciseList,
  useFilterExerciseList,
  userSettingsId,
}: ExerciseListOptionsProps) => {
  const {
    includeSecondaryGroups,
    setIncludeSecondaryGroups,
    handleSortOptionSelection,
    sortCategory,
  } = useExerciseList;

  const { exerciseGroupModal, areExerciseGroupsFiltered } =
    useFilterExerciseList;

  const handleFilterExerciseGroupsButton = () => {
    exerciseGroupModal.onOpen();
  };

  const handleShowSecondaryButton = async () => {
    const newValue = !includeSecondaryGroups;
    const newValueNum = newValue ? 1 : 0;

    setIncludeSecondaryGroups(newValue);

    await UpdateShowSecondaryExerciseGroups(newValueNum, userSettingsId);
  };

  return (
    <div className="flex gap-1">
      <Button
        className="z-1"
        variant="flat"
        color={areExerciseGroupsFiltered ? "secondary" : "default"}
        size="sm"
        onPress={handleFilterExerciseGroupsButton}
      >
        Filter
      </Button>
      <Button
        className="z-1"
        variant="flat"
        color={includeSecondaryGroups ? "secondary" : "default"}
        size="sm"
        onPress={handleShowSecondaryButton}
      >
        Show Secondary
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
