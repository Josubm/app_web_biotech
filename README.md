# BioTech · aplicación Monolito para GitHub Pages

Este directorio es el **paquete completo de la aplicación**. `index.html` es el único punto de entrada funcional: integra inicio, producción y comparación de arquitecturas. Los módulos de JavaScript comparten el mismo estado de página y se despliegan como una sola unidad. Mantén juntos HTML, CSS, motores, datos CSV, documentación y `.nojekyll`.

## Publicar o actualizar

1. En el repositorio `app_web_biotech`, coloca el **contenido de esta carpeta en la raíz**. La raíz debe mostrar `index.html`, `assets/`, `datos/`, `documentacion.html`, `pruebas.html` y `.nojekyll`. No subas el directorio dentro de otro directorio con el mismo nombre.
2. Sube también `documentacion.html`, `DOCUMENTACION.md`, `PRUEBAS.md`, `pruebas.js` y este `README.md`.
3. En GitHub, configura **Settings → Pages → Deploy from a branch → rama principal → /(root)** y guarda.
4. Espera a que termine el despliegue de Pages. El sitio no cambia hasta que el commit se publique correctamente.
5. Abre la URL del repositorio. Usa el menú de la misma página para probar Inicio, Producción y Arquitecturas; los archivos `comparador.html`, `arquitecturas.html`, `monolito.html`, `microservicios.html` y `eventos.html` redirigen a esas vistas integradas.
6. Recarga con **Ctrl+F5** o usa una ventana privada. Las referencias a los recursos tienen un parámetro de versión para evitar que el navegador reutilice una copia vieja.

La URL de GitHub Pages de este repositorio tiene esta forma:

```text
https://josubm.github.io/app_web_biotech/
```

Si una página abre pero los bordes, colores o gráficas parecen antiguos, revisa primero el estado del despliegue y las respuestas de `assets/app-shell.css`, `assets/biotech.css`, `assets/production.css` y `assets/simulator.css`. La guía [`PRUEBAS.md`](PRUEBAS.md) explica cómo comprobar rutas y hacer la recarga forzada.

## Ejecutar pruebas

No se necesitan paquetes npm. Con Node.js instalado, abre una terminal en esta carpeta y ejecuta:

```text
node pruebas.js
node --check assets/app.js
node --check assets/production.js
node --check assets/simulator.js
```

Para probar visualmente, abre `index.html` con un navegador o publica la carpeta con GitHub Pages. Usa `PRUEBAS.md` para la lista manual de regresión.

## Mapa de archivos

- `index.html`: aplicación de una página con rutas Inicio, Producción y Arquitecturas.
- `assets/app.js`: navegación entre vistas y actualización de la arquitectura seleccionada.
- `assets/production.js` y `assets/simulator.js`: motores internos de producción y comparación, cargados en orden desde el mismo `index.html`.
- `comparador.html`, `arquitecturas.html`, `monolito.html`, `microservicios.html`, `eventos.html`: redirecciones compatibles a las vistas del monolito.
- `documentacion.html`: guía dentro del sitio.
- `DOCUMENTACION.md`: variables, fórmulas, supuestos y límites técnicos.
- `PRUEBAS.md`: evidencia de verificaciones, valores de referencia y lista manual.
- `pruebas.js`: ocho pruebas automatizadas de los modelos y los CSV.
- `assets/`: estilos, navegación y motores JavaScript publicados juntos como un solo Monolito modular.
- `datos/`: plantillas CSV demostrativas.
- `.nojekyll`: marcador para la publicación estática.

El sitio no tiene backend ni base de datos. El navegador realiza los cálculos; los CSV de demostración son sintéticos. La documentación distingue los datos de ejemplo de los datos reales del equipo.
