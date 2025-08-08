(() => {
  const els = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    end: document.getElementById('end-screen'),
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    progress: document.getElementById('progress'),
    prompt: document.getElementById('prompt'),
    area: document.getElementById('game-area'),
    explain: document.getElementById('explain'),
    final: document.getElementById('final-score'),
    sessionDetails: document.getElementById('session-details'),
    lb: document.getElementById('leaderboard'),
    lbClass: document.getElementById('lb-class'),
    lbBody: document.getElementById('lb-body')
  };

  const btnStart = document.getElementById('start-btn');
  const btnValidate = document.getElementById('validate-btn');
  const btnSkip = document.getElementById('skip-btn');
  const btnRestart = document.getElementById('restart-btn');
  const btnCSV = document.getElementById('download-csv');

  const optEval = document.getElementById('opt-eval');
  const optIcons = document.getElementById('opt-icons');
  const optLeader = document.getElementById('opt-leader');

  // Fallback hors-ligne
  const DEFAULT_DATA = {
    "levels": [
      {
        "id": "L1",
        "type": "phasage_mop",
        "prompt": "Replace les phases de la loi MOP (maîtrise d'œuvre) dans l'ordre.",
        "slots": ["ESQ", "APS", "APD", "PRO", "ACT", "VISA", "DET", "AOR"],
        "distractors": ["DOE", "DIUO", "OPC"],
        "explain": "Loi MOP (mission de base) : ESQ → APS → APD → PRO → ACT → VISA → DET → AOR."
      },
      {
        "id": "L2",
        "type": "phasage_chantier",
        "prompt": "Replace les grandes étapes d'un chantier dans l'ordre.",
        "slots": ["Installation de chantier", "Terrassement", "Fondations", "Élévation (gros œuvre)", "Charpente/Toiture", "Second œuvre", "Finitions", "Réception"],
        "distractors": ["Études d'exécution", "DOE"],
        "explain": "Du démarrage à la réception : installation → terrassement → fondations → gros œuvre → clos-couvert → second œuvre → finitions → réception."
      },
      {
        "id": "L3",
        "type": "metiers",
        "prompt": "Associe chaque tâche de gros œuvre au bon métier.",
        "pairs": [
          {"tache": "Ferraillage des semelles", "metier": "Ferrailleur"},
          {"tache": "Pose des banches", "metier": "Coffreur-bancheur"},
          {"tache": "Conduite de la grue", "metier": "Grutier"},
          {"tache": "Coulage de dalle", "metier": "Maçon"}
        ],
        "distractors": ["Électricien", "Plombier-chauffagiste", "Couvreur"],
        "explain": "Ferrailleur (armatures), coffreur (coffrages/banches), grutier (levage), maçon (béton/dalles)."
      },
      {
        "id": "L4",
        "type": "metiers",
        "prompt": "Associe chaque tâche de second œuvre au bon métier.",
        "pairs": [
          {"tache": "Tirage de câbles CFO/CFA", "metier": "Électricien"},
          {"tache": "Pose des réseaux EU/EV", "metier": "Plombier-chauffagiste"},
          {"tache": "Montage de cloisons", "metier": "Plaquiste"},
          {"tache": "Étanchéité des toitures-terrasses", "metier": "Étancheur"}
        ],
        "distractors": ["Menuisier", "Peintre"],
        "explain": "Électricien (alims/communication), plombier (sanitaire), plaquiste (cloisons/DTU), étancheur (membranes/complexes)."
      },
      {
        "id": "L5",
        "type": "vocab",
        "prompt": "Place les étiquettes aux bons emplacements sur le plan (grille 10×6).",
        "plan": "grille-10x6",
        "targets": [
          {"label": "Zone grue", "x": 2, "y": 1, "tolerance": 1},
          {"label": "Stockage matériaux", "x": 7, "y": 4, "tolerance": 1},
          {"label": "Circulation piétons", "x": 1, "y": 5, "tolerance": 1},
          {"label": "Base vie", "x": 8, "y": 1, "tolerance": 1}
        ],
        "distractors": ["Benne à gravats", "Local déchets dangereux", "Zone EPI"],
        "explain": "La grue se place dégagée, stockage en zone plane, circulations protégées, base vie à l'écart des flux."
      },
      {
        "id": "L6",
        "type": "vocab",
        "prompt": "Place les éléments de signalisation et de sécurité.",
        "plan": "grille 10×6",
        "targets": [
          {"label": "Accès camions", "x": 9, "y": 3, "tolerance": 1},
          {"label": "Poste de secours", "x": 4, "y": 2, "tolerance": 1},
          {"label": "Coffret électrique", "x": 6, "y": 2, "tolerance": 1},
          {"label": "Benne à déchets", "x": 3, "y": 5, "tolerance": 1}
        ],
        "distractors": ["Zone soudure", "Aire de lavage roues"],
        "explain": "Accès PL distincts, secours visible/accessible, coffret hors zone humide, déchets regroupés et balisés."
      },
      {
        "id": "L7",
        "type": "phasage_second_oeuvre",
        "prompt": "Ordonne un enchaînement type du second œuvre (logique générale).",
        "slots": ["Cloisons/Calepinage", "Réseaux (CFO/CFA/Plomberie)", "Menuiseries intérieures", "Revêtements sols/murs", "Peinture/Finitions"],
        "distractors": ["Charpente", "Fondations"],
        "explain": "On ferme/structure, on passe les réseaux, on pose menuiseries, puis revêtements et finitions."
      },
      {
        "id": "L8",
        "type": "metiers",
        "prompt": "Associe travaux d'enveloppe et d'aménagement au métier.",
        "pairs": [
          {"tache": "Charpente bois traditionnelle", "metier": "Charpentier"},
          {"tache": "Couverture tuiles", "metier": "Couvreur"},
          {"tache": "Pose menuiseries extérieures", "metier": "Menuisier"},
          {"tache": "Ragréage et sols souples", "metier": "Solier-moquettiste"}
        ],
        "distractors": ["Ferrailleur", "Plaquiste"],
        "explain": "Charpentier (structure), couvreur (étanchéité/tuile), menuisier (ouvrants), solier (supports/revêtements)."
      },
      {
        "id": "L9",
        "type": "vocab",
        "prompt": "Place ces éléments d'organisation de chantier.",
        "plan": "grille 10×6",
        "targets": [
          {"label": "Zone de levage", "x": 3, "y": 1, "tolerance": 1},
          {"label": "Panneau EPI obligatoires", "x": 0, "y": 3, "tolerance": 1},
          {"label": "Zone déchets triés", "x": 8, "y": 5, "tolerance": 1},
          {"label": "Poste de commandement/chef de chantier", "x": 5, "y": 0, "tolerance": 1}
        ],
        "distractors": ["Zone fumeurs", "Aire pique-nique"],
        "explain": "Levage dégagé, EPI à l'entrée, tri en zone dédiée, point de commandement visible."
      },
      {
        "id": "L10",
        "type": "metiers",
        "prompt": "Associe ces rôles/contrôles aux bons acteurs.",
        "pairs": [
          {"tache": "Coordination SPS", "metier": "Coordinateur SPS"},
          {"tache": "OPC (ordonnancement, pilotage, coordination)", "metier": "OPC"},
          {"tache": "Implantation et topographie", "metier": "Géomètre-topographe"},
          {"tache": "Contrôle de conformité du béton", "metier": "Laboratoire (béton)"}
        ],
        "distractors": ["Chef de chantier", "Conducteur de travaux"],
        "explain": "SPS (sécurité), OPC (planning/coordination), géomètre (implantations), labo (essais/contrôles)."
      }
    ],
    "settings": {
      "duration_seconds": 180,
      "hints_enabled": false,
      "hint_penalty": 0,
      "skip_penalty": 0.5,
      "cards_per_game": 10,
      "classes": ["2EMNB", "1AA"],
      "score": {
        "points_per_correct": 1.0,
        "points_per_error": -0.25,
        "time_bonus_cap": 2.0,
        "time_bonus_threshold": 0.5,
        "time_bonus_per_card": 0.2,
        "min_card_score": 0
      }
    }
  };

  let data = null;
  let order = [];
  let current = 0;
  let score = 0;
  let player = { name: '', clazz: '' };
  let timeLeft = 180;
  let timer = null;
  let results = [];
  let cardStartTime = 0;

  function loadData(){
    return fetch('data.json', {cache:'no-store'})
      .then(r => { if(!r.ok) throw new Error('HTTP'); return r.json(); })
      .then(j => { data = j; })
      .catch(() => { data = DEFAULT_DATA; });
  }

  // Utils
  const shuffle = (a) => { for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

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

  function iconTag(label){
    if(!optIcons.checked) return null;
    const svg = ICONS[label];
    if(!svg) return null;
    const span = document.createElement('span');
    span.className = 'ico';
    span.innerHTML = svg;
    return span.firstChild;
  }

  function startGame(){
    const name = document.getElementById('player-name').value.trim();
    const clazz = document.getElementById('player-class').value;
    if(!name){ alert('Veuillez entrer votre nom.'); return; }
    player = { name, clazz };

    const total = data.levels.length;
    const base = Array.from({length: total}, (_,i)=>i);
    order = base.slice(0, data.settings.cards_per_game);
    order = shuffle(order);

    score = 0; current = 0; results = []; timeLeft = data.settings.duration_seconds;
    els.start.classList.add('hidden');
    els.game.classList.remove('hidden');

    updateHUD();
    timer = setInterval(()=>{ timeLeft--; updateHUD(); if(timeLeft<=0) endGame(); },1000);
    nextCard();
  }

  function updateHUD(){
    els.timer.textContent = `⏱ ${Math.floor(timeLeft/60)}:${String(timeLeft%60).padStart(2,'0')}`;
    els.score.textContent = `Score : ${score.toFixed(1)} / 20`;
    els.progress.textContent = `Carte ${Math.min(current+1, data.settings.cards_per_game)}/${data.settings.cards_per_game}`;
  }

  function clearArea(){ els.area.innerHTML=''; if(!optEval.checked) { els.explain.textContent=''; } btnValidate.disabled = true; }

  // PHASAGE
  function renderPhasage(level){
    const wrapper = document.createElement('div');
    wrapper.className = 'phasage-wrapper';

    const bank = document.createElement('div');
    bank.className = 'phasage-bank';
    const slots = document.createElement('div');
    slots.className = 'phasage-slots';

    const items = [...level.slots];
    shuffle(items);

    items.forEach(txt => {
      const chip = document.createElement('div');
      chip.className = 'badge';
      chip.textContent = txt;
      chip.draggable = true;
      chip.tabIndex = 0;
      chip.dataset.type = 'phasage-item';
      chip.addEventListener('dragstart', onDragStart);
      chip.addEventListener('dragend', onDragEnd);
      bank.appendChild(chip);
    });

    level.slots.forEach((_, idx) => {
      const s = document.createElement('div');
      s.className = 'slot';
      s.dataset.index = idx;
      s.addEventListener('dragover', onDragOver);
      s.addEventListener('drop', (e)=>onDropIntoSlot(e, bank));
      slots.appendChild(s);
    });

    wrapper.appendChild(bank); wrapper.appendChild(slots); els.area.appendChild(wrapper);
  }

  function onDragStart(e){ e.dataTransfer.setData('text/plain', e.target.textContent); e.dataTransfer.effectAllowed='move'; e.target.classList.add('dragging'); }
  function onDragOver(e){ e.preventDefault(); e.dataTransfer.dropEffect='move'; }
  function onDragEnd(e){ e.target.classList.remove('dragging'); }
  function onDropIntoSlot(e, bank){ e.preventDefault(); const txt = e.dataTransfer.getData('text/plain');
    if(e.currentTarget.firstChild){ const old = e.currentTarget.firstChild; bank.appendChild(old); }
    const chip = [...document.querySelectorAll('.badge')].find(c=>c.textContent===txt && c.classList.contains('dragging')) || [...document.querySelectorAll('.badge')].find(c=>c.textContent===txt);
    if(!chip) return;
    chip.classList.remove('dragging');
    e.currentTarget.classList.add('filled');
    e.currentTarget.appendChild(chip);
    btnValidate.disabled = false;
  }

  // METIERS
  function renderMetiers(level){
    const wrap = document.createElement('div'); wrap.className='metiers-wrapper';
    const list = document.createElement('div'); list.className='metiers-list';
    const bank = document.createElement('div'); bank.className='metiers-bank';

    const metiers = Array.from(new Set([ ...level.pairs.map(p=>p.metier), ...(level.distractors||[]) ]));
    shuffle(metiers).forEach(m => {
      const chip = document.createElement('div'); chip.className='badge'; chip.textContent=m; chip.draggable=true; chip.tabIndex=0; chip.dataset.type='metier';
      chip.addEventListener('dragstart', onDragStart);
      chip.addEventListener('dragend', onDragEnd);
      bank.appendChild(chip);
    });

    level.pairs.forEach((p,i)=>{
      const row = document.createElement('div'); row.className='metiers-row';
      const t = document.createElement('div'); t.textContent = p.tache; t.className='badge'; t.setAttribute('aria-readonly','true'); t.style.cursor='default';
      const target = document.createElement('div'); target.className='metier-target'; target.dataset.answer = p.metier; target.dataset.index=i;
      target.addEventListener('dragover', onDragOver); target.addEventListener('drop', (e)=>{ e.preventDefault(); const txt=e.dataTransfer.getData('text/plain');
        if(target.firstChild){ const old=target.firstChild; bank.appendChild(old); }
        const chip=[...document.querySelectorAll('.badge')].find(c=>c.textContent===txt && (c.dataset.type==='metier'));
        if(!chip) return;
        target.classList.add('filled'); target.appendChild(chip);
        btnValidate.disabled = false;
      });
      row.appendChild(t); row.appendChild(target); list.appendChild(row);
    });

    wrap.appendChild(list); wrap.appendChild(bank); els.area.appendChild(wrap);
  }

  // VOCABULAIRE
  function renderVocab(level){
    const wrap = document.createElement('div'); wrap.className='plan-wrapper';
    const bank = document.createElement('div'); bank.className='vocab-bank';
    (level.targets||[]).forEach(t=>{
      const tag = document.createElement('div'); tag.className='tag'; tag.draggable=true; tag.dataset.type='vocab';
      const icon = iconTag(t.label); if(icon) tag.appendChild(icon);
      const lbl = document.createElement('span'); lbl.textContent = t.label; lbl.className = icon ? 'sr-only' : '';
      tag.appendChild(lbl);
      tag.addEventListener('dragstart', onDragStart);
      tag.addEventListener('dragend', onDragEnd);
      bank.appendChild(tag);
    });

    const grid = document.createElement('div'); grid.className='grid';
    const cols = 10, rows = 6; grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    for(let y=0;y<rows;y++){
      for(let x=0;x<cols;x++){
        const cell = document.createElement('div'); cell.className='grid-cell'; cell.dataset.x=x; cell.dataset.y=y;
        cell.addEventListener('dragover', onDragOver);
        cell.addEventListener('drop', (e)=>{ e.preventDefault(); const txt=e.dataTransfer.getData('text/plain');
          const existing = [...cell.childNodes].find(n=>n.classList && (n.classList.contains('tag')));
          if(existing){ bank.appendChild(existing); }
          const tag = [...document.querySelectorAll('.tag')].find(t=>t.textContent.trim()===txt || t.innerText.trim()===txt);
          if(tag) { cell.appendChild(tag); btnValidate.disabled = false; }
        });
        grid.appendChild(cell);
      }
    }

    wrap.appendChild(bank); wrap.appendChild(grid); els.area.appendChild(wrap);
  }

  function nextCard(){
    if(current >= data.settings.cards_per_game){ endGame(); return; }
    clearArea();
    const level = data.levels[ order[current] ];
    els.prompt.textContent = level.prompt;

    if(level.type.startsWith('phasage')) renderPhasage(level);
    else if(level.type === 'metiers') renderMetiers(level);
    else if(level.type === 'vocab') renderVocab(level);

    cardStartTime = Date.now();
    updateHUD();
  }

  function validate(){
    const level = data.levels[ order[current] ];
    let correct = 0, errors = 0;

    if(level.type.startsWith('phasage')){
      const placed = [...document.querySelectorAll('.phasage-slots .slot')].map(s=> s.firstChild ? s.firstChild.textContent : null);
      level.slots.forEach((expected, idx)=>{
        const ok = placed[idx] === expected;
        if(ok){ correct++; } else { errors++; }
        const slot = document.querySelector(`.phasage-slots .slot:nth-child(${idx+1})`);
        slot && slot.classList.add(ok ? 'correct' : 'incorrect');
      });
    }
    else if(level.type === 'metiers'){
      const rows = [...document.querySelectorAll('.metiers-row')];
      rows.forEach((row)=>{
        const target = row.querySelector('.metier-target');
        const got = target.firstChild ? target.firstChild.textContent : null;
        const expected = target.dataset.answer;
        const ok = got === expected;
        if(ok){ correct++; } else { errors++; }
        target.classList.add(ok ? 'correct' : 'incorrect');
      });
    }
    else if(level.type === 'vocab'){
      const tags = [...document.querySelectorAll('.tag')];
      tags.forEach(tag=>{
        const cell = tag.parentElement;
        const label = tag.querySelector('span') ? tag.querySelector('span').textContent : tag.textContent.trim();
        const t = level.targets.find(t=>t.label===label);
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
    const meanPerCard = data.settings.duration_seconds / data.settings.cards_per_game;
    if((meanPerCard - elapsed) / meanPerCard > s.time_bonus_threshold){
      gained += s.time_bonus_per_card;
    }

    score = clamp(score + gained, 0, 20);

    if(optEval.checked){ els.explain.textContent = (data.levels[ order[current] ].explain || ''); }

    results.push({
      date: new Date().toLocaleString(),
      nom: player.name,
      classe: player.clazz,
      carte_id: level.id,
      type: level.type,
      corrects: correct,
      erreurs: errors,
      points_gagnes: Number(gained.toFixed(2)),
      score_cumule: Number(score.toFixed(2))
    });

    current++;
    setTimeout(nextCard, 700);
    updateHUD();
  }

  function skip(){
    const pen = data.settings.skip_penalty || 0;
    score = clamp(score - pen, 0, 20);

    const level = data.levels[ order[current] ];
    results.push({
      date: new Date().toLocaleString(),
      nom: player.name, classe: player.clazz,
      carte_id: level.id, type: level.type,
      corrects: 0, erreurs: 0,
      points_gagnes: -pen, score_cumule: Number(score.toFixed(2)),
      action: 'skip'
    });

    current++; updateHUD(); nextCard();
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
    const headers = [
      'date','nom','classe','carte_id','type','corrects','erreurs','points_gagnes','score_cumule','action'
    ];
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

  // Écoutes
  btnStart.addEventListener('click', () => loadData().then(startGame));
  btnValidate.addEventListener('click', validate);
  btnSkip.addEventListener('click', skip);
  btnRestart.addEventListener('click', ()=>location.reload());
  btnCSV.addEventListener('click', downloadCSV);
})();