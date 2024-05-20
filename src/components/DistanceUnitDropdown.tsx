import { Select, SelectItem } from "@nextui-org/react";
import { ValidDistanceUnits } from "../helpers";
import { UnitDropdownProps } from "../typings";

export const DistanceUnitDropdown = ({
  value,
  setSet,
  setUserSettings,
  setState,
  targetType,
}: UnitDropdownProps) => {
  const DISTANCE_UNITS: string[] = ValidDistanceUnits();

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

    if (targetType === "state" && setState !== undefined) {
      setState(e.target.value);
    }
  };

  return (
    <Select
      aria-label="Distance Unit Dropdown List"
      className="max-w-[4.5rem]"
      variant="faded"
      selectedKeys={[value]}
      onChange={(e) => handleChange(e)}
      disallowEmptySelection
    >
      {DISTANCE_UNITS.map((unit) => (
        <SelectItem key={unit} value={unit}>
          {unit}
        </SelectItem>
      ))}
    </Select>
  );
};

export default DistanceUnitDropdown;
