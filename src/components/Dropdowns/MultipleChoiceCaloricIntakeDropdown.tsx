import { Button, Select, SelectItem, SharedSelection } from "@nextui-org/react";
import { useCaloricIntakeTypes } from "../../hooks";

type MultipleChoiceCaloricIntakeDropdownProps = {
  values: Set<string>;
  setValues: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export const MultipleChoiceCaloricIntakeDropdown = ({
  values,
  setValues,
}: MultipleChoiceCaloricIntakeDropdownProps) => {
  const caloricIntakeTypes = useCaloricIntakeTypes();

  return (
    <div className="relative w-full">
      <Select
        selectionMode="multiple"
        label={
          <>
            Caloric Intake Types
            {values.size > 0 && (
              <span className="text-secondary">
                {" "}
                ({values.size} out of {caloricIntakeTypes.length})
              </span>
            )}
          </>
        }
        variant="faded"
        size="sm"
        radius="md"
        selectedKeys={values}
        onSelectionChange={
          setValues as React.Dispatch<React.SetStateAction<SharedSelection>>
        }
        disableAnimation
      >
        {caloricIntakeTypes.map((type) => (
          <SelectItem key={type} value={type}>
            {type}
          </SelectItem>
        ))}
      </Select>
      {values.size > 0 && (
        <Button
          aria-label="Reset Caloric Intake Types"
          className="absolute right-0 -top-[2rem] h-7"
          size="sm"
          variant="flat"
          onPress={() => setValues(new Set())}
        >
          Reset
        </Button>
      )}
    </div>
  );
};
