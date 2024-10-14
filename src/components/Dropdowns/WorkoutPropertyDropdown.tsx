import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";

type WorkoutPropertyDropdownProps = {
  selectedWorkoutProperties: Set<string>;
  setSelectedWorkoutProperties: React.Dispatch<
    React.SetStateAction<Set<string>>
  >;
};

export const WorkoutPropertyDropdown = ({
  selectedWorkoutProperties,
  setSelectedWorkoutProperties,
}: WorkoutPropertyDropdownProps) => {
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
        onSelectionChange={(keys) =>
          setSelectedWorkoutProperties(keys as Set<string>)
        }
      >
        <DropdownItem key="template">Workout Template</DropdownItem>
        <DropdownItem key="routine">Routine</DropdownItem>
        <DropdownItem key="note">Note</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
