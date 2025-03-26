import {
  WorkoutSet,
  SetWorkoutSetAction,
  UseSetTrackingInputsReturnType,
  UserSettings,
  UserWeight,
  UseDisclosureReturnType,
  Exercise,
} from "../typings";
import {
  WeightUnitDropdown,
  DistanceUnitDropdown,
  TimeInput,
  PlusAndMinusButtons,
} from ".";
import { Button, Input } from "@heroui/react";
import {
  ConvertInputStringToNumber,
  ShouldSetTrackingValueButtonBeDisabled,
} from "../helpers";
import { useMemo } from "react";
import { CalculateIcon } from "../assets";

type SetValueInputsProps = {
  operatingSet: WorkoutSet;
  setOperatingSet: SetWorkoutSetAction;
  useSetTrackingInputs: UseSetTrackingInputsReturnType;
  userSettings: UserSettings;
  userWeight?: UserWeight;
  userWeightModal?: UseDisclosureReturnType;
  populateUserWeightValues?: () => void;
  isUserWeightOlderThanOneWeek?: boolean;
  exercise: Exercise | undefined;
  isActiveSet: boolean;
  openCalculationModal: (
    isWeight: boolean,
    exercise: Exercise,
    isActiveSet: boolean,
    setInputs: UseSetTrackingInputsReturnType,
    set: WorkoutSet
  ) => Promise<void>;
};

type Increment = {
  decrease: boolean;
  increase: boolean;
};

type DisableUpdateValueButtonsMapType = {
  weight: Increment;
  reps: Increment;
  rir: Increment;
  rpe: Increment;
  distance: Increment;
  time: Increment;
  resistance_level: Increment;
  partial_reps: Increment;
  user_weight: Increment;
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
  exercise,
  isActiveSet,
  openCalculationModal,
}: SetValueInputsProps) => {
  const {
    setTrackingValuesInput,
    setSetTrackingValuesInput,
    setInputsInvalidityMap,
    isTimeInputInvalid,
    setIsTimeInputInvalid,
    isSetEdited,
    setIsSetEdited,
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
        increase: setInputsInvalidityMap.weight,
      },
      reps: {
        decrease: ShouldSetTrackingValueButtonBeDisabled(
          setTrackingValuesInput.reps,
          setInputsInvalidityMap.reps,
          false,
          1
        ),
        increase: setInputsInvalidityMap.reps,
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
        increase: setInputsInvalidityMap.rir,
      },
      rpe: {
        decrease: ShouldSetTrackingValueButtonBeDisabled(
          setTrackingValuesInput.rpe,
          setInputsInvalidityMap.rpe,
          false,
          1,
          10
        ),
        increase: ShouldSetTrackingValueButtonBeDisabled(
          setTrackingValuesInput.rpe,
          setInputsInvalidityMap.rpe,
          true,
          1,
          10
        ),
      },
      distance: {
        decrease: ShouldSetTrackingValueButtonBeDisabled(
          setTrackingValuesInput.distance,
          setInputsInvalidityMap.distance,
          false,
          userSettings.default_increment_distance
        ),
        increase: setInputsInvalidityMap.distance,
      },
      time: {
        decrease:
          operatingSet.time_in_seconds - userSettings.default_increment_time <
            0 || isTimeInputInvalid,
        increase: isTimeInputInvalid,
      },
      resistance_level: {
        decrease: ShouldSetTrackingValueButtonBeDisabled(
          setTrackingValuesInput.resistance_level,
          setInputsInvalidityMap.resistance_level,
          false,
          userSettings.default_increment_resistance_level
        ),
        increase: setInputsInvalidityMap.resistance_level,
      },
      partial_reps: {
        decrease: ShouldSetTrackingValueButtonBeDisabled(
          setTrackingValuesInput.partial_reps,
          setInputsInvalidityMap.partial_reps,
          false,
          1
        ),
        increase: setInputsInvalidityMap.partial_reps,
      },
      user_weight: {
        decrease: ShouldSetTrackingValueButtonBeDisabled(
          setTrackingValuesInput.user_weight,
          setInputsInvalidityMap.user_weight,
          false,
          userSettings.default_increment_weight
        ),
        increase: setInputsInvalidityMap.user_weight,
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

  const handleUpdateValueButton = (key: string, isIncrease: boolean) => {
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
    if (!isSetEdited) setIsSetEdited(true);
  };

  const handleCalculatorButton = async (isWeight: boolean) => {
    if (exercise === undefined) return;

    await openCalculationModal(
      isWeight,
      exercise,
      isActiveSet,
      useSetTrackingInputs,
      operatingSet
    );
  };

  const handleInputChange = (value: string, key: string) => {
    switch (key) {
      case "weight":
        setSetTrackingValuesInput((prev) => ({
          ...prev,
          weight: value,
        }));
        break;
      case "reps":
        setSetTrackingValuesInput((prev) => ({
          ...prev,
          reps: value,
        }));
        break;
      case "distance":
        setSetTrackingValuesInput((prev) => ({
          ...prev,
          distance: value,
        }));
        break;
      case "rir":
        setSetTrackingValuesInput((prev) => ({
          ...prev,
          rir: value,
        }));
        break;
      case "rpe":
        setSetTrackingValuesInput((prev) => ({
          ...prev,
          rpe: value,
        }));
        break;
      case "resistance_level":
        setSetTrackingValuesInput((prev) => ({
          ...prev,
          resistance_level: value,
        }));
        break;
      case "partial_reps":
        setSetTrackingValuesInput((prev) => ({
          ...prev,
          partial_reps: value,
        }));
        break;
      case "user_weight":
        setSetTrackingValuesInput((prev) => ({
          ...prev,
          user_weight: value,
        }));
        break;
      default:
        break;
    }

    if (!isSetEdited) setIsSetEdited(true);
  };

  return (
    <div className="flex flex-wrap gap-x-1 gap-y-1.5 px-1 justify-evenly">
      {!!operatingSet.is_tracking_weight && (
        <div className="flex justify-between gap-1 select-none">
          <Input
            className="w-[8.75rem]"
            value={setTrackingValuesInput.weight}
            label="Weight"
            size="sm"
            variant="faded"
            labelPlacement="outside-left"
            onValueChange={(value) => handleInputChange(value, "weight")}
            isInvalid={setInputsInvalidityMap.weight}
            isClearable
          />
          <PlusAndMinusButtons
            trackingValue="weight"
            updateValue={handleUpdateValueButton}
            isDecreaseDisabled={disableUpdateValueButtonsMap.weight.decrease}
            isIncreaseDisabled={disableUpdateValueButtonsMap.weight.increase}
          />
          <WeightUnitDropdown
            value={operatingSet.weight_unit}
            setSet={setOperatingSet as SetWorkoutSetAction}
            targetType="set"
            isSmall={true}
            isSetEdited={isSetEdited}
            setIsSetEdited={setIsSetEdited}
          />
          {userSettings.show_calculation_buttons === 1 && (
            <Button
              variant="flat"
              size="sm"
              isIconOnly
              onPress={() => handleCalculatorButton(true)}
            >
              <CalculateIcon />
            </Button>
          )}
        </div>
      )}
      {!!operatingSet.is_tracking_reps && (
        <div className="flex justify-between gap-1 select-none">
          <Input
            className="w-[7rem]"
            value={setTrackingValuesInput.reps}
            label="Reps"
            size="sm"
            variant="faded"
            labelPlacement="outside-left"
            onValueChange={(value) => handleInputChange(value, "reps")}
            isInvalid={setInputsInvalidityMap.reps}
            isClearable
          />
          <PlusAndMinusButtons
            trackingValue="reps"
            updateValue={handleUpdateValueButton}
            isDecreaseDisabled={disableUpdateValueButtonsMap.reps.decrease}
            isIncreaseDisabled={disableUpdateValueButtonsMap.reps.increase}
          />
        </div>
      )}
      {!!operatingSet.is_tracking_distance && (
        <div className="flex justify-between gap-1 select-none">
          <Input
            className="w-[10rem]"
            value={setTrackingValuesInput.distance}
            label="Distance"
            size="sm"
            variant="faded"
            labelPlacement="outside-left"
            onValueChange={(value) => handleInputChange(value, "distance")}
            isInvalid={setInputsInvalidityMap.distance}
            isClearable
          />
          <PlusAndMinusButtons
            trackingValue="distance"
            updateValue={handleUpdateValueButton}
            isDecreaseDisabled={disableUpdateValueButtonsMap.distance.decrease}
            isIncreaseDisabled={disableUpdateValueButtonsMap.distance.increase}
          />
          <DistanceUnitDropdown
            value={operatingSet.distance_unit}
            setSet={setOperatingSet as SetWorkoutSetAction}
            targetType="set"
            isSmall={true}
            isSetEdited={isSetEdited}
            setIsSetEdited={setIsSetEdited}
          />
          {userSettings.show_calculation_buttons === 1 && (
            <Button
              variant="flat"
              size="sm"
              isIconOnly
              onPress={() => handleCalculatorButton(false)}
            >
              <CalculateIcon />
            </Button>
          )}
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
            isSetEdited={isSetEdited}
            setIsSetEdited={setIsSetEdited}
          />
          <div className="flex gap-1">
            <PlusAndMinusButtons
              trackingValue="time"
              updateValue={handleUpdateValueButton}
              isDecreaseDisabled={disableUpdateValueButtonsMap.time.decrease}
              isIncreaseDisabled={disableUpdateValueButtonsMap.time.increase}
            />
          </div>
        </div>
      )}
      {!!operatingSet.is_tracking_rir && (
        <div className="flex justify-between gap-1 select-none">
          <Input
            className="w-[6rem]"
            value={setTrackingValuesInput.rir}
            label="RIR"
            size="sm"
            variant="faded"
            labelPlacement="outside-left"
            onValueChange={(value) => handleInputChange(value, "rir")}
            isInvalid={setInputsInvalidityMap.rir}
            isClearable
          />
          <PlusAndMinusButtons
            trackingValue="rir"
            updateValue={handleUpdateValueButton}
            isDecreaseDisabled={disableUpdateValueButtonsMap.rir.decrease}
            isIncreaseDisabled={disableUpdateValueButtonsMap.rir.increase}
          />
        </div>
      )}
      {!!operatingSet.is_tracking_rpe && (
        <div className="flex justify-between gap-1 select-none">
          <Input
            className="w-[6rem]"
            value={setTrackingValuesInput.rpe}
            label="RPE"
            size="sm"
            variant="faded"
            labelPlacement="outside-left"
            onValueChange={(value) => handleInputChange(value, "rpe")}
            isInvalid={setInputsInvalidityMap.rpe}
            isClearable
          />
          <PlusAndMinusButtons
            trackingValue="rpe"
            updateValue={handleUpdateValueButton}
            isDecreaseDisabled={disableUpdateValueButtonsMap.rpe.decrease}
            isIncreaseDisabled={disableUpdateValueButtonsMap.rpe.increase}
          />
        </div>
      )}
      {!!operatingSet.is_tracking_resistance_level && (
        <div className="flex justify-between gap-1 select-none">
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
              handleInputChange(value, "resistance_level")
            }
            isInvalid={setInputsInvalidityMap.resistance_level}
            isClearable
          />
          <PlusAndMinusButtons
            trackingValue="resistance_level"
            updateValue={handleUpdateValueButton}
            isDecreaseDisabled={
              disableUpdateValueButtonsMap.resistance_level.decrease
            }
            isIncreaseDisabled={
              disableUpdateValueButtonsMap.resistance_level.increase
            }
          />
        </div>
      )}
      {!!operatingSet.is_tracking_partial_reps && (
        <div className="flex justify-between gap-1 select-none">
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
            onValueChange={(value) => handleInputChange(value, "partial_reps")}
            isInvalid={setInputsInvalidityMap.partial_reps}
            isClearable
          />
          <PlusAndMinusButtons
            trackingValue="partial_reps"
            updateValue={handleUpdateValueButton}
            isDecreaseDisabled={
              disableUpdateValueButtonsMap.partial_reps.decrease
            }
            isIncreaseDisabled={
              disableUpdateValueButtonsMap.partial_reps.increase
            }
          />
        </div>
      )}
      {!!operatingSet.is_tracking_user_weight && (
        <div className="flex flex-col gap-1.5 items-center">
          <div className="flex justify-between gap-1 select-none">
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
              onValueChange={(value) => handleInputChange(value, "user_weight")}
              isInvalid={setInputsInvalidityMap.user_weight}
              isClearable
            />
            <PlusAndMinusButtons
              trackingValue="user_weight"
              updateValue={handleUpdateValueButton}
              isDecreaseDisabled={
                disableUpdateValueButtonsMap.user_weight.decrease
              }
              isIncreaseDisabled={
                disableUpdateValueButtonsMap.user_weight.increase
              }
            />
            <WeightUnitDropdown
              value={operatingSet.user_weight_unit}
              setSet={setOperatingSet as SetWorkoutSetAction}
              targetType="set-user-weight-unit"
              isSmall={true}
              isSetEdited={isSetEdited}
              setIsSetEdited={setIsSetEdited}
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
                  ? "Enter New Body Weight"
                  : "Fill In Latest Body Weight Entry"}
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
                    Update Body Weight
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
