import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { VerticalMenuIcon } from "../assets";
import {
  HandleMultisetSetOptionSelectionProps,
  Multiset,
  WorkoutSet,
} from "../typings";

type MultisetMenuProps = {
  multiset: Multiset;
  set: WorkoutSet;
  index: number;
  handleMultisetSetOptionSelection: HandleMultisetSetOptionSelectionProps;
  verticalMenuIconSize: number;
  isInModal: boolean;
};

export const MultisetSetMenu = ({
  multiset,
  set,
  index,
  handleMultisetSetOptionSelection,
  verticalMenuIconSize,
  isInModal,
}: MultisetMenuProps) => {
  const hasSetNum = multiset.setListIndexCutoffs ? true : false;

  const setNum = multiset.setListIndexCutoffs?.get(index);

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
          <VerticalMenuIcon color="#a8a29e" size={verticalMenuIconSize} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={`Option Menu For Number ${index + 1} Multiset ${
          set.exercise_name
        } Set`}
        onAction={(key) =>
          handleMultisetSetOptionSelection(
            key as string,
            set,
            multiset,
            isInModal
          )
        }
      >
        <DropdownItem
          className={set.hasInvalidExerciseId || set.id < 0 ? "hidden" : ""}
          key="edit-set"
        >
          Edit Set
        </DropdownItem>
        {setNum ? (
          <DropdownItem
            className={!hasSetNum ? "hidden" : ""}
            key="remove-set-cutoff"
          >
            Remove Set Cutoff
          </DropdownItem>
        ) : (
          <DropdownItem
            className={!hasSetNum ? "hidden" : ""}
            key="add-set-cutoff"
          >
            Insert Set Cutoff
          </DropdownItem>
        )}
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
