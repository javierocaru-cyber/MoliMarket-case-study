# MoliMarket — caso técnico

**Una vitrina digital universitaria y el proceso de construcción que la acompaña.**

## 🌐 [Visita la página de MoliMarket](https://molimarket.store/)

**Haz clic en el enlace para explorar el sitio web en funcionamiento:** [molimarket.store](https://molimarket.store/).

[Arquitectura](docs/arquitectura.md) · [Incorporación asistida](docs/incorporacion-asistida.md) · [MCP](docs/mcp.md)

MoliMarket ayuda a descubrir productos, servicios y emprendimientos de la comunidad universitaria. Permite explorar fichas y categorías, combinar filtros y contactar directamente a cada emprendimiento por sus canales. La búsqueda por frases interpreta criterios mediante reglas locales.

La idea nació en mi curso de Lenguaje de Programación 2. Con los conocimientos que fui adquiriendo y nuevas herramientas de IA, retomé el proyecto y lo desarrollé mediante un proceso de **vibe coding**: plantear objetivos, iterar, probar y revisar. Mis conocimientos me ayudaron a orientar las decisiones, evaluar los resultados y seguir aprendiendo durante el desarrollo.

Este repositorio presenta el proyecto como **caso técnico y documentación de portafolio**. El sitio real está disponible en el enlace superior. Esta versión pública reúne explicaciones, diagramas y una muestra ejecutable de búsqueda basada en un extracto del código real. El sitio completo, los datos de los emprendimientos y sus imágenes no forman parte de ella.

## Funciones y decisiones

- **Exploración de productos:** filtros por categoría, emprendimiento, punto de entrega y presupuesto, además de búsqueda por frases con reglas locales.
- **Contenido preparado:** páginas prerenderizadas, recursos estáticos y caché en Cloudflare para la entrega del sitio.
- **Herramientas de catálogo:** servidor MCP local y de solo lectura para consultar registros, validar datos y revisar imágenes desde un cliente compatible.
- **Incorporación asistida:** flujo de trabajo con un agente de IA que empieza por una indicación humana y termina con revisión, autorización y comprobaciones de publicación.
- **Calidad y operación:** validaciones de catálogo, pruebas automatizadas, verificación local y comprobaciones posteriores al despliegue.

## Tecnologías principales

| Área | Tecnologías y enfoque |
| --- | --- |
| Interfaz | React, TypeScript, Tailwind CSS y Zustand |
| Construcción y entrega | Vinext, Vite y Cloudflare Workers |
| Contenido y recursos | Prerender, Workers KV, Workers Cache y Static Assets |
| Herramientas locales | Bun y servidor MCP por `stdio` |
| Calidad | Pruebas automatizadas, validaciones y GitHub Actions |

## Documentación

1. [Arquitectura y entrega](docs/arquitectura.md): componentes, caché y recorrido de una petición.
2. [Pipeline de incorporación asistido por IA](docs/incorporacion-asistida.md): del formulario a una ficha revisada y publicada.
3. [MCP privado del catálogo](docs/mcp.md): herramientas, datos y límites.
4. [Proceso de desarrollo y aprendizaje](docs/desarrollo.md): decisiones, uso de IA y evolución del proyecto.
5. [Calidad y publicación](docs/calidad-y-publicacion.md): comprobaciones locales, entrega y verificación.

## Muestra ejecutable

La [muestra de búsqueda por frases](ejemplos/busqueda/) adapta la lógica de filtros y seguimiento del proyecto para trabajar con datos ficticios. Incluye un ejemplo de ejecución y pruebas; requiere Bun. Es un extracto independiente, no una réplica completa de la web ni del pipeline de incorporación.

## Alcance

Las decisiones y resultados descritos corresponden al proyecto real; no implican que cada tarea se ejecute automáticamente ni que las comprobaciones garanticen disponibilidad futura o exactitud comercial permanente. El desarrollo del producto continúa y los detalles pueden cambiar.
