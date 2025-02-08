import { useMemo } from "react";
import {
  TimePeriod,
  UserSettings,
  UseTimePeriodListReturnType,
} from "../../typings";
import { Button, ScrollShadow } from "@heroui/react";
import {
  DietPhaseTypeSpan,
  EmptyListLabel,
  ListFilters,
  SearchInput,
  TimePeriodListOptions,
} from "..";
import { GoToArrowIcon } from "../../assets";
import { useNavigate } from "react-router-dom";

type TimePeriodModalListProps = {
  useTimePeriodList: UseTimePeriodListReturnType;
  handleTimePeriodClick: (timePeriod: TimePeriod) => void;
  userSettings?: UserSettings;
  setUserSettings?: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  customHeightString?: string;
  hiddenTimePeriods?: Set<string>;
};

export const TimePeriodModalList = ({
  useTimePeriodList,
  handleTimePeriodClick,
  userSettings,
  setUserSettings,
  customHeightString,
  hiddenTimePeriods,
}: TimePeriodModalListProps) => {
  const {
    timePeriods,
    filterQuery,
    setFilterQuery,
    filteredTimePeriods,
    timePeriodListFilters,
    selectedTimePeriodProperties,
  } = useTimePeriodList;

  const { filterMap, removeFilter, prefixMap } = timePeriodListFilters;

  const height = useMemo(() => {
    return customHeightString !== undefined ? customHeightString : "h-[400px]";
  }, []);

  const navigate = useNavigate();

  return (
    <div className={`${height} flex flex-col gap-1.5`}>
      <div className="flex flex-col gap-1.5">
        <SearchInput
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredTimePeriods.length}
          totalListLength={timePeriods.length}
          isListFiltered={filterMap.size > 0}
        />
        <div className="flex justify-between items-center">
          <Button
            variant="flat"
            size="sm"
            color="secondary"
            onPress={() => navigate("/time-periods")}
            endContent={<GoToArrowIcon />}
          >
            Edit Time Periods
          </Button>
          <TimePeriodListOptions
            useTimePeriodList={useTimePeriodList}
            userSettings={userSettings}
            setUserSettings={setUserSettings}
          />
        </div>
        {filterMap.size > 0 && (
          <ListFilters
            filterMap={filterMap}
            removeFilter={removeFilter}
            prefixMap={prefixMap}
            isInModal
          />
        )}
      </div>
      <ScrollShadow className="flex flex-col gap-1">
        {filteredTimePeriods.map((timePeriod) => (
          <div
            key={timePeriod.id}
            className={
              hiddenTimePeriods?.has(timePeriod.id.toString())
                ? "hidden"
                : "flex justify-between items-center cursor-pointer w-full bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
            }
            onClick={() => handleTimePeriodClick(timePeriod)}
          >
            <div className="flex flex-col justify-start items-start">
              <div className="flex gap-1 items-baseline">
                <span
                  className={
                    timePeriod.isOngoing &&
                    selectedTimePeriodProperties.has("ongoing")
                      ? "max-w-[18.25rem] truncate text-stone-600"
                      : "max-w-[22.75rem] truncate text-stone-600"
                  }
                >
                  {timePeriod.name}
                </span>
                {timePeriod.isOngoing &&
                  selectedTimePeriodProperties.has("ongoing") && (
                    <span className="text-sm text-orange-400">(Ongoing)</span>
                  )}
              </div>
              <div className="text-xs text-left max-w-[22.75rem] truncate">
                <span className="text-secondary">
                  <span className="font-medium text-stone-500">
                    Start Date:{" "}
                  </span>
                  {timePeriod.formattedStartDate}
                </span>
                {timePeriod.formattedEndDate && (
                  <span className="text-secondary">
                    <span className="font-medium text-stone-500 pl-0.5">
                      {" "}
                      End Date:{" "}
                    </span>
                    {timePeriod.formattedEndDate}
                  </span>
                )}
                <span className="text-slate-400 pl-1">
                  ({timePeriod.numDaysBetweenDates} Days)
                </span>
              </div>
              {selectedTimePeriodProperties.has("diet-phase") && (
                <DietPhaseTypeSpan value={timePeriod.diet_phase} />
              )}
              {selectedTimePeriodProperties.has("note") && (
                <span className="w-[22.75rem] break-all text-xs text-stone-400 text-left">
                  {timePeriod.note}
                </span>
              )}
              {timePeriod.injury !== null &&
                selectedTimePeriodProperties.has("injury") && (
                  <span className="w-[22.75rem] break-all text-xs text-red-600">
                    <span className="font-medium text-red-800">Injury: </span>
                    {timePeriod.injury}
                  </span>
                )}
            </div>
          </div>
        ))}
        {filteredTimePeriods.length === 0 && (
          <EmptyListLabel itemName="Time Periods" />
        )}
      </ScrollShadow>
    </div>
  );
};
