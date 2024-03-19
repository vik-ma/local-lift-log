import { Button } from "@nextui-org/react";
import { WorkoutSet } from "../typings";

type TimeInputProps = {
  value: WorkoutSet;
  setValue: React.Dispatch<React.SetStateAction<WorkoutSet>>;
};

export const TimeInput = ({ value, setValue }: TimeInputProps) => {
  const handleChange = () => {
    setValue((prev) => ({ ...prev, time_in_seconds: 5 }));
  };

  return (
    <div className="flex flex-col justify-center items-center">
      {value.time_in_seconds}
      <Button onPress={handleChange}>Update</Button>
    </div>
  );
};

export default TimeInput;
