import type { Business, Product } from "./types";

/** El mismo estado alimenta los filtros y la búsqueda por frases. No usa servicios externos. */
export interface ProductFilters {
  query: string;
  category: string;
  business: string;
  spot: string;
  minPrice?: number;
  maxPrice?: number;
  sort: "relevance" | "price-asc" | "price-desc";
}

export interface ProductMatch {
  business: Business;
  product: Product;
  section: string;
  matchedPrices: { label: string; price: number }[];
  /** Menor importe publicado que cumple los límites; null si requiere cotización. */
  price: number | null;
}

export interface InterpretedProductRequest {
  filters: ProductFilters;
  understood: boolean;
  explanation: string;
  warnings: string[];
  reset: boolean;
}

const emptyFilters = (): ProductFilters => ({
  query: "", category: "", business: "", spot: "", sort: "relevance",
});

function normalized(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

const searchStopWords = new Set(["de", "del", "la", "las", "el", "los", "un", "una", "unos", "unas", "y", "en", "con", "para"]);
const relatedWords: Record<string, string[]> = {
  tejido: ["tejido", "crochet", "amigurumi"],
  tejidos: ["tejido", "crochet", "amigurumi"],
  crochet: ["crochet", "amigurumi", "tejido"],
  amigurumi: ["amigurumi"],
  amigurumis: ["amigurumi"],
  hamburguesa: ["hamburguesa", "burger"],
  hamburguesas: ["hamburguesa", "burger"],
  waffle: ["waffle", "wafle"],
  waffles: ["waffle", "wafle"],
  wafle: ["waffle", "wafle"],
  wafles: ["waffle", "wafle"],
};

function searchWords(value: string): string[] {
  return normalized(value).replace(/(\d)([a-z])/g, "$1 $2").split(/[^a-z0-9]+/).filter((word) => word && !searchStopWords.has(word));
}

function wordMatches(word: string, textWords: string[]): boolean {
  const alternatives = relatedWords[word] ?? [word];
  return alternatives.some((alternative) => textWords.some((candidate) =>
    candidate === alternative || (alternative.length > 3 && candidate.startsWith(alternative)) ||
    (alternative.endsWith("s") && alternative.length > 4 && candidate === alternative.slice(0, -1)),
  ));
}

function searchableProduct(product: Product, section: string): string[] {
  // La descripción general del negocio no debe hacer coincidir todos sus productos.
  return searchWords([product.name, product.description, section, ...(product.sizes ?? []).map((size) => size.label)].join(" "));
}

function validRange(filters: ProductFilters): boolean {
  const { minPrice, maxPrice } = filters;
  if (minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) return false;
  if (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) return false;
  return minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice;
}

function publishedPrices(product: Product): { label: string; price: number }[] {
  if (product.quoteOnly) return [];
  const sizes = (product.sizes ?? []).filter((size) => Number.isFinite(size.price) && size.price >= 0);
  const base = Number.isFinite(product.price) && product.price >= 0 && !sizes.some((size) => size.price === product.price)
    ? [{ label: "Precio publicado", price: product.price }]
    : [];
  return [...base, ...sizes];
}

/** Etiquetas explícitas del producto/sección; el resto conserva la categoría curada del negocio. */
export function productCategory(business: Business, product: Product, section: string): string {
  const name = normalized(product.name);
  const title = normalized(section);
  if (/\b(?:bebidas?|cafes?|jugos?|gaseosas?|chai|chailatte)\b/.test(title)) return "bebidas";
  if (/\b(?:llaveros?|accesorios?|amigurumis?|peluches?|stickers?|squishies?)\b/.test(`${title} ${name}`)) return "accesorios";
  if (/\b(?:postres?|wafles?|waffles?|carlotas?|cheesecake|pay|pie|minikekito|cuchareables?|tortas?|brownies?|cookies?|minicookies|helados?)\b/.test(`${title} ${name}`)) return "postres";
  if (/^(?:cafe|chai|chailatte|jugo|gaseosa|limonada|refresco|bebida)\b/.test(name)) return "bebidas";
  if (/\b(?:hamburguesas?|burgers?)\b/.test(`${title} ${name}`)) return "hamburguesas";
  if (/\b(?:ropa|prendas?|polos?|polera|polito|tops?|vestidos?|pantalones?)\b/.test(`${title} ${name}`)) return "moda";
  return business.categoryId;
}

export function filterProducts(businesses: Business[], filters: ProductFilters): ProductMatch[] {
  if (!validRange(filters)) return [];
  const words = searchWords(filters.query);
  const category = normalized(filters.category);
  const selectedBusiness = normalized(filters.business);
  const spot = normalized(filters.spot);
  const matches: { match: ProductMatch; score: number }[] = [];
  const seen = new Set<string>();
  for (const business of businesses) {
    if (selectedBusiness && ![business.slug, business.id, business.name].some((value) => normalized(value) === selectedBusiness)) continue;
    if (spot && !business.spots.some((value) => normalized(value) === spot)) continue;
    for (const section of business.catalog) {
      for (const product of section.items) {
        if (category && normalized(productCategory(business, product, section.title)) !== category && normalized(business.category) !== category) continue;
        const key = `${business.id}:${product.id}`;
        if (seen.has(key) || !words.every((word) => wordMatches(word, searchableProduct(product, section.title)))) continue;
        // Si la frase pide una presentación concreta, su precio debe pertenecer a esa presentación.
        const presentationWords = words.filter((word) => (product.sizes ?? []).some((size) => wordMatches(word, searchWords(size.label))));
        const quoteOnly = product.quoteOnly === true;
        if (quoteOnly && (filters.minPrice !== undefined || filters.maxPrice !== undefined)) continue;
        const matchedPrices = publishedPrices(product).filter(({ price }) =>
          (filters.minPrice === undefined || price >= filters.minPrice) &&
          (filters.maxPrice === undefined || price <= filters.maxPrice),
        ).filter(({ label }) => presentationWords.every((word) => wordMatches(word, searchWords(label))));
        if (!quoteOnly && !matchedPrices.length) continue;
        seen.add(key);
        const nameWords = searchWords(product.name);
        const score = words.reduce((total, word) => total + (wordMatches(word, nameWords) ? 2 : 1), 0);
        matches.push({
          match: { business, product, section: section.title, matchedPrices, price: quoteOnly ? null : Math.min(...matchedPrices.map(({ price }) => price)) },
          score,
        });
      }
    }
  }
  matches.sort((a, b) => {
    if (filters.sort === "relevance") return b.score - a.score;
    const first = a.match.price, second = b.match.price;
    // Un importe desconocido nunca se trata como cero, ni siquiera en orden descendente.
    if (first === null || second === null) return Number(first === null) - Number(second === null);
    return filters.sort === "price-asc" ? first - second : second - first;
  });
  return matches.map(({ match }) => match);
}

const categoryPhrases = [
  { id: "postres", label: "Postres", aliases: ["postres", "postre", "dulces", "dulce"] },
  { id: "hamburguesas", label: "Hamburguesas", aliases: ["hamburguesas", "hamburguesa", "burgers", "burger"] },
  { id: "bebidas", label: "Bebidas", aliases: ["bebidas", "bebida", "chailatte", "chai latte"] },
  { id: "moda", label: "Moda", aliases: ["moda", "ropa", "prendas", "prenda", "polos", "tops"] },
  { id: "webdev", label: "Desarrollo Web", aliases: ["desarrollo web", "paginas web", "pagina web", "sitio web", "sitios web", "webdev"] },
  { id: "diseno", label: "Diseño gráfico", aliases: ["diseno grafico", "disenos graficos", "diseno", "disenos"] },
  { id: "saludable", label: "Saludable", aliases: ["saludables", "saludable", "energeticos", "energetico"] },
  { id: "belleza", label: "Belleza", aliases: ["belleza", "cuidado personal", "selfcare", "skincare", "cuidado de la piel"] },
  { id: "accesorios", label: "Accesorios y amigurumis", aliases: ["regalo tejido", "regalos tejidos", "amigurumis", "amigurumi", "crochet", "tejidos", "tejido", "accesorios", "accesorio"] },
];

function escaped(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phrasePattern(phrase: string): RegExp {
  return new RegExp(`\\b${escaped(normalized(phrase)).replace(/\s+/g, "\\s+")}\\b`, "g");
}

const conversationalWords = new Set([
  ...searchStopWords, "busco", "buscar", "buscame", "quiero", "quisiera", "necesito", "dame", "muestra", "mostrar", "muestrame",
  "recomienda", "recomiendame", "recomendar", "recomendaciones", "algo", "algun", "alguna", "algunos", "algunas", "producto", "productos",
  "opcion", "opciones", "tienes", "hay", "que", "me", "puedes", "puede", "podrias", "comprar", "comprarme", "tengo", "mi", "presupuesto",
  "precio", "precios", "cueste", "cuesten", "cuesta", "coste", "costar", "valga", "valor", "por", "a", "al", "se", "encuentre",
  "recoger", "recojo", "entrega", "entregar", "punto", "campus", "unalm", "favor", "porfavor", "hola", "gracias", "bien", "ok",
  "y", "mejor", "solo", "solamente", "tambien", "ahora", "cambia", "cambiar", "sube", "baja", "limite", "limites", "deberia", "ser",
]);

function rejected(filters: ProductFilters, explanation: string, warnings: string[] = []): InterpretedProductRequest {
  return { filters, understood: false, explanation, warnings, reset: false };
}

/** Reglas explícitas para frases cortas; nunca afirma stock, horarios ni seguridad alimentaria. */
export function interpretProductRequest(message: string, businesses: Business[], previous?: ProductFilters): InterpretedProductRequest {
  const original = normalized(message);
  const startingFilters = previous ? { ...previous } : emptyFilters();
  if (!original) return rejected(startingFilters, "Escribe qué producto buscas, tu presupuesto o un punto del campus.");
  if (message.length > 240) return rejected(startingFilters, "Usa una frase de hasta 240 caracteres.");
  if (/^(?:empezar de nuevo|comenzar de nuevo|reiniciar|limpiar filtros|borrar filtros|(?:ver|mostrar)\s+(?:todo(?: el catalogo)?|todos(?: los productos)?))(?:[.!?])?$/.test(original)) {
    return { filters: emptyFilters(), understood: true, explanation: "Mostrando todos los productos del catálogo.", warnings: [], reset: true };
  }
  const warnings: string[] = [];
  let conditionText = original;
  // Los nombres comerciales no son restricciones alimentarias.
  for (const business of businesses) {
    for (const name of [business.name, business.slug.replace(/-/g, " "), business.slug]) {
      conditionText = conditionText.replace(phrasePattern(name), " ");
    }
  }
  const withoutBudgetNegation = conditionText.replace(/no\s+mas\s+de/g, "hasta");
  if (/\b(?:sin|excepto|excluye|excluir|evita|evitar|no)\b|\bnada\s+de\b/.test(withoutBudgetNegation)) {
    warnings.push("No puedo verificar exclusiones ni ingredientes. Confirma esas condiciones directamente con el negocio.");
  }
  if (/\b(?:stock|disponibles?|disponibilidad|agotad[oa]s?|quedan?|quedara|hoy|manana|abiert[oa]s?|abren?|cierran?|horarios?|hora)\b/.test(conditionText)) {
    warnings.push("El catálogo no confirma stock ni atención en tiempo real. Coordina disponibilidad y horario con el negocio.");
  }
  if (/\b(?:ingredientes?|alergenos?|alergias?|alergic[oa]s?|lactosa|gluten|vegan[oa]s?|vegetarian[oa]s?|azucar)\b/.test(conditionText)) {
    warnings.push("La búsqueda no verifica composición, alérgenos ni restricciones alimentarias. Consúltalos con el negocio.");
  }
  if (warnings.length) return rejected(startingFilters, "Puedo buscar por producto, precio, categoría, negocio y punto del campus; estas condiciones necesitan confirmación del negocio.", warnings);
  if (/(?:\bs\s*[/.]\s*|\b(?:hasta|menos de|maximo(?: de)?|minimo(?: de)?|desde|mas de|al menos|no mas de|entre)\s+)(?:s\s*[/.]\s*)?\d+[.,]\d{3,}\b|\b\d+[.,]\d{3,}\s+soles?\b|\bentre\b[^.!?]*\by\s+(?:s\s*[/.]\s*)?\d+[.,]\d{3,}\b/.test(original)) {
    return rejected(startingFilters, "Escribe los importes con un máximo de dos decimales, por ejemplo S/8,50.");
  }

  const continuation = previous && /^(?:y\b|mejor\b|solo\b|solamente\b|tambien\b|cambia\b|sube\b|baja\b|ahora\s+(?:en|de|hasta|desde|entre)\b|hasta\b|desde\b|maximo\b|minimo\b|entre\s+\d)/.test(original);
  const filters = continuation ? { ...previous } : emptyFilters();
  let remaining = original;
  let understood = false;
  let nextQuery = "";

  // Consume los importes antes de buscar nombres: una cifra aislada como "8 oz" no es un presupuesto.
  const amount = "(?:s\\s*[/.]\\s*)?(\\d+(?:[.,]\\d{1,2})?)\\s*(?:soles?|pen)?";
  const toPrice = (value: string) => Number(value.replace(",", "."));
  let lower: number | undefined;
  let upper: number | undefined;
  let lowerFound = false;
  let upperFound = false;
  let ambiguousBudget = false;
  remaining = remaining.replace(new RegExp(`\\bentre\\s+${amount}\\s+(?:y|a)\\s+${amount}`, "g"), (_whole, a: string, b: string) => {
    const nextLower = toPrice(a);
    const nextUpper = toPrice(b);
    ambiguousBudget ||= (lowerFound && lower !== nextLower) || (upperFound && upper !== nextUpper);
    lower = nextLower; upper = nextUpper; lowerFound = true; upperFound = true; return " ";
  });
  remaining = remaining.replace(new RegExp(`\\b(hasta|menos de|maximo(?: de)?|a lo sumo|no mas de|como maximo(?: de)?)\\s+${amount}`, "g"), (_whole, kind: string, value: string) => {
    const nextUpper = Math.round((toPrice(value) - (kind === "menos de" ? 0.01 : 0)) * 100) / 100;
    ambiguousBudget ||= upperFound && upper !== nextUpper;
    upper = nextUpper;
    upperFound = true; return " ";
  });
  remaining = remaining.replace(new RegExp(`\\b(minimo(?: de)?|desde|mas de|al menos)\\s+${amount}`, "g"), (_whole, kind: string, value: string) => {
    const nextLower = Math.round((toPrice(value) + (kind === "mas de" ? 0.01 : 0)) * 100) / 100;
    ambiguousBudget ||= lowerFound && lower !== nextLower;
    lower = nextLower;
    lowerFound = true; return " ";
  });
  remaining = remaining.replace(/\bs\s*[/.]\s*(\d+(?:[.,]\d{1,2})?)\b|\b(\d+(?:[.,]\d{1,2})?)\s+soles?\b/g, (_whole, currency: string, soles: string) => {
    const nextUpper = toPrice(currency || soles);
    ambiguousBudget ||= upperFound && upper !== nextUpper;
    if (!upperFound) { upper = nextUpper; upperFound = true; }
    return " ";
  });
  if (ambiguousBudget) return rejected(startingFilters, "Indica un presupuesto único o un rango, por ejemplo «entre S/5 y S/10».");
  if (lowerFound) filters.minPrice = lower;
  if (upperFound) filters.maxPrice = upper;
  if (lowerFound || upperFound) understood = true;
  if (!validRange(filters)) return rejected(startingFilters, "El precio mínimo debe ser menor o igual que el máximo y ambos deben ser importes válidos en soles.");

  const selectedBusinesses = businesses.filter((business) => [business.name, business.slug.replace(/-/g, " "), business.slug].some((name) => phrasePattern(name).test(remaining)));
  if (selectedBusinesses.length > 1) return rejected(startingFilters, "Busca un negocio a la vez o utiliza los filtros para comparar el catálogo completo.");
  if (selectedBusinesses.length === 1) {
    const business = selectedBusinesses[0];
    filters.business = business.slug;
    for (const name of [business.name, business.slug.replace(/-/g, " "), business.slug]) remaining = remaining.replace(phrasePattern(name), " ");
    understood = true;
  }
  const spots = [...new Set(businesses.flatMap((business) => business.spots))];
  const selectedSpots = spots.filter((spot) => phrasePattern(spot).test(remaining));
  if (selectedSpots.length > 1) return rejected(startingFilters, "Indica un punto del campus a la vez.");
  if (selectedSpots.length === 1) {
    filters.spot = selectedSpots[0];
    remaining = remaining.replace(phrasePattern(selectedSpots[0]), " ");
    understood = true;
  }
  const categories = categoryPhrases.filter((category) => businesses.some((business) => business.catalog.some((section) =>
    section.items.some((product) => productCategory(business, product, section.title) === category.id),
  )));
  const selectedCategories = categories.filter((category) => category.aliases.some((alias) => phrasePattern(alias).test(remaining)));
  if (selectedCategories.length > 1) return rejected(startingFilters, "Indica una categoría a la vez; también puedes buscar un producto por su nombre.");
  if (selectedCategories.length === 1) {
    const category = selectedCategories[0];
    filters.category = category.id;
    for (const alias of category.aliases) {
      if (phrasePattern(alias).test(remaining) && /tejid|crochet|amigurumi/.test(alias)) nextQuery = /amigurumi/.test(alias) ? "amigurumi" : "tejido";
      remaining = remaining.replace(phrasePattern(alias), " ");
    }
    understood = true;
  }
  if (/\b(?:mas baratos?|baratos?|economicos?|menor a mayor)\b/.test(remaining)) {
    filters.sort = "price-asc";
    remaining = remaining.replace(/\b(?:mas baratos?|baratos?|economicos?|menor a mayor)\b/g, " ");
    understood = true;
  } else if (/\b(?:mas caros?|mayor a menor)\b/.test(remaining)) {
    filters.sort = "price-desc";
    remaining = remaining.replace(/\b(?:mas caros?|mayor a menor)\b/g, " ");
    understood = true;
  }
  const residual = searchWords(remaining).filter((word) => !conversationalWords.has(word)).join(" ");
  if (residual) nextQuery = [nextQuery, residual].filter(Boolean).join(" ");
  if (nextQuery || selectedCategories.length) filters.query = nextQuery;
  else if (!continuation) filters.query = "";
  if (nextQuery) {
    const known = businesses.some((business) => business.catalog.some((section) => section.items.some((product) =>
      searchWords(nextQuery).some((word) => wordMatches(word, searchableProduct(product, section.title))),
    )));
    understood ||= known;
  }
  if (!understood) return rejected(filters, "No identifiqué un producto o criterio del catálogo. Prueba «postres hasta S/10 en Plaza Central» o usa los filtros.");
  const criteria: string[] = [];
  if (filters.category) criteria.push(categories.find((category) => category.id === filters.category)?.label ?? filters.category);
  if (filters.query) criteria.push(`«${filters.query}»`);
  if (filters.business) criteria.push(`de ${businesses.find((business) => business.slug === filters.business)?.name ?? filters.business}`);
  if (filters.spot) criteria.push(`en ${filters.spot}`);
  if (filters.minPrice !== undefined) criteria.push(`desde S/${filters.minPrice.toFixed(2)}`);
  if (filters.maxPrice !== undefined) criteria.push(`hasta S/${filters.maxPrice.toFixed(2)}`);
  const count = filterProducts(businesses, filters).length;
  return {
    filters, understood: true, warnings: [], reset: false,
    explanation: `${count ? `Encontré ${count} ${count === 1 ? "producto" : "productos"}` : "No encontré productos"}${criteria.length ? `: ${criteria.join(" · ")}` : " en el catálogo"}. Los puntos indican dónde coordinar el recojo.`,
  };
}
