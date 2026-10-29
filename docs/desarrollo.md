# Desarrollo y aprendizaje

La idea de MoliMarket nació en el curso de Lenguaje de Programación 2: crear una web que ayudara a encontrar emprendimientos de la comunidad universitaria. En ese momento quedó pendiente. Más adelante, el autor retomó el proyecto con nuevos conocimientos y herramientas de IA.

## Forma de trabajo

Gran parte del desarrollo se apoyó en **vibe coding**: describir un objetivo, trabajar con un asistente de IA, revisar las propuestas e iterar. El conocimiento adquirido por el autor fue necesario para orientar el proceso, tomar decisiones, evaluar resultados y comprobar que el comportamiento respondiera al objetivo.

Este método no garantiza por sí mismo que una propuesta sea correcta. Por ello, el trabajo incorpora lectura del código, validación de datos, pruebas automatizadas, revisión visual y comprobaciones en las distintas etapas.

## Decisiones del producto

- Mantener una fuente de catálogo para alimentar las vistas y herramientas de revisión, evitando duplicar manualmente los datos.
- Separar la búsqueda del visitante de las herramientas MCP privadas: la primera usa reglas locales y la segunda permite consultar y validar información desde el entorno de trabajo.
- Preparar páginas y recursos para su entrega en Cloudflare, combinando prerender, caché de páginas y recursos estáticos.
- Separar una modificación local de una versión publicada: construir y probar no implica desplegar.
- Mantener revisión humana para datos comerciales, presentación visual y autorización de publicación.

## Evolución

El proyecto pasó de una idea académica a una vitrina publicada. Con el tiempo se incorporaron filtros de productos, consultas por frases, herramientas MCP y un flujo de incorporación de marcas asistido por un agente de IA.

El proceso de incorporación se documenta como una secuencia de trabajo aplicada durante sesiones con el agente. No se presenta como un sistema autónomo que se active automáticamente por cada formulario recibido.
