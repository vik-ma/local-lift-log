import { useDisclosure } from "@nextui-org/react";
import { Multiset, WorkoutSet, MultisetOperationType } from "../typings";

type UseMultisetActionsProps = {
  setOperatingMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  setOperatingSet: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  setOperationType: React.Dispatch<React.SetStateAction<MultisetOperationType>>;
  deleteModal: ReturnType<typeof useDisclosure>;
};

export const useMultisetActions = ({
  setOperatingMultiset,
  setOperatingSet,
  setOperationType,
  deleteModal,
}: UseMultisetActionsProps) => {
  const handleMultisetSetOptionSelection = (
    key: string,
    set: WorkoutSet,
    multiset: Multiset
  ) => {
    if (key === "edit-set") {
      setOperatingSet(set);
      setOperatingMultiset(multiset);
      setOperationType("edit-set");
    } else if (key === "delete-set") {
      setOperatingSet(set);
      setOperatingMultiset(multiset);
      setOperationType("delete-set");
      deleteModal.onOpen();
    } else if (key === "change-exercise") {
      setOperatingSet(set);
      setOperationType("change-exercise");
    } else if (key === "reassign-exercise") {
      setOperatingSet(set);
      setOperationType("reassign-exercise");
    }
  };

  return { handleMultisetSetOptionSelection };
};
