import { Checkbox, CheckboxGroup } from "@nextui-org/react";
import { useMemo } from "react";
import { ExerciseGroupMap } from "../typings";

type ExerciseGroupCheckboxesProps = {
  isValid: boolean;
  value: string[];
  handleChange: (value: string[]) => void;
  exerciseGroupDictionary: ExerciseGroupMap;
  customAriaLabel?: string;
  useValueAsValue?: boolean;
  disabledKeys?: string[];
  includeSecondaryGroups?: boolean;
  setIncludeSecondaryGroups?: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ExerciseGroupCheckboxes = ({
  isValid,
  value,
  handleChange,
  exerciseGroupDictionary,
  customAriaLabel,
  useValueAsValue,
  disabledKeys,
  includeSecondaryGroups,
  setIncludeSecondaryGroups,
}: ExerciseGroupCheckboxesProps) => {
  const disabledKeysSet = useMemo(() => {
    return new Set(disabledKeys);
  }, [disabledKeys]);

  return (
    <div className="flex flex-col gap-4">
      {includeSecondaryGroups !== undefined &&
        setIncludeSecondaryGroups !== undefined && (
          <div>
            <Checkbox
              className="hover:underline"
              isSelected={includeSecondaryGroups}
              onValueChange={setIncludeSecondaryGroups}
              color="default"
            >
              Include Secondary Exercise Groups
            </Checkbox>
          </div>
        )}
      <CheckboxGroup
        isRequired
        isInvalid={!isValid}
        value={value}
        aria-label={
          customAriaLabel !== undefined
            ? customAriaLabel
            : "Select Exercise Groups"
        }
        errorMessage={
          !isValid && "At least one Primary Exercise Group must be selected"
        }
        onValueChange={(value) => handleChange(value)}
      >
        <div className="grid grid-cols-2 gap-0.5">
          {Array.from(exerciseGroupDictionary).map(([key, value]) => (
            <div className="w-[10.5rem]" key={useValueAsValue ? value : key}>
              <Checkbox
                className="hover:underline w-full min-w-full"
                color="primary"
                value={useValueAsValue ? value : key}
                isDisabled={disabledKeysSet.has(key)}
              >
                {value}
              </Checkbox>
            </div>
          ))}
        </div>
      </CheckboxGroup>
    </div>
  );
};
