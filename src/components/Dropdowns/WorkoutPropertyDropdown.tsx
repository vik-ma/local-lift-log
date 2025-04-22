import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { UserSettings } from "../../typings";
import { useMemo } from "react";
import { UpdateUserSetting, ValidWorkoutPropertiesMap } from "../../helpers";
import toast from "react-hot-toast";

type WorkoutPropertyDropdownProps = {
  selectedWorkoutProperties: Set<string>;
  setSelectedWorkoutProperties: React.Dispatch<
    React.SetStateAction<Set<string>>
  >;
  userSettings?: UserSettings;
  setUserSettings?: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  isInSettingsPage?: boolean;
};

export const WorkoutPropertyDropdown = ({
  selectedWorkoutProperties,
  setSelectedWorkoutProperties,
  userSettings,
  setUserSettings,
  isInSettingsPage,
}: WorkoutPropertyDropdownProps) => {
  const handleChange = async (keys: Set<string>) => {
    setSelectedWorkoutProperties(keys);

    if (userSettings !== undefined && setUserSettings !== undefined) {
      const workoutPropertyString = Array.from(keys).join(",");

      const success = await UpdateUserSetting(
        "shown_workout_properties",
        workoutPropertyString,
        userSettings,
        setUserSettings
      );

      if (success && isInSettingsPage) {
        toast.success("Setting Updated");
      }
    }
  };

  const workoutProperties = useMemo(() => ValidWorkoutPropertiesMap(), []);

  return (
    <Dropdown shouldBlockScroll={false}>
      <DropdownTrigger>
        <Button
          aria-label="Toggle Display Workout Properties Options Menu"
          className="z-1"
          variant={isInSettingsPage ? "solid" : "flat"}
          color={isInSettingsPage ? "primary" : "default"}
          size="sm"
        >
          {isInSettingsPage ? "Select" : "Display"}
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
