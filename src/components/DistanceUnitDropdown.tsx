import { Select, SelectItem } from "@nextui-org/react";
import { ValidDistanceUnits } from "../helpers";
import { UnitDropdownProps } from "../typings";

export const DistanceUnitDropdown = ({
  value,
  setValue,
}: UnitDropdownProps) => {
  const distanceUnits: string[] = ValidDistanceUnits();
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
          distance_unit: e.target.value,
        }))
      }
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
