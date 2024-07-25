import { Reorder } from "framer-motion";
import { HandleMultisetSetOptionSelectionProps, Multiset } from "../typings";
import { MultisetReorderItem } from "./MultisetReorderItem";
import { useRef } from "react";

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
  const dragConstraintsRef = useRef(null);

  const indexRefs = useRef<Array<{ index: number } | null>>([]);

  if (indexRefs.current.length !== multiset.setList.length) {
    indexRefs.current = multiset.setList.map((_, index) => ({ index }));
  }

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
        setMultiset((prev) => ({ ...prev, setList: value }))
      }
    >
      {multiset.setList.map((set, index) => (
        <MultisetReorderItem
          key={set.id}
          multiset={multiset}
          set={set}
          index={index}
          handleMultisetSetOptionSelection={handleMultisetSetOptionSelection}
          dragConstraintsRef={dragConstraintsRef}
          indexRef={() => indexRefs.current[index]}
        />
      ))}
      {multiset.setList.length === 0 && (
        <div className="flex justify-center text-stone-500 py-2">
          No Exercises Added
        </div>
      )}
    </Reorder.Group>
  );
};
