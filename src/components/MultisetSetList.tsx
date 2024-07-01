import { Multiset } from "../typings";

type MultisetSetListProps = {
  multiset: Multiset;
};

export const MultisetSetList = ({ multiset }: MultisetSetListProps) => {
  return (
    <div className="flex flex-col w-full border rounded-lg divide-y divide-stone-200">
      {multiset.setList.map((set) => (
        <div className="flex justify-between items-center px-2 py-1 font-medium hover:bg-stone-100">
          <span className="text-stone-600">{set.exercise_name}</span>
        </div>
      ))}
    </div>
  );
};
