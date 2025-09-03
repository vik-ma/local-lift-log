import { Select, SelectItem, SharedSelection } from "@heroui/react";
import { useMemo } from "react";
import {
  DISTANCE_UNITS,
  MEASUREMENT_UNITS,
  WEIGHT_UNITS,
} from "../../constants";

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
    switch (unitType) {
      case "weight":
        return WEIGHT_UNITS;
      case "distance":
        return DISTANCE_UNITS;
      case "measurement":
        return MEASUREMENT_UNITS;
      default:
        return [];
    }
  }, [unitType]);

  const unitTypeString = useMemo(() => {
    switch (unitType) {
      case "weight":
        return "Weight";
      case "distance":
        return "Distance";
      case "measurement":
        return "Measurements";
      default:
        return "";
    }
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
