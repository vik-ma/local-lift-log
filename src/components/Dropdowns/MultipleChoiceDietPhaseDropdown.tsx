import { Button, Select, SelectItem, SharedSelection } from "@heroui/react";
import { useDietPhaseTypes } from "../../hooks";

type MultipleChoiceDietPhaseDropdownProps = {
  values: Set<string>;
  setValues: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export const MultipleChoiceDietPhaseDropdown = ({
  values,
  setValues,
}: MultipleChoiceDietPhaseDropdownProps) => {
  const dietPhaseTypes = useDietPhaseTypes();

  return (
    <div className="relative w-full">
      <Select
        selectionMode="multiple"
        label={
          <>
            Diet Phase Types
            {values.size > 0 && (
              <span className="text-secondary">
                {" "}
                ({values.size} out of {dietPhaseTypes.length})
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
        {dietPhaseTypes.map((type) => (
          <SelectItem key={type}>{type}</SelectItem>
        ))}
      </Select>
      {values.size > 0 && (
        <Button
          aria-label="Reset Diet Phase Types"
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
