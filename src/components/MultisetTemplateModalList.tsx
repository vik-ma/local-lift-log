import { Input, ScrollShadow, Select, SelectItem } from "@nextui-org/react";
import { SearchIcon } from "../assets";
import { Multiset, MultisetTypeMap } from "../typings";
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
}: MultisetTemplateModalListProps) => {
  return (
    <div className="h-[400px] flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          label="Search"
          variant="faded"
          placeholder="Type to search..."
          isClearable
          value={filterQuery}
          onValueChange={setFilterQuery}
          startContent={<SearchIcon />}
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
          const multisetTypeText = multisetTypeMap[multiset.multiset_type]
            ? multisetTypeMap[multiset.multiset_type].text
            : "";

          return (
            <button
              key={multiset.id}
              className="flex flex-col justify-start items-start bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:bg-default-200 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
              onClick={() => handleClickMultiset(multiset, numNewSets)}
            >
              <span className="text-md max-w-full break-words text-left">
                {multiset.setListText}
              </span>
              <span className="text-xs text-yellow-600 text-left">
                {multisetTypeText}
              </span>
            </button>
          );
        })}
        {filteredMultisets.length === 0 && (
          <div className="flex flex-col items-center justify-center text-stone-500 py-2">
            <h2>No Multiset Templates Created</h2>
            <Link to={"/multisets/"}>Create Multiset Templates Here</Link>
          </div>
        )}
      </ScrollShadow>
    </div>
  );
};
