import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
  UseExerciseListReturnType,
  UseFilterExerciseListReturnType,
  UserSettings,
} from "../../typings";
import { UpdateUserSetting } from "../../helpers";

type ExerciseListOptionsProps = {
  useExerciseList: UseExerciseListReturnType;
  useFilterExerciseList: UseFilterExerciseListReturnType;
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
};

export const ExerciseListOptions = ({
  useExerciseList,
  useFilterExerciseList,
  userSettings,
  setUserSettings,
}: ExerciseListOptionsProps) => {
  const {
    includeSecondaryGroups,
    setIncludeSecondaryGroups,
    handleSortOptionSelection,
    sortCategory,
  } = useExerciseList;

  const { exerciseGroupModal, filterMap } = useFilterExerciseList;

  const handleFilterExerciseGroupsButton = () => {
    exerciseGroupModal.onOpen();
  };

  const handleShowSecondaryButton = async () => {
    const newValue = !includeSecondaryGroups;
    const newValueNum = newValue ? 1 : 0;

    setIncludeSecondaryGroups(newValue);

    await UpdateUserSetting(
      "show_secondary_exercise_groups",
      newValueNum,
      userSettings,
      setUserSettings
    );
  };

  return (
    <div className="flex gap-1">
      <Button
        className="z-1"
        variant="flat"
        color={includeSecondaryGroups ? "secondary" : "default"}
        size="sm"
        onPress={handleShowSecondaryButton}
      >
        Show Secondary
      </Button>
      <Button
        className="z-1"
        variant="flat"
        color={filterMap.size > 0 ? "secondary" : "default"}
        size="sm"
        onPress={handleFilterExerciseGroupsButton}
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
