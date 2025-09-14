import { Button, ScrollShadow } from "@heroui/react";
import {
  Multiset,
  MultisetModalPage,
  UseMultisetActionsReturnType,
  UserSettings,
} from "../../typings";
import {
  EmptyListLabel,
  ListFilters,
  LoadingSpinner,
  MultisetListOptions,
  SearchInput,
} from "..";

type MultisetTemplateModalListProps = {
  useMultisetActions: UseMultisetActionsReturnType;
  handleClickMultiset: (multiset: Multiset, numSets: string) => void;
  numNewSets: string;
  setModalPage: React.Dispatch<React.SetStateAction<MultisetModalPage>>;
  userSettings: UserSettings;
};

export const MultisetTemplateModalList = ({
  useMultisetActions,
  handleClickMultiset,
  numNewSets,
  setModalPage,
  userSettings,
}: MultisetTemplateModalListProps) => {
  const {
    multisets,
    filterQuery,
    setFilterQuery,
    filteredMultisets,
    multisetTypeMap,
    listFilters,
    isMultisetListLoaded,
  } = useMultisetActions;

  const { filterMap, removeFilter, prefixMap, resetFilter } = listFilters;

  const handleCreateNewMultisetButton = () => {
    setModalPage("base");

    if (filterMap.size > 0) resetFilter(userSettings);
  };

  return (
    <div className="h-[450px] flex flex-col gap-1.5">
      <div className="flex flex-col gap-1.5">
        <SearchInput
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredMultisets.length}
          totalListLength={multisets.length}
          isListFiltered={filterMap.size > 0}
        />
        <div className="flex justify-between">
          <Button
            color="secondary"
            size="sm"
            variant="flat"
            onPress={handleCreateNewMultisetButton}
          >
            Create New Multiset
          </Button>
          <MultisetListOptions
            useMultisetActions={useMultisetActions}
            userSettings={userSettings}
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
      {isMultisetListLoaded.current ? (
        <ScrollShadow className="flex flex-col gap-1">
          {filteredMultisets.map((multiset) => {
            const multisetTypeText =
              multisetTypeMap.get(multiset.multiset_type) ?? "";

            return (
              <button
                key={multiset.id}
                className="flex flex-col justify-start items-start bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:bg-default-200 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                onClick={() => handleClickMultiset(multiset, numNewSets)}
              >
                <span className="text-base max-w-full break-words text-left">
                  {multiset.setListText}
                </span>
                <span className="text-xs text-secondary text-left">
                  {multisetTypeText}
                </span>
              </button>
            );
          })}
          {filteredMultisets.length === 0 && (
            <EmptyListLabel itemName="Multiset Templates" />
          )}
        </ScrollShadow>
      ) : (
        <LoadingSpinner />
      )}
    </div>
  );
};
