// Types communs renvoyés par le backend Spring Boot (Page<T> de Spring Data)

export interface Page<T> {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageRequest {
  page?: number;       
  size?: number;
  sort?: string; 
}

export interface ApiError {
  timestamp?: string;
  status?: number;
  error?: string;
  message: string;
  path?: string;
}

export interface ReponsePage<T> {
  content: T[];

  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };

  totalElements: number;
  totalPages: number;

  last: boolean;
  first: boolean;
  size: number;
  number: number;

  numberOfElements: number;
  empty: boolean;
}