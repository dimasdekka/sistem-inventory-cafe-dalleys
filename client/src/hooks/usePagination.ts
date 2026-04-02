import { useState, useCallback } from "react";
import { PAGE_SIZE } from "@/constants";

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

interface UsePaginationReturn {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetPage: () => void;
  totalPages: (total: number) => number;
  pageInfo: (total: number) => { from: number; to: number; total: number };
}

export function usePagination({
  initialPage = 1,
  initialLimit = PAGE_SIZE,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [page, setPageState] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);

  const setPage = useCallback((p: number) => setPageState(p), []);
  const setLimit = useCallback((l: number) => {
    setLimitState(l);
    setPageState(1);
  }, []);

  const nextPage = useCallback(() => setPageState((p) => p + 1), []);
  const prevPage = useCallback(
    () => setPageState((p) => Math.max(1, p - 1)),
    [],
  );
  const resetPage = useCallback(() => setPageState(1), []);

  const totalPages = useCallback(
    (total: number) => Math.ceil(total / limit),
    [limit],
  );

  const pageInfo = useCallback(
    (total: number) => ({
      from: Math.min((page - 1) * limit + 1, total),
      to: Math.min(page * limit, total),
      total,
    }),
    [page, limit],
  );

  return {
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    resetPage,
    totalPages,
    pageInfo,
  };
}
