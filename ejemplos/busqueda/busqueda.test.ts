import { describe, expect, test } from "bun:test";
import { catalogoEjemplo } from "./fixtures";
import { filterProducts, interpretProductRequest, type ProductFilters } from "./product-discovery";

const empty: ProductFilters = { query: "", category: "", business: "", spot: "", sort: "relevance" };

describe("búsqueda por reglas con datos ficticios", () => {
  test("interpreta categoría, presupuesto y punto en una consulta", () => {
    const result = interpretProductRequest("Busco postres hasta S/10 en Plaza Central", catalogoEjemplo);
    expect(result.understood).toBe(true);
    expect(result.filters).toMatchObject({ category: "postres", maxPrice: 10, spot: "Plaza Central" });
    expect(filterProducts(catalogoEjemplo, result.filters).map(({ product }) => product.id)).toEqual(["postre-a", "postre-b"]);
  });

  test("conserva categoría y punto al ajustar presupuesto", () => {
    const first = interpretProductRequest("Postres hasta S/10 en Plaza Central", catalogoEjemplo);
    const next = interpretProductRequest("y hasta S/5", catalogoEjemplo, first.filters);
    expect(next.understood).toBe(true);
    expect(next.filters).toMatchObject({ category: "postres", maxPrice: 5, spot: "Plaza Central" });
    expect(filterProducts(catalogoEjemplo, next.filters).map(({ product }) => product.id)).toEqual(["postre-b"]);
    expect(first.filters.maxPrice).toBe(10);
  });

  test("el presupuesto corresponde a la presentación solicitada", () => {
    const match = filterProducts(catalogoEjemplo, { ...empty, query: "tarta grande", maxPrice: 10 });
    expect(match[0]?.matchedPrices).toEqual([{ label: "Grande", price: 10 }]);
    expect(filterProducts(catalogoEjemplo, { ...empty, query: "tarta grande", maxPrice: 6 })).toHaveLength(0);
  });

  test("cotizaciones no se interpretan como precio cero", () => {
    const all = filterProducts(catalogoEjemplo, { ...empty, sort: "price-asc" });
    expect(all.at(-1)?.price).toBeNull();
    expect(filterProducts(catalogoEjemplo, { ...empty, maxPrice: 50 }).some(({ product }) => product.quoteOnly)).toBe(false);
  });

  test("no afirma restricciones alimentarias que no puede comprobar", () => {
    const result = interpretProductRequest("postres sin azúcar", catalogoEjemplo);
    expect(result.understood).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  test("rechaza presupuestos contradictorios en lugar de inferir uno", () => {
    const result = interpretProductRequest("postres hasta S/5 y hasta S/10", catalogoEjemplo);
    expect(result.understood).toBe(false);
    expect(result.explanation).toContain("presupuesto único");
  });
});
