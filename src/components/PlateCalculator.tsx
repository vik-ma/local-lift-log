import { Button, Input, Select, SelectItem } from "@nextui-org/react";
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
} from "../typings";
import { PresetsModalList } from "./PresetsModalList";
import WeightUnitDropdown from "./Dropdowns/WeightUnitDropdown";

type PlateCalculatorProps = {
  equipmentWeights: EquipmentWeight[];
  weightUnit: string;
  operatingPlateCalculation: PlateCalculation;
  setOperatingPlateCalculation: React.Dispatch<
    React.SetStateAction<PlateCalculation>
  >;
  plateCalculatorPage: PlateCalculatorPage;
  usePresetsList: UsePresetsListReturnType;
  setOperationTypePlateCalc: React.Dispatch<
    React.SetStateAction<OperationTypePlateCalc>
  >;
  handlePresetClickPlateCalc: (equipment?: EquipmentWeight) => void;
  targetWeightInput: string;
  setTargetWeightInput: React.Dispatch<React.SetStateAction<string>>;
  showPresetList: () => Promise<void>;
};

type PlateCalculatorItems = {
  plateMap: Map<number, number>;
  targetWeight: number;
  remainingWeight: number;
  isOneHandle: boolean;
};

export const PlateCalculator = ({
  weightUnit,
  operatingPlateCalculation,
  setOperatingPlateCalculation,
  plateCalculatorPage,
  usePresetsList,
  setOperationTypePlateCalc,
  handlePresetClickPlateCalc,
  targetWeightInput,
  setTargetWeightInput,
  showPresetList,
}: PlateCalculatorProps) => {
  const defaultPlateCalculation: PlateCalculatorItems = useMemo(() => {
    return {
      plateMap: new Map(),
      targetWeight: 0,
      remainingWeight: 0,
      isOneHandle: true,
    };
  }, []);

  const [plateCalculation, setPlateCalculation] =
    useState<PlateCalculatorItems>(defaultPlateCalculation);

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

    await showPresetList();
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
    )
      .map((weight) => weight.weight)
      .sort((a, b) => b - a);

    const targetWeight = Number(targetWeightInput);
    const handleWeight = isOneHandle
      ? operatingPlateCalculation.handle.weight
      : operatingPlateCalculation.handle.weight * 2;
    const weightToLoad = targetWeight - handleWeight;

    let weightPerSide = weightToLoad / plateFactor;

    const plateCounts: { [key: number]: number } = {};

    for (const plate of sortedPlates) {
      const plateCountForThisWeight = Math.floor(weightPerSide / plate);

      if (plateCountForThisWeight > 0) {
        plateCounts[plate] = plateCountForThisWeight * plateFactor;
        weightPerSide -= plateCountForThisWeight * plate;
      }
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

    setPlateCalculation(plateCalculation);
  }, [disableCalculatePlates, operatingPlateCalculation, targetWeightInput]);

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
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center pl-0.5">
                  <h3 className="text-lg font-medium">Handle</h3>
                  <div className="flex gap-2 items-center pr-2">
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
                  <div className="flex gap-1.5 items-center">
                    <div className="flex w-[20rem] justify-between gap-1 bg-default-50 px-1.5 py-0.5 border-2 rounded-lg">
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
              <div className="flex gap-2 px-0.5">
                <div className="flex gap-3.5 items-center">
                  <span className="text-lg font-medium">Target Weight</span>
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
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 items-start px-0.5">
                <span className="font-medium">Available Plates</span>
                <span className="text-secondary w-[15.5rem] truncate">
                  {operatingPlateCalculation.formattedAvailablePlatesString}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-col items-center">
                {plateCalculation.remainingWeight > 0 && (
                  <span className="font-medium text-danger">
                    Could not reach target weight with available plates
                  </span>
                )}
                {plateCalculation.plateMap.size > 0 && (
                  <div className="font-medium text-lg">
                    Showing plates for{" "}
                    <span className="text-secondary">
                      {ConvertNumberToTwoDecimals(
                        plateCalculation.targetWeight -
                          plateCalculation.remainingWeight
                      )}{" "}
                      {weightUnit}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                {plateCalculation.plateMap.size > 0 && (
                  <>
                    <div className="flex justify-between">
                      <h4 className="font-semibold text-lg">Total Plates</h4>
                      {!plateCalculation.isOneHandle && (
                        <h4 className="font-semibold text-lg">Per Handle</h4>
                      )}
                      <h4 className="font-semibold text-lg">Single Side</h4>
                    </div>
                    {[...plateCalculation.plateMap.entries()].map(
                      ([key, value]) => {
                        const handleFactor = plateCalculation.isOneHandle
                          ? 2
                          : 4;
                        return (
                          <div
                            className="flex justify-between"
                            key={`plate-${key}`}
                          >
                            <div className="flex gap-2">
                              <span className="font-medium w-[4.5rem]">
                                {key} {weightUnit}
                              </span>
                              <span className="text-stone-500">{value}</span>
                            </div>
                            {!plateCalculation.isOneHandle && (
                              <div className="flex gap-2">
                                <span className="font-medium w-[4.5rem]">
                                  {key} {weightUnit}
                                </span>
                                <span className="text-stone-500">
                                  {value / 2}
                                </span>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <span className="font-medium w-[4.5rem]">
                                {key} {weightUnit}
                              </span>
                              <span className="text-stone-500">
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
      ) : (
        <PresetsModalList
          presetsList={usePresetsList}
          handlePresetClick={handlePresetClickPlateCalc}
          showModifyButton
          showSortButton
          heightString="h-[410px]"
          validWeightUnit={weightUnit}
        />
      )}
    </>
  );
};
