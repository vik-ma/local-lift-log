import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { VerticalMenuIcon, ChevronIcon } from "../assets";
import { AnimatePresence, motion } from "framer-motion";
import { Multiset, UseMultisetActionsReturnType } from "../typings";
import { MultisetSetMenu } from ".";

type MultisetAccordionsProps = {
  useMultisetActions: UseMultisetActionsReturnType;
  handleMultisetAccordionsClick: (multiset: Multiset, index: number) => void;
  handleMultisetOptionSelection: (key: string, multiset: Multiset) => void;
};

export const MultisetAccordions = ({
  useMultisetActions,
  handleMultisetAccordionsClick,
  handleMultisetOptionSelection,
}: MultisetAccordionsProps) => {
  const {
    filteredMultisets,
    multisetTypeMap,
    handleMultisetSetOptionSelection,
  } = useMultisetActions;

  return (
    <div className="flex flex-col gap-1 w-full">
      {filteredMultisets.map((multiset, index) => {
        const multisetTypeText =
          multisetTypeMap.get(multiset.multiset_type) ?? "";

        return (
          <div
            key={multiset.id}
            aria-label={`Number ${index + 1} Multiset`}
            className="flex flex-col select-none cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
            onClick={() => handleMultisetAccordionsClick(multiset, index)}
          >
            <div className="flex justify-between items-center pl-2 py-1">
              <div className="flex flex-col items-start">
                <span className="w-[19rem] break-words text-left">
                  {multiset.setListText}
                </span>
                <span className="text-xs text-secondary text-left">
                  {multisetTypeText}
                </span>
                <span className="w-[19rem] break-all text-xs text-stone-400 text-left">
                  {multiset.note}
                </span>
              </div>
              <div className="flex gap-0.5 pr-1 items-center">
                <ChevronIcon
                  size={29}
                  color="#a8a29e"
                  direction={multiset.isExpanded ? "down" : "left"}
                />
                <Dropdown shouldBlockScroll={false}>
                  <DropdownTrigger>
                    <Button
                      aria-label={`Toggle Number ${
                        index + 1
                      } Multiset Options Menu`}
                      isIconOnly
                      className="z-1"
                      radius="lg"
                      variant="light"
                    >
                      <VerticalMenuIcon size={19} color="#888" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label={`Option Menu For Number ${index + 1} Multiset`}
                    onAction={(key) =>
                      handleMultisetOptionSelection(key as string, multiset)
                    }
                  >
                    <DropdownItem key="edit">Edit</DropdownItem>
                    <DropdownItem key="delete" className="text-danger">
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
            <AnimatePresence>
              {multiset.isExpanded && (
                <motion.div
                  initial={{ height: 0, overflow: "hidden" }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0, overflow: "hidden" }}
                  transition={{
                    height: { duration: 0.07 },
                  }}
                >
                  <div className="flex flex-col divide-y divide-stone-200">
                    {multiset.setList.map((set) => (
                      <div
                        className="flex justify-between items-center px-2"
                        key={set.id}
                      >
                        <span
                          className={
                            set.hasInvalidExerciseId
                              ? "text-red-700"
                              : "text-stone-600 truncate max-w-[22rem]"
                          }
                        >
                          {set.exercise_name}
                        </span>
                        <MultisetSetMenu
                          multiset={multiset}
                          set={set}
                          index={index}
                          handleMultisetSetOptionSelection={
                            handleMultisetSetOptionSelection
                          }
                          verticalMenuIconSize={14}
                          isInModal={false}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
