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
    final: document.getElementById('final-score'),
    sessionDetails: document.getElementById('session-details'),
    lb: document.getElementById('leaderboard'),
    lbClass: document.getElementById('lb-class'),
    lbBody: document.getElementById('lb-body'),
    helpBtn: document.getElementById('help-btn'),
    helpDlg: document.getElementById('help-dialog'),
    helpClose: document.getElementById('help-close'),
    zoom: document.getElementById('zoom-range'),
    toast: document.getElementById('toast'),
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
    'Zone grue': '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M3 20h18v2H3zM5 20V8h4l3-3 3 3h4v12h-2V10h-3v10h-2V10h-3v10H7V10H5v10z"></path></svg>',
    'Stockage matériaux': '<svg viewBox="0 0 24 24" class="ico"><path d="M3 7l9-4 9 4v10l-9 4-9-4V7zm9 2l7-3-7-3-7 3 7 3zm-7 2l7 3 7-3"/></svg>',
    'Circulation piétons': '<svg viewBox="0 0 24 24" class="ico"><path d="M13 5a2 2 0 11-4 0 2 2 0 014 0zM7 22l2-6 2 2 2-6 3 2 1 6h-2l-1-4-2-1-2 5H7z"/></svg>',
    'Base vie': '<svg viewBox="0 0 24 24" class="ico"><path d="M12 3l9 8h-3v9H6v-9H3l9-8z"/></svg>',
    'Accès camions': '<svg viewBox="0 0 24 24" class="ico"><path d="M3 7h11v7h2l3 3v-3h2v6h-2a2 2 0 11-4 0H9a2 2 0 11-4 0H3V7z"/></svg>',
    'Poste de secours': '<svg viewBox="0 0 24 24" class="ico"><path d="M11 3h2v6h6v2h-6v6h-2v-6H5V9h6z"/></svg>',
    'Coffret électrique': '<svg viewBox="0 0 24 24" class="ico"><path d="M7 2h10v20H7zM12 3l-2 6h3l-1 6 4-8h-3l-1-4z"/></svg>',
    'Benne à déchets': '<svg viewBox="0 0 24 24" class="ico"><path d="M3 6h18l-2 12H5L3 6zm5-2h8v2H8z"/></svg>',
    'Zone de levage': '<svg viewBox="0 0 24 24" class="ico"><path d="M12 2l4 8h-3v12h-2V10H8l4-8z"/></svg>',
    'Panneau EPI obligatoires': '<svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="12" r="9"/><path d="M9 17h6l-1-3H10l-1 3zM12 5a3 3 0 00-3 3v2h6V8a3 3 0 00-3-3z"/></svg>',
    'Zone déchets triés': '<svg viewBox="0 0 24 24" class="ico"><path d="M12 2l2 4h4l-2 4 2 4h-4l-2 4-2-4H6l2-4-2-4h4l2-4z"/></svg>',
    'Poste de commandement/chef de chantier': '<svg viewBox="0 0 24 24" class="ico"><path d="M6 3h2v18H6zM8 3h10l-3 3 3 3H8z"/></svg>'
  };

  // Données par défaut (fallback local).
  const DEFAULT_DATA = {
    "levels": [
      {"id":"L1","type":"phasage_mop","prompt":"Replace les phases de la loi MOP (maîtrise d'œuvre) dans l'ordre.","slots":["ESQ","APS","APD","PRO","ACT","VISA","DET","AOR"],"distractors":["DOE","DIUO","OPC"],"explain":"Loi MOP (mission de base) : ESQ → APS → APD → PRO → ACT → VISA → DET → AOR."},
      {"id":"L2","type":"phasage_chantier","prompt":"Replace les grandes étapes d'un chantier dans l'ordre.","slots":["Installation de chantier","Terrassement","Fondations","Élévation (gros œuvre)","Charpente/Toiture","Second œuvre","Finitions","Réception"],"distractors":["Études d'exécution","DOE"],"explain":"Du démarrage à la réception : installation → terrassement → fondations → gros œuvre → clos-couvert → second œuvre → finitions → réception."},
      {"id":"L3","type":"metiers","prompt":"Associe chaque tâche de gros œuvre au bon métier.","pairs":[{"tache":"Ferraillage des semelles","metier":"Ferrailleur"},{"tache":"Pose des banches","metier":"Coffreur-bancheur"},{"tache":"Conduite de la grue","metier":"Grutier"},{"tache":"Coulage de dalle","metier":"Maçon"}],"distractors":["Électricien","Plombier-chauffagiste","Couvreur"],"explain":"Ferrailleur (armatures), coffreur (coffrages/banches), grutier (levage), maçon (béton/dalles)."},
      {"id":"L4","type":"metiers","prompt":"Associe chaque tâche de second œuvre au bon métier.","pairs":[{"tache":"Tirage de câbles CFO/CFA","metier":"Électricien"},{"tache":"Pose des réseaux EU/EV","metier":"Plombier-chauffagiste"},{"tache":"Montage de cloisons","metier":"Plaquiste"},{"tache":"Étanchéité des toitures-terrasses","metier":"Étancheur"}],"distractors":["Menuisier","Peintre"],"explain":"Électricien (alims/communication), plombier (sanitaire), plaquiste (cloisons/DTU), étancheur (membranes/complexes)."},
      {"id":"L5","type":"vocab","prompt":"Place les étiquettes aux bons emplacements sur le plan (grille 10×6).","plan":"grille-10x6","targets":[{"label":"Zone grue","x":2,"y":1,"tolerance":1},{"label":"Stockage matériaux","x":7,"y":4,"tolerance":1},{"label":"Circulation piétons","x":1,"y":5,"tolerance":1},{"label":"Base vie","x":8,"y":1,"tolerance":1}],"distractors":["Benne à gravats","Local déchets dangereux","Zone EPI"],"explain":"La grue se place dégagée, stockage en zone plane, circulations protégées, base vie à l'écart des flux."},
      {"id":"L6","type":"vocab","prompt":"Place les éléments de signalisation et de sécurité.","plan":"grille-10x6","targets":[{"label":"Accès camions","x":9,"y":3,"tolerance":1},{"label":"Poste de secours","x":4,"y":2,"tolerance":1},{"label":"Coffret électrique","x":6,"y":2,"tolerance":1},{"label":"Benne à déchets","x":3,"y":5,"tolerance":1}],"distractors":["Zone soudure","Aire de lavage roues"],"explain":"Accès PL distincts, secours visible/accessible, coffret hors zone humide, déchets regroupés et balisés."},
      {"id":"L7","type":"phasage_second_oeuvre","prompt":"Ordonne un enchaînement type du second œuvre (logique générale).","slots":["Cloisons/Calepinage","Réseaux (CFO/CFA/Plomberie)","Menuiseries intérieures","Revêtements sols/murs","Peinture/Finitions"],"distractors":["Charpente","Fondations"],"explain":"On ferme/structure, on passe les réseaux, on pose menuiseries, puis revêtements et finitions."},
      {"id":"L8","type":"metiers","prompt":"Associe travaux d'enveloppe et d'aménagement au métier.","pairs":[{"tache":"Charpente bois traditionnelle","metier":"Charpentier"},{"tache":"Couverture tuiles","metier":"Couvreur"},{"tache":"Pose menuiseries extérieures","metier":"Menuisier"},{"tache":"Ragréage et sols souples","metier":"Solier-moquettiste"}],"distractors":["Ferrailleur","Plaquiste"],"explain":"Charpentier (structure), couvreur (étanchéité/tuile), menuisier (ouvrants), solier (supports/revêtements)."},
      {"id":"L9","type":"vocab","prompt":"Place ces éléments d'organisation de chantier.","plan":"grille-10x6","targets":[{"label":"Zone de levage","x":3,"y":1,"tolerance":1},{"label":"Panneau EPI obligatoires","x":0,"y":3,"tolerance":1},{"label":"Zone déchets triés","x":8,"y":5,"tolerance":1},{"label":"Poste de commandement/chef de chantier","x":5,"y":0,"tolerance":1}],"distractors":["Zone fumeurs","Aire pique-nique"],"explain":"Levage dégagé, EPI à l'entrée, tri en zone dédiée, point de commandement visible."},
      {"id":"L10","type":"metiers","prompt":"Associe ces rôles/contrôles aux bons acteurs.","pairs":[{"tache":"Coordination SPS","metier":"Coordinateur SPS"},{"tache":"OPC (ordonnancement, pilotage, coordination)","metier":"OPC"},{"tache":"Implantation et topographie","metier":"Géomètre-topographe"},{"tache":"Contrôle de conformité du béton","metier":"Laboratoire (béton)"}],"distractors":["Chef de chantier","Conducteur de travaux"],"explain":"SPS (sécurité), OPC (planning/coordination), géomètre (implantations), labo (essais/contrôles)."}
    ],
    "settings":{"duration_seconds":180,"hints_enabled":false,"hint_penalty":0,"skip_penalty":0.5,"cards_per_game":10,"classes":["2EMNB","1AA"],"score":{"points_per_correct":1.0,"points_per_error":-0.25,"time_bonus_cap":2.0,"time_bonus_threshold":0.5,"time_bonus_per_card":0.2,"min_card_score":0}}
  };

  // État courant
  let data = null;           // dataset (levels + settings)
  let workingLevels = [];    // niveaux filtrés selon le type choisi
  let order = [];
  let current = 0;
  let score = 0;
  let player = { name: '', clazz: '' };
  let timeLeft = 180;
  let timer = null;
  let results = [];
  let cardStartTime = 0;
  let history = [];

  // Utilitaires
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
  const shuffle = (a) => { for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const pushHistory = (fnUndo) => { history.push(fnUndo); btnUndo.disabled = history.length===0; };
  const showToast = (txt, ms=2000) => { els.toast.textContent = txt; els.toast.classList.remove('hidden'); setTimeout(()=> els.toast.classList.add('hidden'), ms); };

  // Chargement avec fallback garanti
  async function loadData(){
    try{
      const res = await fetch('data.json', {cache:'no-store'});
      if(!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      if(!json || !json.levels) throw new Error('Schéma invalide');
      data = json;
    }catch(e){
      console.warn('data.json indisponible -> fallback local', e);
      data = DEFAULT_DATA;
      showToast('Mode hors-ligne activé (données intégrées)');
    }
  }

  function startGame(){
    const name = $('#player-name').value.trim();
    const clazz = $('#player-class').value;
    if(!name){ alert('Veuillez entrer votre nom.'); return; }
    player = { name, clazz };

    // filtre par type
    const selectedType = $('#exercise-type').value;
    const filterMap = {
      phasage: ['phasage_mop','phasage_chantier','phasage_second_oeuvre'],
      metiers: ['metiers'],
      vocab: ['vocab']
    };
    const keep = (selectedType==='all') ? null : new Set(filterMap[selectedType] || []);
    workingLevels = keep ? data.levels.filter(l => keep.has(l.type)) : data.levels.slice();
    if(workingLevels.length === 0) workingLevels = data.levels.slice();

    // ordre et timers
    const total = Math.min(workingLevels.length, data.settings.cards_per_game);
    order = shuffle(Array.from({length: total}, (_,i)=>i));
    score = 0; current = 0; results = []; history = [];
    timeLeft = data.settings.duration_seconds;

    els.start.classList.add('hidden');
    els.game.classList.remove('hidden');

    updateHUD(true);
    if(timer) clearInterval(timer);
    timer = setInterval(()=>{ timeLeft--; updateHUD(false); if(timeLeft<=0) endGame(); },1000);
    nextCard();
  }

  function updateHUD(resetBar){
    els.timer.textContent = `⏱ ${Math.floor(timeLeft/60)}:${String(timeLeft%60).padStart(2,'0')}`;
    els.score.textContent = `Score : ${score.toFixed(1)} / 20`;
    const total = order.length || (data ? data.settings.cards_per_game : 10);
    els.progress.textContent = `Carte ${Math.min(current+1, total)}/${total}`;
    const pct = Math.min(100, Math.round((current / Math.max(1,total)) * 100));
    els.progressFill.style.width = (resetBar ? '0%' : pct + '%');
  }

  function clearArea(){ els.area.innerHTML=''; els.bankSide.innerHTML=''; if(!optEval.checked) els.explain.textContent=''; btnValidate.disabled = true; history = []; btnUndo.disabled = true; }

  // ---- RENDUS ----
  function renderPhasage(level){
    const bank = document.createElement('div'); bank.className='phasage-bank';
    const slots = document.createElement('div'); slots.className='phasage-slots';

    const items = [...level.slots]; shuffle(items);
    items.forEach(txt => bank.appendChild(makeBadge(txt, 'phasage')));
    level.slots.forEach((_, idx) => slots.appendChild(makeSlot(idx)));

    els.bankSide.appendChild(bank);
    els.area.appendChild(slots);
  }

  function makeBadge(text, kind){
    const chip = document.createElement('div');
    chip.className = 'badge';
    chip.textContent = text;
    chip.draggable = true;
    chip.dataset.kind = kind;
    chip.addEventListener('dragstart', onDragStart);
    chip.addEventListener('dragend', onDragEnd);
    return chip;
  }

  function makeSlot(idx){
    const s = document.createElement('div');
    s.className = 'slot';
    s.dataset.index = idx;
    s.addEventListener('dragover', onDragOver);
    s.addEventListener('drop', (e)=>{
      e.preventDefault();
      const txt = e.dataTransfer.getData('text/plain');
      const chip = findDragged(txt);
      if(!chip) return;
      if(s.firstChild){
        const prev = s.firstChild;
        const parent = chip.parentElement;
        s.replaceChild(chip, prev);
        parent && parent.appendChild(prev);
        pushHistory(()=>{ parent && parent.appendChild(chip); s.replaceChild(prev, s.firstChild); });
      } else {
        const parent = chip.parentElement;
        s.appendChild(chip); s.classList.add('filled');
        pushHistory(()=>{ parent && parent.appendChild(chip); s.classList.remove('filled'); });
      }
      btnValidate.disabled = false;
    });
    return s;
  }

  function onDragStart(e){ e.dataTransfer.setData('text/plain', e.target.textContent); e.dataTransfer.effectAllowed='move'; e.target.classList.add('dragging'); }
  function onDragOver(e){ e.preventDefault(); e.dataTransfer.dropEffect='move'; }
  function onDragEnd(e){ e.target.classList.remove('dragging'); }
  function findDragged(txt){ return $$('.badge').find(c=>c.textContent===txt && c.classList.contains('dragging')) || $$('.badge').find(c=>c.textContent===txt); }

  function renderMetiers(level){
    const list = document.createElement('div'); list.className='metiers-list';
    const bank = document.createElement('div'); bank.className='metiers-bank';

    const metiers = Array.from(new Set([ ...level.pairs.map(p=>p.metier), ...(level.distractors||[]) ]));
    shuffle(metiers).forEach(m => bank.appendChild(makeBadge(m,'metier')));

    level.pairs.forEach((p,i)=>{
      const row = document.createElement('div'); row.className='metiers-row';
      const t = document.createElement('div'); t.textContent = p.tache; t.className='badge'; t.style.cursor='default';
      const target = document.createElement('div'); target.className='metier-target'; target.dataset.answer = p.metier; target.dataset.index=i;
      target.addEventListener('dragover', onDragOver);
      target.addEventListener('drop', (e)=>{
        e.preventDefault();
        const txt = e.dataTransfer.getData('text/plain');
        const chip = findDragged(txt);
        if(!chip) return;
        if(target.firstChild){
          const prev = target.firstChild;
          const parent = chip.parentElement;
          target.replaceChild(chip, prev);
          parent && parent.appendChild(prev);
          pushHistory(()=>{ parent && parent.appendChild(chip); target.replaceChild(prev, target.firstChild); });
        } else {
          const parent = chip.parentElement;
          target.appendChild(chip); target.classList.add('filled');
          pushHistory(()=>{ parent && parent.appendChild(chip); target.classList.remove('filled'); });
        }
        btnValidate.disabled = false;
      });
      row.appendChild(t); row.appendChild(target); list.appendChild(row);
    });

    els.bankSide.appendChild(bank);
    els.area.appendChild(list);
  }

  function renderVocab(level){
    const bank = document.createElement('div'); bank.className='vocab-bank';
    (level.targets||[]).forEach(t=>{
      const tag = document.createElement('div'); tag.className='tag'; tag.draggable=true; tag.dataset.type='vocab';
      if(optIcons.checked){
        const lbl = document.createElement('span'); lbl.textContent = t.label; lbl.className='sr-only';
        tag.innerHTML = (ICONS[t.label] || '') + tag.innerHTML;
        tag.appendChild(lbl);
      } else {
        tag.textContent = t.label;
      }
      tag.addEventListener('dragstart', onDragStart);
      tag.addEventListener('dragend', onDragEnd);
      bank.appendChild(tag);
    });

    const grid = document.createElement('div'); grid.className='grid';
    const cols = 10, rows = 6; grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    for(let y=0;y<rows;y++){
      for(let x=0;x<cols;x++){
        const cell = document.createElement('div'); cell.className='grid-cell'; cell.dataset.x=x; cell.dataset.y=y;
        cell.addEventListener('dragover', e=>{ e.preventDefault(); cell.classList.add('hover'); });
        cell.addEventListener('dragleave', ()=> cell.classList.remove('hover'));
        cell.addEventListener('drop', e=>{ e.preventDefault(); cell.classList.remove('hover');
          const txt=e.dataTransfer.getData('text/plain'); const tag=findTag(txt);
          if(!tag) return;
          const existing = $$('.tag', cell)[0];
          const parent = tag.parentElement;
          if(existing){ parent && parent.appendChild(existing); }
          cell.appendChild(tag);
          btnValidate.disabled = false;
          pushHistory(()=>{ parent && parent.appendChild(tag); });
        });
        grid.appendChild(cell);
      }
    }

    els.bankSide.appendChild(bank);
    els.area.appendChild(grid);

    // Zoom
    els.zoom.oninput = () => { const f = Number(els.zoom.value)/100; grid.style.transform = `scale(${f})`; grid.style.transformOrigin = 'top left'; };
  }

  function findTag(txt){
    return $$('.tag').find(t => (t.textContent.trim()===txt || t.innerText.trim()===txt) && t.classList.contains('dragging')) || $$('.tag').find(t => (t.textContent.trim()===txt || t.innerText.trim()===txt));
  }

  // ---- BOUCLE DE JEU ----
  function nextCard(){
    if(current >= order.length){ endGame(); return; }
    clearArea();
    const level = workingLevels[ order[current] ];
    const typeIcon = (level.type.startsWith('phasage') ? '🏗️ ' : (level.type==='metiers' ? '👷 ' : '📐 '));
    els.prompt.textContent = typeIcon + level.prompt;

    if(level.type.startsWith('phasage')) renderPhasage(level);
    else if(level.type === 'metiers') renderMetiers(level);
    else if(level.type === 'vocab') renderVocab(level);

    cardStartTime = Date.now();
    updateHUD(false);
  }

  function validate(){
    const level = workingLevels[ order[current] ];
    let correct = 0, errors = 0;

    if(level.type.startsWith('phasage')){
      const placed = $$('.slot').map(s=> s.firstChild ? s.firstChild.textContent : null);
      level.slots.forEach((expected, idx)=>{
        const ok = placed[idx] === expected;
        if(ok){ correct++; } else { errors++; }
        const slot = $(`.slot:nth-child(${idx+1})`);
        slot && slot.classList.add(ok ? 'correct' : 'incorrect');
      });
    }
    else if(level.type === 'metiers'){
      const rows = $$('.metiers-row');
      rows.forEach((row)=>{
        const target = $('.metier-target', row);
        const got = target.firstChild ? target.firstChild.textContent : null;
        const expected = target.dataset.answer;
        const ok = got === expected;
        if(ok){ correct++; } else { errors++; }
        target.classList.add(ok ? 'correct' : 'incorrect');
      });
    }
    else if(level.type === 'vocab'){
      const tags = $$('.tag');
      tags.forEach(tag=>{
        const cell = tag.parentElement;
        const label = tag.querySelector('span') ? tag.querySelector('span').textContent : tag.textContent.trim();
        const t = (level.targets||[]).find(t=>t.label===label);
        if(!t){ errors++; return; }
        if(cell && cell.classList.contains('grid-cell')){
          const x = Number(cell.dataset.x), y = Number(cell.dataset.y);
          const dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
          const ok = (dx <= (t.tolerance||0)) && (dy <= (t.tolerance||0));
          if(ok){ correct++; cell.classList.add('correct'); } else { errors++; cell.classList.add('incorrect'); }
        } else { errors++; }
      });
    }

    const s = data.settings.score;
    let gained = (correct * s.points_per_correct) + (errors * s.points_per_error);
    if(gained < s.min_card_score) gained = s.min_card_score;

    const elapsed = (Date.now() - cardStartTime) / 1000;
    const meanPerCard = data.settings.duration_seconds / Math.max(1, order.length);
    if((meanPerCard - elapsed) / meanPerCard > s.time_bonus_threshold){
      gained += s.time_bonus_per_card;
    }

    score = clamp(score + gained, 0, 20);

    if(optEval.checked){ els.explain.textContent = (level.explain || ''); }

    results.push({ date: new Date().toLocaleString(), nom: player.name, classe: player.clazz, carte_id: level.id, type: level.type, corrects: correct, erreurs: errors, points_gagnes: Number(gained.toFixed(2)), score_cumule: Number(score.toFixed(2)) });

    current++;
    setTimeout(nextCard, 700);
    updateHUD(false);
  }

  function undo(){
    const fn = history.pop();
    if(fn){ fn(); }
    btnUndo.disabled = history.length===0;
  }

  function skip(){
    const pen = data.settings.skip_penalty || 0;
    score = clamp(score - pen, 0, 20);

    const level = workingLevels[ order[current] ];
    results.push({ date: new Date().toLocaleString(), nom: player.name, classe: player.clazz, carte_id: level.id, type: level.type, corrects: 0, erreurs: 0, points_gagnes: -pen, score_cumule: Number(score.toFixed(2)), action: 'skip' });

    current++; updateHUD(false); nextCard();
  }

  function endGame(){
    if(timer) clearInterval(timer);
    els.game.classList.add('hidden');
    els.end.classList.remove('hidden');
    els.final.textContent = `${player.name} (${player.clazz}) – Score final : ${score.toFixed(1)} / 20`;

    els.sessionDetails.textContent = JSON.stringify(results, null, 2);

    downloadCSV();
    if(optLeader.checked) renderLeaderboard();
  }

  function toCSV(rows){
    const headers = ['date','nom','classe','carte_id','type','corrects','erreurs','points_gagnes','score_cumule','action'];
    const lines = [headers.join(',')];
    rows.forEach(r=>{
      const row = headers.map(h => (r[h]!==undefined? String(r[h]).replaceAll('"','""') : ''));
      lines.push(row.join(','));
    });
    return lines.join('\n');
  }

  function downloadCSV(){
    const csv = toCSV(results);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'resultats_tebaa.csv'; a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  }

  function saveScore(){
    try{
      const key = 'tebaa_scores';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.push({ name: player.name, clazz: player.clazz, score: Number(score.toFixed(2)), date: new Date().toLocaleString() });
      localStorage.setItem(key, JSON.stringify(list));
    }catch(e){ /* stockage désactivé */ }
  }

  function renderLeaderboard(){
    saveScore();
    try{
      const key = 'tebaa_scores';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = list.filter(x => x.clazz === player.clazz).sort((a,b)=> b.score - a.score).slice(0,10);
      els.lbClass.textContent = player.clazz;
      els.lbBody.innerHTML = '';
      filtered.forEach((r,i)=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i+1}</td><td>${r.name}</td><td>${r.score.toFixed(1)}</td><td>${r.date}</td>`;
        els.lbBody.appendChild(tr);
      });
      els.lb.classList.remove('hidden');
    }catch(e){ /* rien */ }
  }

  // Écoutes (sécurisées)
  document.addEventListener('DOMContentLoaded', () => {
    btnStart?.addEventListener('click', async () => { await loadData(); startGame(); });
    btnValidate?.addEventListener('click', validate);
    btnSkip?.addEventListener('click', skip);
    btnUndo?.addEventListener('click', undo);
    btnRestart?.addEventListener('click', ()=>location.reload());
    btnCSV?.addEventListener('click', downloadCSV);
    els.helpBtn?.addEventListener('click', ()=> els.helpDlg.showModal());
    els.helpClose?.addEventListener('click', ()=> els.helpDlg.close());

    // Raccourcis clavier
    window.addEventListener('keydown', (e)=>{
      if(els.start && !els.start.classList.contains('hidden') && e.key==='Enter'){ e.preventDefault(); btnStart?.click(); return; }
      if(els.game.classList.contains('hidden')) return;
      if(e.key==='Enter'){ e.preventDefault(); if(!btnValidate.disabled) validate(); }
      if(e.key.toLowerCase()==='s'){ e.preventDefault(); skip(); }
      if(e.ctrlKey && e.key.toLowerCase()==='z'){ e.preventDefault(); if(!btnUndo.disabled) undo(); }
    });
  });
})();