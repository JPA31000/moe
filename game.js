(() => {
  const els = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    end: document.getElementById('end-screen'),
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    progress: document.getElementById('progress'),
    progressFill: document.getElementById('progress-fill'),
    prompt: document.getElementById('prompt'),
    area: document.getElementById('game-area'),
    bankSide: document.getElementById('bank-side'),
    explain: document.getElementById('explain'),
    helpBtn: document.getElementById('help-btn'),
    helpDlg: document.getElementById('help-dialog'),
    helpClose: document.getElementById('help-close'),
    zoom: document.getElementById('zoom-range'),
    toast: document.getElementById('toast'),
    rule: document.getElementById('rule-banner'),
    checklist: document.getElementById('checklist'),
    listItems: document.getElementById('checklist-items'),
    hintBtn: document.getElementById('hint-btn'),
    final: document.getElementById('final-score'),
  };
  const btnStart = document.getElementById('start-btn');
  const btnValidate = document.getElementById('validate-btn');
  const btnSkip = document.getElementById('skip-btn');
  const btnUndo = document.getElementById('undo-btn');
  const btnRestart = document.getElementById('restart-btn');
  const btnCSV = document.getElementById('download-csv');
  const optEval = document.getElementById('opt-eval');
  const optIcons = document.getElementById('opt-icons');
  const optLeader = document.getElementById('opt-leader');

  const ICONS = {
    'Zone de levage': '<svg viewBox="0 0 24 24" class="ico"><path d="M12 2l4 8h-3v12h-2V10H8l4-8z"/></svg>',
    'Panneau EPI obligatoires': '<svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="12" r="9"/><path d="M9 17h6l-1-3H10l-1 3zM12 5a3 3 0 00-3 3v2h6V8a3 3 0 00-3-3z"/></svg>',
    'Zone déchets triés': '<svg viewBox="0 0 24 24" class="ico"><path d="M12 2l2 4h4l-2 4 2 4h-4l-2 4-2-4H6l2-4-2-4h4l2-4z"/></svg>',
    'Poste de commandement/chef de chantier': '<svg viewBox="0 0 24 24" class="ico"><path d="M6 3h2v18H6zM8 3h10l-3 3 3 3H8z"/></svg>'
  };

  const RULE_TIPS = {
    "Zone de levage": "Zone dégagée, hors circulations piétons.",
    "Panneau EPI obligatoires": "Proche de l'entrée, visible avant l'accès au chantier.",
    "Zone déchets triés": "En périphérie, accessible aux bennes, hors flux.",
    "Poste de commandement/chef de chantier": "Près de l'entrée ou en position centrale visible."
  };

  const DEFAULT = {
    settings: { duration_seconds: 180, cards_per_game: 4, hints_enabled: true, hint_penalty: 0.2, skip_penalty: 0.5 },
    levels: [
      {
        id: "P1",
        type: "vocab",
        title: "Organisation de chantier sur plan",
        prompt: "Place ces éléments d'organisation de chantier sur le plan réel.",
        plan_image: "plan.png",
        targets: [
          { label: "Zone de levage", x_pct: 27, y_pct: 22, tol_pct: 4 },
          { label: "Panneau EPI obligatoires", x_pct: 6, y_pct: 36, tol_pct: 4 },
          { label: "Zone déchets triés", x_pct: 90, y_pct: 85, tol_pct: 4 },
          { label: "Poste de commandement/chef de chantier", x_pct: 55, y_pct: 8, tol_pct: 4 }
        ],
        explain: "Repères : Entrée côté gauche ; logistique en bas/droite ; éviter les conflits de flux."
      }
    ]
  };

  // --- State ---
  let data = null, working = [], order = [], current=0, score=0, timer=null, timeLeft=180, results=[], history=[];
  let cardStart=0, hintUsed=false, player={name:'',clazz:''};

  const $ = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));
  const shuffle = (a)=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const showToast=(t,ms=1800)=>{els.toast.textContent=t; els.toast.classList.remove('hidden'); setTimeout(()=>els.toast.classList.add('hidden'), ms);};

  async function loadData(){
    try{
      const res = await fetch('data.json',{cache:'no-store'});
      if(!res.ok) throw new Error();
      const json = await res.json();
      if(!json.levels) throw new Error();
      data = json;
    } catch(e){
      data = DEFAULT;
      showToast('Mode plan: données intégrées');
    }
  }

  function setRule(level){
    if(level.type!=='vocab'){ els.rule.classList.add('hidden'); return; }
    const lines = (level.targets||[]).map(t=>`• <b>${t.label}</b> — ${RULE_TIPS[t.label]||''}`);
    els.rule.innerHTML = lines.join('<br>');
    els.rule.classList.remove('hidden');
  }

  function startGame(){
    const name = document.getElementById('player-name').value.trim();
    const clazz = document.getElementById('player-class').value;
    if(!name){ alert('Veuillez saisir votre nom.'); return; }
    player = {name, clazz};
    const type = document.getElementById('exercise-type').value;
    if(type==='vocab') working = data.levels.filter(l=>l.type==='vocab'); else working = data.levels.slice();
    order = shuffle(Array.from({length: Math.min(working.length, data.settings.cards_per_game)}, (_,i)=>i));
    current=0; score=0; results=[]; timeLeft=data.settings.duration_seconds; history=[];
    els.start.classList.add('hidden'); els.game.classList.remove('hidden');
    updateHUD(true);
    if(timer) clearInterval(timer);
    timer = setInterval(()=>{ timeLeft--; updateHUD(false); if(timeLeft<=0) endGame(); }, 1000);
    nextCard();
  }

  function updateHUD(reset){
    els.timer.textContent = `⏱ ${Math.floor(timeLeft/60)}:${String(timeLeft%60).padStart(2,'0')}`;
    els.score.textContent = `Score : ${score.toFixed(1)} / 20`;
    const total = order.length||1; els.progress.textContent = `Carte ${Math.min(current+1,total)}/${total}`;
    els.progressFill.style.width = (reset?'0%': Math.round((current/Math.max(total,1))*100)+'%');
  }

  function clearArea(){
    els.area.innerHTML='';
    els.bankSide.querySelectorAll(':scope > :not(.checklist)').forEach(n=>n.remove());
    els.explain.textContent=''; els.rule.classList.add('hidden'); btnValidate.disabled=true;
    history=[]; btnUndo.disabled=true; hintUsed=false;
    els.listItems.innerHTML=''; els.checklist.classList.add('hidden');
  }

  function nextCard(){
    if(current>=order.length){ endGame(); return; }
    clearArea();
    const level = working[ order[current] ];
    els.prompt.textContent = '📐 ' + (level.prompt||'');
    if(level.plan_image){ renderPlan(level); } else { renderPlan(DEFAULT.levels[0]); } // always plan for this prototype
    cardStart = Date.now();
    updateHUD(false);
  }

  function renderPlan(level){
    // bank with draggable tags
    const bank = document.createElement('div'); bank.className='vocab-bank';
    (level.targets||[]).forEach(t=>{
      const tag = document.createElement('div'); tag.className='tag'; tag.draggable=true; tag.dataset.label=t.label;
      if(optIcons.checked){ const ico = document.createElement('span'); ico.className='ico'; ico.innerHTML = (ICONS[t.label]||''); tag.appendChild(ico); }
      const txt = document.createElement('span'); txt.textContent=t.label; tag.appendChild(txt);
      tag.addEventListener('dragstart', (e)=>{ e.dataTransfer.setData('text/plain', t.label); tag.classList.add('dragging'); showGuidesFor(labelToTarget(level,t.label)); });
      tag.addEventListener('dragend', ()=>{ tag.classList.remove('dragging'); clearGuides(); });
      bank.appendChild(tag);
    });
    els.bankSide.insertBefore(bank, els.checklist);

    // plan container
    const wrap = document.createElement('div'); wrap.className='plan-wrap';
    const inner = document.createElement('div'); inner.className='plan-inner'; wrap.appendChild(inner);
    const img = document.createElement('img'); img.src = level.plan_image; img.alt='Plan de chantier'; img.className='plan';
    inner.appendChild(img);

    // create drop zones (in percent) + placed layer
    const placedLayer = document.createElement('div'); placedLayer.style.position='absolute'; placedLayer.style.left='0'; placedLayer.style.top='0'; placedLayer.style.right='0'; placedLayer.style.bottom='0'; inner.appendChild(placedLayer);

    function percentToPx(xpct, ypct){
      const r = img.getBoundingClientRect();
      const x = r.width * (xpct/100), y = r.height * (ypct/100);
      return {x,y};
    }

    function labelToTarget(level,label){ return (level.targets||[]).find(tt=>tt.label===label); }

    function createDropZone(t){
      const dz = document.createElement('div'); dz.className='drop-zone';
      dz.dataset.label = t.label;
      inner.appendChild(dz);
      positionDZ(dz);
      return dz;
      function positionDZ(el){
        const r = img.getBoundingClientRect();
        const {x,y} = percentToPx(t.x_pct, t.y_pct);
        const size = Math.max(22, r.width*(t.tol_pct||3)/50);
        el.style.left = (x - size/2) + 'px';
        el.style.top  = (y - size/2) + 'px';
        el.style.width = el.style.height = size + 'px';
      }
    }

    const zones = (level.targets||[]).map(t => createDropZone(t));

    function clearGuides(){ zones.forEach(z=>z.classList.remove('guide')); }
    function showGuidesFor(t){ clearGuides(); const z = zones.find(z=>z.dataset.label===t.label); if(z) z.classList.add('guide'); }

    // handle zoom (scale inner)
    els.zoom.oninput = () => {
      const f = Number(els.zoom.value)/100;
      inner.style.transform = `scale(${f})`;
    };

    // droppable: drop anywhere over inner -> snap to nearest point if within tolerance (accepted anywhere, scoring checks tolerance)
    inner.addEventListener('dragover', (e)=>{ e.preventDefault(); e.dataTransfer.dropEffect='move'; });
    inner.addEventListener('drop', (e)=>{
      e.preventDefault();
      const label = e.dataTransfer.getData('text/plain');
      const tag = $(`.tag.dragging`) || Array.from(document.querySelectorAll('.tag')).find(t=>t.dataset.label===label);
      if(!tag) return;
      const rect = img.getBoundingClientRect();
      // mouse position relative to image
      const mx = (e.clientX - rect.left), my = (e.clientY - rect.top);
      // create or move placed tag
      let placed = placedLayer.querySelector(`.tag-placed[data-label="${label}"]`);
      const place = ()=>{
        const el = placed || document.createElement('div');
        el.className='tag tag-placed'; el.dataset.label=label;
        el.innerHTML = tag.innerHTML;
        el.style.left = mx + 'px'; el.style.top = my + 'px';
        if(!placed){ placedLayer.appendChild(el); }
      };
      place();
      btnValidate.disabled = false;
      clearGuides();
      updateChecklist(level);
    });

    function updateChecklist(level){
      els.checklist.classList.remove('hidden'); els.listItems.innerHTML='';
      (level.targets||[]).forEach(t=>{
        const li = document.createElement('li'); li.textContent=t.label;
        const placed = placedLayer.querySelector(`.tag-placed[data-label="${t.label}"]`);
        if(placed) li.classList.add('done');
        els.listItems.appendChild(li);
      });
    }

    els.hintBtn.onclick = ()=>{
      zones.forEach(z=>z.classList.add('guide'));
      showToast('Zones indicatives affichées');
      setTimeout(clearGuides, 2500);
    };

    els.area.appendChild(wrap);

    // keep zones positioned on resize
    new ResizeObserver(()=>{
      zones.forEach(z=>{
        const t = labelToTarget(level, z.dataset.label);
        const r = img.getBoundingClientRect();
        const {x,y} = percentToPx(t.x_pct, t.y_pct);
        const size = Math.max(22, r.width*(t.tol_pct||3)/50);
        z.style.left = (x - size/2) + 'px';
        z.style.top  = (y - size/2) + 'px';
        z.style.width = z.style.height = size + 'px';
      });
    }).observe(img);
    setRule(level);
    updateChecklist(level);
  }

  function validate(){
    const level = data.levels[ order[current] ];
    if(!level.plan_image){ next(); return; }
    const img = document.querySelector('img.plan');
    const rect = img.getBoundingClientRect();
    let correct=0, errors=0;

    (level.targets||[]).forEach(t=>{
      const el = document.querySelector(`.tag-placed[data-label="${t.label}"]`);
      if(!el){ errors++; return; }
      const x = parseFloat(el.style.left), y = parseFloat(el.style.top);
      const tx = rect.width * (t.x_pct/100), ty = rect.height * (t.y_pct/100);
      const tol = Math.max(20, rect.width*(t.tol_pct||3)/100);
      const d = Math.hypot(x - tx, y - ty);
      if(d <= tol){ correct++; el.classList.add('correct'); } else { errors++; el.classList.add('incorrect'); }
    });

    let gained = correct*1.0 + errors*(-0.25);
    if(gained < 0) gained = 0;
    score = clamp(score + gained, 0, 20);
    if(optEval.checked) els.explain.textContent = level.explain||'';
    current++; updateHUD(false);
    setTimeout(nextCard, 700);
  }

  function skip(){ current++; updateHUD(false); nextCard(); }
  function nextCard(){ if(current>=order.length){ endGame(); } else { nextCardCore(); } }
  function nextCardCore(){
    // for this prototype we only use vocab plan cards
    clearArea();
    const level = data.levels[ order[current] ];
    els.prompt.textContent = '📐 ' + (level.prompt||'');
    renderPlan(level);
  }

  function endGame(){
    clearInterval(timer);
    els.game.classList.add('hidden');
    els.end.classList.remove('hidden');
    els.final.textContent = `${player.name} (${player.clazz}) — Score final : ${score.toFixed(1)} / 20`;
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    btnStart?.addEventListener('click', async ()=>{ await loadData(); startGame(); });
    btnValidate?.addEventListener('click', validate);
    btnSkip?.addEventListener('click', skip);
    btnUndo?.addEventListener('click', ()=>{});
    btnRestart?.addEventListener('click', ()=>location.reload());
    btnCSV?.addEventListener('click', ()=>{});
    els.helpBtn?.addEventListener('click', ()=>els.helpDlg.showModal());
    els.helpClose?.addEventListener('click', ()=>els.helpDlg.close());
    window.addEventListener('keydown', (e)=>{
      if(els.start && !els.start.classList.contains('hidden') && e.key==='Enter'){ e.preventDefault(); btnStart?.click(); return; }
      if(els.game.classList.contains('hidden')) return;
      if(e.key==='Enter'){ e.preventDefault(); if(!btnValidate.disabled) validate(); }
      if(e.key.toLowerCase()==='s'){ e.preventDefault(); skip(); }
    });
  });
})();