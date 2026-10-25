# BioTech · carpeta lista para GitHub Pages

Esta carpeta contiene solo el sitio y sus dependencias. Para publicarlo, crea o abre tu repositorio Git y sube **el contenido completo de `app_web_biotech` a la raíz del repositorio**. Mantén juntas `assets/` y `datos/` con los HTML.

Luego, en GitHub: **Settings → Pages → Deploy from a branch → rama principal → /(root)**. Guarda y espera a que Pages muestre el enlace.

Abre `index.html` localmente para revisar el sitio. No requiere instalación, compilación, backend ni base de datos.

## Qué contiene

- `index.html`: portada y navegación.
- `comparador.html`: simulador de producción en COP.
- `arquitecturas.html` y páginas Monolito/Microservicios/Eventos: comparación de arquitectura.
- `documentacion.html`, `DOCUMENTACION.md`: variables, ecuaciones y límites.
- `assets/`: estilos y motores JavaScript.
- `datos/`: los dos CSV que cargan los simuladores.
- `.nojekyll`: evita procesamiento innecesario del sitio estático por Jekyll.

Los PDF, TXT, prototipos anteriores y archivos de trabajo se quedan fuera de esta carpeta porque no son dependencias del sitio. Las páginas ya resumen los antecedentes necesarios y enlazan a las fuentes externas vigentes.
