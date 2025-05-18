import { useMemo, useState } from "react";
import {
  IsStringEmpty,
  IsStringInvalidInteger,
  IsStringInvalidNumber,
} from "../helpers";
import {
  UseFilterMinAndMaxValueInputsReturnType,
  UseFilterMinAndMaxValueInputsArgs,
} from "../typings";

export const useFilterMinAndMaxValueInputs = ({
  minValue,
  maxValue,
  isIntegerOnly,
}: UseFilterMinAndMaxValueInputsArgs = {}): UseFilterMinAndMaxValueInputsReturnType => {
  const [minInput, setMinInput] = useState<string>("");
  const [maxInput, setMaxInput] = useState<string>("");

  const isMinInputInvalid = useMemo(() => {
    if (IsStringEmpty(minInput)) return false;
    if (isIntegerOnly && IsStringInvalidInteger(minInput, 0, true)) return true;
    if (IsStringInvalidNumber(minInput, 0, true)) return true;
    if (minValue !== undefined && Number(minInput) < minValue) return true;
    if (maxValue !== undefined && Number(minInput) > maxValue) return true;
    return false;
  }, [minInput, minValue, maxValue, isIntegerOnly]);

  const isMaxInputInvalid = useMemo(() => {
    if (IsStringEmpty(maxInput)) return false;
    if (isIntegerOnly && IsStringInvalidInteger(maxInput, 0, true)) return true;
    if (IsStringInvalidNumber(maxInput, 0, true)) return true;
    if (minValue !== undefined && Number(maxInput) < minValue) return true;
    if (maxValue !== undefined && Number(maxInput) > maxValue) return true;
    return false;
  }, [maxInput, minValue, maxValue, isIntegerOnly]);

  const isMaxValueBelowMinValue = useMemo(() => {
    if (isMinInputInvalid || isMaxInputInvalid) return false;
    if (IsStringEmpty(minInput) || IsStringEmpty(maxInput)) return false;
    if (Number(maxInput) < Number(minInput)) return true;
    return false;
  }, [minInput, maxInput, isMinInputInvalid, isMaxInputInvalid]);

  const resetInputs = () => {
    setMinInput("");
    setMaxInput("");
  };

  const resetMinInput = () => {
    setMinInput("");
  };

  const resetMaxInput = () => {
    setMaxInput("");
  };

  const isFilterInvalid = useMemo(() => {
    return isMinInputInvalid || isMaxInputInvalid || isMaxValueBelowMinValue;
  }, [isMinInputInvalid, isMaxInputInvalid, isMaxValueBelowMinValue]);

  return {
    minInput,
    setMinInput,
    maxInput,
    setMaxInput,
    isMinInputInvalid,
    isMaxInputInvalid,
    isMaxValueBelowMinValue,
    resetInputs,
    resetMinInput,
    resetMaxInput,
    isFilterInvalid,
  };
};
