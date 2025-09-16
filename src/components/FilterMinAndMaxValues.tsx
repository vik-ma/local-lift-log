import { UseFilterMinAndMaxValueInputsReturnType } from "../typings";
import { Checkbox, Input } from "@heroui/react";

type FilterMinAndMaxValuesProps = {
  label: string;
  useFilterMinAndMaxValueInputs: UseFilterMinAndMaxValueInputsReturnType;
  isSmall?: boolean;
  customIncludeNullCheckboxLabel?: string;
  showIncludeNullInMaxValuesCheckbox?: boolean;
};

export const FilterMinAndMaxValues = ({
  label,
  useFilterMinAndMaxValueInputs,
  isSmall,
  customIncludeNullCheckboxLabel,
  showIncludeNullInMaxValuesCheckbox,
}: FilterMinAndMaxValuesProps) => {
  const {
    minInput,
    setMinInput,
    maxInput,
    setMaxInput,
    isMinInputInvalid,
    isMaxInputInvalid,
    isMaxValueBelowMinValue,
    includeNullInMaxValues,
    setIncludeNullInMaxValues,
  } = useFilterMinAndMaxValueInputs;

  return (
    <div className="flex flex-col relative">
      {showIncludeNullInMaxValuesCheckbox && (
        <div className="px-px absolute -top-[3px] w-[24rem]">
          <Checkbox
            className="hover:underline"
            classNames={{ label: "text-sm", wrapper: "mr-[5px]" }}
            size="sm"
            color="primary"
            isSelected={includeNullInMaxValues}
            onValueChange={setIncludeNullInMaxValues}
          >
            {customIncludeNullCheckboxLabel !== undefined
              ? customIncludeNullCheckboxLabel
              : "Include entries with no values (Max only)"}
          </Checkbox>
        </div>
      )}
      <div
        className={
          showIncludeNullInMaxValuesCheckbox
            ? "flex items-center gap-5 pt-6"
            : "flex items-center gap-5"
        }
      >
        <div
          className={
            isSmall
              ? "w-[6rem] flex flex-col gap-0.5 whitespace-nowrap"
              : "w-[6.5rem] flex flex-col gap-0.5 whitespace-nowrap"
          }
        >
          <h4
            className={
              isMinInputInvalid
                ? "text-base font-semibold px-0.5 text-danger"
                : "text-base font-semibold px-0.5 text-default-500"
            }
          >
            Min {label}
          </h4>
          <Input
            aria-label={`Min ${label} Input`}
            className="h-[3.5rem]"
            value={minInput}
            variant="faded"
            onValueChange={setMinInput}
            isInvalid={isMinInputInvalid}
            isClearable
          />
        </div>
        <div
          className={
            isSmall
              ? "w-[6rem] flex flex-col gap-0.5 whitespace-nowrap"
              : "w-[6.5rem] flex flex-col gap-0.5 whitespace-nowrap"
          }
        >
          <h4
            className={
              isMaxInputInvalid || isMaxValueBelowMinValue
                ? "text-base font-semibold px-0.5 text-danger"
                : "text-base font-semibold px-0.5 text-default-500"
            }
          >
            Max {label}
          </h4>
          <Input
            aria-label={`Max ${label} Input`}
            className="h-[3.5rem]"
            value={maxInput}
            variant="faded"
            onValueChange={setMaxInput}
            isInvalid={isMaxInputInvalid || isMaxValueBelowMinValue}
            isClearable
            errorMessage={
              isMaxValueBelowMinValue && (
                <span className="text-nowrap">
                  Max Value is below Min Value
                </span>
              )
            }
          />
        </div>
      </div>
    </div>
  );
};
