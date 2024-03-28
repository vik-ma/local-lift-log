import { Select, SelectItem } from "@nextui-org/react";
import { ValidWeightUnits } from "../helpers";
import { UnitDropdownProps } from "../typings";

export const WeightUnitDropdown = ({
  value,
  actionSet,
  actionSettings,
  actionMeasurements,
  targetType,
}: UnitDropdownProps) => {
  const weightUnits: string[] = ValidWeightUnits();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "set" && actionSet !== undefined) {
      actionSet((prev) => ({
        ...prev,
        weight_unit: e.target.value,
      }));
    }

    if (targetType === "settings" && actionSettings !== undefined) {
      actionSettings(e);
    }

    if (targetType === "measurements" && actionMeasurements !== undefined) {
      actionMeasurements(e.target.value);
    }
  };

  return (
    <Select
      label="Unit"
      size="sm"
      className="max-w-20"
      variant="faded"
      selectedKeys={[value]}
      onChange={(e) => handleChange(e)}
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
