import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { VerticalMenuIcon } from "../assets";
import { Multiset, WorkoutSet } from "../typings";

type MultisetMenuProps = {
  multiset: Multiset;
  set: WorkoutSet;
  index: number;
  handleMultisetSetOptionSelection: (
    key: string,
    set: WorkoutSet,
    multiset: Multiset
  ) => void;
  verticalMenuIconSize: number;
};

export const MultisetSetMenu = ({
  multiset,
  set,
  index,
  handleMultisetSetOptionSelection,
  verticalMenuIconSize,
}: MultisetMenuProps) => {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          aria-label={`Toggle Number ${index + 1} Multiset ${
            set.exercise_name
          } Options Menu`}
          isIconOnly
          className="z-1"
          radius="lg"
          size="sm"
          variant="light"
        >
          <VerticalMenuIcon color="#bbb" size={verticalMenuIconSize} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={`Option Menu For Number ${index + 1} Multiset ${
          set.exercise_name
        } Set`}
        onAction={(key) =>
          handleMultisetSetOptionSelection(key as string, set, multiset)
        }
      >
        <DropdownItem key="edit-set">Edit Set</DropdownItem>
        {set.hasInvalidExerciseId ? (
          <DropdownItem key="reassign-exercise">Reassign Exercise</DropdownItem>
        ) : (
          <DropdownItem key="change-exercise">Change Exercise</DropdownItem>
        )}
        <DropdownItem className="text-danger" key="delete-set">
          Remove Set
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
