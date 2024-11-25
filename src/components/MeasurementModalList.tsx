import { ScrollShadow } from "@nextui-org/react";
import { EmptyListLabel, FavoriteButton, SearchInput } from ".";
import { Measurement, UseMeasurementListReturnType } from "../typings";
import { CheckmarkIcon } from "../assets";

type MeasurementModalListProps = {
  useMeasurementList: UseMeasurementListReturnType;
  handleMeasurementClick: (measurement: Measurement) => void;
};

export const MeasurementModalList = ({
  useMeasurementList,
  handleMeasurementClick,
}: MeasurementModalListProps) => {
  const {
    measurements,
    filterQuery,
    setFilterQuery,
    filteredMeasurements,
    activeMeasurementSet,
    toggleFavorite,
  } = useMeasurementList;

  return (
    <div className="h-[400px] flex flex-col gap-2">
      <SearchInput
        filterQuery={filterQuery}
        setFilterQuery={setFilterQuery}
        filteredListLength={filteredMeasurements.length}
        totalListLength={measurements.length}
      />
      <ScrollShadow className="flex flex-col gap-1">
        {filteredMeasurements.map((measurement) => (
          <div
            key={measurement.id}
            className={
              activeMeasurementSet.has(measurement.id)
                ? "flex cursor-pointer bg-yellow-100 border-2 border-yellow-300 rounded-xl transition-colors duration-100 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                : "flex cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl transition-colors duration-100 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
            }
            onClick={() => handleMeasurementClick(measurement)}
          >
            <div className="flex justify-between items-center py-1 pl-2 w-full">
              <div className="flex gap-2.5 items-center">
                <CheckmarkIcon
                  isChecked={activeMeasurementSet.has(measurement.id)}
                  size={29}
                />
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
