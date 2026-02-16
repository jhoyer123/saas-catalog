// mock/categories.mock.ts

export interface CategoryMock {
  id: string;
  name: string;
  slug: string;
}

export const mockCategories: CategoryMock[] = [
  {
    id: "cat-001",
    name: "Camisetas",
    slug: "camisetas",
  },
  {
    id: "cat-002",
    name: "Pantalones",
    slug: "pantalones",
  },
  {
    id: "cat-003",
    name: "Vestidos",
    slug: "vestidos",
  },
  {
    id: "cat-004",
    name: "Chaquetas",
    slug: "chaquetas",
  },
  {
    id: "cat-005",
    name: "Accesorios",
    slug: "accesorios",
  },
];
