import { Select, SelectItem, SharedSelection } from "@heroui/react";
import { useMemo } from "react";
import {
  ValidDistanceUnits,
  ValidMeasurementUnits,
  ValidWeightUnits,
} from "../../helpers";

type UnitType = "weight" | "distance" | "measurement";

type MultipleChoiceUnitDropdownProps = {
  unitType: UnitType;
  filterUnits: Set<string>;
  setFilterUnits: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export const MultipleChoiceUnitDropdown = ({
  unitType,
  filterUnits,
  setFilterUnits,
}: MultipleChoiceUnitDropdownProps) => {
  const unitList = useMemo(() => {
    if (unitType === "weight") return ValidWeightUnits();
    if (unitType === "distance") return ValidDistanceUnits();
    if (unitType === "measurement") return ValidMeasurementUnits();
    return [];
  }, [unitType]);

  const unitTypeString = useMemo(() => {
    if (unitType === "weight") return "Weight";
    if (unitType === "distance") return "Distance";
    if (unitType === "measurement") return "Measurements";
    return "";
  }, [unitType]);

  return (
    <Select
      selectionMode="multiple"
      label={
        <>
          {unitTypeString} Units
          {filterUnits.size > 0 && (
            <span className="text-secondary">
              {" "}
              ({filterUnits.size} out of {unitList.length})
            </span>
          )}
        </>
      }
      variant="faded"
      size="sm"
      radius="md"
      selectedKeys={filterUnits}
      onSelectionChange={
        setFilterUnits as React.Dispatch<React.SetStateAction<SharedSelection>>
      }
      disableAnimation
    >
      {unitList.map((item) => (
        <SelectItem key={item}>{item}</SelectItem>
      ))}
    </Select>
  );
};
