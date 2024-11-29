import { Button, Input, ScrollShadow } from "@nextui-org/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ConvertNumberToTwoDecimals,
  IsStringEmpty,
  IsStringInvalidNumberOr0,
  UpdateDefaultPlateCalculationId,
} from "../helpers";
import {
  EquipmentWeight,
  OperationTypePlateCalc,
  PlateCalculation,
  PlateCalculatorPage,
  UsePresetsListReturnType,
  UserSettings,
} from "../typings";
import {
  PresetsModalList,
  PlateCalculationModalList,
  PlateCalculationHandleConfig,
  WeightUnitDropdown,
} from ".";

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
  finalWeight: number;
  success: boolean;
  isOneHandle: boolean;
  showResult: boolean;
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
      finalWeight: 0,
      success: false,
      isOneHandle: true,
      showResult: false,
    };
  }, []);

  const {
    otherUnitPlateCalculation,
    setOtherUnitPlateCalculation,
    sortCategoryEquipment,
    handleSortOptionSelectionEquipment,
    isDefaultPlateCalculationInvalid,
    setIsDefaultPlateCalculationInvalid,
  } = usePresetsList;

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

  const handleSetHandleButton = () => {
    if (sortCategoryEquipment !== "favorite") {
      handleSortOptionSelectionEquipment("favorite");
    }

    setOperationTypePlateCalc("set-handle");
    setPlateCalculatorPage("equipment-list");
  };

  const handleEditAvailablePlatesButton = async () => {
    if (sortCategoryEquipment !== "plate-calc") {
      handleSortOptionSelectionEquipment("plate-calc");
    }

    setOperationTypePlateCalc("show-list");
    setPlateCalculatorPage("equipment-list");
  };

  const calculatePlates = useCallback(() => {
    if (
      disableCalculatePlates ||
      operatingPlateCalculation.availablePlatesMap === undefined ||
      operatingPlateCalculation.handle === undefined
    ) {
      setPlateCalculatorResult(defaultPlateCalculatorItems);
      return;
    }

    const isOneHandle = operatingPlateCalculation.num_handles === 1;
    const plateFactor = isOneHandle ? 2 : 4;

    const sortedPlates = Array.from(
      operatingPlateCalculation.availablePlatesMap.keys()
    ).sort((a, b) => b.weight - a.weight);

    const sortedPlatesMap = new Map<number, number>();

    for (const key of sortedPlates) {
      const value = operatingPlateCalculation.availablePlatesMap.get(key);
      if (value !== undefined) {
        if (sortedPlatesMap.has(key.weight)) {
          // If different Equipment Weights has same weight value, add up values
          const addedValue = sortedPlatesMap.get(key.weight)! + value;
          sortedPlatesMap.set(key.weight, addedValue);
        } else {
          sortedPlatesMap.set(key.weight, value);
        }
      }
    }

    const targetWeight = Number(targetWeightInput);
    const handleWeight = isOneHandle
      ? operatingPlateCalculation.handle.weight
      : operatingPlateCalculation.handle.weight * 2;
    const weightToLoad = targetWeight - handleWeight;

    let plateCountResult: { [key: number]: number } = {};
    let maxInvalidWeight = 0;
    let success = false;

    const calculatePlateCounts = (sortedPlatesMap: Map<number, number>) => {
      let weightPerSide = weightToLoad / plateFactor;

      const plateCounts: { [key: number]: number } = {};

      for (const [plate, numAvailable] of sortedPlatesMap) {
        const plateCountForThisWeight = Math.min(
          Math.floor(weightPerSide / plate),
          Math.floor(numAvailable / plateFactor)
        );

        if (plateCountForThisWeight > 0) {
          plateCounts[plate] = plateCountForThisWeight * plateFactor;
          weightPerSide -= plateCountForThisWeight * plate;
        }

        if (weightPerSide <= 0) break;
      }

      if (weightPerSide === 0) {
        plateCountResult = plateCounts;
        success = true;
        return;
      }

      const remainingWeight = weightPerSide * plateFactor;

      if (
        Object.keys(plateCounts).length > 0 &&
        targetWeight - remainingWeight > maxInvalidWeight
      ) {
        plateCountResult = plateCounts;
        maxInvalidWeight = targetWeight - remainingWeight;
      }

      if (weightPerSide > 0) {
        // Remove heaviest plate and redo calculation if Target Weight could not be hit
        const newPlatesList = Array.from(sortedPlatesMap);
        newPlatesList.shift();
        const newPlatesMap = new Map(newPlatesList);

        if (newPlatesMap.size > 0) calculatePlateCounts(newPlatesMap);
      }
    };

    calculatePlateCounts(sortedPlatesMap);

    const plateMap = new Map<number, number>(
      Object.entries(plateCountResult).map(([key, value]) => [
        Number(key),
        value,
      ])
    );

    const sortedPlateMap = new Map(
      [...plateMap.entries()].sort((a, b) => b[0] - a[0])
    );

    const plateCalculatorResult: PlateCalculatorItems = {
      plateMap: sortedPlateMap,
      targetWeight: targetWeight,
      finalWeight: success ? targetWeight : maxInvalidWeight,
      success: success,
      isOneHandle: isOneHandle,
      showResult: true,
    };

    setPlateCalculatorResult(plateCalculatorResult);
  }, [
    disableCalculatePlates,
    operatingPlateCalculation,
    targetWeightInput,
    defaultPlateCalculatorItems,
  ]);

  const resetPlateCalculatorResult = () => {
    setTargetWeightInput("");
    setPlateCalculatorResult(defaultPlateCalculatorItems);
  };

  const switchWeightUnit = () => {
    setOtherUnitPlateCalculation(operatingPlateCalculation);
    setOperatingPlateCalculation(otherUnitPlateCalculation);
    resetPlateCalculatorResult();
  };

  const handlePlateCalculationClick = async (
    plateCalculation: PlateCalculation
  ) => {
    setOperatingPlateCalculation(plateCalculation);
    setOtherUnitPlateCalculation((prev) => ({
      ...prev,
      weight_unit: plateCalculation.weight_unit === "kg" ? "lbs" : "kg",
    }));

    if (isDefaultPlateCalculationInvalid) {
      await UpdateDefaultPlateCalculationId(
        plateCalculation.id,
        userSettings.id
      );

      const updatedSettings: UserSettings = {
        ...userSettings,
        default_plate_calculation_id: plateCalculation.id,
      };

      setUserSettings(updatedSettings);
      setIsDefaultPlateCalculationInvalid(false);
    }

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
            <div className="flex flex-col gap-1.5">
              <PlateCalculationHandleConfig
                plateCalculation={operatingPlateCalculation}
                setPlateCalculation={setOperatingPlateCalculation}
                handleSetHandleButton={handleSetHandleButton}
              />
              <div className="flex flex-col gap-1 px-0.5">
                <div className="flex gap-[4.25rem] items-end">
                  <span className="text-lg font-medium">Target Weight</span>
                  <div className="flex items-end gap-1.5">
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
            {plateCalculatorResult.showResult && (
              <div className="flex flex-col gap-0.5">
                <div className="flex flex-col items-center">
                  {!plateCalculatorResult.success && (
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
                            plateCalculatorResult.finalWeight
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
                <ScrollShadow className="flex flex-col h-[190px]">
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
                                    {key}{" "}
                                    {operatingPlateCalculation.weight_unit}
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
                </ScrollShadow>
              </div>
            )}
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
