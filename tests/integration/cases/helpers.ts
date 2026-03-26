export function buildCaseListQuery(params: {
  q?: string;
  status?: string[];
  productLine?: string;
  cargoProduct?: string;
  coverType?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status?.length) search.set("status", params.status.join(","));
  if (params.productLine) search.set("productLine", params.productLine);
  if (params.cargoProduct) search.set("cargoProduct", params.cargoProduct);
  if (params.coverType) search.set("coverType", params.coverType);
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortDir) search.set("sortDir", params.sortDir);
  return search.toString();
}
