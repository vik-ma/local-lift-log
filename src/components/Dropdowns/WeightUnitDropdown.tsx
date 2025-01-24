import { Select, SelectItem } from "@heroui/react";
import { UnitDropdownProps } from "../../typings";
import { useValidWeightUnits } from "../../hooks";

export const WeightUnitDropdown = ({
  value,
  setSet,
  setUserSettings,
  setState,
  setEquipmentWeight,
  targetType,
  showLabel,
  isSmall,
  isSetEdited,
  setIsSetEdited,
  setPlateCollection,
  switchWeightUnit,
  showBigLabel,
}: UnitDropdownProps) => {
  const validWeightUnits = useValidWeightUnits();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "set" && setSet !== undefined) {
      setSet((prev) => ({
        ...prev,
        weight_unit: e.target.value,
      }));

      if (isSetEdited !== undefined && setIsSetEdited && !isSetEdited) {
        setIsSetEdited(true);
      }
    }

    if (targetType === "set-user-weight-unit" && setSet !== undefined) {
      setSet((prev) => ({
        ...prev,
        user_weight_unit: e.target.value,
      }));
    }

    if (targetType === "equipment" && setEquipmentWeight !== undefined) {
      setEquipmentWeight((prev) => ({ ...prev, weight_unit: e.target.value }));
    }

    if (targetType === "settings" && setUserSettings !== undefined) {
      setUserSettings(e);
    }

    if (targetType === "state" && setState !== undefined) {
      setState(e.target.value);
    }

    if (targetType === "plate-collection" && setPlateCollection !== undefined) {
      setPlateCollection((prev) => ({ ...prev, weight_unit: e.target.value }));

      if (switchWeightUnit !== undefined) switchWeightUnit();
    }
  };

  return (
    <div className="flex flex-col gap-0.5">
      {showBigLabel && (
        <h3 className="text-base font-semibold px-0.5">Unit</h3>
      )}
      <Select
        aria-label="Weight Unit Dropdown List"
        label={showLabel ? "Unit" : null}
        className={showLabel ? "w-[6rem]" : "w-[4.5rem]"}
        size={isSmall ? "sm" : "md"}
        variant="faded"
        selectedKeys={[value]}
        onChange={(e) => handleChange(e)}
        disallowEmptySelection
      >
        {validWeightUnits.map((unit) => (
          <SelectItem key={unit} value={unit}>
            {unit}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};

export default WeightUnitDropdown;
