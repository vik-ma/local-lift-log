import { Checkbox, CheckboxGroup } from "@nextui-org/react";
import { ExerciseGroupMap } from "../typings";

type ExerciseGroupCheckboxesProps = {
  isValid: boolean;
  value: string[];
  handleChange: (value: string[]) => void;
  exerciseGroupDictionary: ExerciseGroupMap;
  hideLabel?: boolean;
};

export const ExerciseGroupCheckboxes = ({
  isValid,
  value,
  handleChange,
  exerciseGroupDictionary,
  hideLabel,
}: ExerciseGroupCheckboxesProps) => {
  return (
    <div>
      <CheckboxGroup
        className={hideLabel ? "h-[14.75rem]" : "h-[17rem]"}
        isRequired
        isInvalid={!isValid}
        value={value}
        label={hideLabel ? undefined : "Select Exercise Groups"}
        errorMessage={
          !isValid && "At least one Exercise Group must be selected"
        }
        onValueChange={(value) => handleChange(value)}
      >
        <div className="grid grid-cols-2 gap-0.5">
          {Array.from(exerciseGroupDictionary).map(([key, value]) => (
            <Checkbox key={key} color="primary" value={key}>
              {value}
            </Checkbox>
          ))}
        </div>
      </CheckboxGroup>
    </div>
  );
};
