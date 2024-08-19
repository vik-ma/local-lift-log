import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from "@nextui-org/react";
import { WorkoutSet, DefaultIncrementInputs } from "../typings";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  ConvertNumberToTwoDecimals,
  IsNumberNegativeOrInfinity,
  IsStringEmpty,
  IsStringInvalidInteger,
  IsStringInvalidNumber,
  IsStringInvalidNumberOrAbove59,
} from "../helpers";
import { ChevronIcon } from "../assets";
import { useTimeInputMap } from "../hooks";

type TimeInputProps = {
  defaultTimeInput: string;
  time_input_behavior_hhmmss: string;
  time_input_behavior_mmss: string;
  setIsTimeInputInvalid: React.Dispatch<React.SetStateAction<boolean>>;
  set?: WorkoutSet;
  setSet?: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  defaultIncrementInputValues?: DefaultIncrementInputs;
  setDefaultIncrementInputValues?: React.Dispatch<
    React.SetStateAction<DefaultIncrementInputs>
  >;
  isClearable?: boolean;
  isSmall?: boolean;
  showTimeLabel?: boolean;
};

type HhmmssInput = {
  hours: string;
  minutes: string;
  seconds: string;
};

type MmssInput = {
  minutes: string;
  seconds: string;
};

type TimeInputBehaviorMapType = {
  [key: string]: number;
};

export const TimeInput = ({
  defaultTimeInput,
  time_input_behavior_hhmmss,
  time_input_behavior_mmss,
  set,
  setSet,
  setIsTimeInputInvalid,
  defaultIncrementInputValues,
  setDefaultIncrementInputValues,
  isClearable = true,
  isSmall = false,
  showTimeLabel = true,
}: TimeInputProps) => {
  const [inputType, setInputType] = useState<string>(defaultTimeInput);

  const timeInputBehaviorMap: TimeInputBehaviorMapType = useMemo(() => {
    return { first: 1, second: 2, third: 3, never: 0 };
  }, []);

  const timeInputMap = useTimeInputMap();

  const [timeInSeconds, setTimeInSeconds] = useState<number>(
    set !== undefined ? set.time_in_seconds : 0
  );

  const convertSecondsToMinutes = (seconds: number): string => {
    if (seconds === 0) return "";
    const minutes = seconds / 60;
    const minutesTrimmed = ConvertNumberToTwoDecimals(minutes);
    return minutesTrimmed.toString();
  };

  const convertSecondsToHhmmss = (seconds: number): HhmmssInput => {
    if (seconds === 0) return { seconds: "", minutes: "", hours: "" };

    const hours = Math.floor(seconds / 3600);
    const remainingSecondsAfterHours = seconds % 3600;
    const minutes = Math.floor(remainingSecondsAfterHours / 60);
    const remainingSeconds = remainingSecondsAfterHours % 60;

    const hhmmssInput: HhmmssInput = {
      hours: hours === 0 ? "" : hours.toString(),
      minutes: minutes === 0 ? "" : minutes.toString(),
      seconds: remainingSeconds === 0 ? "" : remainingSeconds.toString(),
    };
    return hhmmssInput;
  };

  const convertSecondsToMmss = (seconds: number): MmssInput => {
    if (seconds === 0) return { seconds: "", minutes: "" };

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const mmssInput: MmssInput = {
      minutes: minutes === 0 ? "" : minutes.toString(),
      seconds: remainingSeconds === 0 ? "" : remainingSeconds.toString(),
    };
    return mmssInput;
  };

  const [secondsInput, setSecondsInput] = useState<string>("");
  const [minutesInput, setMinutesInput] = useState<string>("");
  const [hhmmssInput, setHhmmssInput] = useState<HhmmssInput>({
    hours: "",
    minutes: "",
    seconds: "",
  });
  const [mmssInput, setMmssInput] = useState<MmssInput>({
    minutes: "",
    seconds: "",
  });

  const isSecondsInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(secondsInput);
  }, [secondsInput]);

  const isMinutesInputInvalid = useMemo(() => {
    return IsStringInvalidNumber(minutesInput);
  }, [minutesInput]);

  const isHhmmssSecondsInputInvalid = useMemo(() => {
    return IsStringInvalidNumberOrAbove59(hhmmssInput.seconds);
  }, [hhmmssInput.seconds]);

  const isHhmmssMinutesInputInvalid = useMemo(() => {
    return IsStringInvalidNumberOrAbove59(hhmmssInput.minutes);
  }, [hhmmssInput.minutes]);

  const isHhmmssHoursInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(hhmmssInput.hours);
  }, [hhmmssInput.hours]);

  const isMmssMinutesInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(mmssInput.minutes);
  }, [mmssInput.minutes]);

  const isMmssSecondsInputInvalid = useMemo(() => {
    return IsStringInvalidNumberOrAbove59(mmssInput.seconds);
  }, [mmssInput.seconds]);

  useEffect(() => {
    if (setIsTimeInputInvalid === undefined) return;

    if (
      isSecondsInputInvalid ||
      isMinutesInputInvalid ||
      isHhmmssHoursInputInvalid ||
      isHhmmssMinutesInputInvalid ||
      isHhmmssSecondsInputInvalid
    ) {
      setIsTimeInputInvalid(true);
    } else {
      setIsTimeInputInvalid(false);
    }
  }, [
    isSecondsInputInvalid,
    isMinutesInputInvalid,
    isHhmmssHoursInputInvalid,
    isHhmmssMinutesInputInvalid,
    isHhmmssSecondsInputInvalid,
    setIsTimeInputInvalid,
  ]);

  const handleSecondsInputChange = (value: string) => {
    setSecondsInput(value);
    const seconds = IsStringEmpty(value) ? 0 : Number(value);

    if (IsNumberNegativeOrInfinity(seconds) || !Number.isInteger(seconds))
      return;

    updateValue(seconds);
  };

  const handleMinutesInputChange = (value: string) => {
    setMinutesInput(value);
    const minutes = IsStringEmpty(value) ? 0 : Number(value);

    if (IsNumberNegativeOrInfinity(minutes)) return;

    const seconds: number = convertMinutesToSeconds(minutes);

    updateValue(seconds);
  };

  const convertMinutesToSeconds = (minutes: number): number => {
    return Math.floor(minutes * 60);
  };

  const convertHhmmssToSeconds = (
    hours: number,
    minutes: number,
    seconds: number
  ): number => {
    const timeInSeconds = hours * 3600 + minutes * 60 + seconds;
    return timeInSeconds;
  };

  const convertMmssToSeconds = (minutes: number, seconds: number): number => {
    const timeInSeconds = minutes * 60 + seconds;
    return timeInSeconds;
  };

  const handleHhmmssInputChange = (value: HhmmssInput) => {
    // Don't allow more than 2 characters in minutes and seconds input fields
    if (value.minutes.length > 2 || value.seconds.length > 2) return;

    setHhmmssInput(value);
    const hours = IsStringEmpty(value.hours) ? 0 : Number(value.hours);
    const minutes = IsStringEmpty(value.minutes) ? 0 : Number(value.minutes);
    const seconds = IsStringEmpty(value.seconds) ? 0 : Number(value.seconds);

    if (
      IsNumberNegativeOrInfinity(hours) ||
      IsNumberNegativeOrInfinity(minutes) ||
      IsNumberNegativeOrInfinity(seconds)
    )
      return;

    const timeInSeconds = convertHhmmssToSeconds(hours, minutes, seconds);

    updateValue(timeInSeconds);

    // Don't move focus
    if (time_input_behavior_hhmmss === "never") return;

    // Move focus to HH:MM:SS Minutes Input field after typing in a number in Hours field
    if (
      value.hours.length === timeInputBehaviorMap[time_input_behavior_hhmmss] &&
      hhmmssMinutesInput.current &&
      document.activeElement === hhmmssHoursInput.current
    ) {
      hhmmssMinutesInput.current.focus();
      return;
    }

    // Move focus to HH:MM:SS Seconds Input field after typing in 2 numbers in Minutes field
    if (
      value.minutes.length === 2 &&
      hhmmssSecondsInput.current &&
      document.activeElement === hhmmssMinutesInput.current
    ) {
      hhmmssSecondsInput.current.focus();
    }
  };

  const handleMmssInputChange = (value: MmssInput) => {
    // Don't allow more than 2 characters in seconds input field
    if (value.seconds.length > 2) return;

    setMmssInput(value);
    const minutes = IsStringEmpty(value.minutes) ? 0 : Number(value.minutes);
    const seconds = IsStringEmpty(value.seconds) ? 0 : Number(value.seconds);

    if (
      IsNumberNegativeOrInfinity(minutes) ||
      IsNumberNegativeOrInfinity(seconds)
    )
      return;

    const timeInSeconds = convertMmssToSeconds(minutes, seconds);

    updateValue(timeInSeconds);

    // Don't move focus
    if (time_input_behavior_mmss === "never") return;

    // Move focus to MM:SS Seconds Input field after typing in 3 numbers in Minutes field
    if (
      value.minutes.length === timeInputBehaviorMap[time_input_behavior_mmss] &&
      mmssSecondsInput.current &&
      document.activeElement === mmssMinutesInput.current
    ) {
      mmssSecondsInput.current.focus();
    }
  };

  const updateValue = (seconds: number) => {
    if (setSet !== undefined) {
      setSet((prev) => ({ ...prev, time_in_seconds: seconds }));
    }

    if (setDefaultIncrementInputValues !== undefined) {
      setDefaultIncrementInputValues((prev) => ({
        ...prev,
        time: seconds,
      }));
    }
  };

  useEffect(() => {
    if (set !== undefined) {
      setTimeInSeconds(set.time_in_seconds);
    }

    if (defaultIncrementInputValues !== undefined) {
      setTimeInSeconds(defaultIncrementInputValues.time);
    }
  }, [set, defaultIncrementInputValues]);

  useEffect(() => {
    setSecondsInput(timeInSeconds === 0 ? "" : timeInSeconds.toString());
    setMinutesInput(convertSecondsToMinutes(timeInSeconds));
    setMmssInput(convertSecondsToMmss(timeInSeconds));
    setHhmmssInput(convertSecondsToHhmmss(timeInSeconds));
  }, [timeInSeconds]);

  const hhmmssHoursInput = useRef<HTMLInputElement>(null);
  const hhmmssMinutesInput = useRef<HTMLInputElement>(null);
  const hhmmssSecondsInput = useRef<HTMLInputElement>(null);
  const mmssMinutesInput = useRef<HTMLInputElement>(null);
  const mmssSecondsInput = useRef<HTMLInputElement>(null);

  return (
    <div className="flex justify-between gap-1 items-center">
      <span className="text-xs">
        {showTimeLabel
          ? `Time (${timeInputMap.get(inputType)})`
          : timeInputMap.get(inputType)}
      </span>
      <Dropdown>
        <DropdownTrigger>
          <Button
            aria-label="Toggle Time Input Style Menu"
            isIconOnly
            variant="flat"
            size={isSmall ? "sm" : "md"}
          >
            <ChevronIcon size={22} color="#999" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Time Input Style Menu"
          selectionMode="single"
          selectedKeys={[inputType]}
          onAction={(key) => setInputType(key as string)}
        >
          {Array.from(timeInputMap).map(([key, value]) => (
            <DropdownItem key={key} value={key}>
              {value}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      <div className="flex items-center">
        {inputType === "hhmmss" && (
          <div className="flex items-center gap-1 w-full">
            <Input
              className={
                isSmall && isClearable
                  ? "w-[4rem]"
                  : isSmall
                  ? "w-[2.5rem]"
                  : ""
              }
              aria-label="Hours Input Field"
              variant="faded"
              size={isSmall ? "sm" : "md"}
              isClearable={isClearable}
              value={hhmmssInput.hours}
              onValueChange={(value) =>
                handleHhmmssInputChange({
                  ...hhmmssInput,
                  hours: value,
                })
              }
              isInvalid={isHhmmssHoursInputInvalid}
              ref={hhmmssHoursInput}
            />
            <Input
              className={
                isSmall && isClearable
                  ? "w-[4rem]"
                  : isSmall
                  ? "w-[2.5rem]"
                  : ""
              }
              aria-label="Minutes Input Field"
              variant="faded"
              size={isSmall ? "sm" : "md"}
              isClearable={isClearable}
              value={hhmmssInput.minutes}
              onValueChange={(value) =>
                handleHhmmssInputChange({
                  ...hhmmssInput,
                  minutes: value,
                })
              }
              isInvalid={isHhmmssMinutesInputInvalid}
              ref={hhmmssMinutesInput}
            />
            <Input
              className={
                isSmall && isClearable
                  ? "w-[4rem]"
                  : isSmall
                  ? "w-[2.5rem]"
                  : ""
              }
              aria-label="Seconds Input Field"
              variant="faded"
              size={isSmall ? "sm" : "md"}
              isClearable={isClearable}
              value={hhmmssInput.seconds}
              onValueChange={(value) =>
                handleHhmmssInputChange({
                  ...hhmmssInput,
                  seconds: value,
                })
              }
              isInvalid={isHhmmssSecondsInputInvalid}
              ref={hhmmssSecondsInput}
            />
          </div>
        )}
        {inputType === "mmss" && (
          <div className="flex items-center gap-1 w-full">
            <Input
              className={
                isSmall && isClearable
                  ? "w-[4.5rem]"
                  : isSmall
                  ? "w-[2.5rem]"
                  : ""
              }
              aria-label="Minutes Input Field"
              variant="faded"
              size={isSmall ? "sm" : "md"}
              isClearable={isClearable}
              value={mmssInput.minutes}
              onValueChange={(value) =>
                handleMmssInputChange({
                  ...mmssInput,
                  minutes: value,
                })
              }
              isInvalid={isMmssMinutesInputInvalid}
              ref={mmssMinutesInput}
            />
            <Input
              className={
                isSmall && isClearable
                  ? "w-[4.5rem]"
                  : isSmall
                  ? "w-[2.5rem]"
                  : ""
              }
              aria-label="Seconds Input Field"
              variant="faded"
              size={isSmall ? "sm" : "md"}
              isClearable={isClearable}
              value={mmssInput.seconds}
              onValueChange={(value) =>
                handleMmssInputChange({
                  ...mmssInput,
                  seconds: value,
                })
              }
              isInvalid={isMmssSecondsInputInvalid}
              ref={mmssSecondsInput}
            />
          </div>
        )}
        {inputType === "minutes" && (
          <Input
            className={
              isSmall && isClearable
                ? "w-[5.5rem]"
                : isSmall
                ? "w-[3.5rem]"
                : ""
            }
            aria-label="Minutes Input Field"
            variant="faded"
            size={isSmall ? "sm" : "md"}
            isClearable={isClearable}
            value={minutesInput}
            onValueChange={(value) => handleMinutesInputChange(value)}
            isInvalid={isMinutesInputInvalid}
          />
        )}
        {inputType === "seconds" && (
          <Input
            className={
              isSmall && isClearable
                ? "w-[5.5rem]"
                : isSmall
                ? "w-[3.5rem]"
                : ""
            }
            aria-label="Seconds Input Field"
            variant="faded"
            size={isSmall ? "sm" : "md"}
            isClearable={isClearable}
            value={secondsInput}
            onValueChange={(value) => handleSecondsInputChange(value)}
            isInvalid={isSecondsInputInvalid}
          />
        )}
      </div>
    </div>
  );
};

export default TimeInput;
