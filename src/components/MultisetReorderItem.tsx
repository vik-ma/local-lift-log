import { Reorder, useDragControls, motion } from "framer-motion";
import {
  HandleMultisetSetOptionSelectionProps,
  Multiset,
  WorkoutSet,
} from "../typings";
import { ReorderIcon } from "../assets";
import { MultisetSetMenu } from "./MultisetSetMenu";

type MultisetReorderItemProps = {
  multiset: Multiset;
  set: WorkoutSet;
  index: number;
  handleMultisetSetOptionSelection: HandleMultisetSetOptionSelectionProps;
  dragConstraintsRef: React.MutableRefObject<null>;
};

export const MultisetReorderItem = ({
  multiset,
  set,
  index,
  handleMultisetSetOptionSelection,
  dragConstraintsRef,
}: MultisetReorderItemProps) => {
  const dragControls = useDragControls();

  const setNum = multiset?.setListIndexCutoffs?.get(index);

  return (
    <Reorder.Item value={set} dragListener={false} dragControls={dragControls}>
      <div
        className={
          set.id < 0
            ? "flex justify-between gap-1 items-center px-2 py-1 font-medium bg-yellow-50 hover:bg-stone-100"
            : "flex justify-between gap-1 items-center px-2 py-1 font-medium hover:bg-stone-100"
        }
      >
        <span
          className={
            set.hasInvalidExerciseId
              ? "text-red-700"
              : "text-stone-500 truncate"
          }
        >
          {set.exercise_name}
        </span>
        {setNum && (
          <motion.div
            className="w-[7rem] text-yellow-600"
            drag="y"
            dragSnapToOrigin
            dragConstraints={dragConstraintsRef}
            dragControls={dragControls}
            dragElastic={0}
          >
            Set {setNum}
          </motion.div>
        )}
        <div className="flex gap-2 items-center">
          {set.id < 0 && (
            <span className="text-yellow-500 truncate">(NEW)</span>
          )}
          <MultisetSetMenu
            multiset={multiset}
            set={set}
            index={index}
            handleMultisetSetOptionSelection={handleMultisetSetOptionSelection}
            verticalMenuIconSize={18}
            isInModal={true}
          />
          <ReorderIcon dragControls={dragControls} size={18} color="#c4c4c4" />
        </div>
      </div>
    </Reorder.Item>
  );
};
