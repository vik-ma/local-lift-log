import { Reorder, useDragControls, motion, PanInfo } from "framer-motion";
import {
  HandleMultisetSetOptionSelectionProps,
  Multiset,
  WorkoutSet,
} from "../typings";
import { ReorderIcon } from "../assets";
import { MultisetSetMenu } from "./MultisetSetMenu";
import { useRef } from "react";

type MultisetReorderItemProps = {
  multiset: Multiset;
  set: WorkoutSet;
  index: number;
  handleMultisetSetOptionSelection: HandleMultisetSetOptionSelectionProps;
  dragConstraintsRef: React.RefObject<HTMLDivElement>;
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

  const setNumDragRef = useRef<HTMLDivElement>(null);

  const handleSetNumDragEnd = (info: PanInfo) => {
    const x = info.point.x;
    const y = info.point.y;

    if (!dragConstraintsRef.current) return;

    const targetRect = dragConstraintsRef.current.getBoundingClientRect();

    // Do nothing if dropped outside of dragConstraintsRef
    const isWithinBounds =
      x >= targetRect.left &&
      x <= targetRect.right &&
      y >= targetRect.top &&
      y <= targetRect.bottom;

    if (!isWithinBounds) return;

    const draggedElement = setNumDragRef.current;

    // Temporarily disable pointer event for dragged setNum div
    if (draggedElement) {
      draggedElement.style.pointerEvents = "none";

      // Execute on next frame
      requestAnimationFrame(() => {
        let elementAtDropPoint = document.elementFromPoint(x, y);

        if (!elementAtDropPoint) return;

        // Loop through nearest parent elements until id is found with multiset index
        // Change number if changing layout of elements
        for (let i = 0; i < 4; i++) {
          if (!elementAtDropPoint) break;

          if (
            elementAtDropPoint.id &&
            elementAtDropPoint.id.startsWith("multiset-")
          ) {
            console.log(elementAtDropPoint.id);
            break;
          }

          elementAtDropPoint = elementAtDropPoint.parentElement;
        }

        draggedElement.style.pointerEvents = "";
      });
    }
  };

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
        id={`multiset-${index}`}
      >
        {/* Change number in handleSetNumDragEnd loop if editing layout */}
        <div className="flex justify-between gap-1 items-center w-full max-w-[19rem]">
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
                ref={setNumDragRef}
                className="w-[4rem] text-center py-0.5 text-yellow-600 bg-stone-100 rounded-lg cursor-grab hover:bg-stone-200 hover:text-stone-600 active:cursor-grabbing active:bg-stone-200 active:text-stone-600"
                drag="y"
                dragSnapToOrigin
                dragConstraints={dragConstraintsRef}
                dragControls={setNumDragControls}
                dragElastic={0}
                onDragEnd={(_, info) => handleSetNumDragEnd(info)}
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
