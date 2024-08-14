import {
  WorkoutSet,
  SetWorkoutSetAction,
  UseSetTrackingInputsReturnType,
  UserSettings,
  UserWeight,
} from "../typings";
import { WeightUnitDropdown, DistanceUnitDropdown, TimeInput } from ".";
import { Button, Input, useDisclosure } from "@nextui-org/react";

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
    setInputsValidityMap,
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

  return (
    <div className="flex flex-wrap gap-1.5 px-1 justify-evenly">
      {!!operatingSet.is_tracking_weight && (
        <div className="flex justify-between gap-2 w-56">
          <Input
            value={setTrackingValuesInput.weight}
            label="Weight"
            variant="faded"
            labelPlacement="outside-left"
            onValueChange={(value) =>
              setSetTrackingValuesInput((prev) => ({
                ...prev,
                weight: value,
              }))
            }
            isInvalid={setInputsValidityMap.weight}
            isClearable
          />
          <WeightUnitDropdown
            value={operatingSet.weight_unit}
            setSet={setOperatingSet as SetWorkoutSetAction}
            targetType="set"
          />
        </div>
      )}
      {!!operatingSet.is_tracking_reps && (
        <Input
          className="w-28"
          value={setTrackingValuesInput.reps}
          label="Reps"
          variant="faded"
          labelPlacement="outside-left"
          onValueChange={(value) =>
            setSetTrackingValuesInput((prev) => ({
              ...prev,
              reps: value,
            }))
          }
          isInvalid={setInputsValidityMap.reps}
          isClearable
        />
      )}
      {!!operatingSet.is_tracking_distance && (
        <div className="flex justify-between gap-2 w-64">
          <Input
            value={setTrackingValuesInput.distance}
            label="Distance"
            variant="faded"
            labelPlacement="outside-left"
            onValueChange={(value) =>
              setSetTrackingValuesInput((prev) => ({
                ...prev,
                distance: value,
              }))
            }
            isInvalid={setInputsValidityMap.distance}
            isClearable
          />
          <DistanceUnitDropdown
            value={operatingSet.distance_unit}
            setSet={setOperatingSet as SetWorkoutSetAction}
            targetType="set"
          />
        </div>
      )}
      {!!operatingSet.is_tracking_time && (
        <TimeInput
          value={operatingSet}
          setValue={setOperatingSet}
          defaultTimeInput={userSettings.default_time_input}
          setIsInvalid={setIsTimeInputInvalid}
          time_input_behavior_hhmmss={userSettings.time_input_behavior_hhmmss}
          time_input_behavior_mmss={userSettings.time_input_behavior_mmss}
        />
      )}
      {!!operatingSet.is_tracking_rir && (
        <Input
          className="w-[6.5rem]"
          value={setTrackingValuesInput.rir}
          label="RIR"
          variant="faded"
          labelPlacement="outside-left"
          onValueChange={(value) =>
            setSetTrackingValuesInput((prev) => ({
              ...prev,
              rir: value,
            }))
          }
          isInvalid={setInputsValidityMap.rir}
          isClearable
        />
      )}
      {!!operatingSet.is_tracking_rpe && (
        <Input
          className="w-[6.5rem]"
          value={setTrackingValuesInput.rpe}
          label="RPE"
          variant="faded"
          labelPlacement="outside-left"
          onValueChange={(value) =>
            setSetTrackingValuesInput((prev) => ({
              ...prev,
              rpe: value,
            }))
          }
          isInvalid={setInputsValidityMap.rpe}
          isClearable
        />
      )}
      {!!operatingSet.is_tracking_resistance_level && (
        <Input
          className="w-auto"
          classNames={{
            label: "whitespace-nowrap",
            input: "w-16",
          }}
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
          isInvalid={setInputsValidityMap.resistance_level}
          isClearable
        />
      )}
      {!!operatingSet.is_tracking_partial_reps && (
        <Input
          className="w-auto"
          classNames={{
            label: "whitespace-nowrap",
            input: "w-16",
          }}
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
          isInvalid={setInputsValidityMap.partial_reps}
          isClearable
        />
      )}
      {!!operatingSet.is_tracking_user_weight && (
        <div className="flex flex-col gap-1.5 items-center">
          <div className="flex justify-between gap-2 w-56">
            <Input
              value={setTrackingValuesInput.user_weight}
              label="Body Weight"
              variant="faded"
              labelPlacement="outside-left"
              onValueChange={(value) =>
                setSetTrackingValuesInput((prev) => ({
                  ...prev,
                  user_weight: value,
                }))
              }
              isInvalid={setInputsValidityMap.user_weight}
              isClearable
            />
            <WeightUnitDropdown
              value={operatingSet.user_weight_unit}
              setSet={setOperatingSet as SetWorkoutSetAction}
              targetType="set-user-weight-unit"
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
