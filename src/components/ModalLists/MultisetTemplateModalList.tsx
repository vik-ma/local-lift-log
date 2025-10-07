import { Button, Pagination, ScrollShadow } from "@heroui/react";
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
import {
  LIST_HEIGHT_WITH_PAGINATION,
  LIST_HEIGHT_WITHOUT_PAGINATION,
  MODAL_BODY_HEIGHT,
} from "../../constants";

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
    listFilters,
    isMultisetListLoaded,
    paginatedMultisets,
    totalPaginationPages,
    validPaginationPage,
    setPaginationPage,
  } = useMultisetActions;

  const { filterMap, removeFilter, prefixMap, resetFilter } = listFilters;

  const showPaginationControls = totalPaginationPages > 1;

  const listHeight = showPaginationControls
    ? LIST_HEIGHT_WITH_PAGINATION
    : LIST_HEIGHT_WITHOUT_PAGINATION;

  const handleCreateNewMultisetButton = () => {
    setModalPage("base");

    if (filterMap.size > 0) resetFilter(userSettings);
  };

  return (
    <div className={`${MODAL_BODY_HEIGHT} flex flex-col gap-1.5`}>
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
          <MultisetListOptions useMultisetActions={useMultisetActions} />
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
        <div className="flex flex-col justify-between gap-1.5">
          <ScrollShadow className={`${listHeight} flex flex-col gap-1`}>
            {paginatedMultisets.map((multiset) => {
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
                    {multiset.multiset_type}
                  </span>
                </button>
              );
            })}
            {filteredMultisets.length === 0 && (
              <EmptyListLabel itemName="Multiset Templates" />
            )}
          </ScrollShadow>
          {showPaginationControls && (
            <div className="flex justify-center">
              <Pagination
                showControls
                loop
                page={validPaginationPage}
                total={totalPaginationPages}
                onChange={setPaginationPage}
              />
            </div>
          )}
        </div>
      ) : (
        <LoadingSpinner />
      )}
    </div>
  );
};
