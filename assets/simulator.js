(() => {
  // M/M/c queue model with Erlang-C waiting probability. Parameters are explicit
  // classroom assumptions, not measurements from a cloud provider.
  const ARCH = {
    monolith:{name:'Monolito',short:'Monolito',color:'#f2b84b',unitCost:1600000,baseRps:100,networkMs:18,availability:.970,efficiency:.55,description:'Una aplicación agrupa interfaz, ingesta, análisis y recomendaciones.',pro:'Despliegue sencillo y menor costo inicial.',con:'Escala en conjunto y tiene menor disponibilidad base.'},
    microservices:{name:'Microservicios',short:'Microservicios',color:'#45d6b0',unitCost:1000000,baseRps:125,networkMs:42,availability:.995,efficiency:.85,description:'Servicios separados procesan ingesta, análisis LCA e IA.',pro:'Permite escalar y recuperar componentes por separado.',con:'La comunicación entre servicios y su operación suman complejidad.'},
    events:{name:'Eventos',short:'Eventos',color:'#64c8ff',unitCost:720000,baseRps:150,networkMs:24,availability:.999,efficiency:.95,description:'Los eventos de cargas y sensores disparan trabajos bajo demanda.',pro:'Se adapta a ráfagas y tiene alta eficiencia de expansión.',con:'Puede tener arranque en frío y costos menos predecibles.'}
  };
  const SCENARIOS={
    base:{label:'Base normal',users:150,data:25,complexity:1.5,budget:5000000},
    peak:{label:'Pico de sensores',users:850,data:15,complexity:1,budget:5000000},
    heavy:{label:'Evaluación masiva',users:300,data:85,complexity:2.5,budget:5000000},
    academic:{label:'Uso académico',users:600,data:5,complexity:1,budget:6000000},
    industrial:{label:'Uso industrial',users:20,data:80,complexity:2.5,budget:16000000}
  };
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const fmt=(n,d=0)=>Number.isFinite(n)?Number(n).toLocaleString('es-CO',{minimumFractionDigits:d,maximumFractionDigits:d}):'Saturado';
  const paramsFrom=root=>({users:Number(root.querySelector('[name=users]').value),data:Number(root.querySelector('[name=data]').value),complexity:Number(root.querySelector('[name=complexity]').value),budget:Number(root.querySelector('[name=budget]').value)});
  function erlangC(lambda,mu,c){
    const offered=lambda/mu, rho=offered/c;
    if(rho>=1)return {rho,pWait:1,queueSeconds:Infinity,stable:false};
    let erlangB=1;
    for(let k=1;k<=c;k++)erlangB=(offered*erlangB)/(k+offered*erlangB);
    const pWait=erlangB/(1-rho+rho*erlangB);
    const queueSeconds=pWait/(c*mu-lambda);
    return {rho,pWait,queueSeconds,stable:true};
  }
  function calculate(p){
    const work=1+(p.data/50)+(p.complexity-1)*.45;
    const slaBudget=p.budget;
    return Object.entries(ARCH).map(([id,a])=>{
      const servers=Math.max(1,Math.floor(p.budget/a.unitCost));
      const serviceRate=a.baseRps/work;
      const capacity=servers*serviceRate;
      const q=erlangC(p.users,serviceRate,servers);
      let latency=q.stable?(q.queueSeconds+(1/serviceRate))*1000+a.networkMs:Infinity;
      if(id==='events'&&q.rho<.30)latency+=600;
      const availability=a.availability-.02*Math.max(0,Math.min(q.rho,1)-.70);
      const cost=servers*a.unitCost;
      const scalability=100*a.efficiency*Math.min(1,capacity/Math.max(p.users,.1));
      const latencyScore=Number.isFinite(latency)?clamp(1-latency/200,0,1)*100:0;
      const availabilityScore=clamp((availability-.95)/.05,0,1)*100;
      const score=.4*latencyScore+.3*scalability+.3*availabilityScore;
      const withinBudget=cost<=slaBudget;
      const meetsSLA=q.stable&&latency<=200&&availability>=.995&&withinBudget;
      const costScore=clamp(1-cost/Math.max(slaBudget,1),0,1)*100;
      return {id,a,servers,serviceRate,capacity,rho:q.rho,pWait:q.pWait,queueSeconds:q.queueSeconds,latency,availability,cost,scalability,score,latencyScore,availabilityScore,costScore,withinBudget,meetsSLA,stable:q.stable};
    });
  }
  function recommend(results){
    const eligible=results.filter(r=>r.meetsSLA), pool=eligible.length?eligible:results;
    return {best:pool.reduce((a,b)=>a.score>=b.score?a:b),hasEligible:eligible.length>0};
  }
  function kpiTable(results){
    return `<div class="table-scroll"><table><thead><tr><th>Indicador</th>${results.map(r=>`<th>${r.a.short}</th>`).join('')}</tr></thead><tbody>
      <tr><td>Latencia media estimada</td>${results.map(r=>`<td class="${r.latency<=200?'good':'bad'}">${fmt(r.latency)} ms</td>`).join('')}</tr>
      <tr><td>Capacidad estimada</td>${results.map(r=>`<td>${fmt(r.capacity,1)} req/s</td>`).join('')}</tr>
      <tr><td>Utilización</td>${results.map(r=>`<td>${fmt(r.rho*100,1)}%</td>`).join('')}</tr>
      <tr><td>Disponibilidad estimada</td>${results.map(r=>`<td class="${r.availability>=.995?'good':'bad'}">${fmt(r.availability*100,2)}%</td>`).join('')}</tr>
      <tr><td>Servidores/unidades estimadas</td>${results.map(r=>`<td>${fmt(r.servers)}</td>`).join('')}</tr>
      <tr><td>Costo mensual del modelo</td>${results.map(r=>`<td class="${r.withinBudget?'':'bad'}">COP ${fmt(r.cost)}</td>`).join('')}</tr>
      <tr><td>Puntaje (40/30/30)</td>${results.map(r=>`<td><strong>${fmt(r.score,1)}/100</strong></td>`).join('')}</tr>
    </tbody></table></div>`;
  }
  function scoreChart(results){
    const metrics=[['Latencia',r=>r.latencyScore,'#39c89b'],['Escalabilidad',r=>r.scalability,'#58a6ff'],['Disponibilidad',r=>r.availabilityScore,'#bd91ff'],['Costo',r=>r.costScore,'#f2b84b']];
    const W=820,left=150,right=58,plot=W-left-right,rowH=66,top=34,H=top+results.length*rowH+30;
    let s=`<svg class="viz" viewBox="0 0 ${W} ${H}" role="img" aria-label="Puntaje de cero a cien para latencia, escalabilidad, disponibilidad y costo por arquitectura">`;
    [0,25,50,75,100].forEach(v=>{const x=left+plot*v/100;s+=`<line x1="${x}" y1="${top-9}" x2="${x}" y2="${H-18}" class="gridline"/><text x="${x}" y="${H-3}" class="axis" text-anchor="middle">${v}</text>`});
    results.forEach((r,i)=>{const y=top+i*rowH;s+=`<text x="${left-12}" y="${y+20}" class="chartlabel" text-anchor="end">${r.a.short}</text>`;metrics.forEach(([label,value,color],j)=>{const yy=y+4+j*12,w=plot*clamp(value(r),0,100)/100;s+=`<rect x="${left}" y="${yy}" width="${plot}" height="8" rx="4" class="barbg"/><rect x="${left}" y="${yy}" width="${w}" height="8" rx="4" fill="${color}"/><text x="${left+plot+8}" y="${yy+8}" class="axis">${fmt(value(r),0)}</text><title>${r.a.short} · ${label}: ${fmt(value(r),1)}/100</title>`});});
    s+='</svg><div class="legend">'+metrics.map(([label,,color])=>`<span><i style="background:${color}"></i>${label}</span>`).join('')+'</div>';
    return s;
  }
  function latencyChart(results){
    const max=Math.max(300,...results.map(r=>Number.isFinite(r.latency)?r.latency:300));
    const scale=Math.min(max,1000), slaX=Math.min(100,200/scale*100);
    return `<div class="latency-viz">${results.map(r=>{const value=Number.isFinite(r.latency)?r.latency:scale,width=clamp(value/scale*100,1,100);return `<div class="latency-row"><span>${r.a.short}</span><div class="latency-track"><i class="sla-marker" style="left:${slaX}%"></i><b style="width:${width}%;background:${r.a.color}"></b></div><strong>${fmt(r.latency)} ms</strong></div>`}).join('')}<div class="chart-foot"><span>0 ms</span><span>─── SLA: 200 ms</span><span>${fmt(scale)} ms</span></div></div>`;
  }
  function capacityChart(results){
    const max=Math.max(...results.map(r=>r.capacity));
    return `<div class="capacity-viz">${results.map(r=>`<div class="capacity-card"><span class="capacity-dot" style="background:${r.a.color}"></span><strong>${r.a.short}</strong><b>${fmt(r.capacity,1)}</b><small>solicitudes/segundo</small><div class="capacity-track"><i style="width:${clamp(r.capacity/max*100,1,100)}%;background:${r.a.color}"></i></div><small>${fmt(r.servers)} unidades · ρ ${fmt(r.rho*100,1)}%</small></div>`).join('')}</div>`;
  }
  function alertsFor(r,p){
    const x=[];
    if(!r.stable)x.push(['danger','Demanda iguala o supera la capacidad: el sistema se satura.']);
    if(r.latency>200)x.push(['danger',`Latencia por encima del SLA: ${fmt(r.latency)} ms (máximo 200 ms).`]);
    if(r.availability<.995)x.push(['danger',`Disponibilidad bajo SLA: ${fmt(r.availability*100,2)}% (mínimo 99,5%).`]);
    if(!r.withinBudget)x.push(['warning',`Costo estimado COP ${fmt(r.cost)} excede el límite de COP ${fmt(p.budget)}/mes.`]);
    if(r.id==='monolith'&&p.users>600)x.push(['danger','El monolito supera el umbral de 600 solicitudes/s definido como riesgo de saturación.']);
    if(!x.length)x.push(['success','Cumple latencia, disponibilidad y presupuesto para este escenario.']);
    return x.map(([kind,msg])=>`<div class="notice ${kind}">${msg}</div>`).join('');
  }
  function render(root){
    const p=paramsFrom(root), results=calculate(p), decision=recommend(results), selected=root.dataset.architecture||'all';
    root.querySelectorAll('[data-output="users"]').forEach(el=>el.textContent=`${fmt(p.users)} req/s`);
    root.querySelectorAll('[data-output="data"]').forEach(el=>el.textContent=`${fmt(p.data)} MB`);
    root.querySelectorAll('[data-output="complexity"]').forEach(el=>el.textContent=`${fmt(p.complexity,1)}×`);
    root.querySelectorAll('[data-output="budget"]').forEach(el=>el.textContent=`COP ${fmt(p.budget)}/mes`);
    if(selected==='all'){
      const b=decision.best, why=decision.hasEligible?'Cumple los objetivos obligatorios del escenario.':`Ninguna opción cumple todo el SLA; esta obtiene el mejor puntaje y aún incumple ${[b.latency>200?'latencia':null,b.availability<.995?'disponibilidad':null,!b.withinBudget?'presupuesto':null].filter(Boolean).join(', ')}.`;
      root.querySelector('[data-recommendation]').innerHTML=`<span class="eyebrow">Resultado del modelo</span><h2>${decision.hasEligible?'Recomendación: ':'Mejor puntaje: '}${b.a.name}</h2><p class="rec-summary">${why}</p><div class="result-tags"><span>${b.meetsSLA?'SLA cumple':'SLA no cumple'}</span><span>Puntaje ${fmt(b.score,1)}/100</span><span>${fmt(b.servers)} unidades</span></div><details><summary>Por qué y cuáles son sus límites</summary><p>${b.a.name}: ${b.a.description}</p><p><strong>Ventaja:</strong> ${b.a.pro} <strong>Limitación:</strong> ${b.a.con}</p><p class="small muted">Modelo matemático M/M/c; los parámetros base son supuestos editables, no mediciones de nube.</p></details>`;
      root.querySelector('[data-comparison]').innerHTML=kpiTable(results);
      root.querySelector('[data-score-chart]').innerHTML=scoreChart(results);
      root.querySelector('[data-latency-chart]').innerHTML=latencyChart(results);
      root.querySelector('[data-capacity-chart]').innerHTML=capacityChart(results);
      root.querySelector('[data-alerts]').innerHTML=alertsFor(b,p);
      root.querySelectorAll('[data-selected-kpi]').forEach(el=>{const r=results.find(x=>x.id===(root.dataset.activeArchitecture||'microservices'))||decision.best;const map={latency:`${fmt(r.latency)} ms`,capacity:`${fmt(r.capacity,1)} req/s`,availability:`${fmt(r.availability*100,2)}%`,cost:`COP ${fmt(r.cost)}`,score:`${fmt(r.score,1)}/100`};el.textContent=map[el.dataset.selectedKpi]||'—'});
      root.querySelectorAll('[data-architecture-card]').forEach(card=>card.classList.toggle('active',card.dataset.architectureCard===(root.dataset.activeArchitecture||'microservices')));
    } else {
      const r=results.find(x=>x.id===selected);
      root.querySelector('[data-single-result]').innerHTML=`<h2>${r.a.name} · ${r.meetsSLA?'cumple':'requiere ajustes'}</h2><div class="metric-grid"><div class="metric"><span>Latencia</span><b>${fmt(r.latency)} ms</b></div><div class="metric"><span>Capacidad</span><b>${fmt(r.capacity,1)} req/s</b></div><div class="metric"><span>Disponibilidad</span><b>${fmt(r.availability*100,2)}%</b></div><div class="metric"><span>Costo mensual</span><b>COP ${fmt(r.cost)}</b></div><div class="metric"><span>Unidades</span><b>${fmt(r.servers)}</b></div><div class="metric"><span>Puntaje</span><b>${fmt(r.score,1)}/100</b></div></div>`;
      root.querySelector('[data-single-chart]').innerHTML=latencyChart(results);
      root.querySelector('[data-single-recommendation]').innerHTML=`<p>${r.a.description}</p><p><strong>Supuestos:</strong> tasa de servicio y costo/unidad son parámetros de demostración.</p>`;
    }
  }
  function controlsValid(root){
    const errors=[];
    root.querySelectorAll('input[type=number][name]').forEach(el=>{const n=Number(el.value),min=Number(el.min),max=Number(el.max),step=Number(el.step)||1;const offStep=Math.abs((n-min)/step-Math.round((n-min)/step))>1e-8;if(!el.value||!Number.isFinite(n)||n<min||n>max||offStep)errors.push(`${el.dataset.label}: usa un valor entre ${el.min} y ${el.max} en pasos de ${step}.`)});
    const box=root.querySelector('[data-input-errors]');
    if(box){box.innerHTML=errors.map(e=>`<div class="notice danger">${e}</div>`).join('');box.hidden=!errors.length}
    return errors.length===0;
  }
  function syncControls(root,values){
    Object.entries(values).forEach(([key,value])=>{const n=root.querySelector(`input[type=number][name="${key}"]`),range=root.querySelector(`input[type=range][name="${key}"]`),select=root.querySelector(`select[name="${key}"]`);if(n)n.value=value;if(range)range.value=value;if(select)select.value=value});
    root.querySelectorAll('[data-scenario]').forEach(btn=>btn.classList.remove('active'));
    markDirty(root,false);
  }
  function markDirty(root,dirty){const x=root.querySelector('[data-run-state]');if(x){x.textContent=dirty?'Variables cambiadas · pulsa “Calcular”':'Resultado calculado';x.className=dirty?'run-state pending':'run-state'}if(dirty)root.querySelectorAll('[data-scenario]').forEach(btn=>btn.classList.remove('active'));root.classList.toggle('dirty',dirty)}
  function readCsvRows(text){
    const input=String(text).replace(/^\uFEFF/,''),rows=[];let row=[],cell='',quoted=false;
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
    const rows=readCsvRows(text);
    if(rows.length<2)throw new Error('El CSV debe incluir encabezados y al menos una fila de escenarios.');
    const headers=rows.shift().map(x=>x.toLowerCase());
    const find=(names)=>headers.findIndex(h=>names.includes(h));
    const ix={label:find(['escenario','scenario','nombre']),users:find(['solicitudes_por_segundo','users','concurrencia']),data:find(['datos_mb','data_mb','datos']),complexity:find(['complejidad_ia','complexity']),budget:find(['presupuesto_cop_mes','budget','presupuesto'])};
    if(Object.values(ix).some(i=>i<0))throw new Error('El CSV debe incluir escenario, solicitudes_por_segundo, datos_mb, complejidad_ia y presupuesto_cop_mes.');
    return rows.filter(r=>r.length>=headers.length).map(r=>({label:r[ix.label],users:Number(r[ix.users]),data:Number(r[ix.data]),complexity:Number(r[ix.complexity]),budget:Number(r[ix.budget])})).filter(x=>[x.users,x.data,x.complexity,x.budget].every(Number.isFinite));
  }
  function mount(root){
    let csvRows=[];
    root.querySelectorAll('input[type=range][name]').forEach(range=>{const number=root.querySelector(`input[type=number][name="${range.name}"]`);range.addEventListener('input',()=>{if(number)number.value=range.value;markDirty(root,true)});});
    root.querySelectorAll('input[type=number][name]').forEach(number=>number.addEventListener('input',()=>{const v=Number(number.value),range=root.querySelector(`input[type=range][name="${number.name}"]`);if(Number.isFinite(v)&&range&&v>=Number(range.min)&&v<=Number(range.max))range.value=v;markDirty(root,true)}));
    root.querySelectorAll('select[name]').forEach(el=>el.addEventListener('change',()=>markDirty(root,true)));
    root.querySelectorAll('[data-run]').forEach(btn=>btn.addEventListener('click',()=>{if(!controlsValid(root))return;render(root);markDirty(root,false);root.querySelector('[data-results]')?.scrollIntoView({behavior:'smooth',block:'start'})}));
    root.querySelectorAll('[data-scenario]').forEach(btn=>btn.addEventListener('click',()=>{const values=SCENARIOS[btn.dataset.scenario];if(!values)return;syncControls(root,values);btn.classList.add('active');render(root);root.querySelector('[data-results]')?.scrollIntoView({behavior:'smooth',block:'start'})}));
    root.querySelectorAll('[data-architecture-card]').forEach(card=>card.addEventListener('click',()=>{root.dataset.activeArchitecture=card.dataset.architectureCard;root.querySelectorAll('[data-architecture-card]').forEach(c=>c.classList.toggle('selected',c===card));}));
    root.querySelectorAll('[data-reset]').forEach(btn=>btn.addEventListener('click',()=>{syncControls(root,SCENARIOS.base);render(root)}));
    const file=root.querySelector('[data-csv-input]');
    if(file)file.addEventListener('change',async()=>{if(!file.files[0])return;try{csvRows=parseCsv(await file.files[0].text());const select=root.querySelector('[data-csv-scenario]');select.replaceChildren(...csvRows.map((row,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=row.label;return option}));root.querySelector('[data-csv-box]').hidden=false;root.querySelector('[data-csv-message]').textContent=`${csvRows.length} escenarios encontrados. Selecciona uno para cargar sus variables.`}catch(e){root.querySelector('[data-input-errors]').innerHTML=`<div class="notice danger">${e.message}</div>`;root.querySelector('[data-input-errors]').hidden=false}});
    const loadRow=root.querySelector('[data-load-csv-row]');
    if(loadRow)loadRow.addEventListener('click',()=>{const row=csvRows[Number(root.querySelector('[data-csv-scenario]').value)];if(!row)return;const values={users:row.users,data:row.data,complexity:row.complexity,budget:row.budget};syncControls(root,values);if(controlsValid(root)){render(root);root.querySelector('[data-results]')?.scrollIntoView({behavior:'smooth',block:'start'})}});
    render(root);markDirty(root,false);
  }
  window.BioTechModel={calculate,erlangC,parseCsv,scenarios:SCENARIOS,architectures:ARCH};
  document.querySelectorAll('[data-simulator]').forEach(mount);
})();
