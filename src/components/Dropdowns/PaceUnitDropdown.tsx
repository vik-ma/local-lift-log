import { Select, SelectItem } from "@heroui/react";
import { ValidPaceUnits } from "../../helpers";

type PaceUnitDropdownProps = {
  value: string;
  targetType: "chart";
  changeUnitInChart?: (
    newUnit: string,
    unitCategory: "Weight" | "Distance" | "Pace"
  ) => void;
};

export const PaceUnitDropdown = ({
  value,
  targetType,
  changeUnitInChart,
}: PaceUnitDropdownProps) => {
  const validPaceUnits = ValidPaceUnits();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "chart" && changeUnitInChart !== undefined) {
      changeUnitInChart(e.target.value, "Pace");
    }
  };

  return (
    <Select
      aria-label="Pace Unit Dropdown List"
      label="Pace Unit"
      labelPlacement="outside"
      classNames={{
        label: "pl-0.5 mt-1",
        mainWrapper: "w-[5.5rem]",
      }}
      size="sm"
      variant="faded"
      selectedKeys={[value]}
      onChange={(e) => handleChange(e)}
      disallowEmptySelection
    >
      {validPaceUnits.map((unit) => (
        <SelectItem key={unit} value={unit}>
          {unit}
        </SelectItem>
      ))}
    </Select>
  );
};
