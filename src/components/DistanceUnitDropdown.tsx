import { Select, SelectItem } from "@nextui-org/react";
import { ValidDistanceUnits } from "../helpers";
import { UnitDropdownProps } from "../typings";

export const DistanceUnitDropdown = ({
  value,
  setSet,
  setUserSettings,
  targetType,
}: UnitDropdownProps) => {
  const distanceUnits: string[] = ValidDistanceUnits();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "set" && setSet !== undefined) {
      setSet((prev) => ({
        ...prev,
        distance_unit: e.target.value,
      }));
    }

    if (targetType === "settings" && setUserSettings !== undefined) {
      setUserSettings(e);
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
