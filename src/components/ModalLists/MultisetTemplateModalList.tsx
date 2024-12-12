import { Button, ScrollShadow } from "@nextui-org/react";
import {
  Multiset,
  MultisetModalPage,
  UseMultisetActionsReturnType,
} from "../../typings";
import { EmptyListLabel, MultisetListOptions, SearchInput } from "..";

type MultisetTemplateModalListProps = {
  useMultisetActions: UseMultisetActionsReturnType;
  handleClickMultiset: (multiset: Multiset, numSets: string) => void;
  numNewSets: string;
  setModalPage: React.Dispatch<React.SetStateAction<MultisetModalPage>>;
};

export const MultisetTemplateModalList = ({
  useMultisetActions,
  handleClickMultiset,
  numNewSets,
  setModalPage,
}: MultisetTemplateModalListProps) => {
  const {
    multisets,
    filterQuery,
    setFilterQuery,
    filteredMultisets,
    multisetTypeMap,
    listFilters,
  } = useMultisetActions;

  const { filterMap } = listFilters;

  return (
    <div className="h-[400px] flex flex-col gap-1.5">
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
            onPress={() => setModalPage("base")}
          >
            Create New Multiset
          </Button>
          <MultisetListOptions useMultisetActions={useMultisetActions} />
        </div>
      </div>
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
    </div>
  );
};
