'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

global.window = {};
global.document = { querySelectorAll: () => [] };
require(path.join(__dirname, 'assets/production.js'));
require(path.join(__dirname, 'assets/simulator.js'));
const production = window.BioTechProduction;
const architecture = window.BioTechModel;
let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log(`PASS ${passed}: ${name}`);
}

function productionParams(quantity = 25) {
  const d = production.defaults;
  const p = {
    quantity,
    electricityRate: d.electricity_rate,
    waterRate: d.water_rate,
    machineRate: d.machine_rate,
    wasteRate: d.waste_rate,
    overheadPct: d.overhead_pct,
    targetMarginPct: d.target_margin_pct,
    grid_factor: null,
    material_factor: null,
    water_factor: null,
  };
  for (const side of ['base', 'alt']) {
    for (const field of ['material_kg','energy_kwh','water_l','time_min','scrap_pct','material_price','sale_price','labor_cop','packaging_cop','transport_cop','maintenance_cop_h']) {
      p[`${side}_${field}`] = d[`${side}_${field}`];
    }
  }
  return p;
}

check('producción: material, costos, precio y margen del ejemplo de 25 unidades', () => {
  const base = production.calculate(productionParams(), 'base');
  const alternative = production.calculate(productionParams(), 'alt');
  assert.equal(Math.round(base.totalCost), 1127666);
  assert.equal(Math.round(alternative.totalCost), 1035515);
  assert.equal(Math.round(base.unitCost), 45107);
  assert.equal(Math.round(alternative.unitCost), 41421);
  assert.equal(Math.round(base.suggestedSalePrice), 64438);
  assert.equal(Math.round(alternative.suggestedSalePrice), 59172);
  assert.equal(base.carbon, null);
  assert.ok(base.suggestedSalePrice > base.unitCost);
});

check('producción: CO₂e solo se calcula con los tres factores presentes', () => {
  const p = productionParams();
  p.grid_factor = 0.4; p.material_factor = 1.2; p.water_factor = 0.1;
  const result = production.calculate(p, 'base');
  assert.ok(result.carbon > 0);
  p.water_factor = null;
  assert.equal(production.calculate(p, 'base').carbon, null);
});

check('producción: CSV demostrativo y celda de producto con coma', () => {
  const file = fs.readFileSync(path.join(__dirname, 'datos/produccion_demo.csv'), 'utf8');
  const rows = production.parseCsv(file);
  assert.equal(rows.length, 1);
  const quoted = file.replace('Producto de demostracion (sintetico COP)', '"Producto, edicion 1"');
  assert.equal(production.parseCsv(quoted)[0].product, 'Producto, edicion 1');
});

check('producción: rechaza CSV vacío y comillas sin cerrar', () => {
  assert.throws(() => production.parseCsv(''), /encabezados y al menos una fila/);
  assert.throws(() => production.parseCsv('"campo sin cierre'), /comillas sin cerrar/);
});

check('arquitecturas: los cinco escenarios producen tres alternativas y el caso base recomienda microservicios con SLA', () => {
  const csv = fs.readFileSync(path.join(__dirname, 'datos/escenarios_modelo.csv'), 'utf8');
  const rows = architecture.parseCsv(csv);
  assert.equal(rows.length, 5);
  for (const scenario of Object.values(architecture.scenarios)) assert.equal(architecture.calculate(scenario).length, 3);
  const base = architecture.calculate(architecture.scenarios.base);
  const micro = base.find(row => row.id === 'microservices');
  assert.ok(micro.stable);
  assert.ok(micro.meetsSLA);
  assert.ok(Math.abs(micro.latency - 56) < 1);
  assert.ok(Math.abs(base.find(row => row.id === 'events').latency - 636) < 1);
});

check('arquitecturas: los escenarios de pico y masivo identifican saturación', () => {
  for (const key of ['peak', 'heavy']) {
    const results = architecture.calculate(architecture.scenarios[key]);
    assert.equal(results.length, 3);
    assert.ok(results.some(row => !row.stable));
  }
});

check('arquitecturas: el nombre de escenario acepta coma entre comillas', () => {
  const csv = fs.readFileSync(path.join(__dirname, 'datos/escenarios_modelo.csv'), 'utf8');
  const quoted = csv.replace('Base (normal)', '"Base, normal"');
  assert.equal(architecture.parseCsv(quoted)[0].label, 'Base, normal');
});

check('arquitecturas: rechaza CSV vacío y comillas sin cerrar', () => {
  assert.throws(() => architecture.parseCsv(''), /encabezados y al menos una fila/);
  assert.throws(() => architecture.parseCsv('"campo sin cierre'), /comillas sin cerrar/);
});

console.log(`
${passed} pruebas automatizadas pasaron.`);
