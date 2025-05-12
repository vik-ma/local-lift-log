import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { UserSettings, UseWorkoutListReturnType } from "../../typings";
import { VerticalMenuIcon } from "../../assets";
import { WorkoutPropertyDropdown } from "..";

type WorkoutListOptionsProps = {
  useWorkoutList: UseWorkoutListReturnType;
  selectedWorkoutProperties: Set<string>;
  setSelectedWorkoutProperties: React.Dispatch<
    React.SetStateAction<Set<string>>
  >;
  userSettings?: UserSettings;
  setUserSettings?: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  handleOptionMenuSelection?: (key: string) => void;
};

export const WorkoutListOptions = ({
  useWorkoutList,
  selectedWorkoutProperties,
  setSelectedWorkoutProperties,
  userSettings,
  setUserSettings,
  handleOptionMenuSelection,
}: WorkoutListOptionsProps) => {
  const {
    sortCategory,
    handleSortOptionSelection,
    handleOpenFilterButton,
    listFilters,
    workoutListHasEmptyWorkouts,
  } = useWorkoutList;

  const { filterMap } = listFilters;

  return (
    <div className="flex gap-1 pr-0.5">
      <WorkoutPropertyDropdown
        selectedWorkoutProperties={selectedWorkoutProperties}
        setSelectedWorkoutProperties={setSelectedWorkoutProperties}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
      />
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
          <DropdownItem key="date-desc">Date (Latest First)</DropdownItem>
          <DropdownItem key="date-asc">Date (Oldest First)</DropdownItem>
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
      {handleOptionMenuSelection !== undefined && (
        <Dropdown shouldBlockScroll={false}>
          <DropdownTrigger>
            <Button
              aria-label="Toggle Workout List Options Menu"
              isIconOnly
              className="z-1"
              size="sm"
              variant="light"
              isDisabled={!workoutListHasEmptyWorkouts.current}
            >
              <VerticalMenuIcon size={19} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Workout List Options Menu"
            onAction={(key) => handleOptionMenuSelection(key as string)}
          >
            <DropdownItem className="text-danger" key="delete-empty-workouts">
              Delete All Empty Workouts
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )}
    </div>
  );
};
