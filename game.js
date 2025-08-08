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
    'Poste de commandement/chef de chantier': '<svg viewBox="0 0 24 24" class="ico"><path d="M6 3h2v18H6zM8 3h10l-3 3 3 3H8z"/></svg>',
    'Accès camions': '<svg viewBox="0 0 24 24" class="ico"><path d="M3 7h11v7h2l3 3v-3h2v6h-2a2 2 0 11-4 0H9a2 2 0 11-4 0H3V7z"/></svg>',
    'Poste de secours': '<svg viewBox="0 0 24 24" class="ico"><path d="M11 3h2v6h6v2h-6v6h-2v-6H5V9h6z"/></svg>',
    'Coffret électrique': '<svg viewBox="0 0 24 24" class="ico"><path d="M7 2h10v20H7zM12 3l-2 6h3l-1 6 4-8h-3l-1-4z"/></svg>',
    'Stockage matériaux': '<svg viewBox="0 0 24 24" class="ico"><path d="M3 7l9-4 9 4v10l-9 4-9-4V7zm9 2l7-3-7-3-7 3 7 3zm-7 2l7 3 7-3"/></svg>'
  };

  const RULE_TIPS = {
    "Zone de levage": "Zone dégagée, hors circulations piétons.",
    "Panneau EPI obligatoires": "Proche de l'entrée, visible avant l'accès au chantier.",
    "Zone déchets triés": "En périphérie, accessible aux bennes, hors flux.",
    "Poste de commandement/chef de chantier": "Près de l'entrée ou en position centrale visible.",
    "Accès camions": "Côté logistique, éviter le croisement avec piétons.",
    "Poste de secours": "Visible et rapidement accessible.",
    "Coffret électrique": "Hors zone humide/chocs, accessible pour raccordements.",
    "Stockage matériaux": "Zone plane dégagée, proche de la logistique."
  };

  const DATA = {
    settings: { duration_seconds: 180, cards_per_game: 1, hints_enabled: true, hint_penalty: 0.2, skip_penalty: 0.5 },
    levels: [{
      id: "PLAN1",
      type: "vocab",
      prompt: "Place 8 éléments d'organisation de chantier sur le plan.",
      plan_image: "plan.png",
      targets: [
        {"label":"Zone de levage","x_pct":27,"y_pct":22,"tol_pct":4},
        {"label":"Panneau EPI obligatoires","x_pct":6,"y_pct":36,"tol_pct":4},
        {"label":"Zone déchets triés","x_pct":90,"y_pct":85,"tol_pct":4},
        {"label":"Poste de commandement/chef de chantier","x_pct":55,"y_pct":8,"tol_pct":4},
        {"label":"Accès camions","x_pct":94,"y_pct":44,"tol_pct":5},
        {"label":"Poste de secours","x_pct":45,"y_pct":32,"tol_pct":4},
        {"label":"Coffret électrique","x_pct":66,"y_pct":32,"tol_pct":4},
        {"label":"Stockage matériaux","x_pct":78,"y_pct":72,"tol_pct":5}
      ],
      explain: "Repères : Entrée côté gauche ; logistique en bas/droite ; éviter les conflits de flux."
    }]
  };

  // --- State ---
  let order=[0], current=0, score=0, timeLeft=DATA.settings.duration_seconds, timer=null, results=[], history=[];
  let player={name:'',clazz:''};

  const $ = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const showToast=(t,ms=1800)=>{els.toast.textContent=t; els.toast.classList.remove('hidden'); setTimeout(()=>els.toast.classList.add('hidden'), ms);};

  function setRule(level){
    const lines = level.targets.map(t=>`• <b>${t.label}</b> — ${RULE_TIPS[t.label]||''}`);
    els.rule.innerHTML = lines.join('<br>');
    els.rule.classList.remove('hidden');
  }

  function startGame(){
    const name = document.getElementById('player-name').value.trim();
    const clazz = document.getElementById('player-class').value;
    if(!name){ alert('Veuillez saisir votre nom.'); return; }
    player={name,clazz};
    els.start.classList.add('hidden'); els.game.classList.remove('hidden');
    updateHUD(true);
    if(timer) clearInterval(timer);
    timer = setInterval(()=>{ timeLeft--; updateHUD(false); if(timeLeft<=0) endGame(); }, 1000);
    nextCard();
  }

  function updateHUD(reset){
    els.timer.textContent = `⏱ ${Math.floor(timeLeft/60)}:${String(timeLeft%60).padStart(2,'0')}`;
    els.score.textContent = `Score : ${score.toFixed(1)} / 20`;
    els.progress.textContent = `Carte ${Math.min(current+1,1)}/1`;
    els.progressFill.style.width = (reset?'0%':'100%');
  }

  function clearArea(){
    els.area.innerHTML='';
    els.bankSide.querySelectorAll(':scope > :not(.checklist)').forEach(n=>n.remove());
    els.explain.textContent=''; btnValidate.disabled=true; history=[]; btnUndo.disabled=true;
    els.listItems.innerHTML='';
  }

  function nextCard(){
    clearArea();
    const level = DATA.levels[0];
    els.prompt.textContent = '📐 ' + level.prompt;
    renderPlan(level);
  }

  function renderPlan(level){
    // bank
    const bank = document.createElement('div'); bank.className='vocab-bank';
    level.targets.forEach(t=>{
      const tag = document.createElement('div'); tag.className='tag'; tag.draggable=true; tag.dataset.label=t.label;
      if(optIcons.checked){ const ico = document.createElement('span'); ico.className='ico'; ico.innerHTML=(ICONS[t.label]||''); tag.appendChild(ico); }
      const tx = document.createElement('span'); tx.textContent=t.label; tag.appendChild(tx);
      tag.addEventListener('dragstart', (e)=>{ e.dataTransfer.setData('text/plain', t.label); tag.classList.add('dragging'); highlightOne(t.label); });
      tag.addEventListener('dragend', ()=>{ tag.classList.remove('dragging'); clearGuides(); });
      bank.appendChild(tag);
    });
    els.bankSide.insertBefore(bank, els.checklist);

    // plan
    const wrap = document.createElement('div'); wrap.className='plan-wrap';
    const inner = document.createElement('div'); inner.className='plan-inner'; wrap.appendChild(inner);
    const img = document.createElement('img'); img.src = level.plan_image; img.alt='Plan de chantier'; img.className='plan';
    inner.appendChild(img);
    const placedLayer = document.createElement('div'); Object.assign(placedLayer.style,{position:'absolute',left:'0',top:'0',right:'0',bottom:'0'}); inner.appendChild(placedLayer);

    function percentToPx(xpct, ypct){
      const r = img.getBoundingClientRect();
      return { x: r.width * (xpct/100), y: r.height * (ypct/100) };
    }

    // zones guides
    const zones = level.targets.map(t=>{
      const z = document.createElement('div'); z.className='drop-zone'; z.dataset.label=t.label; inner.appendChild(z);
      positionZone(z, t); return z;
    });

    function positionZone(el, t){
      const r = img.getBoundingClientRect();
      const {x,y} = percentToPx(t.x_pct, t.y_pct);
      const size = Math.max(24, r.width*(t.tol_pct||3)/50);
      el.style.left=(x-size/2)+'px'; el.style.top=(y-size/2)+'px'; el.style.width=el.style.height=size+'px';
    }

    function clearGuides(){ zones.forEach(z=>z.classList.remove('guide')); }
    function highlightOne(label){ clearGuides(); const z=zones.find(z=>z.dataset.label===label); if(z) z.classList.add('guide'); }
    function highlightAll(){ zones.forEach(z=>z.classList.add('guide')); setTimeout(clearGuides, 2500); }

    // zoom
    els.zoom.oninput = ()=>{ const f=Number(els.zoom.value)/100; inner.style.transform=`scale(${f})`; };

    // drop
    inner.addEventListener('dragover', e=>{ e.preventDefault(); e.dataTransfer.dropEffect='move'; });
    inner.addEventListener('drop', e=>{
      e.preventDefault();
      const label = e.dataTransfer.getData('text/plain');
      const tag = document.querySelector('.tag.dragging') || Array.from(document.querySelectorAll('.tag')).find(t=>t.dataset.label===label);
      if(!tag) return;
      const rect = img.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      let placed = placedLayer.querySelector(`.tag-placed[data-label="${label}"]`);
      if(!placed){
        placed = document.createElement('div'); placed.className='tag tag-placed'; placed.dataset.label=label; placed.innerHTML = tag.innerHTML; placedLayer.appendChild(placed);
      }
      placed.style.left = mx+'px'; placed.style.top = my+'px';
      btnValidate.disabled = false;
      refreshChecklist(level);
      clearGuides();
    });

    function refreshChecklist(level){
      els.listItems.innerHTML = '';
      level.targets.forEach(t=>{
        const li = document.createElement('li'); li.textContent=t.label;
        const placed = placedLayer.querySelector(`.tag-placed[data-label="${t.label}"]`);
        if(placed) li.classList.add('done');
        els.listItems.appendChild(li);
      });
    }

    new ResizeObserver(()=>{
      zones.forEach(z=>{
        const t = level.targets.find(tt=>tt.label===z.dataset.label);
        positionZone(z, t);
      });
    }).observe(img);

    setRule(level);
    refreshChecklist(level);

    els.hintBtn.onclick = ()=>{ highlightAll(); showToast('Zones indicatives affichées'); };
  }

  function validate(){
    const level = DATA.levels[0];
    const img = document.querySelector('img.plan');
    const rect = img.getBoundingClientRect();
    let correct=0, errors=0;

    level.targets.forEach(t=>{
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
    updateHUD(false);
    endGame();
  }

  function endGame(){
    clearInterval(timer);
    els.game.classList.add('hidden'); els.end.classList.remove('hidden');
    els.final.textContent = `${document.getElementById('player-name').value} (${document.getElementById('player-class').value}) — Score final : ${score.toFixed(1)} / 20`;
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    btnStart?.addEventListener('click', startGame);
    btnValidate?.addEventListener('click', validate);
    btnSkip?.addEventListener('click', ()=>endGame());
    btnUndo?.addEventListener('click', ()=>{});
    btnRestart?.addEventListener('click', ()=>location.reload());
    btnCSV?.addEventListener('click', ()=>{});
    els.helpBtn?.addEventListener('click', ()=>els.helpDlg.showModal());
    els.helpClose?.addEventListener('click', ()=>els.helpDlg.close());
    window.addEventListener('keydown', (e)=>{
      if(els.start && !els.start.classList.contains('hidden') && e.key==='Enter'){ e.preventDefault(); btnStart?.click(); return; }
      if(els.game.classList.contains('hidden')) return;
      if(e.key==='Enter'){ e.preventDefault(); if(!btnValidate.disabled) validate(); }
      if(e.key.toLowerCase()==='s'){ e.preventDefault(); endGame(); }
    });
  });
})();