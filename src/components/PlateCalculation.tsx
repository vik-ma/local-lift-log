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
  PlateCalculatorPage,
  UsePresetsListReturnType,
} from "../typings";
import { PresetsModalList } from "./PresetsModalList";

type PlateCalculationProps = {
  equipmentWeights: EquipmentWeight[];
  weightUnit: string;
  plateCalculatorHandle: EquipmentWeight | undefined;
  plateCalculatorPage: PlateCalculatorPage;
  usePresetsList: UsePresetsListReturnType;
  setPlateCalculatorPage: React.Dispatch<
    React.SetStateAction<PlateCalculatorPage>
  >;
  setOperationTypePlateCalc: React.Dispatch<
    React.SetStateAction<OperationTypePlateCalc>
  >;
  handlePresetClickPlateCalc: (equipment?: EquipmentWeight) => void;
  targetWeightInput: string;
  setTargetWeightInput: React.Dispatch<React.SetStateAction<string>>;
  numHandles: string;
  setNumHandles: React.Dispatch<React.SetStateAction<string>>;
};

type PlateCalculation = {
  plateMap: Map<number, number>;
  targetWeight: number;
  remainingWeight: number;
  isOneHandle: boolean;
};

export const PlateCalculation = ({
  equipmentWeights,
  weightUnit,
  plateCalculatorHandle,
  plateCalculatorPage,
  usePresetsList,
  setPlateCalculatorPage,
  setOperationTypePlateCalc,
  handlePresetClickPlateCalc,
  targetWeightInput,
  setTargetWeightInput,
  numHandles,
  setNumHandles,
}: PlateCalculationProps) => {
  const defaultPlateCalculation: PlateCalculation = useMemo(() => {
    return {
      plateMap: new Map(),
      targetWeight: 0,
      remainingWeight: 0,
      isOneHandle: true,
    };
  }, []);

  const [plateCalculation, setPlateCalculation] = useState<PlateCalculation>(
    defaultPlateCalculation
  );

  const isTargetWeightInputInvalid = useMemo(() => {
    return (
      IsStringEmpty(targetWeightInput) ||
      IsStringInvalidNumberOr0(targetWeightInput)
    );
  }, [targetWeightInput]);

  const targetWeightInputRef = useRef<HTMLInputElement>(null);

  const plateCalculatorList = useMemo(() => {
    const plateCalculatorList = equipmentWeights.reduce<number[]>(
      (acc, equipment) => {
        if (equipment.is_in_plate_calculator === 1) {
          acc.push(equipment.weight);
        }
        return acc;
      },
      []
    );

    plateCalculatorList.sort((a, b) => b - a);

    return plateCalculatorList;
  }, [equipmentWeights]);

  const disableCalculatePlates = useMemo(() => {
    if (isTargetWeightInputInvalid) return true;
    if (plateCalculatorList.length === 0) return true;
    if (plateCalculatorHandle === undefined) return true;
    if (numHandles !== "1" && numHandles !== "2") return true;
    const handleMultiplier = numHandles === "1" ? 1 : 2;
    if (
      Number(targetWeightInput) -
        plateCalculatorHandle.weight * handleMultiplier <=
      0
    )
      return true;

    return false;
  }, [
    isTargetWeightInputInvalid,
    plateCalculatorHandle,
    targetWeightInput,
    numHandles,
    plateCalculatorList,
  ]);

  const handleChangeHandleButton = () => {
    setPlateCalculatorPage("list");
    setOperationTypePlateCalc("change-handle");
  };

  const handleSetHandleButton = () => {
    setPlateCalculatorPage("list");
    setOperationTypePlateCalc("set-handle");
  };

  const handleHandlesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNumHandles(e.target.value);
  };

  const calculatePlates = useCallback(() => {
    if (disableCalculatePlates || plateCalculatorHandle === undefined) return;

    const isOneHandle = numHandles === "1";
    const plateFactor = isOneHandle ? 2 : 4;

    const sortedPlates = plateCalculatorList;

    const targetWeight = Number(targetWeightInput);
    const handleWeight = isOneHandle
      ? plateCalculatorHandle.weight
      : plateCalculatorHandle.weight * 2;
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
  }, [
    disableCalculatePlates,
    numHandles,
    plateCalculatorHandle,
    plateCalculatorList,
    targetWeightInput,
  ]);

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
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <h3 className="font-medium px-0.5">Handle</h3>
              {plateCalculatorHandle !== undefined ? (
                <div className="flex gap-1.5 items-center">
                  <div className="flex w-[20rem] justify-between gap-1 bg-default-50 px-1.5 py-0.5 border-2 rounded-lg">
                    <span className="w-[16rem] truncate">
                      {plateCalculatorHandle.name}
                    </span>
                    <div className="flex gap-1 text-secondary">
                      <span className="w-[3.5rem] truncate text-right">
                        {plateCalculatorHandle.weight}
                      </span>
                      <span>{plateCalculatorHandle.weight_unit}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={handleChangeHandleButton}
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
            <div className="flex gap-1.5 px-0.5">
              <div className="flex gap-2 items-center w-[15.5rem]">
                <span className="font-medium">Target Weight</span>
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
                  <span className="text-stone-500">{weightUnit}</span>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <span>Handles</span>
                <Select
                  aria-label="Select Number Of Handles"
                  className="w-[4rem]"
                  size="sm"
                  variant="faded"
                  selectedKeys={[numHandles]}
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
            <div className="flex gap-2 items-start">
              <span className="font-medium w-[7.5rem]">Available Plates</span>
              <span className="text-secondary w-[16.5rem] truncate">
                {plateCalculatorList.join(", ")}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-col items-center">
                {plateCalculation.remainingWeight > 0 && (
                  <span className="font-medium text-danger">
                    Could not reach target weight with available plates
                  </span>
                )}
                {plateCalculation.plateMap.size > 0 && (
                  <div className="font-medium">
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
                      const handleFactor = plateCalculation.isOneHandle ? 2 : 4;
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
      ) : (
        <PresetsModalList
          presetsList={usePresetsList}
          handlePresetClick={handlePresetClickPlateCalc}
          showExtraMenu
          heightString="h-[410px]"
        />
      )}
    </>
  );
};
