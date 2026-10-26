# Documentación técnica y académica de BioTech

**Proyecto:** simulador académico para planificar producción en Colombia y comparar arquitecturas para la plataforma BioTech.
**Moneda:** pesos colombianos (COP).
**Uso previsto:** explorar escenarios, hacer visibles los supuestos y sustentar decisiones; no sustituye mediciones de planta, cotizaciones ni pruebas en nube.

## 1. Problema y propósito

Fabricar un producto sin estimar antes cuánto material, energía, agua, tiempo y dinero puede consumir dificulta comparar diseños y precios. El módulo de producción convierte tasas por unidad en estimaciones para un lote y compara un plan base con una alternativa. Así el equipo puede detectar qué variables explican el costo, cuánto recurso podría ahorrar una opción y qué precio cubriría los costos capturados.

La propuesta BioTech también considera que el producto y sus datos se administran mediante una plataforma digital. El módulo de arquitecturas compara tres maneras de procesar sus solicitudes —monolito, microservicios y eventos— bajo una carga y un presupuesto hipotéticos.

El sitio es intencionalmente transparente: presenta un modelo matemático reproducible y datos sintéticos de demostración. No declara que se haya entrenado una IA con los documentos del proyecto porque no hay un conjunto de registros BioTech medidos, ni particiones de entrenamiento/prueba, ni resultados de validación disponibles.

## 2. Qué tecnología utiliza y por qué

- **HTML** estructura portada, formularios, resultados y documentación.
- **CSS propio** define presentación, estados, gráficas y adaptación a pantallas pequeñas.
- **JavaScript sin dependencias** valida formularios, importa CSV, calcula los modelos y construye las gráficas en el navegador.
- **CSV** permite cargar varias filas de ejemplo o datos que prepare el equipo.
- **GitHub Pages** publica los archivos estáticos. No se necesita servidor de aplicación, base de datos, instalación ni clave de servicio.

Se eligió esta arquitectura porque el objetivo es facilitar una demostración web publicable con el repositorio de la actividad. El navegador procesa el formulario y el archivo seleccionado localmente; el sitio no guarda los datos de manera permanente. Al recargar, se vuelve al estado inicial. El equipo debe guardar por separado las facturas, mediciones y archivos originales que respaldan un análisis real.

## 3. Mapa del sitio

| Archivo | Función |
|---|---|
| `index.html` | Presenta el proyecto, sus módulos y el alcance de producción. |
| `comparador.html` | Formulario y comparación de fabricación en COP. |
| `arquitecturas.html` | Comparación simultánea de las tres arquitecturas. |
| `monolito.html` | Explica y muestra el resultado de la alternativa monolítica. |
| `microservicios.html` | Explica y muestra el resultado de microservicios. |
| `eventos.html` | Explica y muestra el resultado orientado a eventos. |
| `documentacion.html` | Resumen navegable del modelo, uso y límites. |
| `DOCUMENTACION.md` | Especificación técnica ampliada (este documento). |
| `PRUEBAS.md` y `pruebas.js` | Evidencia, resultados y pruebas reproducibles del modelo. |
| `README.md` | Instrucciones de publicación y actualización. |
| `assets/` | Estilos compartidos, estilos de módulo y motores JavaScript. |
| `datos/produccion_demo.csv` | Una comparación de producción sintética para aprender el formato. |
| `datos/escenarios_modelo.csv` | Cinco escenarios sintéticos para el módulo de arquitecturas. |
| `.nojekyll` | Indica a GitHub Pages que publique los archivos estáticos sin el procesamiento de Jekyll. |

No se deben separar los HTML de `assets/` ni de `datos/`: los enlaces son relativos a esas carpetas.

## 4. Uso del simulador de producción

1. Abre **Producción** en la navegación o `comparador.html`.
2. Escribe el nombre del producto y, si se conocen, municipio, fuente y fecha.
3. Ingresa cantidad y datos por unidad para el plan base y la alternativa. La alternativa se calcula para la misma cantidad.
4. Abre **Tarifas y objetivo de rentabilidad** e ingresa tarifas y porcentajes aplicables. El botón de referencia de Bogotá es un prellenado orientativo: verifica cada valor contra la factura vigente antes de usarlo en una sustentación.
5. Completa los costos adicionales desplegables de ambos planes.
6. Pulsa **Calcular lote**, carga un escenario predefinido o importa una fila CSV. Los escenarios de demostración llenan y calculan automáticamente.
7. Revisa el resumen, las etapas, las tarjetas de indicadores, las barras Base/Alternativa, el detalle de rubros y el precio/margen.
8. Para CO₂e, abre **Factores opcionales** e ingresa los tres factores con fuente y año. Si falta cualquiera, el programa informa que no tiene base para el cálculo.
9. **Restablecer** limpia las entradas y vuelve al estado inicial.

Los campos numéricos obligatorios se validan contra mínimo, máximo y paso. Si falta un valor, el panel que lo contiene se abre y el formulario señala el primer campo pendiente. Nombre, municipio y fuente son opcionales, aunque se recomienda registrar fuente y fecha para que el resultado sea sustentable.

### 4.1 Variables de producción

| Entrada | Quién la define | Unidad / uso |
|---|---|---|
| Producto | Equipo | Texto libre. |
| Municipio, fuente y fecha | Equipo | Contexto para identificar tarifas y mediciones. |
| Cantidad del lote `Q` | Equipo | Unidades a producir; compartida por ambos planes. |
| Masa neta por unidad | Diseño/ficha técnica/medición | kg de producto terminado por unidad. |
| Residuo o rechazo `s` | Historial o medición | Porcentaje del material de entrada; debe ser menor que 95 %. |
| Energía por unidad | Medidor o estimación técnica | kWh/unidad. |
| Agua por unidad | Medidor o estimación técnica | L/unidad. |
| Tiempo de máquina por unidad | Registro de proceso | minutos/unidad. |
| Precio del material | Cotización o factura | COP/kg; cada plan puede tener su propio valor. |
| Precio de venta previsto | Decisión comercial | COP/unidad; cero indica que aún no se ingresó precio. |
| Electricidad | Factura/contrato | COP/kWh, común a ambos planes. |
| Agua y alcantarillado | Factura/contrato | COP/m³, común a ambos planes. |
| Uso de máquina | Criterio contable | COP/hora, común a ambos planes. |
| Mano de obra | Nómina/estimación | COP/unidad, independiente por plan. |
| Empaque y transporte | Cotización/registro | COP/unidad, independientes por plan. |
| Mantenimiento | Registro/estimación | COP/hora, independiente por plan. |
| Disposición de residuos | Gestor/factura | COP/kg de residuo, común a ambos planes. |
| Costos indirectos | Política del equipo | Porcentaje aplicado al subtotal. |
| Margen objetivo | Decisión comercial | Porcentaje sobre el precio de venta; rango 0–90 %. |
| Factores de emisión | Fuente ambiental documentada | kg CO₂e/kWh, kg CO₂e/kg de material, kg CO₂e/m³. Opcionales. |

### 4.2 Cálculo de material y recursos

Con `Q` unidades, masa neta `m` kg/unidad y residuo `s` como fracción entre 0 y 0,95:

```text
Masa de producto terminado (kg) = Q × m
Material que debe entrar (kg)    = (Q × m) / (1 − s)
Residuo estimado (kg)             = material que entra − producto terminado
Energía del lote (kWh)            = Q × kWh/unidad
Agua del lote (L)                 = Q × L/unidad
Horas de máquina                  = Q × minutos/unidad / 60
```

El ajuste de scrap responde a que parte del material de entrada se pierde o se rechaza. Por ejemplo, con 10 % de pérdida el proceso necesita más material de entrada que la masa neta que queda en el producto.

### 4.3 Cálculo de costos, precio y margen

```text
Costo de material       = material de entrada × precio COP/kg
Costo de electricidad   = energía × tarifa COP/kWh
Costo de agua           = agua en litros / 1.000 × tarifa COP/m³
Costo de máquina        = horas de máquina × COP/hora
Mano de obra            = Q × mano de obra COP/unidad
Empaque                 = Q × empaque COP/unidad
Transporte              = Q × transporte COP/unidad
Mantenimiento           = horas de máquina × mantenimiento COP/hora
Disposición de residuos = kg de residuo × COP/kg
Subtotal                = suma de los costos anteriores
Indirectos              = subtotal × porcentaje indirecto / 100
Costo total del lote    = subtotal + indirectos
Costo unitario          = costo total del lote / Q
Precio sugerido         = costo unitario / (1 − margen objetivo / 100)
Margen bruto (%)        = (venta COP/unidad − costo unitario) / venta COP/unidad × 100
Resultado bruto del lote= Q × venta COP/unidad − costo total del lote
```

El precio sugerido es la venta unitaria necesaria para cubrir el costo unitario capturado y obtener el margen objetivo. No es un pronóstico de mercado. Si aplican impuestos, comisiones, financiación, devoluciones, merma adicional o gastos administrativos fuera de los costos indirectos, deben añadirse antes de interpretar rentabilidad.

### 4.4 Lectura de las gráficas

- Las barras de recursos comparan cantidades en su propia unidad: kg, kWh y L no se suman ni se convierten a un puntaje común.
- Las barras de costo expresan COP. Cada fila muestra el importe de ambos planes y el cambio porcentual frente al plan base.
- La variación porcentual es `(alternativa − base) / base × 100`. Un valor negativo representa reducción respecto al base; un valor positivo representa aumento.
- El cuadro de rubros permite rastrear cómo se forma el costo total.
- El costo unitario, precio sugerido, margen al precio ingresado y resultado bruto aparecen por separado para evitar confundirlos.
- La animación de las barras es visual y no representa el tiempo de fabricación ni una medición del proceso.

### 4.5 Emisiones y ciclo de vida

```text
CO₂e de los insumos capturados = energía × factor eléctrico
                               + material de entrada × factor de material
                               + agua (m³) × factor de agua
```

El indicador solo suma electricidad, material y agua con los factores ingresados. No incluye transporte de materias primas/productos, extracción, uso, mantenimiento ni fin de vida. Por tanto, no debe presentarse como una evaluación completa de ciclo de vida (ACV).

## 5. Simulador de arquitecturas

### 5.1 Para qué se incluye

La plataforma BioTech debe recibir datos de producto y podría procesar cargas, sensores o análisis. El módulo permite explicar el intercambio entre velocidad, capacidad, disponibilidad y costo de tres estilos de despliegue. Es una simulación de colas para una actividad académica, no una medición de servidores desplegados.

### 5.2 Entradas y controles

| Entrada | Rango de interfaz | Efecto modelado |
|---|---:|---|
| Solicitudes por segundo `λ` | 10–1.000, paso 10 | Tasa de llegada a la cola. |
| Datos por solicitud | 1–100 MB, paso 1 | Aumenta el trabajo computacional simulado. |
| Carga computacional del análisis | 1,0×, 1,5× o 2,5× | Multiplicador conceptual de trabajo; no es un modelo IA entrenado. |
| Presupuesto mensual | COP 400.000–40.000.000, paso COP 200.000 | Determina el número de unidades que el modelo puede financiar. |

Los escenarios **Base**, **Pico de sensores**, **Masivo**, **Académico** e **Industrial** cargan valores para las cuatro entradas y recalculan. `datos/escenarios_modelo.csv` tiene cinco filas de ejemplo.

### 5.3 Parámetros y ecuaciones

Los parámetros base de demostración se encuentran en `assets/simulator.js` (`ARCH`). Para cada arquitectura incluyen costo mensual por unidad `costoUnidad`, capacidad de servicio base `RPS`, latencia de red, disponibilidad base y eficiencia de escalado. No equivalen a precios de proveedores colombianos ni a una infraestructura desplegada.

```text
Factor de trabajo = 1 + (MB por solicitud / 50) + (complejidad − 1) × 0,45
Unidades financiables c = máximo(1, parte entera(presupuesto / costo mensual por unidad))
Tasa de servicio μ = RPS base / factor de trabajo
Capacidad agregada = c × μ
Utilización ρ = λ / (c × μ)
```

La cola es **M/M/c**: llegadas Poisson, tiempo de servicio exponencial y `c` unidades de servicio iguales. Para `ρ ≥ 1`, la cola es inestable y se reporta saturación. Si `ρ < 1`, se calcula la probabilidad de espera con Erlang C y el tiempo medio de espera:

```text
P(espera) = Erlang C(λ, μ, c)
Espera media = P(espera) / (c × μ − λ)
Latencia estimada = (espera media + 1/μ) × 1.000 + latencia de red (ms)
```

Para Eventos se añaden 600 ms de arranque en frío cuando `ρ < 0,30`; es un supuesto explícito de demostración. La disponibilidad reduce hasta 2 puntos porcentuales cuando la utilización pasa de 70 %:

```text
Disponibilidad = disponibilidad base − 0,02 × máximo(0, mínimo(ρ, 1) − 0,70)
```

### 5.4 SLA, puntuación y recomendación

El escenario considera que una arquitectura cumple el SLA si simultáneamente: está estable, latencia ≤ 200 ms, disponibilidad ≥ 99,5 % y costo ≤ presupuesto.

```text
Puntaje latencia       = limitar(1 − latencia / 200, 0, 1) × 100
Puntaje escalabilidad  = 100 × eficiencia × mínimo(1, capacidad / solicitudes)
Puntaje disponibilidad= limitar((disponibilidad − 0,95) / 0,05, 0, 1) × 100
Puntaje total          = 0,40 × latencia + 0,30 × escalabilidad + 0,30 × disponibilidad
```

El costo se muestra como una dimensión adicional y se usa como condición de presupuesto para el SLA, pero **no entra directamente en el puntaje total**. Si hay opciones que cumplen el SLA, se recomienda la de mayor puntaje entre ellas. Si ninguna cumple, se muestra la de mayor puntaje general y se indican las condiciones que incumple. La recomendación es condicional a los supuestos configurados.

### 5.5 Interpretación

- La gráfica de puntaje normaliza indicadores a escala 0–100 para comparación; no muestra unidades físicas.
- La gráfica de latencia conserva ms y dibuja el límite de 200 ms.
- La gráfica de capacidad conserva solicitudes por segundo e informa unidades y utilización.
- La tabla completa permite ver latencia, capacidad, utilización, disponibilidad, unidades, costo y puntaje.
- Si un escenario satura una arquitectura, el aviso de SLA debe mostrarlo; una barra de capacidad no significa que la opción cumpla el objetivo.

## 6. Calidad de datos, fuentes y alcance

La información de demostración y los parámetros de arquitectura son sintéticos. Los costos y consumos reales dependen del producto, proceso, municipio, proveedor, actividad económica, fecha, impuestos y contrato. Reemplaza los valores sintéticos con facturas, cotizaciones, medidores, fichas técnicas y registros de producción. Registra fuente, unidad, fecha, municipio y responsable del dato.

Los documentos de proyecto disponibles describen antecedentes externos, variables de estudios y resultados publicados; no proporcionan una tabla de lotes BioTech con entradas, consumos, costos y calidad reales. Por ese motivo, este sitio no afirma que un Random Forest, Extra Trees, PNN u otro ML haya sido entrenado o validado con datos del equipo.

Para desarrollar ML en el futuro se requeriría una base versionada de observaciones comparables, variables medidas por lote, objetivo claramente definido, limpieza documentada, división por tiempo o por lote entre entrenamiento/validación/prueba, comparación contra una línea base y métricas (por ejemplo MAE/RMSE para regresión). Una división aleatoria de piezas del mismo lote puede filtrar información y dar una evaluación engañosa.

## 7. Formato de archivos CSV

Los archivos deben ser texto UTF-8, incluir encabezados y usar punto decimal en números. La importación acepta comillas dobles, celdas con comas entrecomilladas y comillas dobles duplicadas dentro de una celda. El archivo se procesa en memoria al seleccionarlo.

- **Producción:** una fila representa un producto con sus planes base y alternativa; usa todos los encabezados de `datos/produccion_demo.csv`. Los factores de emisión pueden quedar vacíos.
- **Arquitectura:** una fila representa un escenario con encabezados `escenario,solicitudes_por_segundo,datos_mb,complejidad_ia,presupuesto_cop_mes`.

Descarga las plantillas desde la página correspondiente para conservar los nombres de columnas. No cambies las unidades ni mezcles puntos y comas como separadores decimales. La validación de interfaz vuelve a comprobar rangos después de cargar una fila.

## 8. Seguridad, privacidad y persistencia

El sitio no solicita cuentas, no conecta con API externa y no escribe a una base de datos. El archivo CSV se lee en el navegador y los resultados se calculan en esa sesión. Al cerrar o recargar la página los campos vuelven al estado inicial; exporta y conserva los datos fuente por los medios del equipo. No subas datos personales o comerciales sensibles al repositorio público.

## 9. Cómo sustentar el proyecto

1. Explica el problema de estimar antes de producir recursos y costos, y de justificar la infraestructura que procesa los datos.
2. Identifica las entradas y sus unidades antes de mostrar resultados.
3. Describe el balance de masa, la conversión de unidades y la suma de costos con un ejemplo verificable.
4. Compara base y alternativa indicador por indicador. Evita decir “mejor” sin especificar qué métrica mejora y cuál empeora.
5. Para arquitectura, explica M/M/c, los supuestos de tasas/costos y los cuatro requisitos del SLA.
6. Distingue datos de demostración de mediciones del equipo y presenta las limitaciones.
7. Explica qué mediciones se necesitan para reemplazar supuestos y, en otra etapa, entrenar y evaluar ML.

## 10. Pruebas y publicación

Las comprobaciones ejecutadas, resultados reproducibles y una lista de regresión están en [`PRUEBAS.md`](PRUEBAS.md). La publicación paso a paso está en [`README.md`](README.md). Todo lo necesario para la página debe mantenerse dentro de esta carpeta, con los nombres y subcarpetas indicados.
