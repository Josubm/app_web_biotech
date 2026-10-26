# BioTech · sitio listo para GitHub Pages

Este directorio es el **paquete completo del sitio**. Mantén todos los archivos y subcarpetas juntos: páginas HTML, hojas CSS, motores JavaScript, datos CSV, documentación y `.nojekyll`.

## Publicar o actualizar

1. En el repositorio `app_web_biotech`, coloca el **contenido de esta carpeta en la raíz**. La raíz debe mostrar `index.html`, `comparador.html`, `arquitecturas.html`, `assets/`, `datos/` y `.nojekyll`. No subas el directorio dentro de otro directorio con el mismo nombre.
2. Sube también `documentacion.html`, `DOCUMENTACION.md`, `PRUEBAS.md`, `pruebas.js` y este `README.md`.
3. En GitHub, configura **Settings → Pages → Deploy from a branch → rama principal → /(root)** y guarda.
4. Espera a que termine el despliegue de Pages. El sitio no cambia hasta que el commit se publique correctamente.
5. Prueba `index.html`, `comparador.html` y `arquitecturas.html` en el dominio publicado. Las rutas deben permanecer relativas y las carpetas `assets/` y `datos/` deben estar al mismo nivel que los HTML.
6. Recarga con **Ctrl+F5** o usa una ventana privada. Las referencias a CSS y JS tienen un parámetro de versión (`?v=20261025-2`) para evitar que el navegador reutilice una copia vieja.

La URL de GitHub Pages de este repositorio tiene esta forma:

```text
https://josubm.github.io/app_web_biotech/
```

Si una página HTML abre pero los bordes, colores o gráficas parecen antiguos, revisa primero el estado del despliegue y las respuestas de `assets/biotech.css`, `assets/production.css` y `assets/simulator.css`. La guía [`PRUEBAS.md`](PRUEBAS.md) explica cómo comprobar rutas y cómo hacer la recarga forzada.

## Ejecutar pruebas

No se necesitan paquetes npm. Con Node.js instalado, abre una terminal en esta carpeta y ejecuta:

```text
node pruebas.js
node --check assets/production.js
node --check assets/simulator.js
```

Para probar visualmente, abre `index.html` con un navegador o publica la carpeta con GitHub Pages. Usa `PRUEBAS.md` para la lista manual de regresión.

## Mapa de archivos

- `index.html`: portada y propósito del proyecto.
- `comparador.html`: simulador de producto en pesos colombianos.
- `arquitecturas.html`: comparación M/M/c de Monolito, Microservicios y Eventos.
- `monolito.html`, `microservicios.html`, `eventos.html`: vistas individuales de cada alternativa.
- `documentacion.html`: guía dentro del sitio.
- `DOCUMENTACION.md`: variables, fórmulas, supuestos y límites técnicos.
- `PRUEBAS.md`: evidencia de verificaciones, valores de referencia y lista manual.
- `pruebas.js`: seis pruebas automatizadas de los modelos y los CSV.
- `assets/`: CSS y JavaScript requerido por las páginas.
- `datos/`: plantillas CSV demostrativas.
- `.nojekyll`: marcador para la publicación estática.

El sitio no tiene backend ni base de datos. El navegador realiza los cálculos; los CSV de demostración son sintéticos. La documentación distingue los datos de ejemplo de los datos reales del equipo.
