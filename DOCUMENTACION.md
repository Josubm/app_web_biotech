# Modelo de producción BioTech: variables y fórmulas

## Contexto colombiano y datos

La interfaz usa COP con formato `es-CO`. La demostración no fija producto, y sus importes en pesos son sintéticos para poder probar los cálculos. No se deben presentar como tarifas nacionales: electricidad, agua, mano de obra, transporte y materias primas varían por municipio, proveedor, industria y fecha. Para sustentar un caso real, reemplaza cada tasa con facturas, cotizaciones, fichas técnicas o registros de planta y anota fuente, lugar y fecha.

El equipo puede ingresar cualquier producto. La comparación usa dos diseños o procesos con la misma cantidad a producir. El CSV tiene una fila por producto/comparación y se carga en el navegador.

## Variables de entrada

| Categoría | Variable | Unidad |
|---|---|---|
| Orden | Producto y cantidad | nombre, unidades |
| Material | Masa neta, scrap, costo de material | kg/unidad, %, COP/kg |
| Proceso | Electricidad, agua y tiempo | kWh/unidad, L/unidad, min/unidad |
| Operación | Tarifa eléctrica/agua, máquina | COP/kWh, COP/m³, COP/h |
| Costos adicionales | Mano de obra, empaque, transporte | COP/unidad |
| Costos adicionales | Mantenimiento de equipo, disposición de residuo | COP/h, COP/kg de residuo |
| Precio | Venta prevista y margen bruto objetivo | COP/unidad, % sobre venta |
| Indirectos | Recargo editable | % del subtotal de costos |
| Ambiente | Factores de emisión opcionales | kg CO₂e por kWh, kg de material y m³ |

Cada parámetro de producto se captura para base y alternativa. Tarifas y recargos comunes se comparten. El nombre es libre; el simulador no está limitado a impresión 3D.

## Ecuaciones

Sea `Q` la cantidad, `m` la masa neta por unidad y `s` la fracción de scrap (`0 ≤ s < 0,95`).

```text
Producto terminado (kg) = Q × m
Material de entrada (kg) = producto terminado / (1 − s)
Residuo (kg) = material de entrada − producto terminado
Energía (kWh) = Q × kWh/unidad
Agua (L) = Q × L/unidad
Horas de máquina = Q × minutos/unidad / 60
```

```text
Materia prima = material de entrada × COP/kg
Electricidad = energía × COP/kWh
Agua = agua en litros / 1.000 × COP/m³
Máquina = horas × COP/h
Mano de obra = Q × COP/unidad
Empaque = Q × COP/unidad
Transporte = Q × COP/unidad
Mantenimiento = horas × COP/h de mantenimiento
Disposición de residuo = kg de scrap × COP/kg
Subtotal = suma de los costos anteriores
Costos indirectos = subtotal × porcentaje indirecto
Costo total del lote = subtotal + costos indirectos
Costo total unitario = costo total / Q
```

```text
Margen bruto (%) = (precio de venta − costo total unitario) / precio de venta × 100
Precio sugerido = costo total unitario / (1 − margen objetivo)
Resultado bruto del lote = Q × precio de venta − costo total del lote
```

El precio sugerido cubre solo los costos capturados y el margen elegido; no predice el precio de mercado ni la disposición de compra. Impuestos, comisiones, devoluciones, financiación y gastos no capturados deben añadirse como costos si se requieren.

Con factores de emisión ingresados:

```text
CO₂e = energía × factor eléctrico
     + material de entrada × factor material
     + agua en m³ × factor agua
```

Ese indicador cubre únicamente estos insumos de producción, no es un ACV completo.

## Comparación e interpretación

Las gráficas separan unidades físicas de dinero: material, energía, agua y residuo no se mezclan en una puntuación arbitraria. La evaluación señala reducciones y aumentos entre plan base y alternativa. El precio/margen se calcula para cada plan.

El modelo requiere tasas representativas por producto y proceso. Las variables de geometría o proceso identificadas en la infografía 3D (orientación, relleno, espesor de capa, contornos) no se convierten automáticamente a kWh o COP: esa relación exige mediciones específicas. El modelo actual es un balance de planificación, no ML.

## Documentos del proyecto y datos faltantes

Los documentos disponibles incluyen resultados y antecedentes externos, pero no filas históricas de BioTech con entradas, consumos, costos y calidad medidos. No se debe afirmar que un Random Forest/Extra Trees/PNN está entrenado con los datos del proyecto. Para entrenar uno se necesitan registros repetidos y medidos por lote/pieza, una separación de entrenamiento y prueba, y métricas MAE/RMSE/R².

Los documentos plantean un ciclo de vida con extracción, producción, transporte, uso y fin de vida. Este simulador calcula producción y una tarifa logística por unidad capturada por el equipo. Un ACV completo requiere procedencia y extracción de materiales, distancias/modos de transporte, energía/vida útil durante el uso, mantenimiento, reciclaje y disposición. No se estiman etapas sin esos datos.

Los valores del CSV demo son sintéticos y no deben citarse como datos nacionales. Usa facturas, cotizaciones y registros locales, especificando municipio, uso, fecha y fuente.

## Uso

1. Abre `comparador.html` y escribe cualquier producto.
2. Ajusta la cantidad y los datos del plan base y alternativa.
3. Usa, si corresponde, la referencia pública de Bogotá o sustituye las tarifas por valores reales del caso colombiano; anota municipio, fuente y fecha.
4. Carga una demostración, importa una fila CSV o pulsa **Calcular lote**.
5. Revisa consumos, desglose de costos, costo por unidad, precio sugerido, margen y cambio frente a base.
6. Solo calcula CO₂e cuando puedas ingresar factores con fuente, región y año.

`arquitecturas.html` conserva el módulo de actividad 9 para comparar Monolito, Microservicios y Eventos. Su modelo de cola analiza solicitudes web y es independiente del costo de producción.
