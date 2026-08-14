import { BrandOfForm } from "@/types/brand.types";
import { CategorySimple } from "@/types/category.types";

export const categoryOptions = (categories: CategorySimple[]) => {
  return categories.map((cat) => ({ value: cat.id, label: cat.name }));
};

export const brandOptions = (brands: BrandOfForm[]) => {
  return brands.map((brand) => ({ value: brand.id, label: brand.name }));
};
