import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from "@heroui/react";
import { UserSettings } from "../typings";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  ConvertNumberToTwoDecimals,
  IsNumberValid,
  IsNumberValidInteger,
  IsStringEmpty,
  IsStringInvalidInteger,
  IsStringInvalidNumber,
} from "../helpers";
import { ChevronIcon } from "../assets";
import { useTimeInputMap } from "../hooks";

type TimeValueInputProps = {
  userSettings: UserSettings;
  setIsTimeInputInvalid: React.Dispatch<React.SetStateAction<boolean>>;
  timeInSeconds: number;
  setTimeInSeconds: React.Dispatch<React.SetStateAction<number>>;
  isClearable?: boolean;
  isSmall?: boolean;
  showTimeLabel?: boolean;
  isSetEdited?: boolean;
  setIsSetEdited?: React.Dispatch<React.SetStateAction<boolean>>;
  allow0?: boolean;
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

export const TimeValueInput = ({
  userSettings,
  setIsTimeInputInvalid,
  timeInSeconds,
  setTimeInSeconds,
  isClearable = true,
  isSmall = false,
  showTimeLabel = true,
  isSetEdited,
  setIsSetEdited,
  allow0 = true,
}: TimeValueInputProps) => {
  const [inputType, setInputType] = useState<string>(
    userSettings.default_time_input
  );

  const timeInputBehaviorMap: TimeInputBehaviorMapType = useMemo(() => {
    return { first: 1, second: 2, third: 3, never: 0 };
  }, []);

  const timeInputMap = useTimeInputMap();

  const convertSecondsToMinutes = (seconds: number) => {
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
    return IsStringInvalidInteger(hhmmssInput.seconds, 0, false, 59);
  }, [hhmmssInput.seconds]);

  const isHhmmssMinutesInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(hhmmssInput.minutes, 0, false, 59);
  }, [hhmmssInput.minutes]);

  const isHhmmssHoursInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(hhmmssInput.hours);
  }, [hhmmssInput.hours]);

  const isMmssMinutesInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(mmssInput.minutes);
  }, [mmssInput.minutes]);

  const isMmssSecondsInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(mmssInput.seconds, 0, false, 59);
  }, [mmssInput.seconds]);

  const isValue0AndInvalid = useMemo(() => {
    return !allow0 && timeInSeconds === 0;
  }, [allow0, timeInSeconds]);

  useEffect(() => {
    if (setIsTimeInputInvalid === undefined) return;

    if (
      isSecondsInputInvalid ||
      isMinutesInputInvalid ||
      isHhmmssHoursInputInvalid ||
      isHhmmssMinutesInputInvalid ||
      isHhmmssSecondsInputInvalid ||
      isValue0AndInvalid
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
    isValue0AndInvalid,
  ]);

  const handleSecondsInputChange = (value: string) => {
    setSecondsInput(value);
    const seconds = IsStringEmpty(value) ? 0 : Number(value);

    if (!IsNumberValidInteger(seconds)) return;

    updateValue(seconds);
  };

  const handleMinutesInputChange = (value: string) => {
    setMinutesInput(value);
    const minutes = IsStringEmpty(value) ? 0 : Number(value);

    if (!IsNumberValid(minutes)) return;

    const seconds: number = convertMinutesToSeconds(minutes);

    updateValue(seconds);
  };

  const convertMinutesToSeconds = (minutes: number) => {
    return Math.floor(minutes * 60);
  };

  const convertHhmmssToSeconds = (
    hours: number,
    minutes: number,
    seconds: number
  ) => {
    const timeInSeconds = hours * 3600 + minutes * 60 + seconds;
    return timeInSeconds;
  };

  const convertMmssToSeconds = (minutes: number, seconds: number) => {
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
      !IsNumberValid(hours) ||
      !IsNumberValid(minutes) ||
      !IsNumberValid(seconds)
    )
      return;

    const timeInSeconds = convertHhmmssToSeconds(hours, minutes, seconds);

    updateValue(timeInSeconds);

    // Don't move focus
    if (userSettings.time_input_behavior_hhmmss === "never") return;

    // Move focus to HH:MM:SS Minutes Input field after typing in a number in Hours field
    if (
      value.hours.length ===
        timeInputBehaviorMap[userSettings.time_input_behavior_hhmmss] &&
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

    if (!IsNumberValid(minutes) || !IsNumberValid(seconds)) return;

    const timeInSeconds = convertMmssToSeconds(minutes, seconds);

    updateValue(timeInSeconds);

    // Don't move focus
    if (userSettings.time_input_behavior_mmss === "never") return;

    // Move focus to MM:SS Seconds Input field after typing in 3 numbers in Minutes field
    if (
      value.minutes.length ===
        timeInputBehaviorMap[userSettings.time_input_behavior_mmss] &&
      mmssSecondsInput.current &&
      document.activeElement === mmssMinutesInput.current
    ) {
      mmssSecondsInput.current.focus();
    }
  };

  const updateValue = (seconds: number) => {
    setTimeInSeconds(seconds);

    if (
      isSetEdited !== undefined &&
      setIsSetEdited !== undefined &&
      !isSetEdited
    ) {
      setIsSetEdited(true);
    }
  };

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
    <div className="flex justify-between gap-0.5 items-center">
      <Dropdown shouldBlockScroll={false}>
        <DropdownTrigger>
          <Button
            className="text-xs"
            aria-label="Toggle Time Input Style Menu"
            variant="light"
            size={isSmall ? "sm" : "md"}
            radius="lg"
            endContent={<ChevronIcon size={18} color="#888" />}
          >
            {showTimeLabel
              ? `Time (${timeInputMap.get(inputType)})`
              : timeInputMap.get(inputType)}
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
              isInvalid={isHhmmssHoursInputInvalid || isValue0AndInvalid}
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
              isInvalid={isHhmmssMinutesInputInvalid || isValue0AndInvalid}
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
              isInvalid={isHhmmssSecondsInputInvalid || isValue0AndInvalid}
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
              isInvalid={isMmssMinutesInputInvalid || isValue0AndInvalid}
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
              isInvalid={isMmssSecondsInputInvalid || isValue0AndInvalid}
              ref={mmssSecondsInput}
            />
          </div>
        )}
        {inputType === "minutes" && (
          <Input
            className={
              isSmall && isClearable ? "w-[5.5rem]" : isSmall ? "w-[4rem]" : ""
            }
            aria-label="Minutes Input Field"
            variant="faded"
            size={isSmall ? "sm" : "md"}
            isClearable={isClearable}
            value={minutesInput}
            onValueChange={(value) => handleMinutesInputChange(value)}
            isInvalid={isMinutesInputInvalid || isValue0AndInvalid}
          />
        )}
        {inputType === "seconds" && (
          <Input
            className={
              isSmall && isClearable ? "w-[5.5rem]" : isSmall ? "w-[4rem]" : ""
            }
            aria-label="Seconds Input Field"
            variant="faded"
            size={isSmall ? "sm" : "md"}
            isClearable={isClearable}
            value={secondsInput}
            onValueChange={(value) => handleSecondsInputChange(value)}
            isInvalid={isSecondsInputInvalid || isValue0AndInvalid}
          />
        )}
      </div>
    </div>
  );
};
