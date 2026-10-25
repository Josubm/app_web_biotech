(() => {
  const DEMO = {
    product: '', location: '', data_source: '', quantity: 100,
    base_material_kg: .08, base_energy_kwh: .48, base_water_l: .02, base_time_min: 75, base_scrap_pct: 10,
    base_material_price: 50000, base_sale_price: 120000, base_labor_cop: 6000, base_packaging_cop: 3000, base_transport_cop: 1500, base_maintenance_cop_h: 2500,
    alt_material_kg: .073, alt_energy_kwh: .42, alt_water_l: .02, alt_time_min: 67, alt_scrap_pct: 6,
    alt_material_price: 50000, alt_sale_price: 120000, alt_labor_cop: 6000, alt_packaging_cop: 3000, alt_transport_cop: 1500, alt_maintenance_cop_h: 2500,
    electricity_rate: 900, water_rate: 6500, machine_rate: 18000, waste_rate: 500, overhead_pct: 10, target_margin_pct: 30,
    grid_factor: '', material_factor: '', water_factor: ''
  };
  const $ = (root, name) => root.querySelector(`[name="${name}"]`);
  const fmt = (v, d=2) => Number.isFinite(v) ? v.toLocaleString('es-CO',{minimumFractionDigits:d,maximumFractionDigits:d}) : '—';
  const cop = v => Number.isFinite(v) ? `COP ${new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(v)}` : '—';
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  function readInputs(root) {
    const p={product:$(root,'product').value.trim(),location:$(root,'location').value.trim(),dataSource:$(root,'data_source').value.trim(),quantity:Number($(root,'quantity').value),electricityRate:Number($(root,'electricity_rate').value),waterRate:Number($(root,'water_rate').value),machineRate:Number($(root,'machine_rate').value),wasteRate:Number($(root,'waste_rate').value),overheadPct:Number($(root,'overhead_pct').value),targetMarginPct:Number($(root,'target_margin_pct').value)};
    for(const side of ['base','alt']) for(const field of ['material_kg','energy_kwh','water_l','time_min','scrap_pct','material_price','sale_price','labor_cop','packaging_cop','transport_cop','maintenance_cop_h']) p[`${side}_${field}`]=Number($(root,`${side}_${field}`).value);
    for(const f of ['grid_factor','material_factor','water_factor']) p[f]=$(root,f).value.trim()===''?null:Number($(root,f).value);
    return p;
  }
  function calculate(p,side) {
    const q=p.quantity,mass=p[`${side}_material_kg`],scrapRate=p[`${side}_scrap_pct`]/100;
    const finishedMass=q*mass,rawMaterial=finishedMass/(1-scrapRate),waste=rawMaterial-finishedMass;
    const energy=q*p[`${side}_energy_kwh`],water=q*p[`${side}_water_l`],machineHours=q*p[`${side}_time_min`]/60;
    const materialCost=rawMaterial*p[`${side}_material_price`],energyCost=energy*p.electricityRate,waterCost=water/1000*p.waterRate,machineCost=machineHours*p.machineRate;
    const laborCost=q*p[`${side}_labor_cop`],packagingCost=q*p[`${side}_packaging_cop`],transportCost=q*p[`${side}_transport_cop`];
    const maintenanceCost=machineHours*p[`${side}_maintenance_cop_h`],wasteCost=waste*p.wasteRate;
    const subtotal=materialCost+energyCost+waterCost+machineCost+laborCost+packagingCost+transportCost+maintenanceCost+wasteCost;
    const overheadCost=subtotal*p.overheadPct/100,totalCost=subtotal+overheadCost,unitCost=totalCost/q;
    const salePrice=p[`${side}_sale_price`],revenue=salePrice>0?salePrice*q:null,grossProfit=revenue===null?null:revenue-totalCost;
    const marginPct=salePrice>0?(salePrice-unitCost)/salePrice*100:null;
    const suggestedSalePrice=unitCost/(1-p.targetMarginPct/100);
    const carbonReady=[p.grid_factor,p.material_factor,p.water_factor].every(v=>v!==null&&Number.isFinite(v)&&v>=0);
    const carbon=carbonReady?energy*p.grid_factor+rawMaterial*p.material_factor+water/1000*p.water_factor:null;
    return {finishedMass,rawMaterial,waste,energy,water,machineHours,materialCost,energyCost,waterCost,machineCost,laborCost,packagingCost,transportCost,maintenanceCost,wasteCost,subtotal,overheadCost,totalCost,unitCost,salePrice,revenue,grossProfit,marginPct,suggestedSalePrice,carbon};
  }
  function percentChange(base,alt){if(base===0)return alt===0?'0%':'Nuevo';return `${fmt((alt-base)/base*100,1)}%`}
  function comparisonChart(rows){
    return `<div class="compare-bars">${rows.map(r=>{const max=Math.max(r.base,r.alt,1e-9);return `<div class="compare-row"><div class="compare-label"><strong>${r.label}</strong><span>${r.money?cop(r.base):`${fmt(r.base,r.digits??2)} ${r.unit}`} <i>base</i> · ${r.money?cop(r.alt):`${fmt(r.alt,r.digits??2)} ${r.unit}`} <i>alternativa</i></span></div><div class="paired-bars"><div class="prod-bar base" style="width:${clamp(r.base/max*100,0,100)}%" title="Base: ${r.money?cop(r.base):`${fmt(r.base)} ${r.unit}`}"></div><div class="prod-bar alt" style="width:${clamp(r.alt/max*100,0,100)}%" title="Alternativa: ${r.money?cop(r.alt):`${fmt(r.alt)} ${r.unit}`}"></div></div><strong class="delta ${r.alt<=r.base?'good':'bad'}">${percentChange(r.base,r.alt)}</strong></div>`}).join('')}</div>`;
  }
  function evaluate(b,a){
    const rows=[['material de entrada',b.rawMaterial,a.rawMaterial],['electricidad',b.energy,a.energy],['agua',b.water,a.water],['residuo',b.waste,a.waste],['costo total',b.totalCost,a.totalCost]];
    if(b.carbon!==null&&a.carbon!==null)rows.push(['emisiones CO₂e',b.carbon,a.carbon]);
    const better=rows.filter(([,x,y])=>y<x-1e-9).map(([n])=>n),worse=rows.filter(([,x,y])=>y>x+1e-9).map(([n])=>n);
    if(!better.length&&!worse.length)return {title:'Los dos planes dan el mismo resultado',body:'Con los valores actuales, no hay diferencias calculadas.',kind:'info'};
    if(!worse.length)return {title:'La alternativa mejora costo y consumo',body:`Reduce ${better.join(', ')} sin aumentar los indicadores incluidos.`,kind:'success'};
    if(!better.length)return {title:'El plan base resulta más favorable',body:`La alternativa aumenta ${worse.join(', ')} y no reduce otros indicadores incluidos.`,kind:'warning'};
    return {title:'La alternativa tiene ventajas y costos de intercambio',body:`Mejora ${better.join(', ')}, pero aumenta ${worse.join(', ')}. Revisa qué indicadores prioriza el proyecto.`,kind:'info'};
  }
  function validate(root){
    const errors=[];
    root.querySelectorAll('input[type=number][required]').forEach(el=>{
      const n=Number(el.value);
      const min=el.min===''?-Infinity:Number(el.min);
      const max=el.max===''?Infinity:Number(el.max);
      const invalid=!el.value.trim()||!Number.isFinite(n)||n<min||n>max;
      if(invalid)errors.push(`${el.dataset.label||el.name}: ingresa un valor entre ${el.min || '0'} y ${el.max || 'el límite permitido'}.`);
    });
    const msg=root.querySelector('[data-production-errors]');msg.innerHTML=errors.map(e=>`<div class="notice danger">${esc(e)}</div>`).join('');msg.hidden=errors.length===0;return errors.length===0;
  }
  function render(root){
    const p=readInputs(root),base=calculate(p,'base'),alt=calculate(p,'alt'),decision=evaluate(base,alt),product=p.product||'Producto personalizado';
    root.querySelector('[data-product-name]').textContent=product;root.querySelector('[data-location-summary]').textContent=[p.location,p.dataSource].filter(Boolean).join(' · ')||'Ejemplo sintético (sin municipio ni fuente)';
    root.querySelector('[data-production-decision]').innerHTML=`<span class="eyebrow">Comparación para ${esc(product)}</span><h2>${decision.title}</h2><p>${decision.body}</p><div class="result-tags"><span>${alt.unitCost<=base.unitCost?'Menor':'Mayor'} costo por unidad: ${cop(Math.abs(alt.unitCost-base.unitCost))}</span><span>${alt.energy<=base.energy?'Menos':'Más'} energía: ${fmt(Math.abs(alt.energy-base.energy))} kWh/lote</span><span>${alt.rawMaterial<=base.rawMaterial?'Menos':'Más'} material: ${fmt(Math.abs(alt.rawMaterial-base.rawMaterial))} kg/lote</span></div>`;
    const kpis=[['Costo total por unidad',base.unitCost,alt.unitCost,'COP/pieza',true],['Costo total del lote',base.totalCost,alt.totalCost,'COP',true],['Material de entrada',base.rawMaterial,alt.rawMaterial,'kg'],['Energía',base.energy,alt.energy,'kWh'],['Agua',base.water,alt.water,'L'],['Residuo estimado',base.waste,alt.waste,'kg'],['Tiempo de máquina',base.machineHours,alt.machineHours,'h']];
    root.querySelector('[data-production-kpis]').innerHTML=kpis.map(([label,x,y,unit,money])=>`<article class="prod-kpi"><span>${label}</span><div><strong>${money?cop(x):fmt(x)} <small>base</small></strong><strong>${money?cop(y):fmt(y)} <small>alternativa</small></strong></div><em class="${y<=x?'good':'bad'}">${percentChange(x,y)} vs. base</em><small>${unit}</small></article>`).join('');
    root.querySelector('[data-resource-chart]').innerHTML=comparisonChart([{label:'Material de entrada',base:base.rawMaterial,alt:alt.rawMaterial,unit:'kg'},{label:'Electricidad',base:base.energy,alt:alt.energy,unit:'kWh'},{label:'Agua',base:base.water,alt:alt.water,unit:'L'},{label:'Residuo',base:base.waste,alt:alt.waste,unit:'kg'}]);
    root.querySelector('[data-cost-chart]').innerHTML=comparisonChart([
      {label:'Materia prima',base:base.materialCost,alt:alt.materialCost,money:true},{label:'Servicios (energía + agua)',base:base.energyCost+base.waterCost,alt:alt.energyCost+alt.waterCost,money:true},{label:'Operación de máquina',base:base.machineCost+base.maintenanceCost,alt:alt.machineCost+alt.maintenanceCost,money:true},{label:'Mano de obra',base:base.laborCost,alt:alt.laborCost,money:true},{label:'Logística de producto',base:base.packagingCost+base.transportCost,alt:alt.packagingCost+alt.transportCost,money:true},{label:'Disposición de residuos',base:base.wasteCost,alt:alt.wasteCost,money:true},{label:'Costos indirectos',base:base.overheadCost,alt:alt.overheadCost,money:true},{label:'Total estimado',base:base.totalCost,alt:alt.totalCost,money:true}
    ]);
    const costRows=[['Materia prima',base.materialCost,alt.materialCost],['Electricidad',base.energyCost,alt.energyCost],['Agua y alcantarillado',base.waterCost,alt.waterCost],['Uso de máquina',base.machineCost,alt.machineCost],['Mano de obra',base.laborCost,alt.laborCost],['Empaque',base.packagingCost,alt.packagingCost],['Transporte',base.transportCost,alt.transportCost],['Mantenimiento',base.maintenanceCost,alt.maintenanceCost],['Disposición de residuos',base.wasteCost,alt.wasteCost],['Costos indirectos',base.overheadCost,alt.overheadCost],['Costo total',base.totalCost,alt.totalCost]];
    root.querySelector('[data-cost-detail]').innerHTML=`<div class="table-scroll"><table><thead><tr><th>Rubro (COP)</th><th>Base</th><th>Alternativa</th></tr></thead><tbody>${costRows.map(([name,x,y])=>`<tr><td>${name}</td><td>${cop(x)}</td><td>${cop(y)}</td></tr>`).join('')}</tbody></table></div>`;
    root.querySelector('[data-sale-results]').innerHTML=[base,alt].map((x,i)=>`<div class="sale-plan"><h3>${i===0?'Plan base':'Alternativa'}</h3><span>Precio de venta ingresado</span><strong>${x.salePrice>0?cop(x.salePrice):'Sin definir'}</strong><span>Costo total estimado por unidad</span><strong>${cop(x.unitCost)}</strong><span>Precio sugerido para margen objetivo (${fmt(p.targetMarginPct,0)}%)</span><strong>${cop(x.suggestedSalePrice)}</strong><span>Margen bruto al precio ingresado</span><strong class="${x.marginPct!==null&&x.marginPct>=0?'good':'bad'}">${x.marginPct===null?'Ingresa el precio de venta':`${fmt(x.marginPct,1)}%`}</strong><span>Resultado bruto del lote</span><strong>${x.grossProfit===null?'—':cop(x.grossProfit)}</strong></div>`).join('');
    const emissions=root.querySelector('[data-emissions]');
    emissions.innerHTML=base.carbon===null||alt.carbon===null?'<div class="notice info">CO₂e no calculado: agrega factores de emisión con su fuente en “Factores opcionales”.</div>':`<div class="emissions-values"><span>Base <strong>${fmt(base.carbon)} kg CO₂e</strong></span><span>Alternativa <strong>${fmt(alt.carbon)} kg CO₂e</strong></span><span class="${alt.carbon<=base.carbon?'good':'bad'}">Cambio <strong>${percentChange(base.carbon,alt.carbon)}</strong></span></div>`;
    const state=root.querySelector('[data-production-run-state]');state.textContent='Resultado calculado';state.className='run-state';root.querySelector('[data-produced-at]').textContent=new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'});
  }
  function fill(root,v){Object.entries(v).forEach(([key,val])=>{const el=$(root,key);if(el)el.value=val});root.querySelectorAll('[data-production-preset]').forEach(b=>b.classList.remove('active'))}
  function parseCsv(text){
    const rows=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/).map(x=>x.split(',').map(c=>c.trim().replace(/^"|"$/g,''))),headers=rows.shift().map(x=>x.toLowerCase());
    const map={producto:'product',municipio:'location',fuente_y_fecha:'data_source',cantidad:'quantity',masa_base_kg:'base_material_kg',energia_base_kwh:'base_energy_kwh',agua_base_l:'base_water_l',tiempo_base_min:'base_time_min',residuo_base_pct:'base_scrap_pct',precio_material_base_cop_kg:'base_material_price',precio_venta_base_cop_unidad:'base_sale_price',mano_obra_base_cop_unidad:'base_labor_cop',empaque_base_cop_unidad:'base_packaging_cop',transporte_base_cop_unidad:'base_transport_cop',mantenimiento_base_cop_h:'base_maintenance_cop_h',masa_alternativa_kg:'alt_material_kg',energia_alternativa_kwh:'alt_energy_kwh',agua_alternativa_l:'alt_water_l',tiempo_alternativa_min:'alt_time_min',residuo_alternativa_pct:'alt_scrap_pct',precio_material_alternativa_cop_kg:'alt_material_price',precio_venta_alternativa_cop_unidad:'alt_sale_price',mano_obra_alternativa_cop_unidad:'alt_labor_cop',empaque_alternativa_cop_unidad:'alt_packaging_cop',transporte_alternativa_cop_unidad:'alt_transport_cop',mantenimiento_alternativa_cop_h:'alt_maintenance_cop_h',tarifa_electricidad_cop_kwh:'electricity_rate',tarifa_agua_cop_m3:'water_rate',costo_maquina_cop_h:'machine_rate',disposicion_residuo_cop_kg:'waste_rate',costos_indirectos_pct:'overhead_pct',margen_bruto_objetivo_pct:'target_margin_pct',factor_emision_electricidad_kgco2e_kwh:'grid_factor',factor_emision_material_kgco2e_kg:'material_factor',factor_emision_agua_kgco2e_m3:'water_factor'};
    const idx=Object.fromEntries(Object.entries(map).map(([header,key])=>[key,headers.indexOf(header)])),missing=Object.entries(idx).filter(([,i])=>i<0).map(([k])=>k);
    if(missing.length)throw new Error('El CSV debe usar las columnas de la plantilla produccion_demo.csv.');
    const out=rows.filter(r=>r.length>=headers.length).map(r=>Object.fromEntries(Object.entries(idx).map(([key,i])=>[key,r[i]])));
    if(!out.length)throw new Error('El CSV no contiene filas de producto.');return out;
  }
  function mount(root){
    const demo=()=>fill(root,DEMO);
    let liveTimer;
    const updateLive=()=>{
      clearTimeout(liveTimer);
      liveTimer=setTimeout(()=>{if(validate(root)){render(root);root.querySelector('[data-production-run-state]').textContent='Actualización automática';}},220);
    };
    root.querySelectorAll('input,select').forEach(el=>{const dirty=()=>{const state=root.querySelector('[data-production-run-state]');state.textContent='Calculando cambios...';state.className='run-state pending';updateLive()};el.addEventListener('input',dirty);el.addEventListener('change',dirty)});
    root.querySelector('[data-production-run]').addEventListener('click',()=>{if(validate(root)){render(root);root.querySelector('[data-production-results]').scrollIntoView({behavior:'smooth',block:'start'})}});
    root.querySelectorAll('[data-production-preset]').forEach(btn=>btn.addEventListener('click',()=>{const v={...DEMO};if(btn.dataset.productionPreset==='small')v.quantity=25;if(btn.dataset.productionPreset==='large')v.quantity=1000;fill(root,v);btn.classList.add('active');if(validate(root))render(root);root.querySelector('[data-production-results]').scrollIntoView({behavior:'smooth',block:'start'})}));
    root.querySelector('[data-production-reset]').addEventListener('click',()=>{demo();render(root)});
    root.querySelector('[data-bogota-tariffs]').addEventListener('click',()=>{$(root,'electricity_rate').value=1188.6328;$(root,'water_rate').value=11710.89;$(root,'location').value='Bogotá D.C.';$(root,'data_source').value='Servicios: Enel oct-2026 / EAAB abr-2026 (industrial); otros valores sintéticos';if(validate(root))render(root)});
    let rows=[];const file=root.querySelector('[data-production-csv]');
    file.addEventListener('change',async()=>{if(!file.files[0])return;try{rows=parseCsv(await file.files[0].text());const sel=root.querySelector('[data-production-csv-row]');sel.replaceChildren(...rows.map((r,i)=>{const o=document.createElement('option');o.value=i;o.textContent=r.product||`Fila ${i+1}`;return o}));root.querySelector('[data-production-csv-ready]').hidden=false;root.querySelector('[data-production-csv-message]').textContent=`${rows.length} fila(s) lista(s). Elige una y carga sus datos.`}catch(e){const box=root.querySelector('[data-production-errors]');box.innerHTML=`<div class="notice danger">${esc(e.message)}</div>`;box.hidden=false}});
    root.querySelector('[data-load-production-csv]').addEventListener('click',()=>{const row=rows[Number(root.querySelector('[data-production-csv-row]').value)];if(!row)return;fill(root,row);if(validate(root))render(root)});
    fill(root,DEMO);render(root);
  }
  window.BioTechProduction={calculate,parseCsv,defaults:DEMO};
  document.querySelectorAll('[data-production-simulator]').forEach(mount);
})();
