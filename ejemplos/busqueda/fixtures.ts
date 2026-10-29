import type { Business } from "./types";

/** Datos inventados exclusivamente para esta muestra; no hay contactos ni marcas reales. */
export const catalogoEjemplo: Business[] = [
  {
    id: "negocio-ejemplo-a", slug: "negocio-ejemplo-a", name: "Negocio Ejemplo A",
    category: "comida", categoryId: "postres", spots: ["Plaza Central"],
    catalog: [{ title: "Postres", items: [
      { id: "postre-a", name: "Brownie de cacao", description: "Porción individual", price: 8 },
      { id: "postre-b", name: "Tarta de limón", description: "Dos presentaciones", price: 5,
        sizes: [{ label: "Pequeña", price: 5 }, { label: "Grande", price: 10 }] },
    ] }],
  },
  {
    id: "negocio-ejemplo-b", slug: "negocio-ejemplo-b", name: "Negocio Ejemplo B",
    category: "servicio", categoryId: "diseno", spots: ["Plaza Central"],
    catalog: [{ title: "Servicios", items: [
      { id: "servicio-a", name: "Diseño gráfico", description: "Servicio de ejemplo", quoteOnly: true },
    ] }],
  },
];
