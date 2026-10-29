/** Tipos mínimos para ejecutar el extracto con datos ficticios. */
export type Product = {
  id: string;
  name: string;
  description: string;
} & (
  | { quoteOnly: true; price?: never; sizes?: never }
  | { quoteOnly?: false; price: number; sizes?: { label: string; price: number }[] }
);

export interface Business {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryId: string;
  spots: string[];
  catalog: { title: string; items: Product[] }[];
}
