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
  showLabel,
  isSmall,
  isSetEdited,
  setIsSetEdited,
  showBigLabel,
}: UnitDropdownProps) => {
  const validDistanceUnits = useValidDistanceUnits();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "set" && setSet !== undefined) {
      setSet((prev) => ({
        ...prev,
        distance_unit: e.target.value,
      }));

      if (isSetEdited !== undefined && setIsSetEdited && !isSetEdited) {
        setIsSetEdited(true);
      }
    }

    if (targetType === "distance" && setDistance !== undefined) {
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
    <div className="flex flex-col gap-0.5">
      {showBigLabel && <h3 className="text-base font-semibold px-0.5">Unit</h3>}
      <Select
        aria-label="Distance Unit Dropdown List"
        label={showLabel ? "Unit" : null}
        className={showLabel ? "w-[6rem]" : "w-[4.5rem]"}
        size={isSmall ? "sm" : "md"}
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
    </div>
  );
};

export default DistanceUnitDropdown;
