import { useMemo, useState } from "react";
import {
  IsStringEmpty,
  IsStringInvalidInteger,
  IsStringInvalidNumber,
} from "../helpers";
import {
  UseFilterMinAndMaxValueInputsReturnType,
  UseFilterMinAndMaxValueInputsProps,
} from "../typings";

export const useFilterMinAndMaxValueInputs = ({
  minValue,
  maxValue,
  isIntegerOnly,
}: UseFilterMinAndMaxValueInputsProps = {}): UseFilterMinAndMaxValueInputsReturnType => {
  const [minInput, setMinInput] = useState<string>("");
  const [maxInput, setMaxInput] = useState<string>("");
  const [includeNullInMaxValues, setIncludeNullInMaxValues] =
    useState<boolean>(false);

  const min = 0;
  const doNotAllowMin = true;

  const isMinInputInvalid = useMemo(() => {
    if (IsStringEmpty(minInput)) return false;
    if (isIntegerOnly && IsStringInvalidInteger(minInput, min, doNotAllowMin))
      return true;
    if (IsStringInvalidNumber(minInput, min, doNotAllowMin)) return true;
    if (minValue !== undefined && Number(minInput) < minValue) return true;
    if (maxValue !== undefined && Number(minInput) > maxValue) return true;
    return false;
  }, [minInput, minValue, maxValue, isIntegerOnly, doNotAllowMin]);

  const isMaxInputInvalid = useMemo(() => {
    if (IsStringEmpty(maxInput)) return false;
    if (isIntegerOnly && IsStringInvalidInteger(maxInput, min, doNotAllowMin))
      return true;
    if (IsStringInvalidNumber(maxInput, min, doNotAllowMin)) return true;
    if (minValue !== undefined && Number(maxInput) < minValue) return true;
    if (maxValue !== undefined && Number(maxInput) > maxValue) return true;
    return false;
  }, [maxInput, minValue, maxValue, isIntegerOnly, doNotAllowMin]);

  const isMaxValueBelowMinValue = useMemo(() => {
    if (isMinInputInvalid || isMaxInputInvalid) return false;
    if (IsStringEmpty(minInput) || IsStringEmpty(maxInput)) return false;
    if (Number(maxInput) < Number(minInput)) return true;
    return false;
  }, [minInput, maxInput, isMinInputInvalid, isMaxInputInvalid]);

  const isFilterInvalid = useMemo(() => {
    return isMinInputInvalid || isMaxInputInvalid || isMaxValueBelowMinValue;
  }, [isMinInputInvalid, isMaxInputInvalid, isMaxValueBelowMinValue]);

  const areInputsEmpty = useMemo(() => {
    return IsStringEmpty(minInput) && IsStringEmpty(maxInput);
  }, [minInput, maxInput]);

  return {
    minInput,
    setMinInput,
    maxInput,
    setMaxInput,
    isMinInputInvalid,
    isMaxInputInvalid,
    isMaxValueBelowMinValue,
    isFilterInvalid,
    includeNullInMaxValues,
    setIncludeNullInMaxValues,
    areInputsEmpty,
  };
};
