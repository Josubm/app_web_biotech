# Pruebas y evidencia del proyecto BioTech

**Fecha de esta verificación:** 25 de octubre de 2026.
**Alcance:** motores matemáticos, CSV y aplicación Monolito de una página. Los ejemplos son sintéticos; las pruebas automatizadas no miden una infraestructura de backend real.

## 1. Pruebas automatizadas incluidas

El archivo `pruebas.js` ejercita las funciones públicas de los dos motores, sin instalar paquetes externos. Desde PowerShell, CMD o una terminal situada en la raíz `app_web_biotech`, ejecuta:

```text
node pruebas.js
```

Comprueba ocho casos:

1. Producción calcula total de lote, costo unitario, precio sugerido y margen en el ejemplo de 25 unidades.
2. Producción calcula CO₂e solo si están presentes los tres factores.
3. Producción importa el CSV demostrativo y una celda entrecomillada con coma.
4. Producción rechaza CSV vacío y comillas sin cerrar.
5. Arquitecturas importa cinco escenarios, calcula las tres opciones de backend y verifica SLA base de Microservicios.
6. Arquitecturas detecta escenarios Pico/Masivo inestables.
7. Arquitecturas importa un nombre entrecomillado con coma.
8. Arquitecturas rechaza CSV vacío y comillas sin cerrar.

**Resultado ejecutado:** 8 pruebas automatizadas pasaron. Para verificar el JavaScript por separado:

```text
node --check assets/app.js
node --check assets/production.js
node --check assets/simulator.js
```

## 2. Resultados numéricos de referencia

### Producción: “Lote pequeño”

El escenario usa 25 unidades, datos sintéticos en COP y objetivo de margen bruto de 30 %. Redondeado al COP:

| Indicador | Plan base | Alternativa |
|---|---:|---:|
| Material de entrada | 2,22 kg | 1,94 kg |
| Energía | 12,00 kWh | 10,50 kWh |
| Agua | 0,50 L | 0,50 L |
| Costo total del lote | COP 1.127.666 | COP 1.035.515 |
| Costo estimado por unidad | COP 45.107 | COP 41.421 |
| Precio sugerido al 30 % de margen | COP 64.438 | COP 59.172 |

La alternativa reduce el costo total calculado en aproximadamente COP 92.150 para este ejemplo. No es ahorro observado en planta: resulta de las diferencias sintéticas entre las tasas ingresadas.

### Arquitectura: “Base normal”

Con 150 solicitudes/s, 25 MB por solicitud, carga computacional 1,5× y presupuesto de COP 5.000.000/mes, el modelo calculó:

| Arquitectura | Unidades estimadas | Latencia estimada | Capacidad estimada | Costo del modelo |
|---|---:|---:|---:|---:|
| Monolito | 3 | 67 ms | 173,9 req/s | COP 4.800.000/mes |
| Microservicios | 5 | 56 ms | 362,3 req/s | COP 5.000.000/mes |
| Eventos | 6 | 636 ms | 521,7 req/s | COP 4.320.000/mes |

En esos supuestos, Microservicios obtiene el mayor puntaje elegible y cumple el SLA configurado. Eventos supera el límite de latencia de 200 ms por el supuesto de arranque en frío. El resultado cambiará si cambian los parámetros; estos importes no son cotizaciones de nube.

## 3. Comprobaciones realizadas en esta sesión

- `node --check` sobre `app.js`, `production.js` y `simulator.js`.
- Ejecución de ambos modelos desde Node para obtener los valores de referencia de arriba.
- Importación de una fila de `produccion_demo.csv` y cinco filas de `escenarios_modelo.csv`.
- `index.html` integra Inicio, Producción y Arquitecturas. Carga de forma explícita y en orden `assets/production.js`, `assets/simulator.js` y `assets/app.js` para publicar los motores y la navegación como una sola aplicación.
- Las URLs `comparador.html`, `arquitecturas.html`, `monolito.html`, `microservicios.html` y `eventos.html` redirigen a las secciones de la aplicación integrada.
- La comparación presenta Monolito como arquitectura elegida y distingue la versión modular actual (cálculo en el navegador) de la proyección M/M/c de un backend monolítico. Microservicios y Eventos se mantienen como alternativas comparables; el ranking numérico usa supuestos de infraestructura y no reemplaza la decisión de alcance del proyecto.
- Validación local de `index.html`: no hay IDs duplicados, las referencias locales encontradas existen y los motores se cargan antes del enrutador. Esta revisión estática no confirma que GitHub Pages haya recibido o publicado estos cambios.

Las pruebas automatizadas verifican el motor y el formato de datos. No simulan la medición física del proceso, una factura colombiana, una compra real ni una nube desplegada. El equipo debe ejecutar la lista manual después de publicar para revisar su navegador y su dispositivo.


### Estado de GitHub Pages al finalizar la revisión

La aplicación integrada y sus redirecciones son cambios locales que deben subirse al repositorio para verse en GitHub Pages. Después del despliegue, confirma que `index.html`, `assets/app.js`, `assets/app-shell.css`, los dos motores JavaScript y los CSV respondan correctamente. La entrada funcional de navegación es la raíz del sitio; los HTML anteriores deben abrir la sección integrada correspondiente.

## 4. Lista manual de regresión después de desplegar

### Producción

| Paso | Acción | Resultado que se debe observar |
|---|---|---|
| P1 | Abrir `index.html#production` o pulsar Producción en el menú. | Se muestran entradas precargadas con un ejemplo sintético, resumen, etapas, indicadores y gráficas; no se presenta como medición del producto. |
| P2 | Pulsar **Lote pequeño**. | Se recalculan 25 unidades; resumen, etapas, indicadores, barras con valores y desglose se actualizan. Los números deben aproximarse a la tabla anterior. |
| P3 | Cambiar energía de un plan y pulsar **Calcular lote**. | Cambian la energía, sus costos, el resultado de comparación y el precio/margen cuando corresponde. |
| P4 | Dejar un requerido vacío o introducir un valor fuera de rango y calcular. | Mensaje de validación, panel desplegado si aplica y primer campo inválido enfocado. No aparece un cálculo nuevo con ese formulario. |
| P5 | Abrir el selector CSV, cargar `datos/produccion_demo.csv` y seleccionar su fila. | La fila se carga y permite recalcular. Factores de emisión vacíos dejan CO₂e como no calculado. |
| P6 | Introducir factores de emisión conocidos, con unidad y fuente, y calcular. | CO₂e aparece para base y alternativa; no confundirlo con ACV completo. |
| P7 | Pulsar **Restablecer**. | Los campos vuelven al ejemplo sintético de 100 unidades y se vuelve a calcular; no quedan bordes de error ni resultados antiguos. |

### Arquitecturas

| Paso | Acción | Resultado que se debe observar |
|---|---|---|
| A1 | Abrir `index.html#simulador` o pulsar Arquitecturas en el menú. | Aparece la recomendación del backend simulado, gráficos de puntaje, latencia con SLA y capacidad. |
| A2 | Pulsar **Pico sensores** y luego **Masivo**. | Las entradas cambian, resultados se recalculan y posibles saturaciones/violaciones se indican como alertas. |
| A3 | Mover el control deslizante y cambiar el campo numérico equivalente. | Slider y campo se sincronizan; estado indica que hay cambios pendientes hasta recalcular. |
| A4 | Importar `datos/escenarios_modelo.csv`. | Se enumeran cinco filas; al cargar una se actualizan entradas y resultados. |
| A5 | Abrir `monolito.html`, `microservicios.html` y `eventos.html`. | Cada URL abre la aplicación integrada y resalta la opción solicitada. |
| A6 | Repetir con ventana estrecha/móvil. | Tarjetas se apilan; campos, unidades, valores y gráficas no se cortan ni se superponen. |

### Publicación y caché

1. Confirma que la raíz del repositorio contenga `index.html`, `assets/`, `datos/`, `documentacion.html` y `.nojekyll`; no dejes una segunda carpeta anidada llamada `app_web_biotech`.
2. Sube el paquete completo, incluyendo los `.md` y `pruebas.js`.
3. Espera a que el despliegue de GitHub Pages termine sin error.
4. Abre `https://josubm.github.io/app_web_biotech/` y prueba Inicio, Producción y Arquitecturas desde el menú; recarga con **Ctrl+F5**.
5. Comprueba que `assets/production.js?v=20261025-8`, `assets/simulator.js?v=20261025-8` y `assets/app.js?v=20261025-8` carguen con estado 200.

Las animaciones muestran la comparación al renderizar el resultado; el cálculo es local e inmediato y no tiene una barra de espera de progreso de una tarea larga.
