declare module '@inertiajs/core' {
  interface PageProps {
    [key: string]: unknown;
  }
}

declare module '@inertiajs/react' {
  interface PageProps {
    [key: string]: unknown;
  }
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  links: PaginationLink[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedData<T> {
  data: T[];
  links: PaginationLink[];
  meta: PaginationMeta;
}