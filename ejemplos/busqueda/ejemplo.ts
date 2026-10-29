import { catalogoEjemplo } from "./fixtures";
import { interpretProductRequest, filterProducts } from "./product-discovery";

const primera = interpretProductRequest("Busco postres hasta S/10 en Plaza Central", catalogoEjemplo);
const siguiente = interpretProductRequest("y hasta S/5", catalogoEjemplo, primera.filters);
for (const [consulta, resultado] of [["Consulta inicial", primera], ["Seguimiento", siguiente]] as const) {
  console.log(`${consulta}: ${resultado.explanation}`);
  console.log(filterProducts(catalogoEjemplo, resultado.filters)
    .map(({ product, price }) => `  - ${product.name}: ${price === null ? "a cotizar" : `S/${price}`}`).join("\n"));
}
