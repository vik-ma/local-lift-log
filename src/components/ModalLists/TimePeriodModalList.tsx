import { useMemo } from "react";
import {
  TimePeriod,
  UserSettings,
  UseTimePeriodListReturnType,
} from "../../typings";
import { Button, ScrollShadow } from "@heroui/react";
import {
  EmptyListLabel,
  ListFilters,
  SearchInput,
  TimePeriodListItemContent,
  TimePeriodListOptions,
} from "..";
import { GoToArrowIcon } from "../../assets";
import { Link, useNavigate } from "react-router-dom";

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
  }, [customHeightString]);

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
            <TimePeriodListItemContent
              timePeriod={timePeriod}
              selectedTimePeriodProperties={selectedTimePeriodProperties}
              isInModalList={true}
            />
          </div>
        ))}
        {filteredTimePeriods.length === 0 && (
          <EmptyListLabel
            itemName="Time Periods"
            extraContent={
              timePeriods.length > 0 ? undefined : (
                <Link to={"/time-periods"}>Create Time Periods Here</Link>
              )
            }
          />
        )}
      </ScrollShadow>
    </div>
  );
};
