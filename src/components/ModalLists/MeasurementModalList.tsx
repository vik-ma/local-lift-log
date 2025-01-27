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
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

type MeasurementModalListProps = {
  useMeasurementList: UseMeasurementListReturnType;
  handleMeasurementClick: (measurement: Measurement) => void;
  highlightedMeasurements?: Set<string>;
  customHeightString?: string;
};

export const MeasurementModalList = ({
  useMeasurementList,
  handleMeasurementClick,
  highlightedMeasurements,
  customHeightString,
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
  }, []);

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
              highlightedMeasurements?.has(measurement.id.toString())
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
                  <span className="w-[17.5rem] truncate text-left">
                    {measurement.name}
                  </span>
                  <span className="text-xs text-stone-400 text-left">
                    {measurement.measurement_type}
                  </span>
                </div>
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
          <EmptyListLabel itemName="Measurements" />
        )}
      </ScrollShadow>
    </div>
  );
};
