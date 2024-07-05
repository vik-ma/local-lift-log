import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { VerticalMenuIcon, ChevronIcon } from "../assets";
import { AnimatePresence, motion } from "framer-motion";
import { Multiset, MultisetTypeMap, WorkoutSet } from "../typings";

type MultisetAccordionProps = {
  multisets: Multiset[];
  handleMultisetAccordionClick: (multiset: Multiset, index: number) => void;
  handleMultisetOptionSelection: (key: string, multiset: Multiset) => void;
  multisetTypeMap: MultisetTypeMap;
  handleMultisetSetOptionSelection: (
    key: string,
    set: WorkoutSet,
    multiset: Multiset
  ) => void;
};

export const MultisetAccordion = ({
  multisets,
  handleMultisetAccordionClick,
  handleMultisetOptionSelection,
  multisetTypeMap,
  handleMultisetSetOptionSelection,
}: MultisetAccordionProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {multisets.map((multiset, index) => {
        const multisetTypeText = multisetTypeMap[multiset.multiset_type]
          ? multisetTypeMap[multiset.multiset_type].text
          : "";

        return (
          <div
            key={multiset.id}
            aria-label={`Number ${index + 1} Multiset`}
            className="flex flex-col select-none cursor-pointer gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
            onClick={() => handleMultisetAccordionClick(multiset, index)}
          >
            <div className="flex flex-row justify-between w-full gap-2 items-center">
              <div className="flex flex-col justify-start items-start">
                <span className="w-[19rem] break-words text-left">
                  {multiset.setListText}
                </span>
                <span className="text-xs text-yellow-600 text-left">
                  {multisetTypeText}
                </span>
              </div>
              <div className="flex gap-1 px-0.5 items-center">
                <ChevronIcon
                  size={27}
                  color="#a8a29e"
                  direction={multiset.isExpanded ? "down" : "left"}
                />
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      aria-label={`Toggle Number ${
                        index + 1
                      } Multiset Options Menu`}
                      isIconOnly
                      className="z-1"
                      size="sm"
                      radius="lg"
                      variant="light"
                    >
                      <VerticalMenuIcon size={17} />
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
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    height: { duration: 0.1 },
                    opacity: { duration: 0.05 },
                  }}
                >
                  <div className="flex flex-col divide-y divide-stone-200">
                    {multiset.setList.map((set) => (
                      <div
                        className="flex justify-between items-center"
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
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              aria-label={`Toggle Number ${
                                index + 1
                              } Multiset ${set.exercise_name} Options Menu`}
                              isIconOnly
                              className="z-1"
                              size="sm"
                              variant="light"
                            >
                              <VerticalMenuIcon color="#a8a29e" size={14} />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label={`Option Menu For Number ${
                              index + 1
                            } Multiset ${set.exercise_name} Set`}
                            onAction={(key) =>
                              handleMultisetSetOptionSelection(
                                key as string,
                                set,
                                multiset
                              )
                            }
                          >
                            <DropdownItem key="edit-set">Edit Set</DropdownItem>
                            {set.hasInvalidExerciseId ? (
                              <DropdownItem key="reassign-exercise">
                                Reassign Exercise
                              </DropdownItem>
                            ) : (
                              <DropdownItem key="change-exercise">
                                Change Exercise
                              </DropdownItem>
                            )}
                            <DropdownItem
                              className="text-danger"
                              key="delete-set"
                            >
                              Remove Set
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
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
