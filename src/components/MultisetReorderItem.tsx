import { Reorder, useDragControls, motion, PanInfo } from "framer-motion";
import {
  HandleMultisetSetOptionSelectionProps,
  Multiset,
  WorkoutSet,
} from "../typings";
import { ReorderIcon } from "../assets";
import { MultisetSetMenu } from "./MultisetSetMenu";
import { useMemo, useRef, useState } from "react";
import { IsNumberValidId, ValidateNewSetIndexTarget } from "../helpers";

type MultisetReorderItemProps = {
  multiset: Multiset;
  setMultiset: React.Dispatch<React.SetStateAction<Multiset>>;
  set: WorkoutSet;
  handleMultisetSetOptionSelection: HandleMultisetSetOptionSelectionProps;
  dragConstraintsRef: React.RefObject<HTMLDivElement>;
};

export const MultisetReorderItem = ({
  multiset,
  setMultiset,
  set,
  handleMultisetSetOptionSelection,
  dragConstraintsRef,
}: MultisetReorderItemProps) => {
  const [isDraggingSetNum, setIsDraggingSetNum] = useState<boolean>(false);

  const exerciseDragControls = useDragControls();
  const setNumDragControls = useDragControls();

  const index = useMemo(() => {
    return multiset.setList.findIndex(
      (multisetSet) => multisetSet.id === set.id
    );
  }, [multiset.setList, set.id]);

  const setNum = multiset?.setListIndexCutoffs?.get(index);

  const setNumDragRef = useRef<HTMLDivElement>(null);

  const multisetId = `multiset-${index}`;

  const handleSetNumDragEnd = (info: PanInfo, setNum: number) => {
    const x = info.point.x;
    const y = info.point.y;

    setIsDraggingSetNum(false);

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
      draggedElement.style.opacity = "0";

      // Execute on next frame
      requestAnimationFrame(() => {
        let elementAtDropPoint = document.elementFromPoint(x, y);

        // Loop through nearest parent elements until id is found with multiset index
        // Change number if changing layout of elements
        for (let i = 0; i < 4; i++) {
          if (!elementAtDropPoint) break;

          if (
            elementAtDropPoint.id &&
            elementAtDropPoint.id.startsWith("multiset-")
          ) {
            setNewSetIndexCutoff(elementAtDropPoint.id, setNum, draggedElement);
            break;
          }

          elementAtDropPoint = elementAtDropPoint.parentElement;
        }

        draggedElement.style.pointerEvents = "";
      });
    }
  };

  const setNewSetIndexCutoff = (
    id: string,
    setNum: number,
    draggedElement: HTMLDivElement
  ) => {
    if (id === multisetId || multiset.setListIndexCutoffs === undefined) {
      resetDraggedElement(draggedElement);
      return;
    }

    const newTargetIndex = Number(id.split("-")[1]);

    if (
      isNaN(newTargetIndex) ||
      !IsNumberValidId(newTargetIndex) ||
      newTargetIndex >= multiset.setList.length
    ) {
      resetDraggedElement(draggedElement);
      return;
    }

    const isValid = ValidateNewSetIndexTarget(
      newTargetIndex,
      setNum,
      multiset.setListIndexCutoffs
    );

    if (!isValid) {
      resetDraggedElement(draggedElement);
      return;
    }

    // updateSetIndexCutoffs(index, newTargetIndex, setNum);
  };

  const resetDraggedElement = (draggedElement: HTMLDivElement) => {
    draggedElement.style.opacity = "1";
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
        id={multisetId}
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
                className={`w-[4rem] text-center py-0.5 select-none text-yellow-600 bg-stone-100 rounded-lg hover:bg-stone-200 hover:text-stone-600 active:bg-stone-200 active:text-stone-600 ${
                  isDraggingSetNum ? "pointer-events-none" : ""
                } ${setNum !== 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
                dragListener={setNum === 1 ? false : true}
                drag="y"
                dragSnapToOrigin
                dragConstraints={dragConstraintsRef}
                dragControls={setNumDragControls}
                dragElastic={0}
                onDragStart={() => setIsDraggingSetNum(true)}
                onDragEnd={(_, info) => handleSetNumDragEnd(info, setNum)}
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
