import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { UseExerciseListReturnType, UserSettings } from "../../typings";
import { UpdateUserSetting } from "../../helpers";

type ExerciseListOptionsProps = {
  useExerciseList: UseExerciseListReturnType;
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
};

export const ExerciseListOptions = ({
  useExerciseList,
  userSettings,
  setUserSettings,
}: ExerciseListOptionsProps) => {
  const {
    handleSortOptionSelection,
    sortCategory,
    exerciseListFilters,
    showSecondaryGroups,
    setShowSecondaryGroups,
  } = useExerciseList;

  const { filterExerciseGroupModal, filterMap } = exerciseListFilters;

  const handleFilterExerciseGroupsButton = () => {
    filterExerciseGroupModal.onOpen();
  };

  const handleShowSecondaryButton = async () => {
    const newValue = !showSecondaryGroups;
    const newValueNum = newValue ? 1 : 0;

    setShowSecondaryGroups(newValue);

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
        color={showSecondaryGroups ? "secondary" : "default"}
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
