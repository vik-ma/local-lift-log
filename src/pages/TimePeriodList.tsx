import { Button } from "@nextui-org/react";
import { ListPageSearchInput, LoadingSpinner } from "../components";
import { useTimePeriodList } from "../hooks";

export default function TimePeriodList() {
  const timePeriodList = useTimePeriodList(true);

  const {
    timePeriods,
    setTimePeriods,
    filteredTimePeriods,
    filterQuery,
    setFilterQuery,
    isTimePeriodListLoaded,
  } = timePeriodList;

  const handleCreateNewTimePeriodButton = () => {};

  if (!isTimePeriodListLoaded.current) return <LoadingSpinner />;

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <ListPageSearchInput
          header="Time Period List"
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredTimePeriods.length}
          totalListLength={timePeriods.length}
          // TODO: CHANGE IF ADDING FILTERS
          isListFiltered={false}
          bottomContent={
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <Button
                  color="secondary"
                  variant="flat"
                  onPress={handleCreateNewTimePeriodButton}
                  size="sm"
                >
                  New Time Period
                </Button>
              </div>
            </div>
          }
        />
      </div>
    </>
  );
}
