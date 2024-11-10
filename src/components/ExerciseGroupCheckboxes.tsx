import { Checkbox, CheckboxGroup } from "@nextui-org/react";
import { useMemo } from "react";
import { ExerciseGroupMap } from "../typings";

type ExerciseGroupCheckboxesProps = {
  isValid: boolean;
  value: string[];
  handleChange: (value: string[]) => void;
  exerciseGroupDictionary: ExerciseGroupMap;
  isSecondary?: boolean;
  useValueAsValue?: boolean;
  disabledKeys?: string[];
};

export const ExerciseGroupCheckboxes = ({
  isValid,
  value,
  handleChange,
  exerciseGroupDictionary,
  isSecondary,
  useValueAsValue,
  disabledKeys,
}: ExerciseGroupCheckboxesProps) => {
  const disabledKeysSet = useMemo(() => {
    return new Set(disabledKeys);
  }, [disabledKeys]);

  return (
    <CheckboxGroup
      isRequired
      isInvalid={!isValid}
      value={value}
      aria-label={
        isSecondary
          ? "Select Secondary Exercise Groups"
          : "Select Primary Exercise Groups"
      }
      errorMessage={
        !isValid && "At least one Primary Exercise Group must be selected"
      }
      onValueChange={(value) => handleChange(value)}
    >
      <div className="grid grid-cols-2 gap-0.5">
        {Array.from(exerciseGroupDictionary).map(([key, value]) => (
          <div className="w-[10.5rem]">
            <Checkbox
              className="hover:underline w-full min-w-full"
              key={useValueAsValue ? value : key}
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
  );
};
