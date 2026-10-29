# Muestra ejecutable: búsqueda por frases

Este directorio contiene un **extracto de la lógica real de búsqueda por reglas de MoliMarket**, adaptado para ejecutarse por separado con tipos mínimos y datos ficticios. No es la web completa, no incluye el catálogo de producción y no utiliza un modelo de IA ni servicios externos.

El extracto reconoce criterios como categoría, importe y punto, conserva filtros en consultas de seguimiento y rechaza algunas condiciones que los datos no permiten confirmar. Sus pruebas usan productos, negocios y lugares inventados y no contienen contactos ni imágenes.

Se adaptaron la importación de tipos y dos textos de ejemplo/comentario para retirar referencias del catálogo real. Las reglas se conservan. Los resultados de la muestra no representan productos ni precios disponibles en el sitio público.

## Ejecutar

Instala [Bun](https://bun.sh/) 1.4 o superior y, desde este directorio, ejecuta:

```sh
bun --no-env-file run ejemplo.ts
bun --no-env-file test busqueda.test.ts
```

La muestra no necesita dependencias adicionales, archivos de entorno, credenciales ni conexión de red para ejecutarse. La versión completa y desplegada se puede conocer en [molimarket.store](https://molimarket.store/).
