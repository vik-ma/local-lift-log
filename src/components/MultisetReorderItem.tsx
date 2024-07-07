import { Reorder, useDragControls } from "framer-motion";
import { Multiset, WorkoutSet } from "../typings";
import { ReorderIcon } from "../assets";
import { MultisetSetMenu } from "./MultisetSetMenu";

type MultisetReorderItemProps = {
  multiset: Multiset;
  set: WorkoutSet;
  index: number;
  handleMultisetSetOptionSelection: (
    key: string,
    set: WorkoutSet,
    multiset: Multiset
  ) => void;
};

export const MultisetReorderItem = ({
  multiset,
  set,
  index,
  handleMultisetSetOptionSelection,
}: MultisetReorderItemProps) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item value={set} dragListener={false} dragControls={dragControls}>
      <div className="flex justify-between items-center px-2 py-1 font-medium hover:bg-stone-100">
        <span
          className={
            set.hasInvalidExerciseId
              ? "text-red-700"
              : "text-stone-500 truncate max-w-[20rem]"
          }
        >
          {set.exercise_name}
        </span>
        <div className="flex gap-2 items-center">
          <MultisetSetMenu
            multiset={multiset}
            set={set}
            index={index}
            handleMultisetSetOptionSelection={handleMultisetSetOptionSelection}
            verticalMenuIconSize={18}
          />
          <ReorderIcon dragControls={dragControls} size={18} color="#c4c4c4" />
        </div>
      </div>
    </Reorder.Item>
  );
};