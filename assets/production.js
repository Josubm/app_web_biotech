(() => {
  const DEMO = {
    product: 'Producto de demostración', location: '', data_source: 'Datos sintéticos para demostración; reemplazar por mediciones propias', quantity: 100,
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
    const formatValue=(value, digits=2, unit='')=>{
      if(!Number.isFinite(Number(value))) return '—';
      const amount = Number(value).toLocaleString('es-CO',{minimumFractionDigits:digits,maximumFractionDigits:digits});
      return unit ? `${amount} ${unit}` : amount;
    };
    return `<div class="compare-bars">${rows.map(r=>{
      const base=Number(r.base)||0;
      const alt=Number(r.alt)||0;
      const unit=r.unit||'';
      const max=Math.max(Math.abs(base),Math.abs(alt),1);
      const basePct=(Math.abs(base)/max)*100;
      const altPct=(Math.abs(alt)/max)*100;
      const delta=alt-base;
      const baseLabel=r.money ? cop(base) : formatValue(base,r.digits??2,unit);
      const altLabel=r.money ? cop(alt) : formatValue(alt,r.digits??2,unit);
      return `<div class="compare-row"><div class="compare-row-head"><strong>${r.label}</strong><span class="delta">${delta>=0?'+':''}${fmt(delta,r.digits??2)}${unit?` ${unit}`:''}</span></div><div class="compare-series"><span>Base</span><div class="compare-track"><div class="prod-bar base" style="width:${Math.max(basePct,4)}%"></div></div><strong>${baseLabel}</strong><span>Alt.</span><div class="compare-track"><div class="prod-bar alt" style="width:${Math.max(altPct,4)}%"></div></div><strong>${altLabel}</strong></div></div>`;
    }).join('')}</div>`;
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
    root.querySelectorAll('input[type=number][required]').forEach(el=>{const n=Number(el.value),min=Number(el.min),max=Number(el.max),step=Number(el.step)||1;const invalid=!el.value||!Number.isFinite(n)||n<min||n>max||Math.abs((n/step)-Math.round(n/step))>1e-9; if(invalid) errors.push(`${el.dataset.label||el.name} debe estar entre ${min} y ${max}.`);});
    const msg=root.querySelector('[data-production-errors]'),shown=errors.slice(0,5),extra=errors.length-shown.length;msg.innerHTML=errors.length?`<div class="notice danger"><strong>Revisa ${errors.length} dato${errors.length===1?'':'s'}:</strong><ul>${shown.map(e=>`<li>${e}</li>`).join('')}</ul>${extra>0?`<p>Y ${extra} más.</p>`:''}</div>`:'<div class="notice success">Los datos del lote son válidos.</div>';
    msg.hidden=!errors.length;return !errors.length;
  }
  function render(root){
    const p=readInputs(root),base=calculate(p,'base'),alt=calculate(p,'alt'),decision=evaluate(base,alt),product=p.product||'Producto sin nombre';
    root.querySelector('[data-production-empty]').hidden=true;root.querySelector('[data-production-results]').hidden=false;
    root.querySelector('[data-product-name]').textContent=product;root.querySelector('[data-location-summary]').textContent=[p.location,p.dataSource].filter(Boolean).join(' · ')||'Sin municipio ni fuente';
    const flow=root.querySelector('[data-calc-flow]');flow.dataset.animated='false';flow.querySelector('[data-flow-order]').textContent=`${fmt(p.quantity,0)} unidades · ${product}`;flow.querySelector('[data-flow-material]').textContent=`${fmt(base.rawMaterial,2)} kg · ${fmt(alt.rawMaterial,2)} kg`;
    flow.querySelector('[data-flow-resources]').textContent=`${fmt(base.energy,2)} kWh · ${fmt(alt.energy,2)} kWh`;
    flow.querySelector('[data-flow-price]').textContent=`${cop(base.totalCost)} · ${cop(alt.totalCost)}`;
    root.querySelector('[data-production-decision]').innerHTML=`<span class="eyebrow">Comparación para ${esc(product)}</span><h2>${decision.title}</h2><p>${decision.body}</p><div class="result-tags"><span class="pill">Base: ${cop(base.totalCost)}</span><span class="pill">Alternativa: ${cop(alt.totalCost)}</span></div>`;
    const kpis=[['Costo total por unidad',base.unitCost,alt.unitCost,'COP/unidad',true],['Costo total del lote',base.totalCost,alt.totalCost,'COP',true],['Material de entrada',base.rawMaterial,alt.rawMaterial,'kg',false],['Electricidad',base.energy,alt.energy,'kWh',false],['Agua',base.water,alt.water,'L',false],['Residuo',base.waste,alt.waste,'kg',false]];
    root.querySelector('[data-production-kpis]').innerHTML=kpis.map(([label,x,y,unit,money])=>`<article class="prod-kpi"><span>${label}</span><div><strong>${money?cop(x):fmt(x)} <small>base</small></strong><strong>${money?cop(y):fmt(y)} <small>alt.</small></strong></div></article>`).join('');
    root.querySelector('[data-resource-chart]').innerHTML=comparisonChart([{label:'Material de entrada',base:base.rawMaterial,alt:alt.rawMaterial,unit:'kg'},{label:'Electricidad',base:base.energy,alt:alt.energy,unit:'kWh'},{label:'Agua',base:base.water,alt:alt.water,unit:'L'},{label:'Residuo',base:base.waste,alt:alt.waste,unit:'kg'}]);
    root.querySelector('[data-cost-chart]').innerHTML=comparisonChart([
      {label:'Materia prima',base:base.materialCost,alt:alt.materialCost,money:true},{label:'Servicios (energía + agua)',base:base.energyCost+base.waterCost,alt:alt.energyCost+alt.waterCost,money:true},{label:'Máquina + mantenimiento',base:base.machineCost+base.maintenanceCost,alt:alt.machineCost+alt.maintenanceCost,money:true},{label:'Otros costos',base:base.laborCost+base.packagingCost+base.transportCost+base.wasteCost,alt:alt.laborCost+alt.packagingCost+alt.transportCost+alt.wasteCost,money:true}
    ]);
    const costRows=[['Materia prima',base.materialCost,alt.materialCost],['Electricidad',base.energyCost,alt.energyCost],['Agua y alcantarillado',base.waterCost,alt.waterCost],['Uso de máquina',base.machineCost,alt.machineCost],['Mano de obra',base.laborCost,alt.laborCost],['Empaque',base.packagingCost,alt.packagingCost],['Transporte',base.transportCost,alt.transportCost],['Mantenimiento',base.maintenanceCost,alt.maintenanceCost],['Disposición',base.wasteCost,alt.wasteCost],['Costos indirectos',base.overheadCost,alt.overheadCost]];
    root.querySelector('[data-cost-detail]').innerHTML=`<div class="table-scroll"><table><thead><tr><th>Rubro (COP)</th><th>Base</th><th>Alternativa</th></tr></thead><tbody>${costRows.map(([name,x,y])=>`<tr><th>${name}</th><td>${cop(x)}</td><td>${cop(y)}</td></tr>`).join('')}</tbody></table></div>`;
    const marginLabel=x=>x.marginPct===null?'Sin precio':`${fmt(x.marginPct,1)}%`;
    root.querySelector('[data-sale-results]').innerHTML=`<div class="financial-table-wrap"><table class="financial-table"><thead><tr><th>Concepto</th><th>Plan base</th><th>Alternativa</th></tr></thead><tbody><tr><td>Margen bruto</td><td class="${base.marginPct>0?'good':'bad'}">${marginLabel(base)}</td><td class="${alt.marginPct>0?'good':'bad'}">${marginLabel(alt)}</td></tr><tr><td>Precio de venta</td><td>${cop(base.salePrice)}</td><td>${cop(alt.salePrice)}</td></tr><tr><td>Costo total del lote</td><td>${cop(base.totalCost)}</td><td>${cop(alt.totalCost)}</td></tr><tr><td>Precio sugerido</td><td>${cop(base.suggestedSalePrice)}</td><td>${cop(alt.suggestedSalePrice)}</td></tr></tbody></table></div>`;
    const emissions=root.querySelector('[data-emissions]');
    emissions.innerHTML=base.carbon===null||alt.carbon===null?'<div class="notice info">CO₂e no calculado: agrega factores de emisión con su fuente en “Factores opcionales”.</div>':`<div class="financial-table-wrap"><table class="financial-table"><thead><tr><th>Concepto</th><th>Base</th><th>Alternativa</th></tr></thead><tbody><tr><td>Huella total</td><td>${fmt(base.carbon,2)} kg</td><td>${fmt(alt.carbon,2)} kg</td></tr></tbody></table></div>`;
    const state=root.querySelector('[data-production-run-state]');state.textContent='Resultado calculado';state.className='run-state';root.querySelector('[data-produced-at]').textContent=new Date().toLocaleString('es-CO');
  }
  function fill(root,v){Object.entries(v).forEach(([key,val])=>{const el=$(root,key);if(el)el.value=val});root.querySelectorAll('[data-production-preset]').forEach(b=>b.classList.remove('active'));}
  function readCsvRows(text){
    const input=String(text).replace(/^\uFEFF/,'');const rows=[];let row=[],cell='',quoted=false;
    const finishRow=()=>{row.push(cell.trim());if(row.some(value=>value!==''))rows.push(row);row=[];cell=''};
    for(let i=0;i<input.length;i++){
      const char=input[i];
      if(quoted){if(char==='"'){if(input[i+1]==='"'){cell+='"';i++}else quoted=false}else cell+=char;continue}
      if(char==='"'&&cell.trim()===''){quoted=true;continue}
      if(char===','){row.push(cell.trim());cell='';continue}
      if(char==='\n'||char==='\r'){if(char==='\r'&&input[i+1]==='\n')i++;finishRow();continue}
      cell+=char;
    }
    if(quoted)throw new Error('El CSV contiene una celda con comillas sin cerrar.');
    if(cell!==''||row.length)finishRow();
    return rows;
  }
  function parseCsv(text){
    const rows=readCsvRows(text);if(rows.length<2)throw new Error('El CSV debe incluir encabezados y al menos una fila de datos.');const headers=rows.shift().map(x=>x.toLowerCase());
    const map={producto:'product',municipio:'location',fuente_y_fecha:'data_source',cantidad:'quantity',masa_base_kg:'base_material_kg',energia_base_kwh:'base_energy_kwh',agua_base_l:'base_water_l',tiempo_base_min:'base_time_min',residuo_base_pct:'base_scrap_pct',precio_material_base:'base_material_price',precio_venta_base:'base_sale_price',mano_obra_base:'base_labor_cop',empaque_base:'base_packaging_cop',transporte_base:'base_transport_cop',mantenimiento_base_h:'base_maintenance_cop_h',masa_alt_kg:'alt_material_kg',energia_alt_kwh:'alt_energy_kwh',agua_alt_l:'alt_water_l',tiempo_alt_min:'alt_time_min',residuo_alt_pct:'alt_scrap_pct',precio_material_alt:'alt_material_price',precio_venta_alt:'alt_sale_price',mano_obra_alt:'alt_labor_cop',empaque_alt:'alt_packaging_cop',transporte_alt:'alt_transport_cop',mantenimiento_alt_h:'alt_maintenance_cop_h',tarifa_electricidad:'electricity_rate',tarifa_agua:'water_rate',tarifa_maquina:'machine_rate',tarifa_residuo:'waste_rate',costos_indirectos:'overhead_pct',margen_objetivo:'target_margin_pct'};
    const idx=Object.fromEntries(Object.entries(map).map(([header,key])=>[key,headers.indexOf(header)])),missing=Object.entries(idx).filter(([,i])=>i<0).map(([k])=>k);
    if(missing.length)throw new Error('El CSV debe usar las columnas de la plantilla produccion_demo.csv.');
    const out=rows.filter(r=>r.length>=headers.length).map(r=>Object.fromEntries(Object.entries(idx).map(([key,i])=>[key,r[i]])));
    if(!out.length)throw new Error('El CSV no contiene filas de producto.');return out;
  }
  function mount(root){
    root.querySelectorAll('input,select').forEach(el=>{const dirty=()=>{const state=root.querySelector('[data-production-run-state]');state.textContent='Cambios pendientes · pulsa “Calcular lote”';state.className='run-state pending';}; el.addEventListener('input',dirty); el.addEventListener('change',dirty);});
    root.querySelector('[data-production-run]').addEventListener('click',()=>{if(validate(root)){render(root);root.querySelector('[data-production-results]').scrollIntoView({behavior:'smooth',block:'start'});}});
    const loadDemo=quantity=>{const v={...DEMO,quantity};fill(root,v);if(validate(root)){render(root);root.querySelector('[data-production-results]').scrollIntoView({behavior:'smooth',block:'start'});}};
    root.querySelectorAll('[data-production-preset]').forEach(btn=>btn.addEventListener('click',()=>{const quantity=btn.dataset.productionPreset==='small'?25:btn.dataset.productionPreset==='large'?500:100;loadDemo(quantity);btn.classList.add('active');}));
    root.querySelector('[data-empty-preset]').addEventListener('click',()=>{loadDemo(100);root.querySelector('[data-production-preset="demo"]')?.classList.add('active')});
    root.querySelector('[data-production-reset]').addEventListener('click',()=>{root.querySelectorAll('details').forEach(el=>el.open=false);root.querySelector('[data-production-errors]').hidden=true;fill(root,DEMO);root.querySelector('[data-production-run-state]').textContent='Completa los datos';root.querySelector('[data-production-run-state]').className='run-state';root.querySelector('[data-production-empty]').hidden=false;root.querySelector('[data-production-results]').hidden=true;});
    root.querySelector('[data-bogota-tariffs]').addEventListener('click',()=>{$(root,'electricity_rate').value=1188.6328;$(root,'water_rate').value=11710.89;$(root,'location').value='Bogotá D.C.';$(root,'machine_rate').value=18000;$(root,'waste_rate').value=500;$(root,'overhead_pct').value=10;$(root,'target_margin_pct').value=30;});
    let rows=[];const file=root.querySelector('[data-production-csv]');
    file.addEventListener('change',async()=>{if(!file.files[0])return;try{rows=parseCsv(await file.files[0].text());const sel=root.querySelector('[data-production-csv-row]');sel.replaceChildren(...rows.map((row,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=row[0]||`Fila ${i+1}`;return option;}));sel.hidden=false;root.querySelector('[data-production-csv-ready]').hidden=false;root.querySelector('[data-production-csv-message]').textContent=`${rows.length} fila${rows.length===1?'':'s'} cargadas desde el CSV.`;}catch(error){root.querySelector('[data-production-csv-message]').textContent=error.message;root.querySelector('[data-production-csv-ready]').hidden=true;}});
    root.querySelector('[data-load-production-csv]').addEventListener('click',()=>{const row=rows[Number(root.querySelector('[data-production-csv-row]').value)];if(!row)return;fill(root,row);if(validate(root)){render(root);root.querySelector('[data-production-results]').scrollIntoView({behavior:'smooth',block:'start'});}});
    fill(root,DEMO);
    render(root);
    root.querySelector('[data-production-preset="demo"]')?.classList.add('active');
  }
  window.BioTechProduction={calculate,parseCsv,defaults:DEMO};
  document.querySelectorAll('[data-production-simulator]').forEach(mount);
})();
