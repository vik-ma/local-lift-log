import { Select, SelectItem } from "@heroui/react";
import { UnitCategory } from "../../typings";
import { VALID_SPEED_UNITS } from "../../constants";

type SpeedUnitDropdownProps = {
  value: string;
  targetType: "chart";
  changeUnitInChart?: (newUnit: string, unitCategory: UnitCategory) => void;
};

export const SpeedUnitDropdown = ({
  value,
  targetType,
  changeUnitInChart,
}: SpeedUnitDropdownProps) => {
  const validSpeedUnits = VALID_SPEED_UNITS;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "chart" && changeUnitInChart !== undefined) {
      changeUnitInChart(e.target.value, "Speed");
    }
  };

  return (
    <div>
      <Select
        aria-label="Speed Unit Dropdown List"
        label="Speed Unit"
        labelPlacement="outside"
        classNames={{
          label: "pl-[3px] mt-1",
          mainWrapper: "w-[7.75rem]",
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
    </div>
  );
};
