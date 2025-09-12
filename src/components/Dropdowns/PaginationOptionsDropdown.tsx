import { Select, SelectItem } from "@heroui/react";
import { UpdateUserSettingFunction } from "../../typings";
import {
  PAGINATION_OPTIONS_LIST_PAGE,
  PAGINATION_OPTIONS_MODAL,
} from "../../constants";

type PaginationOptionsDropdownProps = {
  value: number;
  updateUserSetting: UpdateUserSettingFunction;
  isModalOption?: boolean;
};

export const PaginationOptionsDropdown = ({
  value,
  updateUserSetting,
  isModalOption,
}: PaginationOptionsDropdownProps) => {
  const paginationOptions = isModalOption
    ? PAGINATION_OPTIONS_MODAL
    : PAGINATION_OPTIONS_LIST_PAGE;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const numValue = Number(e.target.value);

    updateUserSetting("num_pagination_items_list_desktop", numValue);
  };

  return (
    <Select
      aria-label="Number Of Pagination Items Dropdown List"
      className="w-[5rem]"
      variant="faded"
      selectedKeys={[value.toString()]}
      onChange={(e) => handleChange(e)}
      disallowEmptySelection
    >
      {paginationOptions.map((option) => (
        <SelectItem key={option}>{option.toString()}</SelectItem>
      ))}
    </Select>
  );
};
