import { Input, Select, SelectItem } from "@nextui-org/react";
import { WorkoutSet } from "../typings";
import { useState, useMemo, useEffect } from "react";
import {
  ConvertNumberToTwoDecimals,
  IsNumberNegativeOrInfinity,
  IsStringInvalidInteger,
  IsStringInvalidNumber,
  IsStringInvalidNumberOrAbove59,
} from "../helpers";

type TimeInputProps = {
  value: WorkoutSet;
  setValue: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  defaultTimeInput: string;
  setIsInvalid: React.Dispatch<React.SetStateAction<boolean>>;
};

type HoursMinutesSecondsInput = {
  hours: string;
  minutes: string;
  seconds: string;
};

export const TimeInput = ({
  value,
  setValue,
  defaultTimeInput,
  setIsInvalid,
}: TimeInputProps) => {
  const [inputType, setInputType] = useState<string>(defaultTimeInput);

  const secondsDefaultValue: string =
    value.time_in_seconds === 0 ? "" : value.time_in_seconds.toString();

  const convertSecondsToMinutes = (seconds: number): string => {
    if (seconds === 0) return "";
    const minutes = seconds / 60;
    const minutesTrimmed = ConvertNumberToTwoDecimals(minutes);
    return minutesTrimmed.toString();
  };

  const minutesDefaultValue: string = convertSecondsToMinutes(
    value.time_in_seconds
  );

  const convertSecondsToHoursMinutesSeconds = (
    seconds: number
  ): HoursMinutesSecondsInput => {
    if (seconds === 0) return { seconds: "", minutes: "", hours: "" };

    const hours = Math.floor(seconds / 3600);
    const remainingSecondsAfterHours = seconds % 3600;
    const minutes = Math.floor(remainingSecondsAfterHours / 60);
    const remainingSeconds = remainingSecondsAfterHours % 60;

    const hoursMinutesSecondsInput: HoursMinutesSecondsInput = {
      hours: hours === 0 ? "" : hours.toString(),
      minutes: minutes === 0 ? "" : minutes.toString(),
      seconds: remainingSeconds === 0 ? "" : remainingSeconds.toString(),
    };
    return hoursMinutesSecondsInput;
  };

  const hoursMinutesSecondsDefaultValue: HoursMinutesSecondsInput =
    convertSecondsToHoursMinutesSeconds(value.time_in_seconds);

  const [secondsInput, setSecondsInput] = useState<string>(secondsDefaultValue);
  const [minutesInput, setMinutesInput] = useState<string>(minutesDefaultValue);
  const [hoursMinutesSecondsInput, setHoursMinutesSecondsInput] =
    useState<HoursMinutesSecondsInput>(hoursMinutesSecondsDefaultValue);

  const isSecondsInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(secondsInput);
  }, [secondsInput]);

  const isMinutesInputInvalid = useMemo(() => {
    return IsStringInvalidNumber(minutesInput);
  }, [minutesInput]);

  const isHhmmssSecondsInputInvalid = useMemo(() => {
    return IsStringInvalidNumberOrAbove59(hoursMinutesSecondsInput.seconds);
  }, [hoursMinutesSecondsInput.seconds]);

  const isHhmmssMinutesInputInvalid = useMemo(() => {
    return IsStringInvalidNumberOrAbove59(hoursMinutesSecondsInput.minutes);
  }, [hoursMinutesSecondsInput.minutes]);

  const isHhmmssHoursInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(hoursMinutesSecondsInput.hours);
  }, [hoursMinutesSecondsInput.hours]);

  useEffect(() => {
    if (
      isSecondsInputInvalid ||
      isMinutesInputInvalid ||
      isHhmmssHoursInputInvalid ||
      isHhmmssMinutesInputInvalid ||
      isHhmmssSecondsInputInvalid
    ) {
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
    }
  }, [
    isSecondsInputInvalid,
    isMinutesInputInvalid,
    isHhmmssHoursInputInvalid,
    isHhmmssMinutesInputInvalid,
    isHhmmssSecondsInputInvalid,
    setIsInvalid,
  ]);

  const handleSecondsInputChange = (value: string) => {
    setSecondsInput(value);
    const trimmedValue = value.trim();
    const seconds = trimmedValue.length === 0 ? 0 : Number(trimmedValue);

    if (IsNumberNegativeOrInfinity(seconds) || !Number.isInteger(seconds))
      return;

    setValue((prev) => ({ ...prev, time_in_seconds: seconds }));
    setMinutesInput(convertSecondsToMinutes(seconds));
    setHoursMinutesSecondsInput(convertSecondsToHoursMinutesSeconds(seconds));
  };

  const handleMinutesInputChange = (value: string) => {
    setMinutesInput(value);
    const trimmedValue = value.trim();
    const minutes = trimmedValue.length === 0 ? 0 : Number(trimmedValue);

    if (IsNumberNegativeOrInfinity(minutes)) return;

    const seconds: number = convertMinutesToSeconds(minutes);

    setValue((prev) => ({ ...prev, time_in_seconds: seconds }));
    setSecondsInput(seconds.toString());
    setHoursMinutesSecondsInput(convertSecondsToHoursMinutesSeconds(seconds));
  };

  const convertMinutesToSeconds = (minutes: number): number => {
    return Math.floor(minutes * 60);
  };

  const convertHoursMinutesSecondsToSeconds = (
    hours: number,
    minutes: number,
    seconds: number
  ): number => {
    const timeInSeconds = hours * 3600 + minutes * 60 + seconds;
    return timeInSeconds;
  };

  const handleHoursMinutesSecondsInputChange = (
    value: HoursMinutesSecondsInput
  ) => {
    setHoursMinutesSecondsInput(value);
    const hours = value.hours.trim().length === 0 ? 0 : Number(value.hours);
    const minutes =
      value.minutes.trim().length === 0 ? 0 : Number(value.minutes);
    const seconds =
      value.seconds.trim().length === 0 ? 0 : Number(value.seconds);

    if (
      IsNumberNegativeOrInfinity(hours) ||
      IsNumberNegativeOrInfinity(minutes) ||
      IsNumberNegativeOrInfinity(seconds)
    )
      return;

    const timeInSeconds = convertHoursMinutesSecondsToSeconds(
      hours,
      minutes,
      seconds
    );

    setValue((prev) => ({ ...prev, time_in_seconds: timeInSeconds }));
    setSecondsInput(timeInSeconds.toString());
    setMinutesInput(convertSecondsToMinutes(timeInSeconds));
  };

  return (
    <div className="flex justify-between gap-2">
      <div className="flex">
        {inputType === "hhmmss" && (
          <div className="flex gap-1 w-full">
            <Input
              label="Hours"
              size="sm"
              variant="faded"
              isClearable
              value={hoursMinutesSecondsInput.hours}
              onValueChange={(value) =>
                handleHoursMinutesSecondsInputChange({
                  ...hoursMinutesSecondsInput,
                  hours: value,
                })
              }
              isInvalid={isHhmmssHoursInputInvalid}
            />
            <Input
              label="Minutes"
              size="sm"
              variant="faded"
              isClearable
              value={hoursMinutesSecondsInput.minutes}
              onValueChange={(value) =>
                handleHoursMinutesSecondsInputChange({
                  ...hoursMinutesSecondsInput,
                  minutes: value,
                })
              }
              isInvalid={isHhmmssMinutesInputInvalid}
            />
            <Input
              label="Seconds"
              size="sm"
              variant="faded"
              isClearable
              value={hoursMinutesSecondsInput.seconds}
              onValueChange={(value) =>
                handleHoursMinutesSecondsInputChange({
                  ...hoursMinutesSecondsInput,
                  seconds: value,
                })
              }
              isInvalid={isHhmmssSecondsInputInvalid}
            />
          </div>
        )}
        {inputType === "minutes" && (
          <Input
            label="Minutes"
            size="sm"
            variant="faded"
            isClearable
            value={minutesInput}
            onValueChange={(value) => handleMinutesInputChange(value)}
            isInvalid={isMinutesInputInvalid}
          />
        )}
        {inputType === "seconds" && (
          <Input
            label="Seconds"
            size="sm"
            variant="faded"
            isClearable
            value={secondsInput}
            onValueChange={(value) => handleSecondsInputChange(value)}
            isInvalid={isSecondsInputInvalid}
          />
        )}
      </div>
      <div>
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
