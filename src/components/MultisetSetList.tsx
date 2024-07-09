import { Reorder } from "framer-motion";
import { Multiset, WorkoutSet } from "../typings";
import { MultisetReorderItem } from "./MultisetReorderItem";

type MultisetSetListProps = {
  multiset: Multiset;
  setMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  handleMultisetSetOptionSelection: (
    key: string,
    set: WorkoutSet,
    multiset: Multiset
  ) => void;
};

export const MultisetSetList = ({
  multiset,
  setMultiset,
  handleMultisetSetOptionSelection,
}: MultisetSetListProps) => {
  return (
    <Reorder.Group
      className={
        multiset.setList.length > 0
          ? "flex flex-col w-full border rounded-lg divide-y overflow-hidden divide-stone-200"
          : "flex flex-col w-full rounded-lg divide-y divide-stone-200"
      }
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
        />
      ))}
    </Reorder.Group>
  );
};
