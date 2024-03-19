import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import { WorkoutSet } from "../typings";
import { useState } from "react";

type TimeInputProps = {
  value: WorkoutSet;
  setValue: React.Dispatch<React.SetStateAction<WorkoutSet>>;
};

export const TimeInput = ({ value, setValue }: TimeInputProps) => {
  const [inputType, setInputType] = useState<string>("hhmmss");
  const handleChange = () => {
    setValue((prev) => ({ ...prev, time_in_seconds: 5 }));
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex justify-between gap-2">
        <div className="flex items-center">
          {inputType === "hhmmss" && "HH:MM:SS"}
          {inputType === "minutes" && "Minutes"}
          {inputType === "seconds" && "Seconds"}
        </div>
        <Select
          className="w-32"
          label="Input Type"
          size="sm"
          variant="faded"
          selectedKeys={[inputType]}
          disallowEmptySelection={true}
          onChange={(e) => setInputType(e.target.value)}
        >
          <SelectItem key="hhmmss" value={"hhmmss"}>
            HH:MM:SS
          </SelectItem>
          <SelectItem key="minutes" value={"minutes"}>
            Minutes
          </SelectItem>
          <SelectItem key="seconds" value={"seconds"}>
            Seconds
          </SelectItem>
        </Select>
      </div>
    </div>
  );
};

export default TimeInput;
