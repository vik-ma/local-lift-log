import { useDisclosure } from "@nextui-org/react";
import { Multiset, WorkoutSet } from "../typings";

type UseMultisetActionsProps = {
  setOperatingMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  setOperatingSet: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  deleteModal: ReturnType<typeof useDisclosure>;
};

export const useMultisetActions = ({
  setOperatingMultiset,
  setOperatingSet,
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
    } else if (key === "delete-set") {
      setOperatingSet(set);
      setOperatingMultiset(multiset);
      deleteModal.onOpen();
    } else if (key === "change-exercise") {
      setOperatingSet(set);
    } else if (key === "reassign-exercise") {
      setOperatingSet(set);
    }
  };

  return { handleMultisetSetOptionSelection };
};
