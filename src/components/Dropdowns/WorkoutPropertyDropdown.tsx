import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import Database from "tauri-plugin-sql-api";
import { UserSettings } from "../../typings";

type WorkoutPropertyDropdownProps = {
  selectedWorkoutProperties: Set<string>;
  setSelectedWorkoutProperties: React.Dispatch<
    React.SetStateAction<Set<string>>
  >;
  userSettings: UserSettings;
};

export const WorkoutPropertyDropdown = ({
  selectedWorkoutProperties,
  setSelectedWorkoutProperties,
  userSettings,
}: WorkoutPropertyDropdownProps) => {
  const handleChange = async (keys: Set<string>) => {
    const workoutPropertyString = Array.from(keys).join(",");

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE user_settings SET shown_workout_properties = $1 WHERE id = $2",
        [workoutPropertyString, userSettings.id]
      );

      setSelectedWorkoutProperties(keys);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dropdown>
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
        disallowEmptySelection
        selectionMode="multiple"
        selectedKeys={selectedWorkoutProperties}
        onSelectionChange={(keys) => handleChange(keys as Set<string>)}
      >
        <DropdownItem key="template">Workout Template</DropdownItem>
        <DropdownItem key="routine">Routine</DropdownItem>
        <DropdownItem key="note">Note</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
