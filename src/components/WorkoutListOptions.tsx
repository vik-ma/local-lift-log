import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import {
  UserSettings,
  WorkoutSortCategory,
} from "../typings";
import { VerticalMenuIcon } from "../assets";
import { WorkoutPropertyDropdown } from "./Dropdowns/WorkoutPropertyDropdown";

type WorkoutListOptionsProps = {
  sortCategory: WorkoutSortCategory;
  handleSortOptionSelection: (key: string) => void;
  selectedWorkoutProperties: Set<string>;
  setSelectedWorkoutProperties: React.Dispatch<
    React.SetStateAction<Set<string>>
  >;
  handleFilterButton: () => void;
  userSettings?: UserSettings;
  setUserSettings?: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  hideDetailsButtonOption?: boolean;
  handleOptionMenuSelection?: (key: string) => void;
};

export const WorkoutListOptions = ({
  sortCategory,
  handleSortOptionSelection,
  selectedWorkoutProperties,
  setSelectedWorkoutProperties,
  handleFilterButton,
  userSettings,
  setUserSettings,
  hideDetailsButtonOption,
  handleOptionMenuSelection,
}: WorkoutListOptionsProps) => {
  return (
    <div className="flex gap-1 pr-0.5">
      <Button
        className="z-1"
        variant="flat"
        // TODO: ADD DIFFERENT COLOR FOR WHEN FILTERS ARE ACTIVE
        // color={ ? "secondary" : "default"}
        size="sm"
        onPress={handleFilterButton}
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
          aria-label="Sort Workouts Dropdown Menu"
          selectionMode="single"
          selectedKeys={[sortCategory]}
          onAction={(key) => handleSortOptionSelection(key as string)}
        >
          <DropdownItem key="date-desc">Date (Newest First)</DropdownItem>
          <DropdownItem key="date-asc">Date (Oldest First)</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <WorkoutPropertyDropdown
        selectedWorkoutProperties={selectedWorkoutProperties}
        setSelectedWorkoutProperties={setSelectedWorkoutProperties}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
        hideDetailsButtonOption={hideDetailsButtonOption}
      />
      {handleOptionMenuSelection !== undefined && (
        <Dropdown>
          <DropdownTrigger>
            <Button
              aria-label="Toggle Workout List Options Menu"
              isIconOnly
              className="z-1"
              size="sm"
              variant="light"
            >
              <VerticalMenuIcon size={19} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Workout List Option Menu"
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
