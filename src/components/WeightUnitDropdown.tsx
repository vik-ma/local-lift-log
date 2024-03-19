import { Select, SelectItem } from "@nextui-org/react";
import { ValidWeightUnits } from "../helpers";
import { UnitDropdownProps } from "../typings";

export const WeightUnitDropdown = ({ value, setValue }: UnitDropdownProps) => {
  const weightUnits: string[] = ValidWeightUnits();
  return (
    <Select
      label="Unit"
      size="sm"
      className="max-w-20"
      variant="faded"
      selectedKeys={[value]}
      onChange={(e) =>
        setValue((prev) => ({
          ...prev,
          weight_unit: e.target.value,
        }))
      }
    >
      {weightUnits.map((unit) => (
        <SelectItem key={unit} value={unit}>
          {unit}
        </SelectItem>
      ))}
    </Select>
  );
};

export default WeightUnitDropdown;
