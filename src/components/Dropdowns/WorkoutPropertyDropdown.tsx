import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import Database from "tauri-plugin-sql-api";
import { UserSettings } from "../../typings";
import toast from "react-hot-toast";
import { useMemo } from "react";
import { ValidWorkoutPropertiesMap } from "../../helpers";

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

      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        await db.execute(
          "UPDATE user_settings SET shown_workout_properties = $1 WHERE id = $2",
          [workoutPropertyString, userSettings.id]
        );

        const updatedUserSettings = {
          ...userSettings,
          shown_workout_properties: workoutPropertyString,
        };

        setUserSettings(updatedUserSettings);

        if (isInSettingsPage) {
          toast.success("Setting Updated");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const workoutProperties = useMemo(() => ValidWorkoutPropertiesMap(), []);

  return (
    <Dropdown>
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
