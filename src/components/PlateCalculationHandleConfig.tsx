import { Button, Select, SelectItem } from "@nextui-org/react";
import { PlateCalculation } from "../typings";

type PlateCalculationHandleConfigProps = {
  plateCalculation: PlateCalculation;
  setPlateCalculation: React.Dispatch<React.SetStateAction<PlateCalculation>>;
  handleSetHandleButton: () => void;
};

export const PlateCalculationHandleConfig = ({
  plateCalculation,
  setPlateCalculation,
  handleSetHandleButton,
}: PlateCalculationHandleConfigProps) => {
  const handleHandlesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedOperatingPlateCalculation: PlateCalculation = {
      ...plateCalculation,
      num_handles: Number(e.target.value),
    };

    setPlateCalculation(updatedOperatingPlateCalculation);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center pl-0.5">
        <h3 className="text-lg font-medium">Handle</h3>
        <div className="flex gap-1.5 items-center pr-1">
          <span className="text-sm text-stone-500">Number Of Handles</span>
          <Select
            aria-label="Select Number Of Handles"
            className="w-[4rem]"
            size="sm"
            variant="faded"
            selectedKeys={[plateCalculation.num_handles.toString()]}
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
      {plateCalculation.handle !== undefined ? (
        <div className="flex gap-1 items-center">
          <div className="flex w-[20.5rem] justify-between gap-1 bg-default-50 px-1.5 py-0.5 border-2 rounded-lg">
            <span className="w-[16rem] truncate">
              {plateCalculation.handle.name}
            </span>
            <div className="flex gap-1 text-secondary">
              <span className="w-[3.5rem] truncate text-right">
                {plateCalculation.handle.weight}
              </span>
              <span>{plateCalculation.handle.weight_unit}</span>
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
            aria-label="Set Plate Calculation Handle"
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
  );
};
