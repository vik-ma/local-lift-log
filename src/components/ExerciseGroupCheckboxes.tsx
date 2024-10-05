import { Checkbox, CheckboxGroup } from "@nextui-org/react";

type ExerciseGroupCheckboxesProps = {
  isValid: boolean;
  value: string[];
  handleChange: (value: string[]) => void;
  exerciseGroupList: string[];
  hideLabel?: boolean;
};

export const ExerciseGroupCheckboxes = ({
  isValid,
  value,
  handleChange,
  exerciseGroupList,
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
          {exerciseGroupList.map((group) => (
            <Checkbox key={group} color="primary" value={group}>
              {group}
            </Checkbox>
          ))}
        </div>
      </CheckboxGroup>
    </div>
  );
};
