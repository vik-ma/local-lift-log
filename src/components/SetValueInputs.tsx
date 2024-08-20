import {
  WorkoutSet,
  SetWorkoutSetAction,
  UseSetTrackingInputsReturnType,
  UserSettings,
  UserWeight,
  SetTrackingValues,
} from "../typings";
import { WeightUnitDropdown, DistanceUnitDropdown, TimeInput } from ".";
import { Button, Input, useDisclosure } from "@nextui-org/react";
import { MinusIcon, PlusIcon } from "../assets";
import {
  ConvertInputStringToNumber,
  ShouldSetTrackingValueButtonBeDisabled,
} from "../helpers";
import { useMemo } from "react";

type SetValueInputsProps = {
  operatingSet: WorkoutSet;
  setOperatingSet: SetWorkoutSetAction;
  useSetTrackingInputs: UseSetTrackingInputsReturnType;
  userSettings: UserSettings;
  userWeight?: UserWeight;
  userWeightModal?: ReturnType<typeof useDisclosure>;
  populateUserWeightValues?: () => void;
  isUserWeightOlderThanOneWeek?: boolean;
};

type DisableUpdateValueButtonsMapType = {
  weight: { decrease: boolean };
  reps: { decrease: boolean };
  rir: { decrease: boolean };
  rpe: { decrease: boolean; increase: boolean };
  distance: { decrease: boolean };
  time: { decrease: boolean };
  resistance_level: { decrease: boolean };
  partial_reps: { decrease: boolean };
  user_weight: { decrease: boolean };
};

export const SetValueInputs = ({
  operatingSet,
  setOperatingSet,
  useSetTrackingInputs,
  userSettings,
  userWeight,
  userWeightModal,
  populateUserWeightValues,
  isUserWeightOlderThanOneWeek,
}: SetValueInputsProps) => {
  const {
    setTrackingValuesInput,
    setSetTrackingValuesInput,
    setInputsInvalidityMap,
    isTimeInputInvalid,
    setIsTimeInputInvalid,
  } = useSetTrackingInputs;

  const handleUserWeightButton = () => {
    if (
      userWeight === undefined ||
      userWeightModal === undefined ||
      populateUserWeightValues === undefined
    )
      return;

    if (userWeight.id === 0) {
      userWeightModal.onOpen();
    } else {
      populateUserWeightValues();
    }
  };

  const disableUpdateValueButtonsMap = useMemo(() => {
    const values: DisableUpdateValueButtonsMapType = {
      weight: {
        decrease: ShouldSetTrackingValueButtonBeDisabled(
          setTrackingValuesInput.weight,
          setInputsInvalidityMap.weight,
          false,
          userSettings.default_increment_weight
        ),
      },
      reps: {
        decrease: ShouldSetTrackingValueButtonBeDisabled(
          setTrackingValuesInput.reps,
          setInputsInvalidityMap.reps,
          false,
          1
        ),
      },
      rir: {
        decrease: ShouldSetTrackingValueButtonBeDisabled(
          setTrackingValuesInput.rir,
          setInputsInvalidityMap.rir,
          false,
          1,
          undefined,
          -1
        ),
      },
      rpe: {
        decrease: ShouldSetTrackingValueButtonBeDisabled(
          setTrackingValuesInput.rpe,
          setInputsInvalidityMap.rpe,
          false,
          1,
          10,
          1
        ),
        increase: ShouldSetTrackingValueButtonBeDisabled(
          setTrackingValuesInput.rpe,
          setInputsInvalidityMap.rpe,
          true,
          1,
          10,
          1
        ),
      },
      distance: {
        decrease: ShouldSetTrackingValueButtonBeDisabled(
          setTrackingValuesInput.distance,
          setInputsInvalidityMap.distance,
          false,
          userSettings.default_increment_distance
        ),
      },
      time: {
        decrease:
          operatingSet.time_in_seconds - userSettings.default_increment_time <
            0 || isTimeInputInvalid,
      },
      resistance_level: {
        decrease: ShouldSetTrackingValueButtonBeDisabled(
          setTrackingValuesInput.resistance_level,
          setInputsInvalidityMap.resistance_level,
          false,
          userSettings.default_increment_resistance_level
        ),
      },
      partial_reps: {
        decrease: ShouldSetTrackingValueButtonBeDisabled(
          setTrackingValuesInput.partial_reps,
          setInputsInvalidityMap.partial_reps,
          false,
          1
        ),
      },
      user_weight: {
        decrease: ShouldSetTrackingValueButtonBeDisabled(
          setTrackingValuesInput.user_weight,
          setInputsInvalidityMap.user_weight,
          false,
          userSettings.default_increment_weight
        ),
      },
    };

    return values;
  }, [
    setInputsInvalidityMap,
    setTrackingValuesInput,
    userSettings,
    isTimeInputInvalid,
    operatingSet.time_in_seconds,
  ]);

  const updateValue = (key: SetTrackingValues, isIncrease: boolean) => {
    const updatedSet = { ...operatingSet };
    const updatedSetInputs = { ...setTrackingValuesInput };
    const modifier = isIncrease ? 1 : -1;

    switch (key) {
      case "weight": {
        if (setInputsInvalidityMap.weight) return;

        const newValue = parseFloat(
          (
            ConvertInputStringToNumber(updatedSetInputs.weight) +
            modifier * userSettings.default_increment_weight
          ).toFixed(2)
        );

        updatedSet.weight = newValue;
        updatedSetInputs.weight = newValue === 0 ? "" : newValue.toString();

        break;
      }
      case "reps": {
        if (setInputsInvalidityMap.reps) return;

        const newValue =
          ConvertInputStringToNumber(updatedSetInputs.reps) + modifier;

        updatedSet.reps = newValue;
        updatedSetInputs.reps = newValue === 0 ? "" : newValue.toString();

        break;
      }
      case "distance": {
        if (setInputsInvalidityMap.distance) return;

        const newValue = parseFloat(
          (
            ConvertInputStringToNumber(updatedSetInputs.distance) +
            modifier * userSettings.default_increment_distance
          ).toFixed(2)
        );

        updatedSet.distance = newValue;
        updatedSetInputs.distance = newValue === 0 ? "" : newValue.toString();

        break;
      }
      case "time": {
        if (isTimeInputInvalid) return;

        const newValue =
          updatedSet.time_in_seconds +
          modifier * userSettings.default_increment_time;

        updatedSet.time_in_seconds = newValue;

        break;
      }
      case "rir": {
        if (setInputsInvalidityMap.rir) return;

        const newValue =
          ConvertInputStringToNumber(updatedSetInputs.rir, true) + modifier;

        updatedSet.rir = newValue;
        updatedSetInputs.rir = newValue === -1 ? "" : newValue.toString();

        break;
      }
      case "rpe": {
        if (setInputsInvalidityMap.rpe) return;

        const newValue =
          ConvertInputStringToNumber(updatedSetInputs.rpe) + modifier;

        updatedSet.rpe = newValue;
        updatedSetInputs.rpe = newValue === 0 ? "" : newValue.toString();

        break;
      }
      case "resistance_level": {
        if (setInputsInvalidityMap.resistance_level) return;

        const newValue = parseFloat(
          (
            ConvertInputStringToNumber(updatedSetInputs.resistance_level) +
            modifier * userSettings.default_increment_resistance_level
          ).toFixed(2)
        );

        updatedSet.resistance_level = newValue;
        updatedSetInputs.resistance_level =
          newValue === 0 ? "" : newValue.toString();

        break;
      }
      case "partial_reps": {
        if (setInputsInvalidityMap.partial_reps) return;

        const newValue =
          ConvertInputStringToNumber(updatedSetInputs.partial_reps) + modifier;

        updatedSet.partial_reps = newValue;
        updatedSetInputs.partial_reps =
          newValue === 0 ? "" : newValue.toString();

        break;
      }
      case "user_weight": {
        if (setInputsInvalidityMap.user_weight) return;

        const newValue = parseFloat(
          (
            ConvertInputStringToNumber(updatedSetInputs.user_weight) +
            modifier * userSettings.default_increment_weight
          ).toFixed(2)
        );

        updatedSet.user_weight = newValue;
        updatedSetInputs.user_weight =
          newValue === 0 ? "" : newValue.toString();

        break;
      }
      default:
        break;
    }

    setOperatingSet(updatedSet);
    setSetTrackingValuesInput(updatedSetInputs);
  };

  return (
    <div className="flex flex-wrap gap-x-1 gap-y-1.5 px-1 justify-evenly">
      {!!operatingSet.is_tracking_weight && (
        <div className="flex justify-between gap-1">
          <Input
            className="w-[8.75rem]"
            value={setTrackingValuesInput.weight}
            label="Weight"
            size="sm"
            variant="faded"
            labelPlacement="outside-left"
            onValueChange={(value) =>
              setSetTrackingValuesInput((prev) => ({
                ...prev,
                weight: value,
              }))
            }
            isInvalid={setInputsInvalidityMap.weight}
            isClearable
          />
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => updateValue("weight", false)}
            isDisabled={disableUpdateValueButtonsMap.weight.decrease}
          >
            <MinusIcon />
          </Button>
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => updateValue("weight", true)}
          >
            <PlusIcon />
          </Button>
          <WeightUnitDropdown
            value={operatingSet.weight_unit}
            setSet={setOperatingSet as SetWorkoutSetAction}
            targetType="set"
            isSmall={true}
          />
        </div>
      )}
      {!!operatingSet.is_tracking_reps && (
        <div className="flex justify-between gap-1">
          <Input
            className="w-[7rem]"
            value={setTrackingValuesInput.reps}
            label="Reps"
            size="sm"
            variant="faded"
            labelPlacement="outside-left"
            onValueChange={(value) =>
              setSetTrackingValuesInput((prev) => ({
                ...prev,
                reps: value,
              }))
            }
            isInvalid={setInputsInvalidityMap.reps}
            isClearable
          />
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => updateValue("reps", false)}
            isDisabled={disableUpdateValueButtonsMap.reps.decrease}
          >
            <MinusIcon />
          </Button>
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => updateValue("reps", true)}
          >
            <PlusIcon />
          </Button>
        </div>
      )}
      {!!operatingSet.is_tracking_distance && (
        <div className="flex justify-between gap-1">
          <Input
            className="w-[10rem]"
            value={setTrackingValuesInput.distance}
            label="Distance"
            size="sm"
            variant="faded"
            labelPlacement="outside-left"
            onValueChange={(value) =>
              setSetTrackingValuesInput((prev) => ({
                ...prev,
                distance: value,
              }))
            }
            isInvalid={setInputsInvalidityMap.distance}
            isClearable
          />
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => updateValue("distance", false)}
            isDisabled={disableUpdateValueButtonsMap.distance.decrease}
          >
            <MinusIcon />
          </Button>
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => updateValue("distance", true)}
          >
            <PlusIcon />
          </Button>
          <DistanceUnitDropdown
            value={operatingSet.distance_unit}
            setSet={setOperatingSet as SetWorkoutSetAction}
            targetType="set"
            isSmall={true}
          />
        </div>
      )}
      {!!operatingSet.is_tracking_time && (
        <div className="flex flex-wrap justify-center gap-1">
          <TimeInput
            defaultTimeInput={userSettings.default_time_input}
            time_input_behavior_hhmmss={userSettings.time_input_behavior_hhmmss}
            time_input_behavior_mmss={userSettings.time_input_behavior_mmss}
            set={operatingSet}
            setSet={setOperatingSet}
            setIsTimeInputInvalid={setIsTimeInputInvalid}
            isSmall={true}
          />
          <div className="flex gap-1">
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              onPress={() => updateValue("time", false)}
              isDisabled={disableUpdateValueButtonsMap.time.decrease}
            >
              <MinusIcon />
            </Button>
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              onPress={() => updateValue("time", true)}
            >
              <PlusIcon />
            </Button>
          </div>
        </div>
      )}
      {!!operatingSet.is_tracking_rir && (
        <div className="flex justify-between gap-1">
          <Input
            className="w-[6rem]"
            value={setTrackingValuesInput.rir}
            label="RIR"
            size="sm"
            variant="faded"
            labelPlacement="outside-left"
            onValueChange={(value) =>
              setSetTrackingValuesInput((prev) => ({
                ...prev,
                rir: value,
              }))
            }
            isInvalid={setInputsInvalidityMap.rir}
            isClearable
          />
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => updateValue("rir", false)}
            isDisabled={disableUpdateValueButtonsMap.rir.decrease}
          >
            <MinusIcon />
          </Button>
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => updateValue("rir", true)}
          >
            <PlusIcon />
          </Button>
        </div>
      )}
      {!!operatingSet.is_tracking_rpe && (
        <div className="flex justify-between gap-1">
          <Input
            className="w-[6rem]"
            value={setTrackingValuesInput.rpe}
            label="RPE"
            size="sm"
            variant="faded"
            labelPlacement="outside-left"
            onValueChange={(value) =>
              setSetTrackingValuesInput((prev) => ({
                ...prev,
                rpe: value,
              }))
            }
            isInvalid={setInputsInvalidityMap.rpe}
            isClearable
          />
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => updateValue("rpe", false)}
            isDisabled={disableUpdateValueButtonsMap.rpe.decrease}
          >
            <MinusIcon />
          </Button>
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => updateValue("rpe", true)}
            isDisabled={disableUpdateValueButtonsMap.rpe.increase}
          >
            <PlusIcon />
          </Button>
        </div>
      )}
      {!!operatingSet.is_tracking_resistance_level && (
        <div className="flex justify-between gap-1">
          <Input
            className="w-auto"
            classNames={{
              label: "whitespace-nowrap",
              input: "w-[3.5rem]",
            }}
            size="sm"
            value={setTrackingValuesInput.resistance_level}
            label="Resistance Level"
            variant="faded"
            labelPlacement="outside-left"
            onValueChange={(value) =>
              setSetTrackingValuesInput((prev) => ({
                ...prev,
                resistance_level: value,
              }))
            }
            isInvalid={setInputsInvalidityMap.resistance_level}
            isClearable
          />
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => updateValue("resistance_level", false)}
            isDisabled={disableUpdateValueButtonsMap.resistance_level.decrease}
          >
            <MinusIcon />
          </Button>
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => updateValue("resistance_level", true)}
          >
            <PlusIcon />
          </Button>
        </div>
      )}
      {!!operatingSet.is_tracking_partial_reps && (
        <div className="flex justify-between gap-1">
          <Input
            className="w-auto"
            classNames={{
              label: "whitespace-nowrap",
              input: "w-[3.5rem]",
            }}
            size="sm"
            value={setTrackingValuesInput.partial_reps}
            label="Partial Reps"
            variant="faded"
            labelPlacement="outside-left"
            onValueChange={(value) =>
              setSetTrackingValuesInput((prev) => ({
                ...prev,
                partial_reps: value,
              }))
            }
            isInvalid={setInputsInvalidityMap.partial_reps}
            isClearable
          />
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => updateValue("partial_reps", false)}
            isDisabled={disableUpdateValueButtonsMap.partial_reps.decrease}
          >
            <MinusIcon />
          </Button>
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => updateValue("partial_reps", true)}
          >
            <PlusIcon />
          </Button>
        </div>
      )}
      {!!operatingSet.is_tracking_user_weight && (
        <div className="flex flex-col gap-1.5 items-center">
          <div className="flex justify-between gap-1">
            <Input
              className="w-auto"
              classNames={{
                label: "whitespace-nowrap",
                input: "w-[4.5rem]",
              }}
              value={setTrackingValuesInput.user_weight}
              label="Body Weight"
              size="sm"
              variant="faded"
              labelPlacement="outside-left"
              onValueChange={(value) =>
                setSetTrackingValuesInput((prev) => ({
                  ...prev,
                  user_weight: value,
                }))
              }
              isInvalid={setInputsInvalidityMap.user_weight}
              isClearable
            />
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              onPress={() => updateValue("user_weight", false)}
              isDisabled={disableUpdateValueButtonsMap.user_weight.decrease}
            >
              <MinusIcon />
            </Button>
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              onPress={() => updateValue("user_weight", true)}
            >
              <PlusIcon />
            </Button>
            <WeightUnitDropdown
              value={operatingSet.user_weight_unit}
              setSet={setOperatingSet as SetWorkoutSetAction}
              targetType="set-user-weight-unit"
              isSmall={true}
            />
          </div>
          {userWeight && userWeightModal && (
            <div className="flex flex-col items-center gap-0.5">
              <Button
                color="secondary"
                variant="flat"
                size="sm"
                onPress={handleUserWeightButton}
              >
                {userWeight.id === 0
                  ? "Enter New User Weight"
                  : "Fill In Latest User Weight Entry"}
              </Button>
              {isUserWeightOlderThanOneWeek && (
                <>
                  <span className="font-medium text-sm text-danger">
                    Body Weight Entry Is Older Than One Week
                  </span>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => userWeightModal.onOpen()}
                  >
                    Update User Weight
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
