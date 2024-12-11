import { ScrollShadow, Select, SelectItem } from "@nextui-org/react";
import { ListFilterMapKey, Multiset, MultisetTypeMap } from "../../typings";
import { EmptyListLabel, SearchInput } from "..";
import { Link } from "react-router-dom";

type MultisetTemplateModalListProps = {
  handleClickMultiset: (multiset: Multiset, numSets: string) => void;
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredMultisets: Multiset[];
  multisetTypeMap: MultisetTypeMap;
  numNewSets: string;
  setNumNewSets: React.Dispatch<React.SetStateAction<string>>;
  numSetsOptions: string[];
  multisets: Multiset[];
  filterMap: Map<ListFilterMapKey, string>;
};

export const MultisetTemplateModalList = ({
  handleClickMultiset,
  filterQuery,
  setFilterQuery,
  filteredMultisets,
  multisetTypeMap,
  numNewSets,
  setNumNewSets,
  numSetsOptions,
  multisets,
  filterMap,
}: MultisetTemplateModalListProps) => {
  return (
    <div className="h-[400px] flex flex-col gap-2">
      <div className="flex gap-2">
        <SearchInput
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          filteredListLength={filteredMultisets.length}
          totalListLength={multisets.length}
          isListFiltered={filterMap.size > 0}
        />
        <Select
          label="Number Of Sets To Add"
          variant="faded"
          classNames={{
            trigger: "bg-amber-50 border-amber-200",
          }}
          selectedKeys={[numNewSets]}
          onChange={(e) => setNumNewSets(e.target.value)}
          disallowEmptySelection
        >
          {numSetsOptions.map((num) => (
            <SelectItem key={num} value={num}>
              {num}
            </SelectItem>
          ))}
        </Select>
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
          <EmptyListLabel
            itemName="Multiset Templates"
            extraContent={
              <Link to={"/multisets/"}>Create Multiset Templates Here</Link>
            }
          />
        )}
      </ScrollShadow>
    </div>
  );
};
