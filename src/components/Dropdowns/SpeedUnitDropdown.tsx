import { Select, SelectItem } from "@heroui/react";
import { ValidSpeedUnits } from "../../helpers";

type SpeedUnitDropdownProps = {
  value: string;
  targetType: "chart";
  changeUnitInChart?: (
    newUnit: string,
    unitCategory: "Weight" | "Distance" | "Speed"
  ) => void;
};

export const SpeedUnitDropdown = ({
  value,
  targetType,
  changeUnitInChart,
}: SpeedUnitDropdownProps) => {
  const validSpeedUnits = ValidSpeedUnits();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "chart" && changeUnitInChart !== undefined) {
      changeUnitInChart(e.target.value, "Speed");
    }
  };

  return (
    <Select
      aria-label="Speed Unit Dropdown List"
      label="Speed Unit"
      labelPlacement="outside"
      classNames={{
        label: "pl-[3px] mt-1",
        mainWrapper: "w-[5.5rem]",
      }}
      size="sm"
      variant="faded"
      selectedKeys={[value]}
      onChange={(e) => handleChange(e)}
      disallowEmptySelection
    >
      {validSpeedUnits.map((unit) => (
        <SelectItem key={unit}>{unit}</SelectItem>
      ))}
    </Select>
  );
};
