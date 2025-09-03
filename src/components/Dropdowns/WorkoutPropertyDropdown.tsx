import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { UserSettings } from "../../typings";
import { UpdateUserSetting } from "../../helpers";
import { VALID_WORKOUT_PROPERTIES_MAP } from "../../constants";

type WorkoutPropertyDropdownProps = {
  selectedWorkoutProperties: Set<string>;
  setSelectedWorkoutProperties: React.Dispatch<
    React.SetStateAction<Set<string>>
  >;
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
};

export const WorkoutPropertyDropdown = ({
  selectedWorkoutProperties,
  setSelectedWorkoutProperties,
  userSettings,
  setUserSettings,
}: WorkoutPropertyDropdownProps) => {
  const handleChange = async (keys: Set<string>) => {
    setSelectedWorkoutProperties(keys);

    const workoutPropertyString = Array.from(keys).join(",");

    await UpdateUserSetting(
      "shown_workout_properties",
      workoutPropertyString,
      userSettings,
      setUserSettings
    );
  };

  const workoutProperties = VALID_WORKOUT_PROPERTIES_MAP;

  return (
    <Dropdown shouldBlockScroll={false}>
      <DropdownTrigger>
        <Button
          aria-label="Toggle Display Workout Properties Options Menu"
          className="z-1"
          variant="flat"
          size="sm"
        >
          Display
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Display Workout Properties Menu"
        closeOnSelect={false}
        selectionMode="multiple"
        selectedKeys={selectedWorkoutProperties}
        onSelectionChange={(keys) => handleChange(keys as Set<string>)}
      >
        {Array.from(workoutProperties).map(([key, value]) => (
          <DropdownItem key={key}>{value}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};
