import { Select, SelectItem } from "@nextui-org/react";
import { UnitDropdownProps } from "../../typings";
import { useValidDistanceUnits } from "../../hooks";

export const DistanceUnitDropdown = ({
  value,
  setSet,
  setUserSettings,
  setState,
  setDistance,
  targetType,
}: UnitDropdownProps) => {
  const validDistanceUnits = useValidDistanceUnits();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "set" && setSet !== undefined) {
      setSet((prev) => ({
        ...prev,
        distance_unit: e.target.value,
      }));
    }

    if (targetType === "equipment" && setDistance !== undefined) {
      setDistance((prev) => ({ ...prev, distance_unit: e.target.value }));
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
      {validDistanceUnits.map((unit) => (
        <SelectItem key={unit} value={unit}>
          {unit}
        </SelectItem>
      ))}
    </Select>
  );
};

export default DistanceUnitDropdown;
