import { DietPhaseTypeSpan } from ".";
import { TimePeriod } from "../typings";

type TimePeriodListItemContent = {
  timePeriod: TimePeriod;
  selectedTimePeriodProperties: Set<string>;
  isInModalList: boolean;
};

export const TimePeriodListItemContent = ({
  timePeriod,
  selectedTimePeriodProperties,
  isInModalList,
}: TimePeriodListItemContent) => {
  const isOngoing =
    timePeriod.isOngoing && selectedTimePeriodProperties.has("ongoing");

  const nameWidth =
    isInModalList && isOngoing
      ? "max-w-[18.25rem]"
      : !isInModalList && isOngoing
      ? "max-w-[16.75rem]"
      : isInModalList
      ? "max-w-[22.75rem]"
      : "max-w-[20.75rem]";

  const contentWidth = isInModalList ? "w-[22.75rem]" : "max-w-[20.75rem]";

  return (
    <div className="flex flex-col justify-start items-start">
      <div className="flex gap-1 items-baseline">
        <span className={`${nameWidth} truncate text-stone-600`}>
          {timePeriod.name}
        </span>
        {timePeriod.isOngoing &&
          selectedTimePeriodProperties.has("ongoing") && (
            <span className="text-sm text-indigo-500">(Ongoing)</span>
          )}
      </div>
      <div className={`${contentWidth} text-xs text-left truncate`}>
        <span className="text-secondary">
          <span className="font-medium text-stone-500">Start Date: </span>
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
        <span
          className={`${contentWidth} break-all text-xs text-stone-400 text-left`}
        >
          {timePeriod.note}
        </span>
      )}
      {timePeriod.injury !== null &&
        selectedTimePeriodProperties.has("injury") && (
          <span className={`${contentWidth} break-all text-xs text-red-600`}>
            <span className="font-medium">Injury: </span>
            {timePeriod.injury}
          </span>
        )}
    </div>
  );
};
