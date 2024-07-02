import { Multiset } from "../typings";

type MultisetSetListProps = {
  multiset: Multiset;
};

export const MultisetSetList = ({ multiset }: MultisetSetListProps) => {
  return (
    <div
      className={
        multiset.setList.length > 0
          ? "flex flex-col w-full border rounded-lg divide-y divide-stone-200"
          : "flex flex-col w-full rounded-lg divide-y divide-stone-200"
      }
    >
      {multiset.setList.map((set, index) => (
        <div
          className="flex justify-between items-center px-2 py-1 font-medium hover:bg-stone-100"
          key={`multiset-set-${index}`}
        >
          <span className="text-stone-500 truncate w-[18rem]">
            {set.exercise_name}
          </span>
        </div>
      ))}
    </div>
  );
};
