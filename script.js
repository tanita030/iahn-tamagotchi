const FACE='assets/faces/';
const faces={normal:'01_normal.png',happy:'02_feliz.png',laugh:'03_risas.png',love:'04_enamorado.png',angry:'05_enfadado.png',sad:'06_triste.png',serious:'07_serio.png',bored:'08_aburrido.png',sleep:'09_durmiendo.png',eat:'10_comiendo_pizza.png',drink:'11_bebiendo.png',music:'12_escuchando_musica.png',study:'13_estudiando.png',thinking:'14_pensando.png',hood:'15_en_capucha.png',celebrate:'16_celebrando.png',cat:'17_con_gato.png',confused:'18_confundido.png',cool:'19_cool.png',nervous:'20_nervioso.png',shy:'21_avergonzado.png',tired:'22_agotado.png',phone:'23_con_movil.png',writing:'24_escribiendo.png',grumpy:'25_grunon.png',surprised:'26_sorprendido.png',relaxed:'27_relajado.png',stretch:'28_estirandose.png'};
const savedGame=JSON.parse(localStorage.getItem('iahnGame')||'null');
const state={
  mood:savedGame?.mood ?? 78,
  hunger:savedGame?.hunger ?? 62,
  energy:savedGame?.energy ?? 85,
  health:savedGame?.health ?? 90,
  points:savedGame?.points ?? 50,
  lastTick:savedGame?.lastTick ?? Date.now(),
  photos:JSON.parse(localStorage.getItem('iahnPhotos')||'[]'),
  feed:JSON.parse(localStorage.getItem('iahnFeed')||'[]'),
  roomItems:JSON.parse(localStorage.getItem('iahnRoomItems')||'[]'),
  username:localStorage.getItem('iahnUsername')||''
};

// ==========================================================
// V27 — SONIDO + MÚSICA DE FONDO
// ==========================================================
const AUDIO_PATH='assets/audio/';
const SFX_FILES={
  yay:'yay.mp3', click:'click_buton.mp3', coin:'coin.mp3', eat:'eat.mp3', damage:'gamedamage.mp3',
  gameover:'gameover.mp3', jump:'jump.mp3', laugh:'laugh.mp3', snore:'roncar.mp3', shot:'shot.mp3',
  start:'startgame.mp3', flash:'camara_flash.mp3'
};
const sfx={};
for(const [key,file] of Object.entries(SFX_FILES)){
  const a=new Audio(AUDIO_PATH+file); a.preload='auto'; a.volume=0.55; sfx[key]=a;
}
const musicTracks=[new Audio(AUDIO_PATH+'background_music_1.mp3'),new Audio(AUDIO_PATH+'background_music_2.mp3')];
musicTracks.forEach(a=>{a.preload='auto';a.volume=0.16;});
let musicIndex=0;
let musicStarted=false;
let snoreAudio=null;
let musicMuted=localStorage.getItem('iahnMusicMuted')==='1';
function playSfx(name){
  const base=sfx[name]; if(!base)return;
  try{const a=base.cloneNode(true);a.volume=base.volume;a.play().catch(()=>{});}catch(e){}
}
function stopSnore(){if(snoreAudio){snoreAudio.pause();snoreAudio.currentTime=0;snoreAudio=null;}}
function startMusic(){
  if(musicMuted||musicStarted)return;
  musicStarted=true;
  musicTracks[musicIndex].currentTime=0;
  musicTracks[musicIndex].play().catch(()=>{musicStarted=false;});
}
function setMusicMuted(value){
  musicMuted=value;localStorage.setItem('iahnMusicMuted',value?'1':'0');
  musicTracks.forEach(a=>{a.muted=value;});
  const btn=$('#musicToggle'),icon=$('#musicToggleIcon'),label=$('#musicToggleLabel');
  if(btn){btn.classList.toggle('muted',value);btn.setAttribute('aria-label',value?'Activar música de fondo':'Mutear música de fondo');btn.title=value?'Activar música de fondo':'Mutear música de fondo';}
  if(icon)icon.textContent=value?'🔇':'🎵';
  if(label)label.textContent=value?'OFF':'ON';
  if(!value){startMusic();}
}
function nextMusicTrack(){
  if(!musicStarted)return;
  musicIndex=(musicIndex+1)%musicTracks.length;
  if(musicMuted)return;
  const next=musicTracks[musicIndex];next.currentTime=0;next.play().catch(()=>{});
}
musicTracks.forEach(a=>a.addEventListener('ended',nextMusicTrack));

const $=s=>document.querySelector(s), modal=$('#modal'), body=$('#modalBody'), title=$('#modalTitle');
let sleepTimer=null;
let catTimer=null;
let catPetTimer=null;
let catIndex=0;
// Paseo tranquilo por toda la habitación: pocos cambios y movimientos suaves.
const catScenes=[
  ['cat_12.png',8,22,0.62],
  ['cat_13.png',18,21,0.58],
  ['cat_14.png',31,20,0.56],
  ['cat_01.png',45,20,0.60],
  ['cat_03.png',59,21,0.57],
  ['cat_04.png',73,22,0.62],
  ['cat_05.png',82,20,0.58],
  ['cat_06.png',67,19,0.56],
  ['cat_07.png',52,20,0.60],
  ['cat_08.png',37,21,0.58],
  ['cat_09.png',23,22,0.60],
  ['cat_10.png',11,21,0.56]
];
function showCatFrame(){
  const wrap=$('#catCompanion'),img=$('#catSprite');
  if(!wrap||!img||wrap.classList.contains('hidden-cat')) return;
  const [file,left,bottom,scale]=catScenes[catIndex%catScenes.length];
  img.src='assets/cat/'+file;
  wrap.style.left=left+'%';
  wrap.style.bottom=bottom+'px';
  wrap.style.setProperty('--cat-scale',scale);
  catIndex=(catIndex+1)%catScenes.length;
}
function startCatAnimation(){
  if(catTimer) clearInterval(catTimer);
  showCatFrame();
  // Cambia de pose/posición lentamente para que parezca que pasea, sin moverse demasiado.
  catTimer=setInterval(showCatFrame,2400);
}
function petCat(){
  if(!hasRoomItem('cat')){toast('Primero tienes que comprar el gato 🐱');return;}
  const wrap=$('#catCompanion');
  if(!wrap) return;
  if(catPetTimer) clearTimeout(catPetTimer);
  wrap.classList.add('hidden-cat');
  setFace('cat','¡Mira quién está aquí! 🐱','anim-pop',['❤️','🐱']);
  change({mood:10}); state.points+=2; render();
  toast('Acariciando al gato 🐱❤️');
  catPetTimer=setTimeout(()=>{
    wrap.classList.remove('hidden-cat');
    showCatFrame();
    say('El gato ha vuelto al sofá 🐱');
    catPetTimer=null;
  },3500);
}
if(state.roomItems.includes('cat'))startCatAnimation();

// ==========================================================
// HABITACIÓN PERSONALIZABLE — V29
// Cada usuario posee sus compras; las estadísticas de Iahn
// siguen siendo independientes de la decoración.
// ==========================================================
const ROOM_ITEMS={
  bed:{name:'Cama',emoji:'🛏️',cost:150,file:'01_cama.png',x:-1,y:394,w:585,h:366,z:10},
  window:{name:'Ventana',emoji:'🪟',cost:120,file:'02_ventana.png',x:915,y:0,w:450,h:492,z:8},
  posters:{name:'Pósters y fotos',emoji:'🖼️',cost:90,file:'03_posters_fotos.png',x:228,y:32,w:335,h:356,z:7},
  shelf:{name:'Estantería + planta',emoji:'🌿',cost:110,file:'04_estanteria_planta.png',x:552,y:0,w:380,h:300,z:9},
  rug:{name:'Alfombra',emoji:'🟪',cost:100,file:'05_alfombra.png',x:405,y:755,w:555,h:174,z:4},
  headphones:{name:'Auriculares',emoji:'🎧',cost:55,file:'06_auriculares.png',x:566,y:248,w:176,h:176,z:12},
  lamp:{name:'Lámpara',emoji:'💡',cost:70,file:'07_lampara.png',x:-2,y:171,w:142,h:264,z:13},
  skate:{name:'Skate',emoji:'🛹',cost:75,file:'08_skate.png',x:1328,y:358,w:105,h:257,z:12},
  backpack:{name:'Mochila',emoji:'🎒',cost:80,file:'09_mochila.png',x:1112,y:524,w:165,h:198,z:11},
  laptop:{name:'Portátil',emoji:'💻',cost:100,file:'10_portatil.png',x:1380,y:700,w:250,h:154,z:15},
  books:{name:'Libros',emoji:'📚',cost:35,file:'11_libros.png',x:1270,y:710,w:190,h:163,z:14},
  drink:{name:'Bebida',emoji:'🥤',cost:20,file:'12_bebida.png',x:1208,y:674,w:88,h:164,z:15},
  hangingPlant:{name:'Planta colgante',emoji:'🌿',cost:65,file:'13_planta_colgante.png',x:72,y:5,w:218,h:258,z:11},
  plant:{name:'Planta',emoji:'🪴',cost:40,file:'14_planta_maceta.png',x:650,y:28,w:150,h:182,z:12},
  mugPlant:{name:'Taza con planta',emoji:'☕',cost:45,file:'15_taza_planta.png',x:792,y:10,w:150,h:202,z:13},
  cabinet:{name:'Mueble',emoji:'🗄️',cost:90,file:'16_mueble.png',x:1450,y:492,w:200,h:198,z:10},
  blinds:{name:'Veneciana',emoji:'🪟',cost:60,file:'17_veneciana.png',x:946,y:0,w:244,h:230,z:14},
  cat:{name:'Gato',emoji:'🐱',cost:300,file:null,x:0,y:0,w:0,h:0,z:16,pet:true}
};
function renderRoomItems(){
  const layer=$('#roomItems'); if(!layer)return;
  layer.innerHTML='';
  for(const id of state.roomItems){
    const item=ROOM_ITEMS[id]; if(!item||item.pet||!item.file)continue;
    const el=document.createElement('img'); el.className='room-item'; el.dataset.item=id;
    el.src='assets/room/'+item.file; el.alt=item.name; el.style.left=(item.x/1671*100)+'%'; el.style.top=(item.y/941*100)+'%';
    el.style.width=(item.w/1671*100)+'%'; el.style.height=(item.h/941*100)+'%'; el.style.zIndex=item.z;
    layer.appendChild(el);
  }
  const cat=$('#catCompanion');
  if(cat)cat.classList.toggle('hidden-cat',!state.roomItems.includes('cat'));
}
function hasRoomItem(id){return state.roomItems.includes(id)}
function buyRoomItem(id){
  const item=ROOM_ITEMS[id]; if(!item)return false;
  if(hasRoomItem(id)){toast('Ya tienes este objeto 🏠');return false}
  if(!spend(item.cost))return false;
  state.roomItems.push(id);save();renderRoomItems();
  if(id==='cat')startCatAnimation();
  playSfx('yay');toast(`${item.name} comprado para siempre ${item.emoji}`);return true;
}
function shopMenu(){
  const cards=Object.entries(ROOM_ITEMS).map(([id,item])=>{
    const owned=hasRoomItem(id), disabled=owned||state.points<item.cost?'disabled':'';
    return `<button class="menu-item room-shop-card" data-room-id="${id}" ${disabled}>
      ${item.file?`<img class="room-shop-img" src="assets/room/${item.file}" alt="${item.name}">`:`<span class="room-shop-cat">🐱</span>`}
      <strong>${item.name}</strong><small>${owned?'✓ COMPRADO':'⭐ '+item.cost}</small>
    </button>`;
  }).join('');
  body.innerHTML=`<div class="shop-head"><span>⭐ ${state.points}</span><span>🛍️ TIENDA DE HABITACIÓN</span></div><p class="shop-note">Compra decoraciones una sola vez. Se quedan en tu habitación para siempre.</p><div class="menu-grid room-shop">${cards}</div>`;
  body.querySelectorAll('[data-room-id]').forEach(b=>b.addEventListener('click',()=>{if(buyRoomItem(b.dataset.roomId))shopMenu()}));
}

function clamp(n){return Math.max(0,Math.min(100,n))}
function save(){localStorage.setItem('iahnPhotos',JSON.stringify(state.photos));localStorage.setItem('iahnFeed',JSON.stringify(state.feed))}
function render(){
  $('#points').textContent=state.points;
  for(const k of ['mood','hunger','energy','health']){$('#'+k+'Value').textContent=Math.round(state[k])+'%';$('#'+k+'Bar').style.width=state[k]+'%'}
}
function say(text){$('#speech').textContent=text}
function toast(text){const t=$('#toast');t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
function change(delta){for(const[k,v]of Object.entries(delta))state[k]=clamp(state[k]+v);render()}
function setFace(key,phrase,anim='anim-pop',effects=[]){
  const img=$('#iahn');
  const safeKey=faces[key]?key:'normal';
  img.src=FACE+faces[safeKey];
  img.classList.remove('anim-bounce','anim-shake','anim-pop','anim-happy','special-low');
  if(safeKey==='stretch') img.classList.add('special-low');
  void img.offsetWidth;
  img.classList.add(anim);
  if(phrase)say(phrase);
  const e=$('#effect'); e.innerHTML=effects.map((x,i)=>`<span style="left:${22+i*15}%;top:${28+(i%2)*10}%">${x}</span>`).join('');
  setTimeout(()=>e.innerHTML='',1000);
}
function openModal(name){
  modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');
  const menus={food:['🍕 COMER',foodMenu],meme:['😂 MEME',memeMenu],care:['🫂 CARIÑO',careMenu],play:['🎮 JUGAR',playMenu],chat:['💬 CHAT',chatMenu],gallery:['🖼️ GALERÍA',galleryMenu],achievements:['🏆 LOGROS',achievementsMenu],friends:['👥 AMIGOS',friendsMenu],shop:['🛍️ TIENDA',shopMenu],home:['IAHN',homeMenu]};
  const[t,fn]=menus[name]||menus.home;title.textContent=t;fn();
}
function closeModal(){modal.classList.add('hidden');modal.setAttribute('aria-hidden','true')}
$('#closeModal').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openModal(b.dataset.open)));

function foodMenu(){
  body.innerHTML=`<p>Iahn tiene hambre. Elige algo:</p><div class="menu-grid">${[
    ['🍕','Pizza',20],['🍔','Hamburguesa',18],['🍝','Pasta',15],['🍌','Plátano',10],['🍫','Chocolate',12],['🍣','Sushi',14],
    ['🥣','Cereales',8],['🌮','Tortilla',12],['🍩','Donut',12],['🍓','Fruta',10],['🥤','Batido',14],['🍺','Cerveza',5]
  ].map(x=>`<button class="menu-item food-choice" data-h="${x[2]}" data-name="${x[1]}"><span class="emoji">${x[0]}</span>${x[1]}<small>+${x[2]} hambre</small></button>`).join('')}</div>`;
  body.querySelectorAll('.food-choice').forEach(b=>b.addEventListener('click',()=>{
    const n=b.dataset.name,h=Number(b.dataset.h);change({hunger:h,energy:2,mood:3});state.points+=2;render();
    setFace(n==='Pizza'?'eat':'happy',`Ñam ñam... ${n} 😋`,'anim-bounce',['🍕','❤️']);toast(`Iahn se ha comido ${n} 🍽️`);closeModal();
  }));
}
function memeMenu(){
  body.innerHTML=`<p>Sube una foto o meme. Iahn reaccionará y la foto quedará guardada.</p><div class="upload">🖼️<br><strong>Selecciona una foto</strong><br><button class="primary" id="uploadBtn" type="button">Subir foto</button></div><div class="feed">${state.feed.length?state.feed.slice().reverse().map(f=>`<div class="feed-item"><img class="thumb" src="${f.src}" alt="meme"><div><strong>${f.user}</strong><br><small>${f.text}</small></div></div>`).join(''):'Todavía no hay memes.'}</div>`;
  $('#uploadBtn').addEventListener('click',()=>$('#photoInput').click());
}
function careMenu(){
  const options=[['🫂','Abrazar','mood',15,'love'],['📞','Llamar','mood',12,'phone'],['🧑‍🤝‍🧑','Visitar','mood',20,'happy'],['🎬','Ver una peli','mood',12,'happy'],['🎧','Ponerle música','mood',10,'music'],['🛏️','Dejarle descansar','energy',15,'sleep'],['🐱','Acariciar gato','mood',10,'cat'],['💩','Hacer el gilipollas','mood',8,'laugh']];
  body.innerHTML=`<div class="menu-grid">${options.map(o=>`<button class="menu-item care-choice" data-k="${o[2]}" data-v="${o[3]}" data-name="${o[1]}" data-face="${o[4]}"><span class="emoji">${o[0]}</span>${o[1]}<small>+${o[3]}</small></button>`).join('')}</div>`;
  body.querySelectorAll('.care-choice').forEach(b=>b.addEventListener('click',()=>{
    const name=b.dataset.name, face=b.dataset.face;
    if(face==='sleep'){
      if(sleepTimer) clearTimeout(sleepTimer);
      change({energy:15}); state.points+=2; render();
      setFace('sleep','Zzz... 😴','anim-pop',['💤','💤']);
      const room=$('.room');
      room.classList.add('sleeping');
      closeModal();
      sleepTimer=setTimeout(()=>{
        room.classList.remove('sleeping');
        setFace('normal','Buenos días 😴','anim-pop',['✨']);
        toast('Iahn se ha despertado después de 5 segundos ☀️');
        sleepTimer=null;
      },5000);
      return;
    }
    if(name==='Acariciar gato'){
      change({mood:Number(b.dataset.v)}); state.points+=2; render();
      petCat();
      closeModal();
      return;
    }
    change({[b.dataset.k]:Number(b.dataset.v)});state.points+=2;render();
    setFace(face,`${name} ❤️`,'anim-pop',['❤️','💕']);
    toast(`Iahn ha recibido: ${name}`);closeModal();
  }));
}
function playMenu(){
  body.innerHTML=`<p>Elige un minijuego. Ahora sí: se juega de verdad 🎮</p>
  <div class="game-list">
    <div class="game-card-mini">🪜 <strong>Plataformas</strong><br><small>Salta y sube. ← → + ESPACIO</small><button data-game="platform" type="button">Jugar</button></div>
    <div class="game-card-mini">🌵 <strong>Evita pinchos</strong><br><small>Corre y salta. ESPACIO</small><button data-game="spikes" type="button">Jugar</button></div>
    <div class="game-card-mini">🦠 <strong>Dispara células</strong><br><small>Mueve y dispara. ← → + 🔴</small><button data-game="cells" type="button">Jugar</button></div>
    <div class="game-card-mini">🍕 <strong>Atrapa pizza</strong><br><small>Mueve la bandeja. ← →</small><button data-game="pizza" type="button">Jugar</button></div>
  </div>`;
  body.querySelectorAll('[data-game]').forEach(b=>b.addEventListener('click',()=>miniGame(b.dataset.game)));
}

function miniGame(type){
  if(window.__gameCleanup) window.__gameCleanup();
  setFace('cool','¡Vamos a jugar! 🎮','anim-bounce',['⭐']);
  playSfx('start');

  const names={platform:'PLATAFORMAS',spikes:'EVITA PINCHOS',cells:'DISPARA CÉLULAS',pizza:'ATRAPA PIZZA'};
  body.innerHTML=`
    <div class="game-header"><button class="game-back" id="gameBack">←</button><strong>${names[type]}</strong><span>⭐ <b id="miniScore">0</b></span></div>
    <div class="game-help" id="gameHelp"></div>
    <div class="mini-game real-game" id="mini"></div>
    <div class="game-controls" id="gameControls"></div>
    <button class="primary" id="gameExit" type="button">Salir del juego</button>`;

  const area=$('#mini'),scoreEl=$('#miniScore'),help=$('#gameHelp'),controls=$('#gameControls');
  area.classList.add('game-bg-'+type);
  let score=0,running=true,raf=0,last=performance.now();

  const keys={left:false,right:false,up:false,shoot:false};

  function scoreAdd(n){score=Math.max(0,score+n);scoreEl.textContent=score}
  function make(cls,text=''){
    const el=document.createElement('div');
    el.className=cls;el.textContent=text;
    area.appendChild(el);return el;
  }
  function pos(el,x,y){el.style.left=`${x}px`;el.style.bottom=`${y}px`}
  function cleanup(){
    running=false;
    if(raf)cancelAnimationFrame(raf);
    window.removeEventListener('keydown',onKey);
    window.removeEventListener('keyup',onKeyUp);
    window.__gameCleanup=null;
  }
  function finish(win){
    if(!running)return;
    cleanup();
    state.points+=score;
    change({mood:win?8:2});
    playSfx(win?'yay':'gameover');
    setFace(win?'celebrate':'tired',win?'¡PARTIDAZA! ⭐':'Casi... 😅','anim-happy',win?['⭐','🎮']:['💦']);
    toast(`${win?'Has conseguido':'Has hecho'} +${score} ⭐`);
    setTimeout(()=>{if(!modal.classList.contains('hidden'))playMenu()},900);
  }
  function onKey(e){
    const k=e.key.toLowerCase();
    if(['arrowleft','arrowright','arrowup',' ','a','d','w','enter'].includes(k))e.preventDefault();
    if(k==='arrowleft'||k==='a')keys.left=true;
    if(k==='arrowright'||k==='d')keys.right=true;
    if(k==='arrowup'||k==='w'||k===' ')keys.up=true;
    if(k==='enter')keys.shoot=true;
  }
  function onKeyUp(e){
    const k=e.key.toLowerCase();
    if(k==='arrowleft'||k==='a')keys.left=false;
    if(k==='arrowright'||k==='d')keys.right=false;
    if(k==='arrowup'||k==='w'||k===' ')keys.up=false;
    if(k==='enter')keys.shoot=false;
  }
  window.addEventListener('keydown',onKey);
  window.addEventListener('keyup',onKeyUp);

  function controlsFor(list){
    controls.innerHTML=list.map(([k,label])=>`<button data-key="${k}">${label}</button>`).join('');
    controls.querySelectorAll('button').forEach(b=>{
      const k=b.dataset.key;
      const down=e=>{e.preventDefault();keys[k]=true};
      const up=e=>{e.preventDefault();keys[k]=false};
      b.addEventListener('pointerdown',down);
      b.addEventListener('pointerup',up);
      b.addEventListener('pointercancel',up);
      b.addEventListener('pointerleave',up);
    });
  }
  $('#gameBack').onclick=()=>{cleanup();playMenu()};
  $('#gameExit').onclick=()=>{cleanup();playMenu()};

  // Always put the real Iahn sprite into the game as an inline background.
  const IAHN_ANIM={
    idle:'assets/character/idle.png',
    run1:'assets/character/run_01.png',
    run2:'assets/character/run_02.png',
    jump1:'assets/character/jump_01.png',
    jump2:'assets/character/jump_02.png'
  };
  function setIahnFrame(el,mode,t,dir=1){
    let src=IAHN_ANIM.idle;
    if(mode==='run'){
      src=((Math.floor(t/120)%2)===0)?IAHN_ANIM.run1:IAHN_ANIM.run2;
    }else if(mode==='jump'){
      src=t<140?IAHN_ANIM.jump1:IAHN_ANIM.jump2;
    }
    el.style.backgroundImage=`url("${src}")`;
    // Run sprites face left, but the supplied jump sprites face right.
    // Idle is front-facing, so never mirror it.
    if(mode==='idle'){
      el.style.transform='none';
    }else if(mode==='jump'){
      // Jump artwork faces right by default: mirror only when moving left.
      el.style.transform=(dir<0)?'none':'scaleX(-1)';
    }else{
      // Run artwork faces left by default: mirror when moving right.
      el.style.transform=(dir<0)?'scaleX(-1)':'none';
    }
  }
  function addIahn(x,y){
    const el=make('game-iahn');
    el.dataset.anim='idle';
    el.style.backgroundImage=`url("${IAHN_ANIM.idle}")`;
    pos(el,x,y);
    return el;
  }
  function updateIahn(el,mode,t,dir=1){
    if(!el)return;
    setIahnFrame(el,mode,t,dir);
  }
  function overlap(a,b){
    return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  }

  if(type==='platform'){
    help.textContent='← → mover · ▲ / ESPACIO saltar. Llega a la ⭐. 16 plataformas + monedas.';
    controlsFor([['left','◀'],['up','▲'],['right','▶']]);

    const ps=[
      [15,0,105],[155,65,90],[45,130,100],[210,195,95],[320,260,90],
      [185,325,105],[55,390,100],[235,455,95],[350,520,82],[190,585,105],
      [55,650,100],[225,715,105],[350,780,82],[205,845,115],[80,910,105],[255,975,110]
    ].map(([x,y,w])=>({x,y,w,h:14,el:null}));
    ps.forEach(p=>{p.el=make('platform');p.el.style.width=p.w+'px'});

    const coins=[[180,100],[90,165],[245,230],[350,295],[240,360],[100,425],[275,490],[370,555],[230,620],[105,685],[280,750],[380,815],[250,880],[125,945],[300,1010]]
      .map(([x,y])=>({x,y,w:20,h:20,got:false,el:null}));
    coins.forEach(c=>{c.el=make('game-coin');c.el.textContent='⭐'});

    const goal={x:255,y:1040,w:110,h:22},goalEl=make('game-goal','⭐ META');
    const player={x:35,y:35,w:38,h:48,vx:0,vy:0,onGround:false,el:addIahn(35,35)};
    let camera=0,coyote=0,jumpBuffer=0,highest=-1;

    function draw(){
      ps.forEach(p=>pos(p.el,p.x,p.y-camera));
      coins.forEach(c=>{if(!c.got)pos(c.el,c.x,c.y-camera)});
      pos(goalEl,goal.x,goal.y-camera);pos(player.el,player.x,player.y-camera);
    }
    function loop(t){
      if(!running)return;
      const dt=Math.min(.025,(t-last)/1000);last=t;

      const dir=(keys.right?1:0)-(keys.left?1:0);
      player.vx += (dir*230-player.vx)*Math.min(1,dt*10);
      if(!dir)player.vx*=Math.pow(.002,dt);
      const prevY=player.y;
      player.vy-=980*dt;
      player.x+=player.vx*dt;player.y+=player.vy*dt;
      player.x=Math.max(0,Math.min(area.clientWidth-player.w,player.x));

      if(player.onGround)coyote=.11;else coyote=Math.max(0,coyote-dt);
      if(keys.up){jumpBuffer=.12;keys.up=false}else jumpBuffer=Math.max(0,jumpBuffer-dt);
      if(jumpBuffer>0&&coyote>0){
        player.vy=470;player.onGround=false;coyote=0;jumpBuffer=0;playSfx('jump');
      }
      if(player.vy>0)player.vy-=180*dt;

      player.onGround=false;
      for(const p of ps){
        if(player.vy<=0 &&
          player.x+player.w>p.x && player.x<p.x+p.w &&
          prevY>=p.y+p.h-1 && player.y<=p.y+p.h+2){
          player.y=p.y+p.h;player.vy=0;player.onGround=true;
          if(p.y>highest){highest=p.y;scoreAdd(5)}
        }
      }
      for(const c of coins){
        if(!c.got&&overlap({x:player.x,y:player.y,w:player.w,h:player.h},c)){
          c.got=true;c.el.remove();scoreAdd(10);playSfx('coin');
        }
      }

      camera+=(Math.max(0,player.y-115)-camera)*Math.min(1,dt*7);
      updateIahn(player.el, player.onGround ? (Math.abs(player.vx)>18 ? 'run' : 'idle') : 'jump', t, player.vx>10 ? -1 : 1);
      draw();
      if(overlap({x:player.x,y:player.y,w:player.w,h:player.h},goal)){scoreAdd(75);finish(true);return}
      if(player.y<camera-120){finish(false);return}
      raf=requestAnimationFrame(loop);
    }
    draw();raf=requestAnimationFrame(loop);
  }

  if(type==='spikes'){
    help.textContent='Salta los pinchos durante 30 segundos. Puedes hacer doble salto.';
    controlsFor([['up','▲ SALTAR']]);

    const ground=make('game-ground');ground.style.bottom='0';
    const player={x:55,y:28,w:38,h:48,vy:0,el:addIahn(55,28)};
    let obstacles=[],next=0,start=performance.now(),doubleJump=true,combo=0,lastLand=0;

    function spawn(){
      const high=Math.random()<.2;
      const el=make('game-spike'+(high?' tall':''));
      const o={x:area.clientWidth+30,y:28,w:high?32:28,h:high?48:28,el};
      pos(el,o.x,o.y);obstacles.push(o);
    }
    function loop(t){
      if(!running)return;
      const dt=Math.min(.032,(t-last)/1000);last=t;
      const elapsed=(t-start)/1000;
      const speed=170+elapsed*10;
      if(t>next){spawn();next=t+700+Math.random()*500}

      if(keys.up){
        if(player.y<=28){player.vy=470;doubleJump=true;combo++;playSfx('jump')}
        else if(doubleJump&&player.vy<250){player.vy=400;doubleJump=false;combo++;playSfx('jump')}
        keys.up=false;
      }
      player.vy-=980*dt;player.y+=player.vy*dt;
      if(player.y<=28){
        player.y=28;player.vy=0;
        if(t-lastLand>350&&combo>1){scoreAdd(combo*2);combo=0}
        lastLand=t;doubleJump=true;
      }
      updateIahn(player.el, player.y>29 ? 'jump' : 'run', t, -1);
      pos(player.el,player.x,player.y);

      obstacles.forEach(o=>{o.x-=speed*dt;pos(o.el,o.x,o.y)});
      for(const o of obstacles){
        if(overlap({x:60,y:player.y+5,w:28,h:38},{x:o.x+4,y:o.y,w:o.w-8,h:o.h})){finish(false);return}
      }
      obstacles=obstacles.filter(o=>{if(o.x>-70)return true;o.el.remove();return false});
      score=Math.max(score,Math.floor(elapsed*3));scoreEl.textContent=score;
      if(elapsed>=30){scoreAdd(35+combo*3);finish(true);return}
      raf=requestAnimationFrame(loop);
    }
    raf=requestAnimationFrame(loop);
  }

  if(type==='cells'){
    help.textContent='← → mover · ● / ENTER disparar. Destruye 18 células en oleadas.';
    controlsFor([['left','◀'],['shoot','●'],['right','▶']]);

    const player={x:45,y:32,w:38,h:48,el:addIahn(45,32)};
    let enemies=[],shots=[],lastSpawn=0,lastShot=0,kills=0,wave=1;

    function spawn(){
      const r=Math.random(),kind=r<.2?'fast':r<.35?'tank':'normal';
      const el=make('enemy-cell '+kind);
      const data=kind==='tank'?{w:40,h:40,hp:3,vy:25}:kind==='fast'?{w:25,h:25,hp:1,vy:60}:{w:30,h:30,hp:1,vy:38};
      const e={x:Math.random()*(area.clientWidth-data.w-10)+5,y:area.clientHeight-50,...data,el};
      pos(el,e.x,e.y);enemies.push(e);
    }
    function shoot(){
      const now=performance.now();
      if(now-lastShot<220)return;
      lastShot=now;
      playSfx('shot');
      const el=make('bullet');
      const b={x:player.x+player.w/2-3,y:player.y+42,w:6,h:14,vy:420,el};
      pos(el,b.x,b.y);shots.push(b);
    }
    function loop(t){
      if(!running)return;
      const dt=Math.min(.032,(t-last)/1000);last=t;
      player.x+=((keys.right?220:0)-(keys.left?220:0))*dt;
      player.x=Math.max(0,Math.min(area.clientWidth-player.w,player.x));
      const cellDir=keys.right?-1:1;
      updateIahn(player.el, (keys.left||keys.right) ? 'run' : 'idle', t, cellDir);
      pos(player.el,player.x,player.y);
      if(keys.shoot)shoot();
      if(t-lastSpawn>Math.max(350,750-wave*35)){lastSpawn=t;spawn();if(Math.random()<wave*.025)spawn()}

      shots.forEach(b=>{b.y+=b.vy*dt;pos(b.el,b.x,b.y)});
      enemies.forEach(e=>{e.y-=e.vy*dt;pos(e.el,e.x,e.y)});

      for(let i=shots.length-1;i>=0;i--){
        for(let j=enemies.length-1;j>=0;j--){
          if(overlap(shots[i],enemies[j])){
            shots[i].el.remove();shots.splice(i,1);
            enemies[j].hp--;
            if(enemies[j].hp<=0){
              enemies[j].el.remove();enemies.splice(j,1);kills++;scoreAdd(5+(enemies[j]?.maxHp===3?7:0));
              if(kills%6===0)wave++;
            }
            break;
          }
        }
      }
      for(const e of enemies){
        if(overlap({x:player.x+5,y:player.y+5,w:28,h:38},{x:e.x,y:e.y,w:e.w,h:e.h})||e.y<25){playSfx('damage');finish(false);return}
      }
      shots=shots.filter(b=>{if(b.y<area.clientHeight+30)return true;b.el.remove();return false});
      enemies=enemies.filter(e=>{if(e.y>-50)return true;e.el.remove();return false});
      if(kills>=18){scoreAdd(45+wave*5);finish(true);return}
      raf=requestAnimationFrame(loop);
    }
    raf=requestAnimationFrame(loop);
  }

  if(type==='pizza'){
    help.textContent='← → mueve la bandeja. 🍕 suma, ⭐🍕 da mucho, 💣 quita vida.';
    controlsFor([['left','◀'],['right','▶']]);
    const basket=addIahn(area.clientWidth/2-25,20); basket.classList.add('pizza-basket');
    let bx=area.clientWidth/2-25,items=[],lives=3,caught=0,lastDrop=0,start=performance.now();
    function spawn(){
      const good=Math.random()<.78,golden=good&&Math.random()<.12;
      const el=make(golden?'falling-pizza golden':good?'falling-pizza':'falling-bomb',golden?'⭐🍕':good?'🍕':'💣');
      const p={x:Math.random()*(area.clientWidth-38),y:area.clientHeight-45,w:38,h:38,vy:100+Math.random()*70,good,golden,el};
      pos(el,p.x,p.y);items.push(p);
    }
    function loop(t){
      if(!running)return;
      const dt=Math.min(.032,(t-last)/1000);last=t;
      bx+=((keys.right?260:0)-(keys.left?260:0))*dt;
      bx=Math.max(0,Math.min(area.clientWidth-50,bx));
      updateIahn(basket, (keys.left||keys.right) ? 'run' : 'idle', t, keys.right ? -1 : 1);
      pos(basket,bx,20);
      const delay=Math.max(380,720-(t-start)/1000*10);
      if(t-lastDrop>delay){lastDrop=t;spawn()}
      items.forEach(p=>{p.y-=p.vy*dt;pos(p.el,p.x,p.y)});
      for(let i=items.length-1;i>=0;i--){
        const p=items[i];
        if(overlap({x:bx,y:20,w:50,h:30},p)){
          p.el.remove();items.splice(i,1);
          if(p.good){caught++;scoreAdd(p.golden?25:5);if(caught>=15){scoreAdd(50);finish(true);return}}
          else{lives--;playSfx('damage');toast(`💣 ${lives} ❤️`);if(lives<=0){finish(false);return}}
        }else if(p.y<-40){p.el.remove();items.splice(i,1);if(p.good){lives--;if(lives<=0){finish(false);return}}}
      }
      raf=requestAnimationFrame(loop);
    }
    loop(performance.now());
  }
}

async function chatMenu(friendUid=null, friendName=''){
  if(!firebaseReady){body.innerHTML='<div class="feed-item">🔴 Firebase no está conectado todavía.</div><p><small>Recarga la página e inténtalo de nuevo.</small></p>';return;}
  const friends=await getFriends();
  if(!friends.length){
    body.innerHTML='<div class="feed-item">👥 Todavía no tienes amigos.</div><p><small>Ve a 👥 Amigos para buscar a alguien por su nombre de usuario.</small></p>';return;
  }
  const selected=friendUid?friends.find(f=>f.uid===friendUid):friends[0];
  if(!selected){friendUid=friends[0].uid;friendName=friends[0].username;}
  friendUid=friendUid||selected.uid; friendName=friendName||selected.username;
  const list=friends.map(f=>`<button class="menu-item chat-friend-select ${f.uid===friendUid?'selected':''}" data-chat-uid="${escapeHtml(f.uid)}" data-chat-name="${escapeHtml(f.username)}"><span class="emoji">💬</span>${escapeHtml(f.username)}<small>Abrir chat</small></button>`).join('');
  body.innerHTML=`<div class="chat-layout"><div class="chat-friends"><strong>AMIGOS</strong><div class="chat-friend-list">${list}</div></div><div class="chat-panel"><div class="chat-title">💬 ${escapeHtml(friendName)}</div><div id="chatMessages" class="chat-messages"><div class="feed-item">Cargando mensajes...</div></div><form id="chatForm" class="chat-form"><input id="chatInput" maxlength=300 autocomplete="off" placeholder="Escribe un mensaje..." required><button class="primary" type="submit">➤</button></form></div></div>`;
  body.querySelectorAll('[data-chat-uid]').forEach(b=>b.addEventListener('click',()=>chatMenu(b.dataset.chatUid,b.dataset.chatName)));
  const form=$('#chatForm'), input=$('#chatInput');
  form.addEventListener('submit',async e=>{e.preventDefault();const text=String(input.value||'').trim();if(!text)return;input.disabled=true;try{await sendChatMessage(friendUid,text);input.value='';}catch(err){console.warn(err);toast('No se pudo enviar el mensaje.');}input.disabled=false;input.focus();});
  subscribeToChat(friendUid);
}
function galleryMenu(){body.innerHTML=`<p>Fotos desbloqueadas: ${state.photos.length}</p><div class="gallery">${state.photos.map((src,i)=>`<img src="${src}" alt="Recuerdo ${i+1}">`).join('')||'<p>Aún no hay fotos.</p>'}</div>`}
function achievementsMenu(){const a=[['🍕','Primera comida',state.hunger>62],['😂','Primer meme',state.photos.length>0],['⭐','100 puntos',state.points>=100],['🫂','Cariño recibido',state.mood>78],['🎮','Jugar',state.points>0]];body.innerHTML=a.map(x=>`<div class="feed-item"><span style="font-size:26px">${x[0]}</span><div><strong>${x[1]}</strong><br><small>${x[2]?'✓ Desbloqueado':'🔒 Bloqueado'}</small></div></div>`).join('')}
async function friendsMenu(){
  if(!firebaseReady){body.innerHTML='<div class="feed-item">🔴 Firebase no está conectado.</div>';return;}
  const [friends,incoming,outgoing]=await Promise.all([getFriends(),getFriendRequests('incoming'),getFriendRequests('outgoing')]);
  const friendIds=new Set(friends.map(f=>f.uid));
  const incomingHtml=incoming.map(r=>`<div class="friend-row"><div><strong>👤 ${escapeHtml(r.fromName||'Usuario')}</strong><small> quiere ser tu amigo</small></div><div class="friend-actions"><button class="primary mini" data-accept="${escapeHtml(r.id)}">ACEPTAR</button><button class="secondary mini" data-reject="${escapeHtml(r.id)}">RECHAZAR</button></div></div>`).join('')||'<div class="feed-item">No tienes solicitudes nuevas.</div>';
  const outgoingHtml=outgoing.map(r=>`<div class="friend-row"><div><strong>📨 ${escapeHtml(r.toName||'Usuario')}</strong><small> solicitud enviada</small></div><span>⏳</span></div>`).join('')||'<div class="feed-item">No tienes solicitudes pendientes.</div>';
  const friendsHtml=friends.map(f=>`<div class="friend-row"><div><strong>🟢 ${escapeHtml(f.username)}</strong><small> amigo</small></div><button class="primary mini" data-open-chat="${escapeHtml(f.uid)}" data-open-chat-name="${escapeHtml(f.username)}">CHAT</button></div>`).join('')||'<div class="feed-item">Todavía no tienes amigos.</div>';
  body.innerHTML=`<div class="friends-wrap"><div class="friend-search"><strong>👥 AÑADIR AMIGO</strong><form id="friendSearchForm"><input id="friendSearchInput" maxlength=20 placeholder="Nombre de usuario..." autocomplete="off"><button class="primary" type="submit">BUSCAR</button></form><div id="friendSearchResult"></div></div><h3 class="social-heading">👥 MIS AMIGOS (${friends.length})</h3><div class="friends-list">${friendsHtml}</div><h3 class="social-heading">📥 SOLICITUDES</h3>${incomingHtml}<h3 class="social-heading">📨 ENVIADAS</h3>${outgoingHtml}</div>`;
  $('#friendSearchForm').addEventListener('submit',async e=>{e.preventDefault();await searchAndRenderFriend();});
  body.querySelectorAll('[data-accept]').forEach(b=>b.addEventListener('click',async()=>{await acceptFriendRequest(b.dataset.accept);await friendsMenu();}));
  body.querySelectorAll('[data-reject]').forEach(b=>b.addEventListener('click',async()=>{await rejectFriendRequest(b.dataset.reject);await friendsMenu();}));
  body.querySelectorAll('[data-open-chat]').forEach(b=>b.addEventListener('click',()=>chatMenu(b.dataset.openChat,b.dataset.openChatName)));
}
async function searchAndRenderFriend(){
  const input=$('#friendSearchInput'), result=$('#friendSearchResult');
  const name=String(input?.value||'').trim(); if(!name){result.innerHTML='<div class="social-note">Escribe un nombre.</div>';return;}
  const normalized=normalizeUsername(name); result.innerHTML='<div class="social-note">Buscando...</div>';
  try{
    const snap=await firebaseDb.collection('usernames').doc(normalized).get();
    if(!snap.exists){result.innerHTML='<div class="social-note">❌ No existe ningún usuario con ese nombre.</div>';return;}
    const d=snap.data()||{}; if(d.uid===firebaseUid){result.innerHTML='<div class="social-note">😅 Ese eres tú.</div>';return;}
    const existing=await getFriendshipBetween(firebaseUid,d.uid); if(existing){result.innerHTML='<div class="social-note">✅ Ya sois amigos.</div>';return;}
    const pending=await getPendingBetween(firebaseUid,d.uid); if(pending){result.innerHTML=`<div class="social-note">⏳ Ya hay una solicitud pendiente.</div>`;return;}
    result.innerHTML=`<div class="friend-search-result"><strong>👤 ${escapeHtml(d.username||name)}</strong><button class="primary mini" id="sendFriendBtn">AÑADIR</button></div>`;
    $('#sendFriendBtn').addEventListener('click',async()=>{try{await sendFriendRequest(d.uid,d.username||name);result.innerHTML='<div class="social-note">✅ Solicitud enviada.</div>';}catch(e){console.warn(e);result.innerHTML='<div class="social-note">❌ No se pudo enviar.</div>';}});
  }catch(e){console.warn(e);result.innerHTML='<div class="social-note">❌ Error al buscar.</div>';}
}

function homeMenu(){body.innerHTML=`<p>Prototipo local de Iahn. Las fotos y puntos se guardan en este navegador.</p><button class="primary" id="reset" type="button">Reiniciar partida</button>`;$('#reset').addEventListener('click',()=>{localStorage.clear();location.reload()})}




/* ==========================================================
   V26 — ECONOMÍA + TIEMPO + CUIDADOS
   ========================================================== */
const GAME_COSTS={
  meme:3,
  hug:3, call:5, visit:8, movie:6, music:4, cat:2, joke:1
};
const FOOD_DATA=[
  ['01_pizza.png','Pizza',15,25,0,2],['02_hamburguesa.png','Hamburguesa',12,22,-2,0],['03_hotdog.png','Hot dog',9,17,-1,0],['04_sandwich.png','Sándwich',8,15,1,1],['05_patatas_fritas.png','Patatas fritas',7,14,-2,0],['06_muslo_de_pollo.png','Pollo',10,20,2,2],['07_filete.png','Filete',13,24,2,3],['08_salmon.png','Salmón',14,22,3,4],['09_sushi.png','Sushi',14,21,3,3],['10_sushi_roll.png','Sushi roll',11,18,2,2],['11_nigiri.png','Nigiri',10,17,2,2],['12_onigiri.png','Onigiri',8,16,2,2],['13_ramen.png','Ramen',13,24,1,2],['14_fideos.png','Fideos',10,20,1,1],['15_pollo_teriyaki.png','Pollo teriyaki',13,24,3,3],['16_curry_con_arroz.png','Curry con arroz',14,25,1,3],['17_tonkatsu.png','Tonkatsu',14,24,-1,2],['18_ramen_miso.png','Ramen miso',13,23,2,3],
  ['19_galleta.png','Galleta',5,9,-1,0],['20_chocolate.png','Chocolate',6,11,-1,0],['21_donut.png','Donut',7,13,-2,0],['22_tarta_fresa.png','Tarta de fresa',9,16,-1,0],['23_tarta_chocolate.png','Tarta de chocolate',9,17,-2,0],['24_flan.png','Flan',6,12,0,0],['25_tortitas.png','Tortitas',8,15,0,1],['26_gofre.png','Gofre',8,15,-1,0],['27_helado.png','Helado',7,12,1,0],['28_cupcake.png','Cupcake',7,12,-1,0],['29_caramelo.png','Caramelo',4,8,-2,0],['30_galleta_chocolate.png','Galleta de chocolate',6,10,-1,0],['31_macarons.png','Macarons',8,13,-1,0],['32_muffin.png','Muffin',7,13,0,0],['33_taiyaki.png','Taiyaki',8,14,0,1],['34_dango.png','Dango',7,13,1,0],
  ['35_sandia.png','Sandía',5,12,3,2],['36_fresa.png','Fresas',4,10,3,2],['37_platano.png','Plátano',4,11,4,2],['38_manzana.png','Manzana',4,10,4,2],['39_melocoton.png','Melocotón',5,11,3,2],
  ['40_bubble_tea.png','Bubble tea',7,13,1,0],['41_leche_fresa.png','Leche de fresa',6,12,2,1],['42_cafe.png','Café',6,7,5,0],['43_bebida_skull.png','Bebida skull',7,10,4,0],['44_te_verde.png','Té verde',5,8,4,2],['45_refresco_fresa.png','Refresco de fresa',6,11,-1,0],['46_agua.png','Agua',3,5,5,3],['47_zumo_naranja.png','Zumo de naranja',5,11,4,2],['48_zumo_uva.png','Zumo de uva',5,10,3,1],['49_refresco_rojo.png','Refresco rojo',5,10,-1,0],['50_refresco_skull.png','Refresco skull',6,10,0,0],['51_bebida_energetica.png','Bebida energética',8,9,12,0],
  ['52_comida_gato_azul.png','Comida de gato azul',5,8,-3,0],['53_comida_gato_rosa.png','Comida de gato rosa',5,8,-3,0],['54_carne.png','Carne',8,17,2,2],['55_pescado.png','Pescado',8,16,3,3],['56_pechuga_pollo.png','Pechuga de pollo',8,17,4,3],['57_zanahoria.png','Zanahoria',4,10,4,3],['58_brocoli.png','Brócoli',4,10,4,4],['59_bacon.png','Bacon',7,14,-2,0],['60_verdura_de_hoja.png','Verdura de hoja',4,9,4,4],['61_tomate.png','Tomate',4,9,4,3]
];


// ==========================================================
// FIREBASE — OPCIONAL / PREPARADO PARA MULTIUSUARIO
// Si firebase-config.js contiene un config válido, cada navegador
// obtiene un usuario anónimo con su habitación/estrellas y todos
// comparten las estadísticas globales de Iahn.
// ==========================================================
let firebaseReady=false, firebaseDb=null, firebaseUid=null, applyingRemote=false;
let firebaseInitPromise=null;
let userSyncTimer=null;
function hasFirebaseConfig(){
  const c=window.FIREBASE_CONFIG;
  return !!(c && c.apiKey && c.projectId && c.appId && window.firebase);
}
function scheduleUserSync(){
  if(!firebaseReady || applyingRemote)return;
  clearTimeout(userSyncTimer);
  userSyncTimer=setTimeout(async()=>{
    try{
      await firebaseDb.collection('users').doc(firebaseUid).set({
        username:state.username||'', stars:Math.floor(state.points), roomItems:[...state.roomItems], updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
    }catch(e){console.warn('Firebase user sync:',e)}
  },250);
}
async function syncGlobalDelta(delta){
  if(!firebaseReady || applyingRemote)return;
  const patch={};
  for(const k of ['mood','hunger','energy','health']) if(k in delta) patch[k]=firebase.firestore.FieldValue.increment(Number(delta[k]));
  if(!Object.keys(patch).length)return;
  try{
    await firebaseDb.collection('game').doc('iahn').set({updatedAt:firebase.firestore.FieldValue.serverTimestamp(),...patch},{merge:true});
  }catch(e){console.warn('Firebase global sync:',e)}
}

// ==========================================================
// AMIGOS + CHAT — FIRESTORE EN TIEMPO REAL
// ==========================================================
let chatUnsubscribe=null;
function escapeHtml(v){return String(v??'').replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]));}
function normalizeUsername(v){return String(v||'').trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9._-]/g,'').slice(0,20);}
function chatIdFor(a,b){return [a,b].sort().join('__');}
function friendshipIdFor(a,b){return chatIdFor(a,b);}
async function registerUsernameIndex(){
  if(!firebaseReady||!firebaseUid||!state.username)return;
  const key=normalizeUsername(state.username); if(!key)return;
  const ref=firebaseDb.collection('usernames').doc(key);
  const snap=await ref.get();
  if(!snap.exists){await ref.set({uid:firebaseUid,username:state.username,createdAt:firebase.firestore.FieldValue.serverTimestamp()});return true;}
  const d=snap.data()||{};
  if(d.uid===firebaseUid)return true;
  console.warn('Nombre de usuario ocupado:',state.username);return false;
}
async function getFriends(){
  if(!firebaseReady||!firebaseUid)return [];
  const snap=await firebaseDb.collection('friendships').where('users','array-contains',firebaseUid).get();
  const out=[];
  for(const doc of snap.docs){const d=doc.data()||{};const other=(d.users||[]).find(x=>x!==firebaseUid);if(!other)continue;const names=d.names||{};out.push({uid:other,username:names[other]||'Usuario'});}
  return out;
}
async function getFriendshipBetween(a,b){
  if(!firebaseReady||!firebaseUid)return null;
  // La consulta usa el índice de amistades del usuario actual. Así no intentamos
  // leer directamente un documento inexistente, algo que las reglas pueden rechazar.
  const snap=await firebaseDb.collection('friendships').where('users','array-contains',firebaseUid).get();
  return snap.docs.find(d=>{const users=d.data()?.users||[];return users.includes(a)&&users.includes(b)})||null;
}
async function getPendingBetween(a,b){
  // Solo consultamos solicitudes que el usuario actual puede leer según las reglas.
  const [outgoing,incoming]=await Promise.all([
    firebaseDb.collection('friendRequests').where('fromUid','==',a).get(),
    firebaseDb.collection('friendRequests').where('toUid','==',a).get()
  ]);
  const aReq=outgoing.docs.find(d=>{const x=d.data()||{};return x.toUid===b&&x.status==='pending';});
  const bReq=incoming.docs.find(d=>{const x=d.data()||{};return x.fromUid===b&&x.status==='pending';});
  return aReq||bReq||null;
}
async function getFriendRequests(direction){
  if(!firebaseReady||!firebaseUid)return [];
  const field=direction==='incoming'?'toUid':'fromUid';
  const snap=await firebaseDb.collection('friendRequests').where(field,'==',firebaseUid).get();
  return snap.docs.map(d=>({id:d.id,...d.data()})).filter(r=>r.status==='pending');
}
async function sendFriendRequest(toUid,toName){
  if(toUid===firebaseUid)throw new Error('self');
  if(await getFriendshipBetween(firebaseUid,toUid))throw new Error('already-friends');
  if(await getPendingBetween(firebaseUid,toUid))throw new Error('pending');
  await firebaseDb.collection('friendRequests').add({fromUid:firebaseUid,fromName:state.username||'Usuario',toUid,toName,status:'pending',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
}
async function acceptFriendRequest(id){
  const ref=firebaseDb.collection('friendRequests').doc(id), snap=await ref.get(); if(!snap.exists)throw new Error('missing');
  const d=snap.data()||{}; if(d.toUid!==firebaseUid)throw new Error('not-authorized');
  const batch=firebaseDb.batch();
  batch.set(firebaseDb.collection('friendships').doc(friendshipIdFor(d.fromUid,d.toUid)),{users:[d.fromUid,d.toUid],names:{[d.fromUid]:d.fromName||'Usuario',[d.toUid]:d.toName||state.username||'Usuario'},createdAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
  batch.update(ref,{status:'accepted',acceptedAt:firebase.firestore.FieldValue.serverTimestamp()});
  await batch.commit();
}
async function rejectFriendRequest(id){const ref=firebaseDb.collection('friendRequests').doc(id),snap=await ref.get();if(!snap.exists)throw new Error('missing');const d=snap.data()||{};if(d.toUid!==firebaseUid)throw new Error('not-authorized');await ref.update({status:'rejected',rejectedAt:firebase.firestore.FieldValue.serverTimestamp()});}
async function sendChatMessage(friendUid,text){
  if(!firebaseReady||!firebaseUid)throw new Error('not-ready');
  const friendship=await getFriendshipBetween(firebaseUid,friendUid);if(!friendship)throw new Error('not-friends');
  const chatRef=firebaseDb.collection('chats').doc(chatIdFor(firebaseUid,friendUid));
  const clean=text.trim().slice(0,300); if(!clean)return;
  const batch=firebaseDb.batch();
  batch.set(chatRef,{participants:[firebaseUid,friendUid],lastMessage:clean,lastSender:firebaseUid,lastSenderName:state.username||'Usuario',updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
  batch.set(chatRef.collection('messages').doc(),{senderUid:firebaseUid,senderName:state.username||'Usuario',text:clean,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
  await batch.commit();
}
function subscribeToChat(friendUid){
  if(chatUnsubscribe){chatUnsubscribe();chatUnsubscribe=null;}
  if(!firebaseReady||!firebaseUid)return;
  const chatRef=firebaseDb.collection('chats').doc(chatIdFor(firebaseUid,friendUid));
  chatUnsubscribe=chatRef.collection('messages').orderBy('createdAt','asc').limitToLast(100).onSnapshot(snap=>{
    const el=$('#chatMessages');if(!el)return;
    if(snap.empty){el.innerHTML='<div class="social-note">No hay mensajes todavía. ¡Di hola! 👋</div>';return;}
    el.innerHTML=snap.docs.map(d=>{const m=d.data()||{};const mine=m.senderUid===firebaseUid;return `<div class="chat-bubble ${mine?'mine':''}"><strong>${escapeHtml(m.senderName||'Usuario')}</strong><span>${escapeHtml(m.text||'')}</span><small>${m.createdAt?.toDate?m.createdAt.toDate().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}):''}</small></div>`}).join('');
    el.scrollTop=el.scrollHeight;
  },e=>{console.warn('Chat listener:',e);const el=$('#chatMessages');if(el)el.innerHTML='<div class="social-note">❌ No se pudieron cargar los mensajes.</div>';});
}
async function initFirebaseSync(){
  if(!hasFirebaseConfig())return;
  try{
    if(!firebase.apps.length)firebase.initializeApp(window.FIREBASE_CONFIG);
    const auth=firebase.auth();
    await auth.signInAnonymously();
    firebaseUid=auth.currentUser.uid;
    firebaseDb=firebase.firestore();
    firebaseReady=true;
    const userRef=firebaseDb.collection('users').doc(firebaseUid);
    const gameRef=firebaseDb.collection('game').doc('iahn');
    const userSnap=await userRef.get();
    if(!userSnap.exists){
      await userRef.set({username:state.username||'',stars:Math.floor(state.points),roomItems:[...state.roomItems],createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    }else{
      const d=userSnap.data()||{};
      applyingRemote=true;
      if(typeof d.username==='string' && d.username.trim()){state.username=d.username.trim();localStorage.setItem('iahnUsername',state.username);}
      if(typeof d.stars==='number')state.points=d.stars;
      if(Array.isArray(d.roomItems))state.roomItems=d.roomItems.filter(id=>ROOM_ITEMS[id]);
      applyingRemote=false;
      render();renderRoomItems();
    }
    const gameSnap=await gameRef.get();
    if(!gameSnap.exists){
      await gameRef.set({mood:state.mood,hunger:state.hunger,energy:state.energy,health:state.health,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
    }
    userRef.onSnapshot(snap=>{
      if(!snap.exists)return;
      const d=snap.data()||{};
      applyingRemote=true;
      if(typeof d.stars==='number')state.points=d.stars;
      if(Array.isArray(d.roomItems))state.roomItems=d.roomItems.filter(id=>ROOM_ITEMS[id]);
      applyingRemote=false;
      render();renderRoomItems();
    });
    gameRef.onSnapshot(snap=>{
      if(!snap.exists)return;
      const d=snap.data()||{};
      applyingRemote=true;
      for(const k of ['mood','hunger','energy','health'])if(typeof d[k]==='number')state[k]=clamp(d[k]);
      applyingRemote=false;
      render();
    });
    if(state.username) await registerUsernameIndex().catch(e=>console.warn('Username index:',e));
    console.info('Firebase conectado. Usuario:',firebaseUid);
  }catch(e){
    firebaseReady=false;
    console.warn('Firebase no disponible; usando modo local.',e);
  }
}

async function saveUsername(username){
  const clean=String(username||'').trim().replace(/\s+/g,' ');
  if(clean.length<2 || clean.length>20)return false;
  state.username=clean;
  localStorage.setItem('iahnUsername',clean);
  if(firebaseReady && firebaseUid){
    try{
      await firebaseDb.collection('users').doc(firebaseUid).set({username:clean,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
      const key=normalizeUsername(clean); const ref=firebaseDb.collection('usernames').doc(key); const snap=await ref.get();
      if(snap.exists && snap.data()?.uid!==firebaseUid){state.username=localStorage.getItem('iahnUsername')||'';throw new Error('username-taken');}
      await ref.set({uid:firebaseUid,username:clean,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    }catch(e){
      console.warn('Firebase username save:',e);
      return false;
    }
  }
  return true;
}

function persistGame(){
  localStorage.setItem('iahnGame',JSON.stringify({mood:state.mood,hunger:state.hunger,energy:state.energy,health:state.health,points:state.points,lastTick:state.lastTick,roomItems:state.roomItems}));
  localStorage.setItem('iahnRoomItems',JSON.stringify(state.roomItems));
  scheduleUserSync();
}
function save(){
  localStorage.setItem('iahnPhotos',JSON.stringify(state.photos));
  localStorage.setItem('iahnFeed',JSON.stringify(state.feed));
  persistGame();
}
function spend(cost){
  if(state.points<cost){toast(`Necesitas ${cost} ⭐ y tienes ${state.points} ⭐`);return false;}
  state.points-=cost;render();return true;
}
function gain(n){state.points+=n;playSfx('coin');render();}
function change(delta){for(const[k,v] of Object.entries(delta))state[k]=clamp(state[k]+v);render();syncGlobalDelta(delta);}
function render(){
  $('#points').textContent=Math.floor(state.points);
  for(const k of ['mood','hunger','energy','health']){
    $('#'+k+'Value').textContent=Math.round(state[k])+'%';
    $('#'+k+'Bar').style.width=state[k]+'%';
  }
  persistGame();
}
function applyElapsedTime(){
  const now=Date.now();
  const elapsed=Math.max(0,now-(state.lastTick||now));
  const wholeMin=Math.floor(elapsed/60000);
  if(wholeMin>=1){
    state.hunger=clamp(state.hunger-Math.floor(wholeMin/5));
    state.energy=clamp(state.energy-Math.floor(wholeMin/8));
    state.mood=clamp(state.mood-Math.floor(wholeMin/10));
    if(state.hunger<20||state.energy<15) state.health=clamp(state.health-Math.floor(wholeMin/30));
    state.lastTick += wholeMin*60000;
  }
}
applyElapsedTime();

function foodMenu(){
  const cards=FOOD_DATA.map((f,i)=>{
    const [file,name,cost,hunger,energy,health]=f;
    const disabled=state.points<cost?'disabled':'';
    return `<button class="menu-item food-choice food-card" data-i="${i}" ${disabled}>
      <img class="food-img" src="assets/food/${file}" alt="${name}">
      <strong>${name}</strong>
      <small>⭐ ${cost} · +${hunger} hambre${energy?` · ${energy>0?'+':''}${energy} energía`:''}${health?` · +${health} salud`:''}</small>
    </button>`;
  }).join('');
  body.innerHTML=`<div class="shop-head"><span>⭐ ${state.points}</span><span>🍽️ TIENDA DE COMIDA</span></div><p class="shop-note">Compra comida con tus estrellas. Las frutas y verduras cuidan mejor la salud.</p><div class="menu-grid food-shop">${cards}</div>`;
  body.querySelectorAll('.food-choice').forEach(b=>b.addEventListener('click',()=>{
    const f=FOOD_DATA[Number(b.dataset.i)];
    if(!f||!spend(f[2])) return;
    const [file,name,cost,hunger,energy,health]=f;
    change({hunger,energy,health,mood:3});
    playSfx('eat');
    setFace(name==='Pizza'?'eat':(health>=3?'happy':'eat'),`Ñam... ${name} 😋`,'anim-bounce',['🍽️','❤️']);
    toast(`Has comprado ${name} por ${cost} ⭐`);closeModal();
  }));
}

function careMenu(){
  const options=[
    ['🫂','Abrazar',GAME_COSTS.hug,15,'love'],['📞','Llamar',GAME_COSTS.call,12,'phone'],['🧑‍🤝‍🧑','Visitar',GAME_COSTS.visit,20,'happy'],
    ['🎬','Ver una peli',GAME_COSTS.movie,12,'happy'],['🎧','Ponerle música',GAME_COSTS.music,10,'music'],
    ['🛏️','Dejarle descansar',0,25,'sleep'],['🐱','Acariciar gato',GAME_COSTS.cat,10,'cat'],['💩','Hacer el gilipollas',GAME_COSTS.joke,8,'laugh']
  ];
  body.innerHTML=`<div class="shop-head"><span>⭐ ${state.points}</span><span>❤️ CARIÑO</span></div><p class="shop-note">Las acciones de cariño cuestan estrellas. Dormir y acariciar al gato tienen sus propias reglas.</p><div class="menu-grid">${options.map(o=>`<button class="menu-item care-choice" data-cost="${o[2]}" data-v="${o[3]}" data-name="${o[1]}" data-face="${o[4]}" ${state.points<o[2]?'disabled':''}><span class="emoji">${o[0]}</span><strong>${o[1]}</strong><small>${o[2]?'⭐ '+o[2]:'GRATIS'} · +${o[3]}</small></button>`).join('')}</div>`;
  body.querySelectorAll('.care-choice').forEach(b=>b.addEventListener('click',()=>{
    const name=b.dataset.name,face=b.dataset.face,cost=Number(b.dataset.cost),v=Number(b.dataset.v);
    if(face==='sleep'){
      if(sleepTimer){clearTimeout(sleepTimer);sleepTimer=null;}
      closeModal();
      setFace('sleep','Zzz... 😴','anim-pop',['💤','💤']);
      stopSnore();
      snoreAudio=new Audio(AUDIO_PATH+'roncar.mp3'); snoreAudio.volume=0.35; snoreAudio.loop=true; snoreAudio.play().catch(()=>{});
      $('.room').classList.add('sleeping');
      change({energy:25,health:2,mood:2});
      toast('Iahn duerme 5 segundos... 🌙');
      sleepTimer=setTimeout(()=>{
        $('.room').classList.remove('sleeping');
        stopSnore();
        setFace('normal','Buenos días 😴','anim-pop',['✨']);
        toast('¡Despierto! +25 energía ⚡');
        sleepTimer=null;
      },5000);
      return;
    }
    if(!spend(cost))return;
    if(name==='Acariciar gato'){
      petCat();
      closeModal();
      return;
    }
    change({mood:v,energy: name==='Ver una peli'?2:0});
    setFace(face,`${name} ❤️`,'anim-pop',['❤️','💕']);
    toast(`${name}: -${cost} ⭐`);closeModal();
  }));
}

function petCat(){
  if(!hasRoomItem('cat')){toast('Primero tienes que comprar el gato 🐱');return;}
  const wrap=$('#catCompanion');
  if(!wrap)return;
  if(catPetTimer)clearTimeout(catPetTimer);
  wrap.classList.add('hidden-cat');
  setFace('cat','¡Mira quién está aquí! 🐱','anim-pop',['❤️','🐱']);
  change({mood:10});
  toast('Acariciando al gato 🐱❤️');
  catPetTimer=setTimeout(()=>{
    wrap.classList.remove('hidden-cat');showCatFrame();say('El gato ha vuelto 🐱');catPetTimer=null;
  },3500);
}

function memeMenu(){
  body.innerHTML=`<div class="shop-head"><span>⭐ ${state.points}</span><span>😂 MEME · 3 ⭐</span></div><p>Sube una foto o meme. Cuesta 3 ⭐ y queda guardado en la galería.</p><div class="upload">🖼️<br><strong>Selecciona una foto</strong><br><button class="primary" id="uploadBtn" type="button" ${state.points<3?'disabled':''}>Subir foto · 3 ⭐</button></div><div class="feed">${state.feed.length?state.feed.slice().reverse().map(f=>`<div class="feed-item"><img class="thumb" src="${f.src}" alt="meme"><div><strong>${f.user}</strong><br><small>${f.text}</small></div></div>`).join(''):'Todavía no hay memes.'}</div>`;
  $('#uploadBtn').addEventListener('click',()=>{
    if(!spend(3))return;
    $('#photoInput').click();
  });
}

// Replace the original upload handler so the 3⭐ charge is refunded if the user cancels.
$('#photoInput').onchange=null;
$('#photoInput').addEventListener('change',e=>{
  const file=e.target.files[0];
  if(!file){state.points+=3;render();return;}
  const reader=new FileReader();
  reader.onload=()=>{
    playSfx('flash');
    const item={src:reader.result,user:'Tú',text:'Ha enviado un meme 😂',time:new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})};
    state.photos.push(item.src);state.feed.push(item);save();
    change({mood:12});gain(5);
    playSfx('laugh');
    setFace('laugh','JAJAJAJA 😂','anim-happy',['😂','😂','❤️']);
    toast('Iahn se ha reído. +5 ⭐ de recompensa');openModal('meme');e.target.value='';
  };
  reader.readAsDataURL(file);
});

function playMenu(){
  const locked=state.energy<15;
  body.innerHTML=`<div class="shop-head"><span>⭐ ${state.points}</span><span>⚡ ${Math.round(state.energy)} energía</span></div>
  <p>Jugar gasta energía, pero te da estrellas. ${locked?'<strong>Necesitas al menos 15% de energía.</strong>':''}</p>
  <div class="game-list ${locked?'games-locked':''}">
    <div class="game-card-mini">🪜 <strong>Plataformas</strong><br><small>Salta y sube. ← → + ESPACIO</small><button data-game="platform" type="button" ${locked?'disabled':''}>Jugar · −8 ⚡</button></div>
    <div class="game-card-mini">🌵 <strong>Evita pinchos</strong><br><small>Corre y salta. ESPACIO</small><button data-game="spikes" type="button" ${locked?'disabled':''}>Jugar · −7 ⚡</button></div>
    <div class="game-card-mini">🦠 <strong>Dispara células</strong><br><small>Mueve y dispara. ← → + ENTER</small><button data-game="cells" type="button" ${locked?'disabled':''}>Jugar · −10 ⚡</button></div>
    <div class="game-card-mini">🍕 <strong>Atrapa pizza</strong><br><small>Mueve la bandeja. ← →</small><button data-game="pizza" type="button" ${locked?'disabled':''}>Jugar · −6 ⚡</button></div>
  </div>`;
  body.querySelectorAll('[data-game]').forEach(b=>b.addEventListener('click',()=>{
    const costs={platform:8,spikes:7,cells:10,pizza:6};
    if(spendEnergyForGame(costs[b.dataset.game])) miniGame(b.dataset.game);
  }));
}
function spendEnergyForGame(cost){
  if(state.energy<cost){toast(`Necesitas ${cost}% de energía ⚡`);return false;}
  change({energy:-cost});return true;
}

function achievementsMenu(){
  const lifetime=Number(localStorage.getItem('iahn_lifetime_points')||state.points);
  const games=Number(localStorage.getItem('iahn_games_played')||0);
  const wins=Number(localStorage.getItem('iahn_games_won')||0);
  const foods=Number(localStorage.getItem('iahn_foods_bought')||0);
  const cares=Number(localStorage.getItem('iahn_care_actions')||0);
  const sleeps=Number(localStorage.getItem('iahn_sleeps')||0);
  const pets=Number(localStorage.getItem('iahn_cat_pets')||0);
  const memes=state.photos.length;
  const a=[
    ['🍕','Primer bocado',foods>=1,'Comprar tu primera comida'],
    ['😂','Proveedor oficial de memes',memes>=1,'Subir tu primer meme'],
    ['🐱','Encantador de gatos',pets>=1,'Acariciar al gato por primera vez'],
    ['🎬','Director de sofá',cares>=3,'Hacer 3 acciones de cariño'],
    ['💤','Profesional de la siesta',sleeps>=3,'Dormir 3 veces'],
    ['🥦','Nutricionista de guardia',foods>=5,'Comprar 5 comidas'],
    ['🍕','Adicto a la pizza',foods>=3,'Comprar 3 comidas'],
    ['🫂','Amigo intensito',cares>=10,'Hacer 10 acciones de cariño'],
    ['🎮','No he venido a cuidar al Tamagotchi',games>=1,'Jugar tu primera partida'],
    ['🕹️','Cliente habitual del arcade',games>=10,'Jugar 10 partidas'],
    ['🏆','Iahn no se rinde',wins>=5,'Ganar 5 minijuegos'],
    ['⭐','Banquero de estrellas',state.points>=100,'Tener 100 ⭐ a la vez'],
    ['💸','Adiós, ahorros',lifetime>=100,'Acumular 100 ⭐ ganadas'],
    ['🌟','Fortuna absurda',lifetime>=300,'Acumular 300 ⭐ ganadas'],
    ['🚀','Economía espacial',lifetime>=1000,'Acumular 1.000 ⭐ ganadas'],
    ['❤️','Salud de hierro',state.health>=99,'Llegar al 100% de salud'],
    ['⚡','Batería nuclear',state.energy>=99,'Llegar al 100% de energía'],
    ['💖','Buen rollo máximo',state.mood>=99,'Llegar al 100% de ánimo'],
    ['🍗','Iahn bien alimentado',state.hunger>=99,'Llegar al 100% de hambre'],
    ['👑','Modo dios',state.health>=99&&state.energy>=99&&state.mood>=99&&state.hunger>=99,'Tener las 4 barras al 100%'],
    ['📸','Fotógrafo oficial',memes>=5,'Subir 5 memes'],
    ['💬','Casi vivimos aquí',cares>=20,'Hacer 20 acciones de cariño'],
    ['😴','Rey de la almohada',sleeps>=10,'Dormir 10 veces'],
    ['🎮','Arcade legendario',wins>=10,'Ganar 10 minijuegos'],
    ['🏅','Leyenda de Iahn',lifetime>=2500,'Acumular 2.500 ⭐ ganadas']
  ];
  const unlocked=a.filter(x=>x[2]).length;
  body.innerHTML=`<div class="shop-head"><span>🏆 LOGROS</span><span>${unlocked}/${a.length} ⭐ ${state.points}</span></div><div class="achievement-progress"><div style="width:${Math.round(unlocked/a.length*100)}%"></div></div>`+a.map(x=>`<div class="feed-item achievement ${x[2]?'unlocked':''}"><span style="font-size:26px">${x[0]}</span><div><strong>${x[1]}</strong><br><small>${x[2]?'✓ Desbloqueado':'🔒 Bloqueado'} · ${x[3]}</small></div></div>`).join('');
}
function homeMenu(){body.innerHTML=`<div class="shop-head"><span>⭐ ${state.points}</span><span>ESTADO</span></div><p>Las estrellas sirven para comprar comida y cariño. El estado de Iahn cambia con el tiempo aunque cierres la página.</p><div class="status-hints"><div>🍕 Hambre: −1 cada 5 min</div><div>⚡ Energía: −1 cada 8 min despierto</div><div>💗 Ánimo: −1 cada 10 min</div><div>❤️ Salud: baja si hambre/energía están muy bajas</div><div>💤 Dormir: 5 s · +25 energía · +2 salud</div></div><button class="primary" id="reset" type="button">Reiniciar partida</button>`;$('#reset').addEventListener('click',()=>{localStorage.clear();location.reload()})}

// Patch the game rewards/energy persistence without changing the already-tested minigame loops.
const originalMiniGame=miniGame;
miniGame=function(type){
  const before=state.points;
  originalMiniGame(type);
  // The game itself adds its score to state.points on finish. render() persists it.
};

// Gentle real-time ticking: updates once per minute and persists elapsed time.
setInterval(()=>{
  const now=Date.now(), elapsed=Math.max(0,now-state.lastTick), mins=elapsed/60000;
  const wholeMin=Math.floor(mins);
  if(wholeMin>=1){
    const h=Math.floor(wholeMin/5), e=Math.floor(wholeMin/8), m=Math.floor(wholeMin/10);
    state.hunger=clamp(state.hunger-h);
    state.energy=clamp(state.energy-e);
    state.mood=clamp(state.mood-m);
    if(state.hunger<20||state.energy<15) state.health=clamp(state.health-Math.floor(wholeMin/30));
    state.lastTick += wholeMin*60000;render();
    if(state.hunger<20)setFace('sad','Tengo hambre... 🍕','anim-shake',['🍕']);
    else if(state.energy<20)setFace('tired','Tengo sueño... 😴','anim-bounce',['💤']);
  }
},60000);


// Audio controls: browsers require a user gesture before starting background music.
const musicToggle=$('#musicToggle');
if(musicToggle){
  musicToggle.addEventListener('click',e=>{e.stopPropagation();setMusicMuted(!musicMuted);});
  setMusicMuted(musicMuted);
}
const unlockAudio=()=>{startMusic();window.removeEventListener('pointerdown',unlockAudio);window.removeEventListener('keydown',unlockAudio);window.removeEventListener('touchstart',unlockAudio);};
window.addEventListener('pointerdown',unlockAudio,{passive:true});
window.addEventListener('keydown',unlockAudio,{passive:true});
window.addEventListener('touchstart',unlockAudio,{passive:true});
// V35 — START + identidad Firebase.
const startScreen=$('#startScreen');
const startButton=$('#startButton');
const usernameScreen=$('#usernameScreen');
const usernameInput=$('#usernameInput');
const usernameForm=$('#usernameForm');
const firebaseStatus=$('#firebaseStatus');
function updateFirebaseStatus(){
  if(!firebaseStatus)return;
  firebaseStatus.textContent=firebaseReady ? '🟢 Firebase conectado' : '🔴 Firebase no conectado';
  firebaseStatus.classList.toggle('firebase-ok',firebaseReady);
}
function showUsernameScreen(){
  if(!usernameScreen)return;
  usernameScreen.classList.remove('hidden');
  usernameScreen.setAttribute('aria-hidden','false');
  updateFirebaseStatus();
  if(usernameInput){usernameInput.value=state.username||'';setTimeout(()=>usernameInput.focus(),80);}
}
function hideUsernameScreen(){
  if(!usernameScreen)return;
  usernameScreen.classList.add('hidden');
  usernameScreen.setAttribute('aria-hidden','true');
}
async function enterGame(){
  if(!startScreen)return;
  if(firebaseInitPromise)await firebaseInitPromise;
  updateFirebaseStatus();
  if(!state.username){
    showUsernameScreen();
    return;
  }
  startScreen.classList.add('start-hidden');
  startScreen.setAttribute('aria-hidden','true');
  startMusic();
  playSfx('start');
}
if(startButton)startButton.addEventListener('click',async e=>{e.preventDefault();e.stopPropagation();await enterGame();});
if(usernameForm)usernameForm.addEventListener('submit',async e=>{
  e.preventDefault();
  const clean=String(usernameInput?.value||'').trim().replace(/\s+/g,' ');
  if(clean.length<2 || clean.length>20){toast('El nombre debe tener entre 2 y 20 caracteres.');return;}
  const submit=usernameForm.querySelector('button[type="submit"]');
  if(submit){submit.disabled=true;submit.textContent='GUARDANDO...';}
  if(firebaseInitPromise)await firebaseInitPromise;
  const ok=await saveUsername(clean);
  if(!ok && firebaseReady){toast('No se pudo guardar el nombre en Firebase.');if(submit){submit.disabled=false;submit.textContent='ENTRAR';}return;}
  hideUsernameScreen();
  startScreen.classList.add('start-hidden');
  startScreen.setAttribute('aria-hidden','true');
  startMusic();
  playSfx('start');
  toast(firebaseReady ? `¡Hola, ${state.username}! 🟢 Firebase conectado` : `¡Hola, ${state.username}!`);
  if(submit){submit.disabled=false;submit.textContent='ENTRAR';}
});

document.addEventListener('click',e=>{const btn=e.target.closest('button');if(btn && btn.id!=='musicToggle' && btn.id!=='startButton')playSfx('click');});
render();
renderRoomItems();
firebaseInitPromise=initFirebaseSync();
updateFirebaseStatus();
