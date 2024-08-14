import {
  Button,
  Input,
  ScrollShadow,
  Checkbox,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import { useState } from "react";
import { SetValueInputs } from ".";
import { CommentIcon } from "../assets";
import {
  Exercise,
  WorkoutSet,
  UseSetTrackingInputsReturnType,
  UserSettings,
  UserWeight,
} from "../typings";
import { useNumSetsOptions } from "../hooks";

type SetValueConfigProps = {
  selectedExercise: Exercise;
  operatingSet: WorkoutSet;
  setOperatingSet: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  operationType: string;
  useSetTrackingInputs: UseSetTrackingInputsReturnType;
  userSettings: UserSettings;
  clearSetInputValues: (isOperatingSet: boolean) => void;
  numNewSets?: string;
  setNumNewSets?: React.Dispatch<React.SetStateAction<string>>;
  isMultiset?: boolean;
  numMultisetSets?: number;
  multisetSetTarget?: string;
  setMultisetSetTarget?: React.Dispatch<React.SetStateAction<string>>;
  userWeight?: UserWeight;
  userWeightModal?: ReturnType<typeof useDisclosure>;
};

export const SetValueConfig = ({
  selectedExercise,
  operatingSet,
  setOperatingSet,
  operationType,
  useSetTrackingInputs,
  userSettings,
  clearSetInputValues,
  numNewSets,
  setNumNewSets,
  isMultiset,
  numMultisetSets,
  multisetSetTarget,
  setMultisetSetTarget,
  userWeight,
  userWeightModal,
}: SetValueConfigProps) => {
  const [showDefaultValues, setShowDefaultValues] = useState<boolean>(false);
  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);

  const numSetsOptions = useNumSetsOptions();
  return (
    <div className="flex flex-col gap-2 h-[400px]">
      <div className="flex flex-row items-center justify-between">
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
      <ScrollShadow className="flex flex-col gap-2 h-full">
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
        <h3 className="text-xl font-semibold px-0.5">Track</h3>
        <div className="grid grid-cols-2 gap-1.5 px-1">
          <Checkbox
            color="primary"
            isSelected={operatingSet.is_tracking_weight ? true : false}
            onValueChange={(value) =>
              setOperatingSet((prev) => ({
                ...prev,
                is_tracking_weight: value ? 1 : 0,
              }))
            }
          >
            Weight
          </Checkbox>
          <Checkbox
            color="primary"
            isSelected={operatingSet.is_tracking_reps ? true : false}
            onValueChange={(value) =>
              setOperatingSet((prev) => ({
                ...prev,
                is_tracking_reps: value ? 1 : 0,
              }))
            }
          >
            Reps
          </Checkbox>
          <Checkbox
            color="primary"
            isSelected={operatingSet.is_tracking_distance ? true : false}
            onValueChange={(value) =>
              setOperatingSet((prev) => ({
                ...prev,
                is_tracking_distance: value ? 1 : 0,
              }))
            }
          >
            Distance
          </Checkbox>
          <Checkbox
            color="primary"
            isSelected={operatingSet.is_tracking_time ? true : false}
            onValueChange={(value) =>
              setOperatingSet((prev) => ({
                ...prev,
                is_tracking_time: value ? 1 : 0,
              }))
            }
          >
            Time
          </Checkbox>
          <Checkbox
            color="primary"
            isSelected={operatingSet.is_tracking_rir ? true : false}
            onValueChange={(value) =>
              setOperatingSet((prev) => ({
                ...prev,
                is_tracking_rir: value ? 1 : 0,
              }))
            }
          >
            RIR
          </Checkbox>
          <Checkbox
            color="primary"
            isSelected={operatingSet.is_tracking_rpe ? true : false}
            onValueChange={(value) =>
              setOperatingSet((prev) => ({
                ...prev,
                is_tracking_rpe: value ? 1 : 0,
              }))
            }
          >
            RPE
          </Checkbox>
          <Checkbox
            color="primary"
            isSelected={
              operatingSet.is_tracking_resistance_level ? true : false
            }
            onValueChange={(value) =>
              setOperatingSet((prev) => ({
                ...prev,
                is_tracking_resistance_level: value ? 1 : 0,
              }))
            }
          >
            Resistance Level
          </Checkbox>
          <Checkbox
            color="primary"
            isSelected={operatingSet.is_tracking_partial_reps ? true : false}
            onValueChange={(value) =>
              setOperatingSet((prev) => ({
                ...prev,
                is_tracking_partial_reps: value ? 1 : 0,
              }))
            }
          >
            Partial Reps
          </Checkbox>
          <Checkbox
            color="primary"
            isSelected={operatingSet.is_tracking_user_weight ? true : false}
            onValueChange={(value) =>
              setOperatingSet((prev) => ({
                ...prev,
                is_tracking_user_weight: value ? 1 : 0,
              }))
            }
          >
            User Weight
          </Checkbox>
          <Checkbox
            color="primary"
            isSelected={operatingSet.is_warmup ? true : false}
            onValueChange={(value) =>
              setOperatingSet((prev) => ({
                ...prev,
                is_warmup: value ? 1 : 0,
              }))
            }
          >
            <span className="text-yellow-500">Warmup Set</span>
          </Checkbox>
        </div>
        {(operationType === "add" ||
          operationType === "add-sets-to-multiset") &&
          numNewSets &&
          setNumNewSets && (
            <div className="flex flex-row justify-between">
              <Select
                label="Number Of Sets To Add"
                size="sm"
                variant="faded"
                selectedKeys={[numNewSets]}
                onChange={(e) => setNumNewSets(e.target.value)}
                disallowEmptySelection
              >
                {numSetsOptions.map((num) => (
                  <SelectItem key={num} value={num}>
                    {num}
                  </SelectItem>
                ))}
              </Select>
            </div>
          )}
        <div className="flex gap-4 items-center px-0.5">
          <h3 className="text-xl font-semibold">Default Values</h3>
          <div className="flex flex-grow justify-between">
            <Button
              variant="flat"
              size="sm"
              onPress={() => setShowDefaultValues(!showDefaultValues)}
            >
              {showDefaultValues ? "Hide" : "Show"}
            </Button>
            {showDefaultValues && (
              <Button
                variant="flat"
                size="sm"
                color="danger"
                onPress={() => clearSetInputValues(true)}
              >
                Clear Default Values
              </Button>
            )}
          </div>
        </div>
        {showDefaultValues && (
          <SetValueInputs
            operatingSet={operatingSet}
            setOperatingSet={setOperatingSet}
            useSetTrackingInputs={useSetTrackingInputs}
            userSettings={userSettings}
            userWeight={userWeight}
            userWeightModal={userWeightModal}
          />
        )}
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
                <SelectItem key={num} value={num}>
                  {num}
                </SelectItem>
              ))}
            </Select>
          )}
      </ScrollShadow>
    </div>
  );
};
