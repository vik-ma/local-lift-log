import { useMemo, useRef, useState } from "react";
import { UsePaginatedListReturnType } from "../typings";
import { DEFAULT_MODAL_PAGINATION_ITEMS } from "../constants";

export const usePaginatedList = <T,>(
  list: T[]
): UsePaginatedListReturnType<T> => {
  const [paginationPage, setPaginationPage] = useState<number>(1);

  const itemsPerPaginationPage = useRef<number>(DEFAULT_MODAL_PAGINATION_ITEMS);

  const totalPaginationPages = Math.ceil(
    list.length / itemsPerPaginationPage.current
  );

  const validPaginationPage =
    paginationPage > totalPaginationPages
      ? totalPaginationPages
      : paginationPage;

  const paginatedList = useMemo(() => {
    const start = (validPaginationPage - 1) * itemsPerPaginationPage.current;
    return list.slice(start, start + itemsPerPaginationPage.current);
  }, [list, validPaginationPage]);

  return {
    setPaginationPage,
    itemsPerPaginationPage,
    paginatedList,
    totalPaginationPages,
    validPaginationPage,
  };
};
