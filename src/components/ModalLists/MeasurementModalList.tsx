import { Button, ScrollShadow } from "@heroui/react";
import {
  EmptyListLabel,
  FavoriteButton,
  ListFilters,
  MeasurementListOptions,
  SearchInput,
} from "..";
import { Measurement, UseMeasurementListReturnType } from "../../typings";
import { CheckmarkIcon, GoToArrowIcon } from "../../assets";
import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { FormatNumBodyMeasurementsEntriesString } from "../../helpers";

type MeasurementModalListProps = {
  useMeasurementList: UseMeasurementListReturnType;
  handleMeasurementClick: (measurement: Measurement) => void;
  highlightedMeasurements?: Set<string>;
  customHeightString?: string;
  hiddenMeasurements?: Map<number, Measurement>;
  isInAnalyticsPage?: boolean;
  bodyFatMeasurementsMap?: Map<number, Measurement>;
  hideCircumferenceMeasurements?: boolean;
};

export const MeasurementModalList = ({
  useMeasurementList,
  handleMeasurementClick,
  highlightedMeasurements,
  customHeightString,
  hiddenMeasurements,
  isInAnalyticsPage,
  bodyFatMeasurementsMap,
  hideCircumferenceMeasurements,
}: MeasurementModalListProps) => {
  const {
    measurements,
    filterQuery,
    setFilterQuery,
    filteredMeasurements,
    toggleFavorite,
    listFilters,
  } = useMeasurementList;

  const { filterMap, removeFilter, prefixMap } = listFilters;

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
          filteredListLength={filteredMeasurements.length}
          totalListLength={measurements.length}
          isListFiltered={filterMap.size > 0}
        />
        <div className="flex justify-between items-center">
          <Button
            variant="flat"
            size="sm"
            color="secondary"
            onPress={() => navigate("/measurements/measurement-list")}
            endContent={<GoToArrowIcon />}
          >
            Edit Measurements
          </Button>
          <MeasurementListOptions useMeasurementList={useMeasurementList} />
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
        {filteredMeasurements.map((measurement) => (
          <div
            key={measurement.id}
            className={
              hideCircumferenceMeasurements &&
              measurement.measurement_type === "Circumference"
                ? "hidden"
                : hiddenMeasurements?.has(measurement.id)
                ? "hidden"
                : highlightedMeasurements?.has(measurement.id.toString())
                ? "flex cursor-pointer bg-amber-100 border-2 border-amber-300 rounded-xl transition-colors duration-100 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                : "flex cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl transition-colors duration-100 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
            }
            onClick={() => handleMeasurementClick(measurement)}
          >
            <div className="flex justify-between items-center py-1 pl-2 w-full">
              <div className="flex gap-2.5 items-center">
                {highlightedMeasurements !== undefined && (
                  <CheckmarkIcon
                    isChecked={highlightedMeasurements.has(
                      measurement.id.toString()
                    )}
                    size={29}
                  />
                )}
                <div className="flex flex-col justify-start items-start">
                  <span
                    className={
                      bodyFatMeasurementsMap?.has(measurement.id) &&
                      highlightedMeasurements !== undefined
                        ? "w-[14rem] truncate text-left"
                        : highlightedMeasurements !== undefined
                        ? "w-[17.5rem] truncate text-left"
                        : "w-[20rem] truncate text-left"
                    }
                  >
                    {measurement.name}
                  </span>
                  <span className="text-xs text-stone-400 text-left">
                    {measurement.measurement_type}
                  </span>
                  {measurement.numBodyMeasurementsEntries! > 0 && (
                    <span
                      className={
                        highlightedMeasurements !== undefined
                          ? "w-[17.5rem] truncate text-xs text-secondary text-left"
                          : "w-[21rem] truncate text-xs text-secondary text-left"
                      }
                    >
                      {FormatNumBodyMeasurementsEntriesString(
                        measurement.numBodyMeasurementsEntries
                      )}
                    </span>
                  )}
                </div>
                {bodyFatMeasurementsMap?.has(measurement.id) && (
                  <div className="px-2.5 py-1 rounded-md text-sm text-yellow-600 bg-primary/30 z-50">
                    BF%
                  </div>
                )}
              </div>
              <div className="flex items-center pr-2">
                <FavoriteButton
                  name={measurement.name}
                  isFavorite={!!measurement.is_favorite}
                  item={measurement}
                  toggleFavorite={() => toggleFavorite(measurement)}
                />
              </div>
            </div>
          </div>
        ))}
        {filteredMeasurements.length === 0 && (
          <EmptyListLabel
            itemName="Measurements"
            customLabel={
              isInAnalyticsPage && measurements.length === 0
                ? "No Body Measurements Has Been Recorded"
                : undefined
            }
            extraContent={
              measurements.length > 0 ? undefined : (
                <Link to={"/measurements/measurement-list"}>
                  Create Or Restore Default Measurements Here
                </Link>
              )
            }
          />
        )}
      </ScrollShadow>
    </div>
  );
};
