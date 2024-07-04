import { Reorder } from "framer-motion";
import { Multiset } from "../typings";
import { MultisetReorderItem } from "./MultisetReorderItem";

type MultisetSetListProps = {
  multiset: Multiset;
  setMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
};

export const MultisetSetList = ({
  multiset,
  setMultiset,
}: MultisetSetListProps) => {
  return (
    <Reorder.Group
      className={
        multiset.setList.length > 0
          ? "flex flex-col w-full border rounded-lg divide-y divide-stone-200"
          : "flex flex-col w-full rounded-lg divide-y divide-stone-200"
      }
      values={multiset.setList}
      onReorder={(value) =>
        setMultiset((prev) => ({ ...prev, setList: value }))
      }
    >
      {multiset.setList.map((set) => (
        <MultisetReorderItem set={set} key={set.id} />
      ))}
    </Reorder.Group>
  );
};
