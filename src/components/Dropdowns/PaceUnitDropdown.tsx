import { Select, SelectItem } from "@heroui/react";
import { UnitCategory } from "../../typings";
import { VALID_PACE_UNITS } from "../../constants";

type PaceUnitDropdownProps = {
  value: string;
  targetType: "chart";
  changeUnitInChart?: (newUnit: string, unitCategory: UnitCategory) => void;
};

export const PaceUnitDropdown = ({
  value,
  targetType,
  changeUnitInChart,
}: PaceUnitDropdownProps) => {
  const validPaceUnits = VALID_PACE_UNITS;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "chart" && changeUnitInChart !== undefined) {
      changeUnitInChart(e.target.value, "Pace");
    }
  };

  return (
    <div>
      <Select
        aria-label="Pace Unit Dropdown List"
        label="Pace Unit"
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
        {validPaceUnits.map((unit) => (
          <SelectItem key={unit}>{unit}</SelectItem>
        ))}
      </Select>
    </div>
  );
};
