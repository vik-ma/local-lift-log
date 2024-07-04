import { Reorder, useDragControls } from "framer-motion";
import { WorkoutSet } from "../typings";
import { ReorderIcon } from "../assets";

type MultisetReorderItemProps = {
  set: WorkoutSet;
};

export const MultisetReorderItem = ({ set }: MultisetReorderItemProps) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item value={set} dragListener={false} dragControls={dragControls}>
      <div className="flex justify-between items-center px-2 py-1 font-medium hover:bg-stone-100">
        <span
          className={
            set.hasInvalidExerciseId
              ? "text-red-700"
              : "text-stone-500 truncate max-w-[18rem]"
          }
        >
          {set.exercise_name}
        </span>
        <ReorderIcon dragControls={dragControls} size={18} />
      </div>
    </Reorder.Item>
  );
};
