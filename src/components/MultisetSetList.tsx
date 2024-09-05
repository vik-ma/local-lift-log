import { Reorder } from "framer-motion";
import { HandleMultisetSetOptionSelectionProps, Multiset } from "../typings";
import { MultisetReorderItem } from "./MultisetReorderItem";
import { useRef } from "react";
import { EmptyListLabel } from "./EmptyListLabel";

type MultisetSetListProps = {
  multiset: Multiset;
  setMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  handleMultisetSetOptionSelection: HandleMultisetSetOptionSelectionProps;
};

export const MultisetSetList = ({
  multiset,
  setMultiset,
  handleMultisetSetOptionSelection,
}: MultisetSetListProps) => {
  const dragConstraintsRef = useRef<HTMLDivElement>(null);

  return (
    <Reorder.Group
      className={
        multiset.setList.length > 0
          ? "flex flex-col w-full border rounded-lg divide-y overflow-hidden divide-stone-200"
          : "flex flex-col w-full rounded-lg divide-y divide-stone-200"
      }
      ref={dragConstraintsRef}
      values={multiset.setList}
      onReorder={(value) =>
        setMultiset((prev) => ({
          ...prev,
          setList: value,
          isEditedInModal: true,
        }))
      }
    >
      {multiset.setList.map((set) => (
        <MultisetReorderItem
          key={set.id}
          multiset={multiset}
          setMultiset={setMultiset}
          set={set}
          handleMultisetSetOptionSelection={handleMultisetSetOptionSelection}
          dragConstraintsRef={dragConstraintsRef}
        />
      ))}
      {multiset.setList.length === 0 && (
        <EmptyListLabel itemName="" customLabel="No Exercises Added" />
      )}
    </Reorder.Group>
  );
};
