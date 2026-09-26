import { useState } from 'react';

export function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage);
  return { page, setPage, next: () => setPage((value) => value + 1), prev: () => setPage((value) => Math.max(1, value - 1)) };
}
