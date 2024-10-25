import {
  Button,
  Input,
  ScrollShadow,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ConvertNumberToTwoDecimals,
  IsStringEmpty,
  IsStringInvalidNumberOr0,
} from "../helpers";
import {
  EquipmentWeight,
  OperationTypePlateCalc,
  PlateCalculation,
  PlateCalculatorPage,
  UsePresetsListReturnType,
  UserSettings,
} from "../typings";
import { PresetsModalList } from "./PresetsModalList";
import WeightUnitDropdown from "./Dropdowns/WeightUnitDropdown";
import { PlateCalculationModalList } from "./PlateCalculationModalList";

type PlateCalculatorProps = {
  operatingPlateCalculation: PlateCalculation;
  setOperatingPlateCalculation: React.Dispatch<
    React.SetStateAction<PlateCalculation>
  >;
  plateCalculatorPage: PlateCalculatorPage;
  usePresetsList: UsePresetsListReturnType;
  operationTypePlateCalc: OperationTypePlateCalc;
  setOperationTypePlateCalc: React.Dispatch<
    React.SetStateAction<OperationTypePlateCalc>
  >;
  handlePresetClickSetHandle: (equipment?: EquipmentWeight) => void;
  targetWeightInput: string;
  setTargetWeightInput: React.Dispatch<React.SetStateAction<string>>;
  setPlateCalculatorPage: React.Dispatch<
    React.SetStateAction<PlateCalculatorPage>
  >;
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
};

type PlateCalculatorItems = {
  plateMap: Map<number, number>;
  targetWeight: number;
  remainingWeight: number;
  isOneHandle: boolean;
};

export const PlateCalculator = ({
  operatingPlateCalculation,
  setOperatingPlateCalculation,
  plateCalculatorPage,
  usePresetsList,
  operationTypePlateCalc,
  setOperationTypePlateCalc,
  handlePresetClickSetHandle,
  targetWeightInput,
  setTargetWeightInput,
  setPlateCalculatorPage,
  userSettings,
  setUserSettings,
}: PlateCalculatorProps) => {
  const defaultPlateCalculatorItems: PlateCalculatorItems = useMemo(() => {
    return {
      plateMap: new Map(),
      targetWeight: 0,
      remainingWeight: 0,
      isOneHandle: true,
    };
  }, []);

  const { otherUnitPlateCalculation, setOtherUnitPlateCalculation } =
    usePresetsList;

  const [plateCalculatorResult, setPlateCalculatorResult] =
    useState<PlateCalculatorItems>(defaultPlateCalculatorItems);

  const isTargetWeightInputInvalid = useMemo(() => {
    return (
      IsStringEmpty(targetWeightInput) ||
      IsStringInvalidNumberOr0(targetWeightInput)
    );
  }, [targetWeightInput]);

  const targetWeightInputRef = useRef<HTMLInputElement>(null);

  const disableCalculatePlates = useMemo(() => {
    if (isTargetWeightInputInvalid) return true;
    if (operatingPlateCalculation.availablePlatesMap === undefined) return true;
    if (operatingPlateCalculation.availablePlatesMap.size === 0) return true;
    if (operatingPlateCalculation.handle === undefined) return true;
    if (
      operatingPlateCalculation.num_handles !== 1 &&
      operatingPlateCalculation.num_handles !== 2
    )
      return true;
    const handleMultiplier =
      operatingPlateCalculation.num_handles === 1 ? 1 : 2;
    if (
      Number(targetWeightInput) -
        operatingPlateCalculation.handle.weight * handleMultiplier <=
      0
    )
      return true;

    return false;
  }, [
    isTargetWeightInputInvalid,
    operatingPlateCalculation,
    targetWeightInput,
  ]);

  const handleSetHandleButton = async () => {
    setOperationTypePlateCalc("set-handle");
    setPlateCalculatorPage("equipment-list");
  };

  const handleEditAvailablePlatesButton = async () => {
    setOperationTypePlateCalc("show-list");
    setPlateCalculatorPage("equipment-list");
  };

  const handleHandlesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedOperatingPlateCalculation: PlateCalculation = {
      ...operatingPlateCalculation,
      num_handles: Number(e.target.value),
    };

    setOperatingPlateCalculation(updatedOperatingPlateCalculation);
  };

  const calculatePlates = useCallback(() => {
    if (
      disableCalculatePlates ||
      operatingPlateCalculation.availablePlatesMap === undefined ||
      operatingPlateCalculation.handle === undefined
    )
      return;

    const isOneHandle = operatingPlateCalculation.num_handles === 1;
    const plateFactor = isOneHandle ? 2 : 4;

    const sortedPlates = Array.from(
      operatingPlateCalculation.availablePlatesMap.keys()
    ).sort((a, b) => b.weight - a.weight);

    const sortedPlatesMap = new Map<number, number>();

    for (const key of sortedPlates) {
      const value = operatingPlateCalculation.availablePlatesMap.get(key);
      if (value !== undefined) {
        sortedPlatesMap.set(key.weight, value);
      }
    }

    const targetWeight = Number(targetWeightInput);
    const handleWeight = isOneHandle
      ? operatingPlateCalculation.handle.weight
      : operatingPlateCalculation.handle.weight * 2;
    const weightToLoad = targetWeight - handleWeight;

    let weightPerSide = weightToLoad / plateFactor;

    const plateCounts: { [key: number]: number } = {};

    for (const [plate, numAvailable] of sortedPlatesMap) {
      const plateCountForThisWeight = Math.min(
        Math.floor(weightPerSide / plate),
        numAvailable / plateFactor
      );

      if (plateCountForThisWeight > 0) {
        plateCounts[plate] = plateCountForThisWeight * plateFactor;
        weightPerSide -= plateCountForThisWeight * plate;
      }

      if (weightPerSide <= 0) break;
    }

    const plateMap = new Map<number, number>(
      Object.entries(plateCounts).map(([key, value]) => [Number(key), value])
    );

    const sortedPlateMap = new Map(
      [...plateMap.entries()].sort((a, b) => b[0] - a[0])
    );

    const plateCalculation = {
      plateMap: sortedPlateMap,
      targetWeight: targetWeight,
      remainingWeight:
        plateMap.size === 0 ? targetWeight : weightPerSide * plateFactor,
      isOneHandle: isOneHandle,
    };

    setPlateCalculatorResult(plateCalculation);
  }, [disableCalculatePlates, operatingPlateCalculation, targetWeightInput]);

  const resetPlateCalculatorResult = () => {
    setTargetWeightInput("");
    setPlateCalculatorResult(defaultPlateCalculatorItems);
  };

  const switchWeightUnit = () => {
    setOtherUnitPlateCalculation(operatingPlateCalculation);
    setOperatingPlateCalculation(otherUnitPlateCalculation);
    resetPlateCalculatorResult();
  };

  const handlePlateCalculationClick = (plateCalculation: PlateCalculation) => {
    setOperatingPlateCalculation(plateCalculation);
    setOtherUnitPlateCalculation((prev) => ({
      ...prev,
      weight_unit: plateCalculation.weight_unit === "kg" ? "lbs" : "kg",
    }));
    resetPlateCalculatorResult();
    setPlateCalculatorPage("base");
  };

  useEffect(() => {
    if (targetWeightInputRef.current) {
      targetWeightInputRef.current.focus();
    }

    calculatePlates();
  }, [calculatePlates]);

  return (
    <>
      {plateCalculatorPage === "base" ? (
        <div className="flex flex-col h-full justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center pl-0.5">
                  <h3 className="text-lg font-medium">Handle</h3>
                  <div className="flex gap-1.5 items-center pr-1">
                    <span className="text-sm text-stone-500">
                      Number Of Handles
                    </span>
                    <Select
                      aria-label="Select Number Of Handles"
                      className="w-[4rem]"
                      size="sm"
                      variant="faded"
                      selectedKeys={[
                        operatingPlateCalculation.num_handles.toString(),
                      ]}
                      onChange={(e) => handleHandlesChange(e)}
                      disallowEmptySelection
                    >
                      <SelectItem key="1" value="1">
                        1
                      </SelectItem>
                      <SelectItem key="2" value="2">
                        2
                      </SelectItem>
                    </Select>
                  </div>
                </div>
                {operatingPlateCalculation.handle !== undefined ? (
                  <div className="flex gap-1 items-center">
                    <div className="flex w-[20.5rem] justify-between gap-1 bg-default-50 px-1.5 py-0.5 border-2 rounded-lg">
                      <span className="w-[16rem] truncate">
                        {operatingPlateCalculation.handle.name}
                      </span>
                      <div className="flex gap-1 text-secondary">
                        <span className="w-[3.5rem] truncate text-right">
                          {operatingPlateCalculation.handle.weight}
                        </span>
                        <span>
                          {operatingPlateCalculation.handle.weight_unit}
                        </span>
                      </div>
                    </div>
                    <Button
                      aria-label="Change Plates Handle"
                      className="w-[4rem]"
                      size="sm"
                      variant="flat"
                      onPress={handleSetHandleButton}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="px-0.5 text-stone-400">No Handle Set</span>
                    <Button
                      aria-label="Set Plates Handle"
                      size="sm"
                      variant="flat"
                      color="secondary"
                      onPress={handleSetHandleButton}
                    >
                      Set Handle
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 px-0.5">
                <div className="flex gap-[4.25rem] items-end">
                  <span className="text-lg font-medium">Target Weight</span>
                  <div className="flex items-end gap-[7px]">
                    <span className="text-lg font-medium">
                      Available Plates
                    </span>
                    <Button
                      aria-label="Edit Available Plates"
                      size="sm"
                      variant="flat"
                      onPress={handleEditAvailablePlatesButton}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2.5 items-center">
                  <div className="flex gap-1.5 items-center">
                    <Input
                      ref={targetWeightInputRef}
                      className="w-[6rem]"
                      aria-label="Target Weight Input Field"
                      size="sm"
                      variant="faded"
                      isInvalid={isTargetWeightInputInvalid}
                      isClearable
                      value={targetWeightInput}
                      onValueChange={setTargetWeightInput}
                    />
                    <WeightUnitDropdown
                      value={operatingPlateCalculation.weight_unit}
                      targetType="plate-calculation"
                      setPlateCalculation={setOperatingPlateCalculation}
                      isSmall
                      switchWeightUnit={switchWeightUnit}
                    />
                  </div>
                  {operatingPlateCalculation.availablePlatesMap !==
                    undefined && (
                    <ScrollShadow className="w-[13rem]">
                      <div className="flex divide-x divide-solid">
                        {Array.from(
                          operatingPlateCalculation.availablePlatesMap
                        ).map(([key, value]) => (
                          <div
                            key={key.id}
                            className="flex flex-col px-1.5 justify-center items-center"
                          >
                            <span className="text-secondary font-medium max-w-[3rem] truncate">
                              {key.weight}
                            </span>
                            <span className="text-xs text-stone-500">
                              x{value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollShadow>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex flex-col items-center">
                {plateCalculatorResult.remainingWeight > 0 && (
                  <span className="font-medium text-danger">
                    Could not reach target weight with available plates
                  </span>
                )}
                {plateCalculatorResult.plateMap.size > 0 && (
                  <div className="flex justify-end py-0.5 gap-5 items-center font-medium text-lg w-full">
                    <div className="flex gap-1">
                      <span>Showing plates for</span>
                      <span className="max-w-[4rem] truncate text-secondary">
                        {ConvertNumberToTwoDecimals(
                          plateCalculatorResult.targetWeight -
                            plateCalculatorResult.remainingWeight
                        )}
                      </span>
                      <span className="text-secondary">
                        {operatingPlateCalculation.weight_unit}
                      </span>
                    </div>
                    <Button
                      variant="flat"
                      size="sm"
                      onPress={resetPlateCalculatorResult}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                {plateCalculatorResult.plateMap.size > 0 && (
                  <>
                    <div className="flex justify-between">
                      <h4 className="font-semibold text-lg w-[6.5rem]">
                        Total Plates
                      </h4>
                      {!plateCalculatorResult.isOneHandle && (
                        <h4 className="font-semibold text-lg w-[6.5rem]">
                          Per Handle
                        </h4>
                      )}
                      <h4 className="font-semibold text-lg w-[6.5rem]">
                        Single Side
                      </h4>
                    </div>
                    {Array.from(plateCalculatorResult.plateMap.entries()).map(
                      ([key, value]) => {
                        const handleFactor = plateCalculatorResult.isOneHandle
                          ? 2
                          : 4;
                        return (
                          <div
                            className="flex justify-between"
                            key={`plate-${key}`}
                          >
                            <div className="flex gap-[0.25rem] justify-between w-[6.5rem]">
                              <span className="font-medium w-[4.5rem]">
                                {key} {operatingPlateCalculation.weight_unit}
                              </span>
                              <span className="max-w-[1.75rem] truncate text-stone-500">
                                {value}
                              </span>
                            </div>
                            {!plateCalculatorResult.isOneHandle && (
                              <div className="flex gap-[0.25rem] justify-between w-[6.5rem]">
                                <span className="font-medium w-[4.5rem]">
                                  {key} {operatingPlateCalculation.weight_unit}
                                </span>
                                <span className="max-w-[1.75rem] truncate text-stone-500">
                                  {value / 2}
                                </span>
                              </div>
                            )}
                            <div className="flex gap-[0.25rem] justify-between w-[6.5rem]">
                              <span className="font-medium w-[4.5rem]">
                                {key} {operatingPlateCalculation.weight_unit}
                              </span>
                              <span className="max-w-[1.75rem] truncate text-stone-500">
                                {value / handleFactor}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : plateCalculatorPage === "equipment-list" ? (
        <PresetsModalList
          presetsList={usePresetsList}
          handlePresetClick={
            operationTypePlateCalc === "set-handle"
              ? handlePresetClickSetHandle
              : () => {}
          }
          showModifyButton
          showSortButton
          heightString="h-[400px]"
          validWeightUnit={operatingPlateCalculation.weight_unit}
          showPlateCalculatorButton={operationTypePlateCalc === "show-list"}
          disableCursorPointer={operationTypePlateCalc !== "set-handle"}
        />
      ) : (
        <PlateCalculationModalList
          presetsList={usePresetsList}
          handlePlateCalculationClick={handlePlateCalculationClick}
          userSettings={userSettings}
          setUserSettings={setUserSettings}
        />
      )}
    </>
  );
};
