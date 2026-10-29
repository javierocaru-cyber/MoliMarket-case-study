# Calidad y publicación

Las comprobaciones acompañan las distintas etapas: datos, código, construcción, revisión local y entrega pública. Cada resultado representa una versión y un momento concretos.

## Antes de publicar

- Validación del catálogo: estructura, identificadores, categorías, precios registrados, referencias a imágenes y formato de enlaces.
- Pruebas automatizadas sobre funciones de la aplicación, navegación y aspectos de datos.
- Revisión de tipos y construcción del sitio.
- Comprobación del Worker local, páginas, enlaces y recursos del artefacto.
- Revisión visual de las vistas relevantes en móvil y escritorio.
- Pruebas de las herramientas MCP con entradas válidas y casos de error.

Las comprobaciones de GitHub Actions ejecutan validaciones y construcción sobre cambios de la fuente. La publicación del sitio es un paso separado que requiere autorización.

## Después de publicar

Se comprueba que las páginas relevantes y los recursos correspondan a la versión esperada. También se revisan la entrega de caché, el comportamiento en navegador y las comprobaciones de disponibilidad configuradas para el sitio.

La caché se revisa según la situación de cada entrega. Una respuesta servida desde caché no demuestra que se haya leído KV de nuevo durante esa misma visita.

## Alcance de los resultados

Una prueba superada no garantiza que todos los casos posibles estén cubiertos ni que el sitio vaya a estar siempre disponible. La validación de estructura no acredita stock o condiciones comerciales actuales; esas confirmaciones requieren información del emprendimiento. Las cifras de pruebas y verificaciones cambian con las versiones y deben publicarse junto con su fecha y alcance.
