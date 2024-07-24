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
  const exerciseDragControls = useDragControls();
  const setNumDragControls = useDragControls();

  const setNum = multiset?.setListIndexCutoffs?.get(index);

  return (
    <Reorder.Item
      value={set}
      dragListener={false}
      dragControls={exerciseDragControls}
    >
      <div
        className={
          set.id < 0
            ? "flex justify-between items-center px-2 py-1 font-medium bg-yellow-50 hover:bg-stone-100"
            : "flex justify-between items-center px-2 py-1 font-medium hover:bg-stone-100"
        }
      >
        <div className="flex justify-between gap-1 items-center max-w-[19rem]">
          <span
            className={
              set.hasInvalidExerciseId
                ? "text-red-700"
                : "text-stone-500 truncate"
            }
          >
            {set.exercise_name}
          </span>
          <div className="flex justify-between items-center gap-1">
            {set.id < 0 && (
              <span className="text-yellow-500 flex-grow">(NEW)</span>
            )}
            {setNum && (
              <motion.div
                className="w-[4rem] text-center py-0.5 text-yellow-600 bg-stone-100 rounded-lg cursor-grab hover:bg-stone-200 hover:text-stone-600 active:cursor-grabbing active:bg-stone-200 active:text-stone-600"
                drag="y"
                dragSnapToOrigin
                dragConstraints={dragConstraintsRef}
                dragControls={setNumDragControls}
                dragElastic={0}
              >
                Set {setNum}
              </motion.div>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <MultisetSetMenu
            multiset={multiset}
            set={set}
            index={index}
            handleMultisetSetOptionSelection={handleMultisetSetOptionSelection}
            verticalMenuIconSize={18}
            isInModal={true}
          />
          <ReorderIcon
            dragControls={exerciseDragControls}
            size={18}
            color="#c4c4c4"
          />
        </div>
      </div>
    </Reorder.Item>
  );
};
