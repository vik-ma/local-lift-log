import { Select, SelectItem } from "@nextui-org/react";
import { ValidDistanceUnits } from "../helpers";
import { UnitDropdownProps } from "../typings";

export const DistanceUnitDropdown = ({
  value,
  actionSet,
  actionSettings,
  targetType,
}: UnitDropdownProps) => {
  const distanceUnits: string[] = ValidDistanceUnits();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "set" && actionSet !== undefined) {
      actionSet((prev) => ({
        ...prev,
        distance_unit: e.target.value,
      }));
    }

    if (targetType === "settings" && actionSettings !== undefined) {
      actionSettings(e);
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
      {distanceUnits.map((unit) => (
        <SelectItem key={unit} value={unit}>
          {unit}
        </SelectItem>
      ))}
    </Select>
  );
};

export default DistanceUnitDropdown;
