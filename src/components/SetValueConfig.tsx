import {
  Button,
  Input,
  ScrollShadow,
  Checkbox,
  Select,
  SelectItem,
} from "@heroui/react";
import { useMemo, useState } from "react";
import { SetValueInputs } from ".";
import { ChevronIcon, CommentIcon } from "../assets";
import {
  Exercise,
  WorkoutSet,
  UseSetTrackingInputsReturnType,
  UserSettings,
  UserWeight,
  UseDisclosureReturnType,
} from "../typings";
import { AnimatePresence, motion } from "framer-motion";

type SetValueConfigProps = {
  selectedExercise: Exercise;
  operatingSet: WorkoutSet;
  setOperatingSet: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  operationType: string;
  useSetTrackingInputs: UseSetTrackingInputsReturnType;
  userSettings: UserSettings;
  resetSetInputValues: (isOperatingSet: boolean) => void;
  openCalculationModal: (
    isWeight: boolean,
    exercise: Exercise,
    isActiveSet: boolean,
    setInputs: UseSetTrackingInputsReturnType,
    set: WorkoutSet
  ) => Promise<void>;
  isMultiset?: boolean;
  numMultisetSets?: number;
  multisetSetTarget?: string;
  setMultisetSetTarget?: React.Dispatch<React.SetStateAction<string>>;
  userWeight?: UserWeight;
  userWeightModal?: UseDisclosureReturnType;
};

export const SetValueConfig = ({
  selectedExercise,
  operatingSet,
  setOperatingSet,
  operationType,
  useSetTrackingInputs,
  userSettings,
  resetSetInputValues,
  openCalculationModal,
  isMultiset,
  numMultisetSets,
  multisetSetTarget,
  setMultisetSetTarget,
  userWeight,
  userWeightModal,
}: SetValueConfigProps) => {
  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);
  const [isValuesAccordionExpanded, setIsValuesAccordionExpanded] =
    useState<boolean>(false);

  const { isSetEdited, setIsSetEdited } = useSetTrackingInputs;

  const isSetCompleted = useMemo(() => {
    if (operatingSet.is_completed === 1) return true;

    return false;
  }, [operatingSet.is_completed]);

  const handleTrackingCheckboxClick = (value: boolean, key: string) => {
    const updatedSet = { ...operatingSet };
    const numValue = value ? 1 : 0;

    switch (key) {
      case "weight": {
        updatedSet.is_tracking_weight = numValue;
        break;
      }
      case "reps": {
        updatedSet.is_tracking_reps = numValue;
        break;
      }
      case "distance": {
        updatedSet.is_tracking_distance = numValue;
        break;
      }
      case "time": {
        updatedSet.is_tracking_time = numValue;
        break;
      }
      case "rir": {
        updatedSet.is_tracking_rir = numValue;
        break;
      }
      case "rpe": {
        updatedSet.is_tracking_rpe = numValue;
        break;
      }
      case "resistance_level": {
        updatedSet.is_tracking_resistance_level = numValue;
        break;
      }
      case "partial_reps": {
        updatedSet.is_tracking_partial_reps = numValue;
        break;
      }
      case "user_weight": {
        updatedSet.is_tracking_user_weight = numValue;
        break;
      }
      case "warmup": {
        updatedSet.is_warmup = numValue;
        break;
      }
      default:
        break;
    }

    setOperatingSet(updatedSet);
    if (!isSetEdited) setIsSetEdited(true);
  };

  return (
    <div className="flex flex-col gap-1 h-[400px]">
      <div className="flex items-center justify-between">
        <h2 className="flex text-2xl font-semibold justify-between w-full items-end">
          <div className="flex gap-1 max-w-[21rem]">
            <span className="text-yellow-500 truncate">
              {selectedExercise.name}
            </span>
            <Button
              aria-label="Toggle Set Note Input"
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => setShowNoteInput((prev) => !prev)}
            >
              <CommentIcon size={21} />
            </Button>
          </div>
          {operationType === "edit" && !isMultiset && (
            <span className="text-lg text-stone-500">
              Set {operatingSet.set_index! + 1}
            </span>
          )}
        </h2>
      </div>
      <ScrollShadow className="pb-1.5">
        <div className="flex flex-col gap-2 w-[24rem]">
          {showNoteInput && (
            <Input
              value={operatingSet.note ?? ""}
              label="Note"
              variant="faded"
              size="sm"
              onValueChange={(value) =>
                setOperatingSet((prev) => ({
                  ...prev,
                  note: value,
                }))
              }
              isClearable
            />
          )}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center h-8">
              <h3 className="text-xl font-semibold px-0.5">Track</h3>
              {isSetEdited && (
                <div className="px-0.5">
                  <Button
                    variant="flat"
                    size="sm"
                    color="danger"
                    onPress={() => resetSetInputValues(true)}
                  >
                    Reset
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1 px-1">
              <div className="w-[11rem]">
                <Checkbox
                  className="hover:underline w-full min-w-full"
                  color="primary"
                  isSelected={operatingSet.is_tracking_weight ? true : false}
                  onValueChange={(value) =>
                    handleTrackingCheckboxClick(value, "weight")
                  }
                >
                  Weight
                </Checkbox>
              </div>
              <div className="w-[9rem]">
                <Checkbox
                  className="hover:underline w-full min-w-full"
                  color="primary"
                  isSelected={operatingSet.is_tracking_reps ? true : false}
                  onValueChange={(value) =>
                    handleTrackingCheckboxClick(value, "reps")
                  }
                >
                  Reps
                </Checkbox>
              </div>
              <div className="w-[11rem]">
                <Checkbox
                  className="hover:underline w-full min-w-full"
                  color="primary"
                  isSelected={operatingSet.is_tracking_distance ? true : false}
                  onValueChange={(value) =>
                    handleTrackingCheckboxClick(value, "distance")
                  }
                >
                  Distance
                </Checkbox>
              </div>
              <div className="w-[9rem]">
                <Checkbox
                  className="hover:underline w-full min-w-full"
                  color="primary"
                  isSelected={operatingSet.is_tracking_time ? true : false}
                  onValueChange={(value) =>
                    handleTrackingCheckboxClick(value, "time")
                  }
                >
                  Time
                </Checkbox>
              </div>
              <div className="w-[11rem]">
                <Checkbox
                  className="hover:underline w-full min-w-full"
                  color="primary"
                  isSelected={operatingSet.is_tracking_rir ? true : false}
                  onValueChange={(value) =>
                    handleTrackingCheckboxClick(value, "rir")
                  }
                >
                  RIR
                </Checkbox>
              </div>
              <div className="w-[9rem]">
                <Checkbox
                  className="hover:underline w-full min-w-full"
                  color="primary"
                  isSelected={operatingSet.is_tracking_rpe ? true : false}
                  onValueChange={(value) =>
                    handleTrackingCheckboxClick(value, "rpe")
                  }
                >
                  RPE
                </Checkbox>
              </div>
              <div className="w-[11rem]">
                <Checkbox
                  className="hover:underline w-full min-w-full"
                  color="primary"
                  isSelected={
                    operatingSet.is_tracking_resistance_level ? true : false
                  }
                  onValueChange={(value) =>
                    handleTrackingCheckboxClick(value, "resistance_level")
                  }
                >
                  Resistance Level
                </Checkbox>
              </div>
              <div className="w-[9rem]">
                <Checkbox
                  className="hover:underline w-full min-w-full"
                  color="primary"
                  isSelected={
                    operatingSet.is_tracking_partial_reps ? true : false
                  }
                  onValueChange={(value) =>
                    handleTrackingCheckboxClick(value, "partial_reps")
                  }
                >
                  Partial Reps
                </Checkbox>
              </div>
              <div className="w-[11rem]">
                <Checkbox
                  className="hover:underline w-full min-w-full"
                  color="primary"
                  isSelected={
                    operatingSet.is_tracking_user_weight ? true : false
                  }
                  onValueChange={(value) =>
                    handleTrackingCheckboxClick(value, "user_weight")
                  }
                >
                  User Weight
                </Checkbox>
              </div>
              <div className="w-[9rem]">
                <Checkbox
                  className="hover:underline w-full min-w-full"
                  color="primary"
                  isSelected={operatingSet.is_warmup ? true : false}
                  onValueChange={(value) =>
                    handleTrackingCheckboxClick(value, "warmup")
                  }
                >
                  <span className="text-yellow-500">Warmup Set</span>
                </Checkbox>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div
              aria-label="Set Values Accordion"
              className="flex flex-col select-none cursor-pointer px-0.5"
            >
              <div
                className="flex relative cursor-pointer pb-1"
                onClick={() =>
                  setIsValuesAccordionExpanded(!isValuesAccordionExpanded)
                }
              >
                <h3 className="text-xl font-semibold">
                  {isSetCompleted ? "Completed Values" : "Default Values"}
                </h3>
                <div className="absolute top-0 right-0">
                  <ChevronIcon
                    size={31}
                    color="#505050"
                    direction={isValuesAccordionExpanded ? "down" : "left"}
                  />
                </div>
              </div>
            </div>
            <AnimatePresence>
              {isValuesAccordionExpanded && (
                <motion.div
                  initial={{ height: 0, overflow: "hidden" }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0, overflow: "hidden" }}
                  transition={{
                    height: { duration: 0.07 },
                  }}
                >
                  <SetValueInputs
                    operatingSet={operatingSet}
                    setOperatingSet={setOperatingSet}
                    useSetTrackingInputs={useSetTrackingInputs}
                    userSettings={userSettings}
                    userWeight={userWeight}
                    userWeightModal={userWeightModal}
                    exercise={selectedExercise}
                    isActiveSet={false}
                    openCalculationModal={openCalculationModal}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {operationType === "add-sets-to-multiset" &&
            numMultisetSets &&
            multisetSetTarget &&
            setMultisetSetTarget && (
              <Select
                label="Add To Multiset Set"
                size="sm"
                variant="faded"
                selectedKeys={[multisetSetTarget]}
                onChange={(e) => setMultisetSetTarget(e.target.value)}
                disallowEmptySelection
              >
                {Array.from({ length: numMultisetSets }, (_, i) =>
                  (i + 1).toString()
                ).map((num) => (
                  <SelectItem key={num}>{num}</SelectItem>
                ))}
              </Select>
            )}
        </div>
      </ScrollShadow>
    </div>
  );
};
