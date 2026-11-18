(function () {
  'use strict';

  const STORAGE_KEY = 'gll_handheld_duty_room_v1';
  const SCHEMA_VERSION = 1;
  const MINUTE = 60000;
  const DAY = 86400000;
  const views = [
    ['overview','值班首页'],['devices','掌机收藏'],['schedule','值班日历'],['random','随机抽签'],
    ['sessions','游玩记录'],['performance','性能档案'],['stats','统计报告'],['achievements','收藏成就'],
    ['maintenance','维护中心'],['settings','设置']
  ];

  const deviceSeeds = [
    ['dev-rg55g1','RG-55G1','RG','55G1','8+128GB',['安卓原生','PSP'],['primary']],
    ['dev-rgdsplus','RG-DSplus','RG','DSplus','双屏结构',['NDS','双屏复古'],['portable']],
    ['dev-rg35xxsp','RG35XXSP','RG','35XXSP','翻盖掌机',['GBA','通勤复古'],['portable']],
    ['dev-ktr2','KTR2','','KTR2','特色安卓掌机',['安卓原生游戏','软件测试'],['portable']],
    ['dev-coolpad-square','Coolpad 小方块','Coolpad','小方块','迷你掌机',['碎片化小游戏'],['portable']],
    ['dev-rg34xx','RG34XX','RG','34XX','GBA 经典横版造型',['GBA'],['portable']],
    ['dev-rgrotate','RG-Rotate','RG','Rotate','旋转屏幕、720×720',['GB','GBC','PICO-8','方屏游戏'],['portable']],
    ['dev-gkd-mini','GKD 小金刚','GKD','小金刚','迷你复古掌机',['街机','短流程游戏'],['portable']],
    ['dev-ayn-thor','AYN Thor','AYN','Thor','16GB+1TB；早期 UFS 4.0；镭射 Miku 定制外壳',['3DS','双屏游戏','PC模拟'],['primary']],
    ['dev-aya-air-mini','AYA Air Mini','AYA','Air Mini','3+64GB',['轻量复古','随身游玩'],['portable']],
    ['dev-aya-kpa','AYA KPA','AYA','KPA','高配版本',['小型安卓游戏','复古RPG'],['portable']],
    ['dev-ayn-odin3','AYN Odin 3','AYN','Odin 3','12+256GB Pro 版本',['高性能PC模拟','现代游戏'],['primary'],'unavailable'],
    ['dev-rp-nova','RP Nova','Retroid Pocket','Nova','12+256GB；已安装 Armada OS',['ARM Linux','Steam游戏'],['primary']],
    ['dev-rp-duo-lite','RP Duo Lite','Retroid Pocket','Duo Lite','双屏掌机',['轻量NDS','休闲游戏'],['portable']],
    ['dev-rp-duo','RP Duo','Retroid Pocket','Duo','标准版双屏掌机',['双屏RPG','长篇游戏'],['primary']],
    ['dev-gcloud','罗技 G Cloud','Logitech','G Cloud','大屏串流掌机',['Moonlight','PC游戏串流'],['primary']],
    ['dev-rg477m','RG477M','RG','477M','12+256GB；金属机身',['PS2','NGC','4:3游戏'],['primary']]
  ];

  const recommendationSeeds = {
    'dev-rg55g1':['怪物猎人P3','战神：斯巴达之魂','山脊赛车'],
    'dev-rgdsplus':['宝可梦黑白','逆转裁判','节奏天国'],
    'dev-rg35xxsp':['黄金太阳','火焰纹章：烈火之剑','瓦力欧制造'],
    'dev-ktr2':['泰拉瑞亚','死亡细胞','吸血鬼幸存者'],
    'dev-coolpad-square':['俄罗斯方块','推箱子','贪吃蛇'],
    'dev-rg34xx':['银河战士：融合','宝可梦绿宝石','马力欧赛车'],
    'dev-rgrotate':['塞尔达：梦见岛DX','宝可梦水晶','Celeste Classic'],
    'dev-gkd-mini':['合金弹头3','拳皇97','三国战纪'],
    'dev-ayn-thor':['火焰纹章：觉醒','勇气默示录','马力欧3D大陆'],
    'dev-aya-air-mini':['星之卡比：超级豪华版','超级银河战士','魂斗罗3'],
    'dev-aya-kpa':['勇者斗恶龙3','最终幻想6','牧场物语'],
    'dev-ayn-odin3':['影之刃零（待测试）','高性能PC游戏','哈迪斯'],
    'dev-rp-nova':['空之轨迹2重制版','八方旅人2','哈迪斯2'],
    'dev-rp-duo-lite':['雷顿教授','触摸侦探','任天狗'],
    'dev-rp-duo':['世界树迷宫','勇者斗恶龙9','符文工房3'],
    'dev-gcloud':['影之刃零','赛博朋克2077','荒野大镖客2'],
    'dev-rg477m':['最终幻想10','塞尔达：风之杖','GT赛车4']
  };

  const environmentSeeds = {
    'dev-rp-nova':[{id:'env-rp-nova-armada',name:'Armada OS',installed:true,version:'',platforms:['ARM Linux','Steam'],notes:'当前已安装；具体版本待补充'}],
    'dev-ayn-thor':[
      {id:'env-thor-android',name:'Android',installed:false,version:'',platforms:['Android'],notes:'安装状态待确认'},
      {id:'env-thor-droiddeck',name:'DroidDeck',installed:false,version:'',platforms:['PC'],notes:'未假定已安装'},
      {id:'env-thor-armada',name:'Armada OS',installed:false,version:'',platforms:['ARM Linux','Steam'],notes:'未假定已安装'}
    ]
  };

  const achievementSeeds = [
    ['first-duty','首次值班','完成第一条有效游玩记录','🎮'],
    ['all-on-duty','全员出勤','当前轮次所有可用设备均完成出勤','✅'],
    ['rotation-tour','掌机巡礼','完成一次完整设备轮换','🧭'],
    ['one-device-one-game','一机一作','17 台设备分别至少通关一款游戏','🏆'],
    ['eras','跨越时代','通关来自 5 个不同发行平台的游戏','🕰️'],
    ['dual-screen','双屏专家','使用双屏设备通关 5 款不同游戏','👐'],
    ['arm-explorer','ARM探索者','使用 ARM 本地转译环境通关 3 款 PC 游戏','🧪'],
    ['square-world','方寸世界','使用方屏设备累计游玩 10 小时','◻️'],
    ['retro-master','复古大师','通关 10 款复古游戏','👾'],
    ['cloud-traveler','云端旅人','通过串流累计游玩 100 小时','☁️'],
    ['reunion','久别重逢','重新使用一台闲置超过 90 天的设备','🤝'],
    ['collector-traveler','收藏旅行家','累计使用 17 台不同设备游玩','🎒'],
    ['devoted','专情玩家','在同一款游戏累计游玩 50 小时','❤️'],
    ['full-roster','全制霸','全部 17 台初始设备均至少完成一次出勤','👑']
  ];

  let state;
  let activeView = 'overview';
  let timerTicker = null;
  let drawResult = null;
  let drawLocks = {device:false,game:false};

  const e = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  const isoNow = () => new Date().toISOString();
  const dateOnly = value => {
    const d = value ? new Date(value) : new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const addDays = (value, days) => { const d = new Date(`${dateOnly(value)}T12:00:00`); d.setDate(d.getDate()+days); return dateOnly(d); };
  const daysBetween = (a,b) => Math.max(0,Math.floor((new Date(`${dateOnly(b)}T12:00:00`)-new Date(`${dateOnly(a)}T12:00:00`))/DAY));
  const formatDate = value => value ? new Intl.DateTimeFormat('zh-CN',{month:'short',day:'numeric',year:'numeric'}).format(new Date(`${dateOnly(value)}T12:00:00`)) : '尚无记录';
  const formatMinutes = minutes => { const n=Math.max(0,Math.round(Number(minutes)||0)); return n<60?`${n} 分钟`:`${Math.floor(n/60)}小时${n%60?` ${n%60}分`:''}`; };
  const norm = value => String(value||'').toLowerCase().replace(/[·・:：_\s（）()《》-]/g,'');
  const currentWeekStart = () => { const d=new Date(); const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day); return dateOnly(d); };
  const gameRecords = () => typeof records !== 'undefined' && Array.isArray(records) ? records : [];
  const findGame = title => {
    const target=norm(title); if(!target) return null;
    return gameRecords().find(g=>norm(g.title)===target) || gameRecords().find(g=>norm(g.title).includes(target)||target.includes(norm(g.title))) || null;
  };
  const gameDisplay = ref => {
    const game = ref?.gameId ? gameRecords().find(g=>g.id===ref.gameId) : findGame(ref?.title);
    return {id:game?.id||ref?.gameId||'',title:game?.title||ref?.title||'未安排游戏',cover:game?.cover||'',platform:game?.platform||ref?.platform||'',status:game?.status||ref?.status||'',progress:ref?.progress||'',chapter:ref?.chapter||'',note:ref?.note||''};
  };

  function makeDevices(){
    return deviceSeeds.map((d,index)=>({
      id:d[0],name:d[1],brand:d[2],model:d[3],specifications:d[4],supportedPlatforms:d[5],dutyRoles:d[6],availabilityStatus:d[7]||'available',
      image:'',purchaseDate:'',purchasePrice:null,currency:'CNY',screen:'',color:'',specialEdition:'',operatingSystems:environmentSeeds[d[0]]||[],tags:[...d[5]],preferredPriority:50,
      paused:false,archived:false,sortOrder:index,notes:'',recommendations:(recommendationSeeds[d[0]]||[]).map((title,i)=>({slot:['main','backup','casual'][i],title,gameId:findGame(title)?.id||'',compatibility:'untested'})),
      createdAt:isoNow(),updatedAt:isoNow()
    }));
  }

  function makeSchedule(devices){
    const rows=[
      ['dev-rp-nova','dev-rg35xxsp'],['dev-rp-nova','dev-rgrotate'],['dev-ayn-thor','dev-rgdsplus'],['dev-ayn-thor','dev-gkd-mini'],
      ['dev-rg477m','dev-rg34xx'],['dev-rg477m','dev-aya-air-mini'],['dev-gcloud','dev-coolpad-square'],['dev-gcloud','dev-aya-kpa'],
      ['dev-rp-duo','dev-rp-duo-lite'],['dev-rp-duo','dev-ktr2'],['dev-rg55g1',null],['dev-rg55g1',null]
    ];
    const start=currentWeekStart(); const cycleId=uid('cycle'); const plans=[];
    rows.forEach((row,i)=>{
      const s=addDays(start,i*7), end=addDays(s,6), status=i===0?'active':'planned';
      plans.push({id:`plan-primary-${i+1}`,deviceId:row[0],role:'primary',cycleId,startDate:s,endDate:end,plannedGameId:'',plannedGameTitle:i<2?'空之轨迹2重制版':recommendationSeeds[row[0]]?.[0]||'',status,extensionCount:0,selectionReason:'初始化 12 周排班',actualStartDate:i===0?s:null,actualEndDate:null});
      if(row[1]) plans.push({id:`plan-portable-${i+1}`,deviceId:row[1],role:'portable',cycleId,startDate:s,endDate:end,plannedGameId:'',plannedGameTitle:recommendationSeeds[row[1]]?.[0]||'',status,extensionCount:0,selectionReason:'初始化 12 周排班',actualStartDate:i===0?s:null,actualEndDate:null});
    });
    return plans;
  }

  function initialState(){
    const devices=makeDevices();
    return {schemaVersion:SCHEMA_VERSION,devices,plans:makeSchedule(devices),sessions:[],performanceProfiles:[],maintenance:[],customAchievements:[],unlockedAchievements:{},timer:null,
      settings:{rotationMode:'dual',primaryDurationDays:14,portableDurationDays:7,minimumAttendanceMinutes:15,dualMode:true,cycleId:'cycle-initial',cycleStartDate:currentWeekStart(),timezone:'Asia/Hong_Kong',weights:{idle:35,cycle:25,unfinished:20,scene:10,preference:10}},
      createdAt:isoNow(),updatedAt:isoNow()};
  }

  function normalizeState(raw){
    const base=initialState(); if(!raw||typeof raw!=='object') return base;
    const merged={...base,...raw,settings:{...base.settings,...raw.settings,weights:{...base.settings.weights,...raw.settings?.weights}}};
    merged.devices=Array.isArray(raw.devices)&&raw.devices.length?raw.devices:base.devices;
    merged.plans=Array.isArray(raw.plans)?raw.plans:base.plans;
    ['sessions','performanceProfiles','maintenance','customAchievements'].forEach(k=>merged[k]=Array.isArray(raw[k])?raw[k]:[]);
    merged.unlockedAchievements=raw.unlockedAchievements&&typeof raw.unlockedAchievements==='object'?raw.unlockedAchievements:{};
    merged.schemaVersion=SCHEMA_VERSION;
    return merged;
  }

  function load(){
    try{ state=normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')); }
    catch{ state=initialState(); }
    evaluateAchievements(false); save(false);
  }
  function save(renderAfter=true){ state.updatedAt=isoNow(); localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); if(renderAfter) render(); }
  function device(id){ return state.devices.find(d=>d.id===id); }
  function sessionsFor(id){ return state.sessions.filter(s=>s.deviceId===id); }
  function validDevices(role){ return state.devices.filter(d=>!d.archived&&!d.paused&&d.availabilityStatus==='available'&&(!role||d.dutyRoles.includes(role))); }
  function activePlan(role){ const today=dateOnly(); return state.plans.find(p=>p.role===role&&p.status==='active'&&p.startDate<=today&&p.endDate>=today) || state.plans.find(p=>p.role===role&&p.status==='active') || null; }
  function sessionMinutes(id){ return sessionsFor(id).reduce((n,s)=>n+(Number(s.durationMinutes)||0),0); }
  function lastSession(id){ return sessionsFor(id).sort((a,b)=>String(b.startedAt).localeCompare(String(a.startedAt)))[0]||null; }
  function idleDays(id){ const last=lastSession(id); return last?daysBetween(last.startedAt,new Date()):Infinity; }
  function deviceStatus(id){ const d=device(id); if(d?.archived)return'archived'; if(d?.availabilityStatus==='maintenance')return'maintenance'; if(d?.availabilityStatus!=='available')return'unavailable'; if(activePlan('primary')?.deviceId===id)return'primary'; if(activePlan('portable')?.deviceId===id)return'portable'; const idle=idleDays(id); return idle===Infinity||idle>60?'idle':'waiting'; }
  function deviceStatusLabel(id){ return ({primary:'主力值班',portable:'随身值班',waiting:'等待轮换',idle:'长期闲置',unavailable:'暂不可用',maintenance:'维护中',archived:'已归档'})[deviceStatus(id)]||'等待轮换'; }
  function planMinutes(plan){ return plan?state.sessions.filter(s=>s.dutyPlanId===plan.id).reduce((n,s)=>n+(Number(s.durationMinutes)||0),0):0; }

  function evaluateAchievements(notify=true){
    const now=isoNow(), valid=state.devices.filter(d=>!d.archived), used=new Set(state.sessions.filter(s=>s.durationMinutes>0).map(s=>s.deviceId));
    const completed=new Set(state.sessions.filter(s=>s.completed).map(s=>s.deviceId));
    const unlock=(id,condition)=>{if(condition&&!state.unlockedAchievements[id]){state.unlockedAchievements[id]=now;if(notify)toast(`成就解锁：${achievementSeeds.find(a=>a[0]===id)?.[1]||id}`)}};
    unlock('first-duty',state.sessions.some(s=>Number(s.durationMinutes)>=state.settings.minimumAttendanceMinutes));
    unlock('all-on-duty',validDevices().every(d=>used.has(d.id))&&validDevices().length>0);
    unlock('rotation-tour',validDevices().every(d=>used.has(d.id))&&validDevices().length>0);
    unlock('one-device-one-game',completed.size>=17);
    unlock('collector-traveler',used.size>=17);
    unlock('full-roster',deviceSeeds.every(seed=>used.has(seed[0])));
    const totals={}; state.sessions.forEach(s=>{const key=s.gameId||s.gameTitle||'';totals[key]=(totals[key]||0)+(Number(s.durationMinutes)||0)}); unlock('devoted',Object.values(totals).some(n=>n>=3000));
    unlock('square-world',state.sessions.filter(s=>s.deviceId==='dev-rgrotate').reduce((n,s)=>n+(Number(s.durationMinutes)||0),0)>=600);
    unlock('cloud-traveler',state.sessions.filter(s=>s.runMethod==='streaming').reduce((n,s)=>n+(Number(s.durationMinutes)||0),0)>=6000);
    unlock('reunion',state.sessions.some(s=>s.idleDaysBefore>=90));
  }

  function header(title,subtitle){return `<div class="panel dr-head"><div><span class="dr-kicker">HANDHELD DUTY ROOM</span><h2>${e(title)}</h2><p>${e(subtitle)}</p></div><div class="dr-head-actions"><button onclick="DutyRoom.quickLog()">＋ 快速记录</button><button class="dr-primary" onclick="DutyRoom.startTimer()">▶ 开始游玩</button></div></div>`;}
  function shell(content){return `<div class="dr-shell"><aside class="dr-rail"><div class="dr-brand"><b>掌机值班室</b><span>每一台掌机，都值得被打开。</span></div>${views.map(([id,label])=>`<button class="dr-nav ${activeView===id?'active':''}" onclick="DutyRoom.view('${id}')">${e(label)}</button>`).join('')}</aside><main class="dr-main">${content}</main></div>`;}
  function deviceVisual(d,small=false){const style=d?.image?` style="background-image:url('${String(d.image).replace(/'/g,'%27')}')"`:'';return `<div class="${small?'dr-wall-img':'dr-device-visual'} ${d?.image?'has-image':''}"${style}><span>${d?.image?'':e((d?.name||'?').slice(0,2))}</span></div>`;}
  function currentGame(plan,d){ const ref={gameId:plan?.plannedGameId,title:plan?.plannedGameTitle||d?.recommendations?.[0]?.title,progress:plan?.progress,chapter:plan?.chapter,note:plan?.lastNote}; return gameDisplay(ref); }
  function dutyCard(role){
    const plan=activePlan(role), d=plan&&device(plan.deviceId), game=currentGame(plan,d), mins=planMinutes(plan), target=state.settings.minimumAttendanceMinutes, pct=Math.min(100,Math.round(mins/Math.max(1,target)*100));
    if(!plan||!d)return `<article class="dr-card"><span class="dr-role ${role}">${role==='primary'?'主力值班':'随身值班'}</span><h3>当前没有设备</h3><p>可从排班或智能推荐中选择一台设备。</p><button onclick="DutyRoom.recommend('${role}')">智能安排</button></article>`;
    const remaining=Math.max(0,daysBetween(new Date(),plan.endDate)+1);
    return `<article class="dr-card dr-duty">${deviceVisual(d)}<div><span class="dr-role ${role}">${role==='primary'?'主力值班':'随身值班'}</span><h3>${e(d.name)}</h3><div class="dr-duty-meta">${e(currentEnvironment(d))} · ${formatDate(plan.startDate)}—${formatDate(plan.endDate)} · 剩余 ${remaining} 天</div><div class="dr-game"><div class="dr-game-cover"${game.cover?` style="background-image:url('${String(game.cover).replace(/'/g,'%27')}')"`:''}></div><div><b>${e(game.title)}</b><small>${e(game.chapter||game.progress||game.status||'进度待补充')}</small></div></div><div class="dr-progress"><span style="width:${pct}%"></span></div><div class="dr-duty-meta">本轮 ${formatMinutes(mins)} · ${mins>=target?'已完成出勤':'还需 '+formatMinutes(target-mins)}</div><div class="dr-actions"><button class="dr-primary" onclick="DutyRoom.startTimer('${d.id}','${game.id}')">开始游玩</button><button onclick="DutyRoom.quickLog('${d.id}','${game.id}')">快速记录</button><button onclick="DutyRoom.extend('${plan.id}',3)">延长 3 天</button><button onclick="DutyRoom.handover('${plan.id}')">提前交班</button><button onclick="DutyRoom.swap('${role}')">临时换机</button></div></div></article>`;
  }
  function currentEnvironment(d){const installed=(d?.operatingSystems||[]).find(x=>x.installed);return installed?.name||'运行环境待配置';}

  function renderTimer(){
    if(!state.timer)return''; const t=state.timer,d=device(t.deviceId),g=gameDisplay({gameId:t.gameId,title:t.gameTitle});
    return `<div class="dr-timer"><div class="dr-timer-time" id="drTimerClock">${timerText()}</div><div class="dr-timer-info"><b>${e(g.title)} · ${e(d?.name||'未知设备')}</b><span>${t.pausedAt?'计时已暂停':'计时进行中，刷新页面也不会丢失'}</span></div><div class="dr-actions"><button onclick="DutyRoom.toggleTimerPause()">${t.pausedAt?'继续':'暂停'}</button><button class="dr-primary" onclick="DutyRoom.stopTimer()">结束并记录</button><button class="dr-danger" onclick="DutyRoom.cancelTimer()">取消</button></div></div>`;
  }
  function elapsedTimerMs(){if(!state.timer)return 0;const end=state.timer.pausedAt?new Date(state.timer.pausedAt).getTime():Date.now();return (state.timer.accumulatedMs||0)+Math.max(0,end-new Date(state.timer.startedAt).getTime());}
  function timerText(){const sec=Math.floor(elapsedTimerMs()/1000),h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return [h,m,s].map(n=>String(n).padStart(2,'0')).join(':');}

  function overview(){
    const available=validDevices().length,totalMinutes=state.sessions.reduce((n,s)=>n+(Number(s.durationMinutes)||0),0),weekStart=currentWeekStart(),weekMinutes=state.sessions.filter(s=>dateOnly(s.startedAt)>=weekStart).reduce((n,s)=>n+(Number(s.durationMinutes)||0),0),used=new Set(state.sessions.map(s=>s.deviceId)),coverage=available?Math.round(validDevices().filter(d=>used.has(d.id)).length/available*100):0;
    const longest=validDevices().sort((a,b)=>idleDays(b.id)-idleDays(a.id))[0], next=state.plans.filter(p=>p.status==='planned').sort((a,b)=>a.startDate.localeCompare(b.startDate))[0];
    return header('值班指挥中心','10 秒内决定今天玩哪台掌机、玩什么，以及谁该接下一班。')+renderTimer()+`<div class="dr-grid two">${dutyCard('primary')}${state.settings.dualMode?dutyCard('portable'):''}</div><div class="dr-grid four"><div class="dr-card dr-stat"><span class="dr-stat-icon">▣</span><strong>${state.devices.filter(d=>!d.archived).length}</strong><span>收藏设备</span></div><div class="dr-card dr-stat"><span class="dr-stat-icon">✓</span><strong>${available}</strong><span>当前可用</span></div><div class="dr-card dr-stat"><span class="dr-stat-icon">◷</span><strong>${formatMinutes(weekMinutes)}</strong><span>本周游玩</span></div><div class="dr-card dr-stat"><span class="dr-stat-icon">◎</span><strong>${coverage}%</strong><span>本轮覆盖率</span></div></div><div class="dr-section-title"><div><h3>17 台掌机考勤墙</h3><p>状态来自实际排班和游玩记录，不把计划当成出勤。</p></div><button onclick="DutyRoom.view('devices')">管理设备</button></div><div class="dr-wall">${state.devices.sort((a,b)=>a.sortOrder-b.sortOrder).map(wallItem).join('')}</div><div class="dr-grid three"><div class="dr-card"><h3>下一台轮换</h3><p>${next?`${e(device(next.deviceId)?.name||'自由返场')} · ${formatDate(next.startDate)}`:'尚无未来排班'}</p><button onclick="DutyRoom.view('schedule')">查看排班</button></div><div class="dr-card"><h3>最久未使用</h3><p>${longest?`${e(longest.name)} · ${idleDays(longest.id)===Infinity?'从未记录':idleDays(longest.id)+' 天'}`:'暂无'}</p><button onclick="DutyRoom.recommend('portable')">生成唤醒建议</button></div><div class="dr-card"><h3>今晚玩什么</h3><p>按可用时间、场景和闲置程度抽取真实可运行组合。</p><button class="dr-primary" onclick="DutyRoom.view('random')">开始抽签</button></div></div>`;
  }
  function wallItem(d){const idle=idleDays(d.id);return `<button class="dr-wall-item" onclick="DutyRoom.deviceDetail('${d.id}')"><span class="dr-dot ${deviceStatus(d.id)}"></span>${deviceVisual(d,true)}<b>${e(d.name)}</b><small>${e(deviceStatusLabel(d.id))} · ${idle===Infinity?'尚无游玩':idle+'天前'}</small></button>`;}

  function devicesView(){return header('掌机收藏','17 台初始设备均拥有稳定 ID；支持编辑、停用、恢复、归档和自定义排序。')+`<div class="dr-section-title"><div><h3>设备档案</h3><p>未知参数保持待补充，不根据型号自行猜测。</p></div><button class="dr-primary" onclick="DutyRoom.editDevice()">＋ 新增设备</button></div><div class="dr-device-list">${state.devices.sort((a,b)=>a.sortOrder-b.sortOrder).map(deviceCard).join('')}</div>`;}
  function deviceCard(d){const s=sessionsFor(d.id),mins=sessionMinutes(d.id),last=lastSession(d.id);return `<article class="dr-card dr-device-card"><div class="dr-device-banner"${d.image?` style="background-image:url('${String(d.image).replace(/'/g,'%27')}')"`:''}><h3>${e(d.name)}</h3></div><div class="dr-device-body"><div class="dr-chips"><span class="dr-chip ${d.availabilityStatus==='available'?'good':'warn'}">${e(deviceStatusLabel(d.id))}</span>${(d.dutyRoles||[]).map(r=>`<span class="dr-chip">${r==='primary'?'主力候选':'随身候选'}</span>`).join('')}</div><div class="dr-help">${e(d.specifications||'配置待补充')}</div><div class="dr-chips">${(d.supportedPlatforms||[]).map(x=>`<span class="dr-chip">${e(x)}</span>`).join('')}</div><div class="dr-device-kpis"><div><b>${formatMinutes(mins)}</b><span>累计时长</span></div><div><b>${s.length}</b><span>游玩次数</span></div><div><b>${last?formatDate(last.startedAt):'—'}</b><span>最近游玩</span></div></div><div class="dr-actions"><button onclick="DutyRoom.deviceDetail('${d.id}')">查看档案</button><button onclick="DutyRoom.editDevice('${d.id}')">编辑</button><button onclick="DutyRoom.moveDevice('${d.id}',-1)">↑</button><button onclick="DutyRoom.moveDevice('${d.id}',1)">↓</button></div></div></article>`;}

  function scheduleView(){const weeks=[...new Set(state.plans.map(p=>p.startDate))].sort();return header('值班日历','计划与实际游玩分开记录；调整未来排班不会覆盖历史。')+`<div class="dr-card"><div class="dr-actions"><button onclick="DutyRoom.recommend('primary')">智能安排主力</button><button onclick="DutyRoom.recommend('portable')">智能安排随身</button><button onclick="DutyRoom.exportIcs()">导出 ICS</button><button onclick="DutyRoom.pauseRotation()">${state.settings.rotationPaused?'恢复轮换':'暂停轮换'}</button></div></div><div class="dr-calendar">${weeks.map((start,i)=>{const ps=state.plans.filter(p=>p.startDate===start),cur=ps.some(p=>p.status==='active');return `<div class="dr-week ${cur?'current':''}"><span>第 ${i+1} 周 · ${formatDate(start)}</span>${ps.map(p=>`<b class="${p.role==='portable'?'portable':''}">${p.role==='primary'?'主力':'随身'}：${e(device(p.deviceId)?.name||'自由返场')}</b><small>${e(p.plannedGameTitle||'游戏自由选择')} · ${e(p.status)}</small>`).join('')}</div>`}).join('')}</div><div class="dr-card"><div class="dr-table-wrap"><table class="dr-table"><thead><tr><th>时间</th><th>岗位</th><th>设备</th><th>游戏</th><th>状态</th><th>操作</th></tr></thead><tbody>${state.plans.sort((a,b)=>a.startDate.localeCompare(b.startDate)).map(p=>`<tr><td>${formatDate(p.startDate)}<small> 至 ${formatDate(p.endDate)}</small></td><td>${p.role==='primary'?'主力':'随身'}</td><td><b>${e(device(p.deviceId)?.name||'自由返场')}</b></td><td>${e(p.plannedGameTitle||'自由选择')}</td><td>${e(p.status)}</td><td><button onclick="DutyRoom.editPlan('${p.id}')">调整</button></td></tr>`).join('')}</tbody></table></div></div>`;}

  function randomView(){return header('今晚玩什么','先过滤不可用组合，再按闲置时间和轮换优先级加权抽取。')+`<div class="dr-grid two"><div class="dr-card"><div class="dr-filter-grid"><label>可用时间<select id="drDrawTime"><option value="15">15 分钟</option><option value="30">30 分钟</option><option value="60" selected>1 小时</option><option value="120">2 小时</option><option value="0">不限时间</option></select></label><label>使用场景<select id="drDrawScene"><option value="home">在家</option><option value="commute">通勤</option><option value="outside">外出</option><option value="bed">睡前</option><option value="offline">网络不佳</option><option value="modern">想玩现代 PC 游戏</option><option value="retro">想玩复古游戏</option></select></label><label>抽取方式<select id="drDrawMode"><option value="both">设备＋游戏</option><option value="device">只抽设备</option><option value="game">只抽游戏</option><option value="idle">长期闲置设备</option></select></label></div><div class="dr-actions"><button class="dr-primary" onclick="DutyRoom.draw()">洗牌并抽取</button><button onclick="DutyRoom.draw(true)">重新抽取</button></div><p class="dr-help">维护中、暂不可用、已归档和已占用另一岗位的设备会先被排除。网络不佳时降低串流设备优先级，但不强制排除其本地游戏。</p></div><div class="dr-draw-stage">${drawResult?drawResultHtml():`<div><div class="emoji">🎲</div><h3>还没有抽签</h3><p>选择时间和场景，让值班室帮你减少选择成本。</p></div>`}</div></div>`;}
  function drawResultHtml(){const d=device(drawResult.deviceId),g=gameDisplay({gameId:drawResult.gameId,title:drawResult.gameTitle});return `<div><div class="emoji">${d?.image?'🎮':'🕹️'}</div><h3>${e(d?.name||'未锁定设备')}</h3><p>${e(g.title)}<br>${e(drawResult.reason)}</p><div class="dr-actions"><button onclick="DutyRoom.toggleDrawLock('device')">${drawLocks.device?'🔒':'🔓'} 锁定设备</button><button onclick="DutyRoom.toggleDrawLock('game')">${drawLocks.game?'🔒':'🔓'} 锁定游戏</button><button class="dr-primary" onclick="DutyRoom.acceptDraw()">设为当前值班</button></div></div>`;}

  function sessionsView(){return header('游玩记录','只有保存了有效游玩记录，设备才算真正出勤。')+renderTimer()+`<div class="dr-card"><div class="dr-actions"><button class="dr-primary" onclick="DutyRoom.quickLog()">＋ 新增记录</button><button onclick="DutyRoom.startTimer()">开始计时</button></div></div><div class="dr-card"><div class="dr-table-wrap"><table class="dr-table"><thead><tr><th>时间</th><th>设备</th><th>游戏</th><th>时长</th><th>进度/备注</th><th>操作</th></tr></thead><tbody>${state.sessions.sort((a,b)=>String(b.startedAt).localeCompare(String(a.startedAt))).map(s=>`<tr><td>${formatDate(s.startedAt)}</td><td><b>${e(device(s.deviceId)?.name||'未知设备')}</b><small>${e(s.environmentName||'环境未记录')}</small></td><td><b>${e(gameDisplay({gameId:s.gameId,title:s.gameTitle}).title)}</b><small>${e(s.releasePlatform||'发行平台未记录')}</small></td><td>${formatMinutes(s.durationMinutes)}</td><td>${e(s.chapter||s.progress||s.notes||'—')}</td><td><button onclick="DutyRoom.editSession('${s.id}')">编辑</button> <button class="dr-danger" onclick="DutyRoom.deleteSession('${s.id}')">删除</button></td></tr>`).join('')||'<tr><td colspan="6" class="dr-empty">还没有游玩记录</td></tr>'}</tbody></table></div></div>`;}

  function performanceView(){return header('性能档案','每条记录对应“游戏 × 设备 × 运行环境”，不根据芯片臆测兼容性。')+`<div class="dr-card"><div class="dr-actions"><button class="dr-primary" onclick="DutyRoom.editPerformance()">＋ 新增测试档案</button></div></div><div class="dr-card"><div class="dr-table-wrap"><table class="dr-table"><thead><tr><th>组合</th><th>软件栈</th><th>性能</th><th>综合状态</th><th>问题/建议</th><th>操作</th></tr></thead><tbody>${state.performanceProfiles.map(p=>`<tr><td><b>${e(p.gameTitle)}</b><small>${e(device(p.deviceId)?.name||'未知设备')} · ${e(p.environmentName||'环境待补')}</small></td><td>${e([p.osVersion,p.emulatorVersion,p.protonVersion,p.gpuDriver].filter(Boolean).join(' / ')||'待补充')}</td><td>${e(p.resolution||'—')} · ${p.averageFps?e(p.averageFps)+' FPS':'帧率待补'}</td><td>${e(compatibilityLabel(p.compatibilityStatus))}</td><td>${e(p.issues||p.recommendedConfig||'—')}</td><td><button onclick="DutyRoom.editPerformance('${p.id}')">编辑</button></td></tr>`).join('')||'<tr><td colspan="6" class="dr-empty">还没有性能测试档案</td></tr>'}</tbody></table></div></div>`;}
  function compatibilityLabel(v){return ({untested:'未测试',fail:'无法运行',launch:'可以启动',playable:'可以游玩',smooth:'流畅运行',perfect:'完美运行'})[v]||'未测试';}

  function statsView(){
    const rows=state.devices.map(d=>({d,mins:sessionMinutes(d.id),count:sessionsFor(d.id).length})).sort((a,b)=>b.mins-a.mins),max=Math.max(1,...rows.map(r=>r.mins)),total=rows.reduce((n,r)=>n+r.mins,0),used=rows.filter(r=>r.count).length;
    return header('统计报告','所有统计均从真实游玩记录派生，不重复存储累计值。')+`<div class="dr-grid four"><div class="dr-card dr-stat"><strong>${formatMinutes(total)}</strong><span>累计游玩</span></div><div class="dr-card dr-stat"><strong>${state.sessions.length}</strong><span>游玩次数</span></div><div class="dr-card dr-stat"><strong>${used}</strong><span>使用过的设备</span></div><div class="dr-card dr-stat"><strong>${Math.round(used/Math.max(1,validDevices().length)*100)}%</strong><span>可用设备覆盖率</span></div></div><div class="dr-grid two"><div class="dr-card"><h3>设备游玩时长</h3><div class="dr-bars">${rows.map(r=>`<div class="dr-bar-row"><span>${e(r.d.name)}</span><div class="dr-bar-track"><i style="width:${Math.round(r.mins/max*100)}%"></i></div><b>${formatMinutes(r.mins)}</b></div>`).join('')}</div></div><div class="dr-card"><h3>设备闲置天数</h3><div class="dr-bars">${[...rows].sort((a,b)=>idleDays(b.d.id)-idleDays(a.d.id)).map(r=>{const idle=idleDays(r.d.id),v=idle===Infinity?100:Math.min(100,idle/90*100);return `<div class="dr-bar-row"><span>${e(r.d.name)}</span><div class="dr-bar-track"><i style="width:${v}%"></i></div><b>${idle===Infinity?'从未':idle+' 天'}</b></div>`}).join('')}</div></div></div><div class="dr-card"><h3>年度报告</h3><p>可以导出包含年度最常用设备、总时长、覆盖率和新增设备的文本报告。分享图片将在有足够真实数据后生成，避免用虚构内容填充。</p><button onclick="DutyRoom.exportAnnualReport()">导出 ${new Date().getFullYear()} 年度报告</button></div>`;
  }

  function achievementsView(){const all=[...achievementSeeds,...state.customAchievements.map(a=>[a.id,a.name,a.description,a.icon||'⭐'])];return header('收藏成就','成就只依据真实记录自动解锁；新增设备不会撤销历史成就。')+`<div class="dr-achievements">${all.map(a=>{const unlocked=state.unlockedAchievements[a[0]];return `<div class="dr-achievement ${unlocked?'unlocked':''}"><div class="icon">${e(a[3])}</div><b>${e(a[1])}</b><span>${e(a[2])}</span>${unlocked?`<time>解锁于 ${formatDate(unlocked)}</time>`:'<time>尚未解锁</time>'}</div>`}).join('')}</div><div class="dr-card"><button onclick="DutyRoom.addAchievement()">＋ 新增自定义成就</button></div>`;}

  function maintenanceView(){const due=state.devices.filter(d=>maintenanceDue(d.id));return header('维护中心','维护与游戏出勤分开管理；首版在打开页面时检查到期任务。')+`<div class="dr-grid two"><div class="dr-card"><h3>待维护设备</h3>${due.length?due.map(d=>`<div class="row"><span>${e(d.name)}</span><b>${e(maintenanceDue(d.id))}</b></div>`).join(''):'<p>当前没有到期提醒。</p>'}</div><div class="dr-card"><h3>维护原则</h3><p>长期闲置设备每 60 天提醒检查电池。维护记录不会替代实际游玩日期，也不会计入出勤。</p><button class="dr-primary" onclick="DutyRoom.addMaintenance()">记录维护</button></div></div><div class="dr-card"><div class="dr-table-wrap"><table class="dr-table"><thead><tr><th>日期</th><th>设备</th><th>类型</th><th>下次到期</th><th>电量</th><th>备注</th></tr></thead><tbody>${state.maintenance.sort((a,b)=>String(b.completedAt).localeCompare(String(a.completedAt))).map(m=>`<tr><td>${formatDate(m.completedAt)}</td><td>${e(device(m.deviceId)?.name||'未知')}</td><td>${e(m.maintenanceType)}</td><td>${m.nextDueAt?formatDate(m.nextDueAt):'—'}</td><td>${m.batteryLevel!==''&&m.batteryLevel!=null?e(m.batteryLevel)+'%':'—'}</td><td>${e(m.notes||'—')}</td></tr>`).join('')||'<tr><td colspan="6" class="dr-empty">还没有维护记录</td></tr>'}</tbody></table></div></div>`;}
  function maintenanceDue(id){const d=device(id);if(!d||d.archived)return'';const items=state.maintenance.filter(m=>m.deviceId===id).sort((a,b)=>String(b.completedAt).localeCompare(String(a.completedAt))),last=items[0];if(last?.nextDueAt&&last.nextDueAt<=dateOnly())return'维护已到期';if(!last&&idleDays(id)>60)return'检查电池';return'';}

  function settingsView(){const w=state.settings.weights;return header('值班室设置','轮换规则、算法权重和数据均保存在当前浏览器。')+`<form class="dr-card dr-form" onsubmit="DutyRoom.saveSettings(event)"><label>轮换模式<select name="rotationMode"><option value="dual" ${state.settings.rotationMode==='dual'?'selected':''}>双轨轮换</option><option value="fixed" ${state.settings.rotationMode==='fixed'?'selected':''}>固定周期</option><option value="game" ${state.settings.rotationMode==='game'?'selected':''}>游戏驱动</option><option value="random" ${state.settings.rotationMode==='random'?'selected':''}>随机抽签</option><option value="free" ${state.settings.rotationMode==='free'?'selected':''}>自由模式</option></select></label><label>最低出勤分钟<input name="minimumAttendanceMinutes" type="number" min="1" value="${e(state.settings.minimumAttendanceMinutes)}"></label><label>主力周期（天）<input name="primaryDurationDays" type="number" min="1" value="${e(state.settings.primaryDurationDays)}"></label><label>随身周期（天）<input name="portableDurationDays" type="number" min="1" value="${e(state.settings.portableDurationDays)}"></label><label>闲置权重 %<input name="weightIdle" type="number" min="0" value="${e(w.idle)}"></label><label>本轮未使用权重 %<input name="weightCycle" type="number" min="0" value="${e(w.cycle)}"></label><label>未完成游戏权重 %<input name="weightUnfinished" type="number" min="0" value="${e(w.unfinished)}"></label><label>场景权重 %<input name="weightScene" type="number" min="0" value="${e(w.scene)}"></label><label>个人优先级权重 %<input name="weightPreference" type="number" min="0" value="${e(w.preference)}"></label><label class="dr-check"><input name="dualMode" type="checkbox" ${state.settings.dualMode?'checked':''}><span>启用双设备模式</span></label><div class="dr-form-actions"><button class="dr-primary">保存设置</button></div></form><div class="dr-grid two"><div class="dr-card"><h3>备份与恢复</h3><p>导出包含设备、排班、游玩、性能、成就和维护资料；不会修改原有游戏生涯记录。</p><div class="dr-actions"><button onclick="DutyRoom.exportData()">导出 JSON</button><label class="file-button">导入并合并<input type="file" accept="application/json,.json" onchange="DutyRoom.importData(event)"></label></div></div><div class="dr-card"><h3>危险操作</h3><p>重置排班会保留历史游玩记录；完全重置只清除值班室数据，不影响原有游戏生涯。</p><div class="dr-actions"><button onclick="DutyRoom.resetSchedule()">重置排班</button><button class="dr-danger" onclick="DutyRoom.resetAll()">完全重置值班室</button></div></div></div>`;}

  function render(){
    const mount=document.getElementById('dutyRoomApp'); if(!mount)return;
    evaluateAchievements(false);
    const map={overview,devices:devicesView,schedule:scheduleView,random:randomView,sessions:sessionsView,performance:performanceView,stats:statsView,achievements:achievementsView,maintenance:maintenanceView,settings:settingsView};
    mount.innerHTML=shell((map[activeView]||overview)()); tickTimer();
  }

  function modal(title,body){closeModal();const wrap=document.createElement('div');wrap.id='drModal';wrap.className='dr-modal-backdrop';wrap.innerHTML=`<div class="dr-modal" role="dialog" aria-modal="true"><div class="dr-modal-head"><h3>${e(title)}</h3><button onclick="DutyRoom.closeModal()">✕</button></div><div class="dr-modal-body">${body}</div></div>`;wrap.addEventListener('click',ev=>{if(ev.target===wrap)closeModal()});document.body.appendChild(wrap);setTimeout(()=>wrap.querySelector('input,select,textarea,button')?.focus(),0);}
  function closeModal(){document.getElementById('drModal')?.remove();}
  function toast(message){document.querySelector('.dr-toast')?.remove();const el=document.createElement('div');el.className='dr-toast';el.textContent=message;document.body.appendChild(el);setTimeout(()=>el.remove(),2800);}
  function optionsDevices(selected='',role=''){return validDevices(role).map(d=>`<option value="${d.id}" ${selected===d.id?'selected':''}>${e(d.name)}</option>`).join('');}
  function optionsGames(selected='',title=''){const list=gameRecords().filter(g=>!['待发售'].includes(g.status));return `<option value="">使用手动标题</option>`+list.map(g=>`<option value="${e(g.id)}" data-title="${e(g.title)}" ${selected===g.id||(!selected&&title===g.title)?'selected':''}>${e(g.title)} · ${e(g.platform||'')}</option>`).join('');}

  function quickLog(deviceId='',gameId='',existingId=''){
    const old=existingId?state.sessions.find(s=>s.id===existingId):null,plan=activePlan('primary')?.deviceId===deviceId?activePlan('primary'):activePlan('portable')?.deviceId===deviceId?activePlan('portable'):null,did=old?.deviceId||deviceId||activePlan('primary')?.deviceId||validDevices()[0]?.id||'',gid=old?.gameId||gameId||'',gt=old?.gameTitle||gameDisplay({gameId:gid,title:plan?.plannedGameTitle}).title;
    modal(old?'编辑游玩记录':'快速游玩记录',`<form class="dr-form" onsubmit="DutyRoom.submitSession(event,'${e(old?.id||'')}')"><label>设备<select name="deviceId" required>${optionsDevices(did)}</select></label><label>已有游戏<select name="gameId">${optionsGames(gid,gt)}</select></label><label class="full">游戏名称（未关联游戏库时使用）<input name="gameTitle" value="${e(gt==='未安排游戏'?'':gt)}" placeholder="不会自动创建第二份游戏记录"></label><label>运行环境<input name="environmentName" value="${e(old?.environmentName||currentEnvironment(device(did)))}"></label><label>运行方式<select name="runMethod"><option value="local">本地运行</option><option value="emulator" ${old?.runMethod==='emulator'?'selected':''}>模拟器</option><option value="arm-linux" ${old?.runMethod==='arm-linux'?'selected':''}>ARM Linux</option><option value="streaming" ${old?.runMethod==='streaming'?'selected':''}>串流</option></select></label><label>游玩日期<input name="startedAt" type="date" value="${e(dateOnly(old?.startedAt||new Date()))}"></label><label>时长（分钟）<input name="durationMinutes" type="number" min="1" value="${e(old?.durationMinutes||30)}" required></label><label>进度百分比<input name="progressPercent" type="number" min="0" max="100" value="${e(old?.progressPercent??'')}"></label><label>当前章节<input name="chapter" value="${e(old?.chapter||'')}"></label><label>发行平台<input name="releasePlatform" value="${e(old?.releasePlatform||'')}"></label><label>存档状态<select name="syncStatus"><option>仅本机存档</option><option ${old?.syncStatus==='已手动备份'?'selected':''}>已手动备份</option><option ${old?.syncStatus==='已同步'?'selected':''}>已同步</option><option ${old?.syncStatus==='待同步'?'selected':''}>待同步</option><option ${old?.syncStatus==='同步冲突'?'selected':''}>同步冲突</option><option ${old?.syncStatus==='不支持跨设备'?'selected':''}>不支持跨设备</option></select></label><label class="dr-check"><input name="completed" type="checkbox" ${old?.completed?'checked':''}><span>本次完成通关</span></label><label class="full">备注 / 下次要做什么<textarea name="notes">${e(old?.notes||'')}</textarea></label><div class="dr-form-actions"><button type="button" onclick="DutyRoom.closeModal()">取消</button><button class="dr-primary">保存记录</button></div></form>`);
  }
  function submitSession(ev,id){ev.preventDefault();const fd=new FormData(ev.target),did=fd.get('deviceId'),gid=fd.get('gameId'),g=gameDisplay({gameId:gid,title:fd.get('gameTitle')}),existing=id&&state.sessions.find(s=>s.id===id),plan=[activePlan('primary'),activePlan('portable')].find(p=>p?.deviceId===did);const entry={id:id||uid('session'),deviceId:did,gameId:gid||g.id||'',gameTitle:g.title,environmentName:fd.get('environmentName'),runMethod:fd.get('runMethod'),releasePlatform:fd.get('releasePlatform'),dutyPlanId:existing?.dutyPlanId||plan?.id||'',startedAt:`${fd.get('startedAt')}T12:00:00`,endedAt:isoNow(),durationMinutes:Number(fd.get('durationMinutes'))||0,progressPercent:fd.get('progressPercent')===''?null:Number(fd.get('progressPercent')),progress:fd.get('progressPercent')?`${fd.get('progressPercent')}%`:'',chapter:fd.get('chapter'),notes:fd.get('notes'),syncStatus:fd.get('syncStatus'),completed:fd.get('completed')==='on',idleDaysBefore:existing?.idleDaysBefore??idleDays(did),createdAt:existing?.createdAt||isoNow(),updatedAt:isoNow()};if(id)state.sessions=state.sessions.map(s=>s.id===id?entry:s);else state.sessions.push(entry);if(plan&&planMinutes(plan)>=state.settings.minimumAttendanceMinutes)plan.attendedAt=isoNow();evaluateAchievements(true);save();closeModal();toast('游玩记录已保存');}

  function startTimer(deviceId='',gameId=''){
    if(state.timer){activeView='sessions';render();return;}
    const did=deviceId||activePlan('primary')?.deviceId||validDevices()[0]?.id||'',plan=[activePlan('primary'),activePlan('portable')].find(p=>p?.deviceId===did),gt=currentGame(plan,device(did)).title;
    modal('开始游玩计时',`<form class="dr-form" onsubmit="DutyRoom.submitTimer(event)"><label>设备<select name="deviceId" required>${optionsDevices(did)}</select></label><label>游戏<select name="gameId">${optionsGames(gameId,gt)}</select></label><label class="full">游戏名称<input name="gameTitle" value="${e(gt==='未安排游戏'?'':gt)}"></label><div class="dr-form-actions"><button type="button" onclick="DutyRoom.closeModal()">取消</button><button class="dr-primary">开始计时</button></div></form>`);
  }
  function submitTimer(ev){ev.preventDefault();const fd=new FormData(ev.target),g=gameDisplay({gameId:fd.get('gameId'),title:fd.get('gameTitle')});state.timer={deviceId:fd.get('deviceId'),gameId:fd.get('gameId')||g.id||'',gameTitle:g.title,startedAt:isoNow(),accumulatedMs:0,pausedAt:null};save();closeModal();toast('游玩计时已开始');}
  function toggleTimerPause(){if(!state.timer)return;if(state.timer.pausedAt){state.timer.startedAt=isoNow();state.timer.pausedAt=null}else{state.timer.accumulatedMs=elapsedTimerMs();state.timer.pausedAt=isoNow()}save();}
  function stopTimer(){if(!state.timer)return;const duration=Math.max(1,Math.round(elapsedTimerMs()/MINUTE)),t={...state.timer};state.timer=null;save(false);quickLog(t.deviceId,t.gameId);const input=document.querySelector('#drModal [name="durationMinutes"]');if(input)input.value=duration;const title=document.querySelector('#drModal [name="gameTitle"]');if(title&&!title.value)title.value=t.gameTitle;}
  function cancelTimer(){if(!state.timer||!confirm('取消当前计时？这段时间不会保存。'))return;state.timer=null;save();}
  function tickTimer(){clearInterval(timerTicker);if(!state.timer)return;timerTicker=setInterval(()=>{const el=document.getElementById('drTimerClock');if(el)el.textContent=timerText()},1000);}

  function editDevice(id=''){const d=id?device(id):null;modal(d?'编辑设备':'新增设备',`<form class="dr-form" onsubmit="DutyRoom.submitDevice(event,'${e(id)}')"><label>设备名称<input name="name" required value="${e(d?.name||'')}"></label><label>品牌<input name="brand" value="${e(d?.brand||'')}"></label><label>型号<input name="model" value="${e(d?.model||'')}"></label><label>状态<select name="availabilityStatus"><option value="available" ${d?.availabilityStatus==='available'?'selected':''}>可用</option><option value="unavailable" ${d?.availabilityStatus==='unavailable'?'selected':''}>暂不可用</option><option value="maintenance" ${d?.availabilityStatus==='maintenance'?'selected':''}>维护中</option><option value="sold" ${d?.availabilityStatus==='sold'?'selected':''}>已出售</option></select></label><label class="full">配置与存储<input name="specifications" value="${e(d?.specifications||'')}"></label><label>屏幕参数<input name="screen" value="${e(d?.screen||'')}"></label><label>颜色/特殊版本<input name="specialEdition" value="${e(d?.specialEdition||d?.color||'')}"></label><label>主力/随身资格<select name="roles" multiple size="2"><option value="primary" ${d?.dutyRoles?.includes('primary')?'selected':''}>主力候选</option><option value="portable" ${d?.dutyRoles?.includes('portable')?'selected':''}>随身候选</option></select></label><label>个人优先级 0-100<input name="preferredPriority" type="number" min="0" max="100" value="${e(d?.preferredPriority??50)}"></label><label class="full">支持平台（用 | 分隔）<input name="supportedPlatforms" value="${e((d?.supportedPlatforms||[]).join('|'))}"></label><label class="full">设备图片 URL<input name="image" value="${e(d?.image||'')}" placeholder="也可以在下方上传本地图片"></label><label class="full">上传设备图片<input name="imageFile" type="file" accept="image/*"></label><label class="full">备注<textarea name="notes">${e(d?.notes||'')}</textarea></label><label class="dr-check"><input name="paused" type="checkbox" ${d?.paused?'checked':''}><span>暂停参与轮换</span></label><label class="dr-check"><input name="archived" type="checkbox" ${d?.archived?'checked':''}><span>归档设备</span></label><div class="dr-form-actions"><button type="button" onclick="DutyRoom.closeModal()">取消</button><button class="dr-primary">保存设备</button></div></form>`);}
  async function submitDevice(ev,id){ev.preventDefault();const fd=new FormData(ev.target),old=id?device(id):null,roles=[...ev.target.elements.roles.selectedOptions].map(x=>x.value);let image=fd.get('image');const file=fd.get('imageFile');if(file&&file.size)image=await resizeImage(file);const d={...(old||{}),id:id||uid('device'),name:fd.get('name'),brand:fd.get('brand'),model:fd.get('model'),availabilityStatus:fd.get('availabilityStatus'),specifications:fd.get('specifications'),screen:fd.get('screen'),specialEdition:fd.get('specialEdition'),dutyRoles:roles,supportedPlatforms:String(fd.get('supportedPlatforms')||'').split('|').map(x=>x.trim()).filter(Boolean),preferredPriority:Number(fd.get('preferredPriority'))||0,image,notes:fd.get('notes'),paused:fd.get('paused')==='on',archived:fd.get('archived')==='on',operatingSystems:old?.operatingSystems||[],recommendations:old?.recommendations||[],tags:old?.tags||[],sortOrder:old?.sortOrder??state.devices.length,createdAt:old?.createdAt||isoNow(),updatedAt:isoNow()};if(id)state.devices=state.devices.map(x=>x.id===id?d:x);else state.devices.push(d);save();closeModal();toast('设备档案已保存');}
  function resizeImage(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{const img=new Image();img.onerror=reject;img.onload=()=>{const scale=Math.min(1,1000/img.width,700/img.height),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.82))};img.src=reader.result};reader.readAsDataURL(file)});}
  function moveDevice(id,delta){const sorted=[...state.devices].sort((a,b)=>a.sortOrder-b.sortOrder),i=sorted.findIndex(d=>d.id===id),j=Math.max(0,Math.min(sorted.length-1,i+delta));if(i===j)return;[sorted[i],sorted[j]]=[sorted[j],sorted[i]];sorted.forEach((d,k)=>d.sortOrder=k);state.devices=sorted;save();}
  function deviceDetail(id){const d=device(id);if(!d)return;const s=sessionsFor(id),maint=state.maintenance.filter(m=>m.deviceId===id),perfs=state.performanceProfiles.filter(p=>p.deviceId===id);modal(d.name,`<div class="dr-grid two"><div>${deviceVisual(d)}<div class="dr-chips"><span class="dr-chip">${e(deviceStatusLabel(id))}</span>${(d.supportedPlatforms||[]).map(x=>`<span class="dr-chip">${e(x)}</span>`).join('')}</div><p>${e(d.specifications||'配置待补充')}</p><p class="dr-help">${e(d.notes||'暂无个人备注')}</p></div><div><div class="dr-device-kpis"><div><b>${formatMinutes(sessionMinutes(id))}</b><span>累计时长</span></div><div><b>${s.length}</b><span>游玩次数</span></div><div><b>${maint.length}</b><span>维护记录</span></div></div><h4>运行环境</h4>${(d.operatingSystems||[]).map(x=>`<div class="row"><span>${e(x.name)}</span><b>${x.installed?'已安装':'待确认'}</b></div>`).join('')||'<p class="dr-help">运行环境待补充</p>'}<h4>三个游戏槽位</h4>${(d.recommendations||[]).map((r,i)=>`<div class="row"><span>${['主线','备选','休闲'][i]||r.slot}</span><b>${e(r.title)} · ${compatibilityLabel(r.compatibility)}</b></div>`).join('')}</div></div><div class="dr-actions"><button onclick="DutyRoom.editDevice('${id}')">编辑档案</button><button onclick="DutyRoom.quickLog('${id}')">记录游玩</button><button onclick="DutyRoom.editPerformance('', '${id}')">新增性能测试</button><button onclick="DutyRoom.addMaintenance('${id}')">记录维护</button></div>${perfs.length?`<div class="dr-note">已有 ${perfs.length} 份性能档案。</div>`:''}`);}

  function scoreDevice(d,role,scene='home'){
    const w=state.settings.weights,idle=idleDays(d.id),idleScore=idle===Infinity?100:Math.min(100,idle/60*100),usedThisCycle=state.sessions.some(s=>s.deviceId===d.id&&dateOnly(s.startedAt)>=state.settings.cycleStartDate),cycleScore=usedThisCycle?0:100,unfinished=(d.recommendations||[]).some(r=>r.compatibility!=='fail')?70:20,sceneScore=scene==='offline'&&d.id==='dev-gcloud'?10:scene==='commute'&&d.dutyRoles.includes('portable')?100:scene==='modern'&&d.supportedPlatforms.some(x=>/PC|Steam|串流|Linux/i.test(x))?100:scene==='retro'&&d.supportedPlatforms.some(x=>!/PC|Steam|串流/i.test(x))?85:60,pref=d.preferredPriority??50,total=(idleScore*w.idle+cycleScore*w.cycle+unfinished*w.unfinished+sceneScore*w.scene+pref*w.preference)/Math.max(1,Object.values(w).reduce((a,b)=>a+Number(b),0));return{total,idleScore,cycleScore,unfinished,sceneScore,pref};
  }
  function chooseDevice(role,scene='home',exclude=[]){const pool=validDevices(role).filter(d=>!exclude.includes(d.id)),scored=pool.map(d=>({d,score:scoreDevice(d,role,scene)})).sort((a,b)=>b.score.total-a.score.total);return scored[0]||null;}
  function recommend(role){const occupied=role==='primary'?activePlan('portable')?.deviceId:activePlan('primary')?.deviceId,pick=chooseDevice(role,'home',[occupied].filter(Boolean));if(!pick){toast('没有符合条件的候选设备');return}const reason=`${pick.d.name} 已${idleDays(pick.d.id)===Infinity?'从未记录游玩':'闲置 '+idleDays(pick.d.id)+' 天'}，${pick.score.cycleScore===100?'本轮尚未出勤':'本轮已经使用'}，推荐分 ${Math.round(pick.score.total)}。`;if(confirm(`${reason}\n\n设为当前${role==='primary'?'主力':'随身'}值班设备？`))setActiveDevice(role,pick.d.id,reason);}
  function setActiveDevice(role,deviceId,reason='手动安排'){const old=activePlan(role);if(old){old.status='completed';old.actualEndDate=dateOnly()}const duration=role==='primary'?state.settings.primaryDurationDays:state.settings.portableDurationDays,start=dateOnly(),d=device(deviceId);state.plans.push({id:uid('plan'),deviceId,role,cycleId:state.settings.cycleId,startDate:start,endDate:addDays(start,duration-1),plannedGameId:d?.recommendations?.[0]?.gameId||'',plannedGameTitle:d?.recommendations?.[0]?.title||'',status:'active',extensionCount:0,selectionReason:reason,actualStartDate:start,actualEndDate:null});save();toast('当前值班设备已更新');}
  function extend(id,days){const p=state.plans.find(x=>x.id===id);if(!p)return;p.endDate=addDays(p.endDate,days);p.extensionCount=(p.extensionCount||0)+1;state.plans.filter(x=>x.role===p.role&&x.status==='planned'&&x.startDate>p.startDate).forEach(x=>{x.startDate=addDays(x.startDate,days);x.endDate=addDays(x.endDate,days)});save();toast(`已延长 ${days} 天并顺延未来排班`);}
  function handover(id){const p=state.plans.find(x=>x.id===id);if(!p||!confirm('提前结束本次值班？历史和实际游玩记录会保留。'))return;p.status='completed';p.actualEndDate=dateOnly();save(false);recommend(p.role);}
  function swap(role){const occupied=role==='primary'?activePlan('portable')?.deviceId:activePlan('primary')?.deviceId,pool=validDevices(role).filter(d=>d.id!==occupied&&d.id!==activePlan(role)?.deviceId);modal('临时换机',`<form class="dr-form" onsubmit="DutyRoom.submitSwap(event,'${role}')"><label class="full">选择设备<select name="deviceId" required>${pool.map(d=>`<option value="${d.id}">${e(d.name)} · 闲置 ${idleDays(d.id)===Infinity?'从未':idleDays(d.id)+'天'}</option>`).join('')}</select></label><label class="full">原因<input name="reason" placeholder="临时换机"></label><div class="dr-form-actions"><button type="button" onclick="DutyRoom.closeModal()">取消</button><button class="dr-primary">确认换机</button></div></form>`);}
  function submitSwap(ev,role){ev.preventDefault();const fd=new FormData(ev.target);setActiveDevice(role,fd.get('deviceId'),fd.get('reason')||'临时换机');closeModal();}
  function editPlan(id){const p=state.plans.find(x=>x.id===id);if(!p)return;modal('调整未来排班',`<form class="dr-form" onsubmit="DutyRoom.submitPlan(event,'${id}')"><label>设备<select name="deviceId">${state.devices.filter(d=>!d.archived).map(d=>`<option value="${d.id}" ${d.id===p.deviceId?'selected':''}>${e(d.name)}</option>`).join('')}</select></label><label>岗位<select name="role"><option value="primary" ${p.role==='primary'?'selected':''}>主力</option><option value="portable" ${p.role==='portable'?'selected':''}>随身</option></select></label><label>开始日期<input name="startDate" type="date" value="${e(p.startDate)}"></label><label>结束日期<input name="endDate" type="date" value="${e(p.endDate)}"></label><label class="full">计划游戏<input name="plannedGameTitle" value="${e(p.plannedGameTitle||'')}"></label><div class="dr-form-actions"><button type="button" onclick="DutyRoom.closeModal()">取消</button><button class="dr-primary">保存调整</button></div></form>`);}
  function submitPlan(ev,id){ev.preventDefault();const fd=new FormData(ev.target),p=state.plans.find(x=>x.id===id);Object.assign(p,{deviceId:fd.get('deviceId'),role:fd.get('role'),startDate:fd.get('startDate'),endDate:fd.get('endDate'),plannedGameTitle:fd.get('plannedGameTitle')});save();closeModal();}

  function draw(){const scene=document.getElementById('drDrawScene')?.value||'home',mode=document.getElementById('drDrawMode')?.value||'both';let d=drawLocks.device&&drawResult?device(drawResult.deviceId):null;if(!d){let pool=validDevices();if(mode==='idle')pool=pool.filter(x=>idleDays(x.id)>30||idleDays(x.id)===Infinity);if(scene==='commute'||scene==='outside')pool=pool.filter(x=>x.dutyRoles.includes('portable'));if(!pool.length){toast('没有符合筛选条件的设备');return}const weighted=pool.map(x=>({x,w:Math.max(1,scoreDevice(x,x.dutyRoles[0],scene).total)}));let roll=Math.random()*weighted.reduce((n,a)=>n+a.w,0);d=weighted.find(a=>(roll-=a.w)<=0)?.x||weighted[0].x}let rec=drawLocks.game&&drawResult?{title:drawResult.gameTitle,gameId:drawResult.gameId}:null;if(!rec){const candidates=(d.recommendations||[]).filter(r=>r.compatibility!=='fail');rec=candidates[Math.floor(Math.random()*Math.max(1,candidates.length))]||{title:'自由选择',gameId:''}}drawResult={deviceId:d.id,gameId:rec.gameId||'',gameTitle:rec.title,reason:`${d.name} 当前闲置 ${idleDays(d.id)===Infinity?'尚无记录':idleDays(d.id)+' 天'}；候选组合未标记为无法运行。`};render();}
  function toggleDrawLock(key){drawLocks[key]=!drawLocks[key];render();}
  function acceptDraw(){if(!drawResult)return;const d=device(drawResult.deviceId),role=d.dutyRoles.includes('primary')?'primary':'portable';if(role==='primary'&&activePlan('portable')?.deviceId===d.id||role==='portable'&&activePlan('primary')?.deviceId===d.id){toast('该设备已占用另一值班岗位');return}setActiveDevice(role,d.id,'随机抽签：'+drawResult.reason);const p=activePlan(role);p.plannedGameId=drawResult.gameId;p.plannedGameTitle=drawResult.gameTitle;save();activeView='overview';render();}

  function editPerformance(id='',deviceId=''){const p=id?state.performanceProfiles.find(x=>x.id===id):null;modal(p?'编辑性能档案':'新增性能档案',`<form class="dr-form" onsubmit="DutyRoom.submitPerformance(event,'${e(id)}')"><label>设备<select name="deviceId">${state.devices.filter(d=>!d.archived).map(d=>`<option value="${d.id}" ${d.id===(p?.deviceId||deviceId)?'selected':''}>${e(d.name)}</option>`).join('')}</select></label><label>游戏名称<input name="gameTitle" required value="${e(p?.gameTitle||'')}"></label><label>运行环境<input name="environmentName" value="${e(p?.environmentName||'')}"></label><label>兼容状态<select name="compatibilityStatus">${['untested','fail','launch','playable','smooth','perfect'].map(x=>`<option value="${x}" ${p?.compatibilityStatus===x?'selected':''}>${compatibilityLabel(x)}</option>`).join('')}</select></label><label>系统版本<input name="osVersion" value="${e(p?.osVersion||'')}"></label><label>模拟器/兼容层版本<input name="emulatorVersion" value="${e(p?.emulatorVersion||'')}"></label><label>GPU 驱动<input name="gpuDriver" value="${e(p?.gpuDriver||'')}"></label><label>Proton/转译器版本<input name="protonVersion" value="${e(p?.protonVersion||'')}"></label><label>渲染分辨率<input name="resolution" value="${e(p?.resolution||'')}"></label><label>平均帧率<input name="averageFps" type="number" step="0.1" value="${e(p?.averageFps||'')}"></label><label>最低帧率<input name="minimumFps" type="number" step="0.1" value="${e(p?.minimumFps||'')}"></label><label>功耗 W<input name="powerWatts" type="number" step="0.1" value="${e(p?.powerWatts||'')}"></label><label>温度 °C<input name="temperatureC" type="number" step="0.1" value="${e(p?.temperatureC||'')}"></label><label class="full">已知问题<textarea name="issues">${e(p?.issues||'')}</textarea></label><label class="full">推荐配置<textarea name="recommendedConfig">${e(p?.recommendedConfig||'')}</textarea></label><div class="dr-form-actions"><button type="button" onclick="DutyRoom.closeModal()">取消</button><button class="dr-primary">保存档案</button></div></form>`);}
  function submitPerformance(ev,id){ev.preventDefault();const fd=new FormData(ev.target),old=id?state.performanceProfiles.find(x=>x.id===id):null,obj={...(old||{}),id:id||uid('perf'),deviceId:fd.get('deviceId'),gameTitle:fd.get('gameTitle'),environmentName:fd.get('environmentName'),compatibilityStatus:fd.get('compatibilityStatus'),osVersion:fd.get('osVersion'),emulatorVersion:fd.get('emulatorVersion'),gpuDriver:fd.get('gpuDriver'),protonVersion:fd.get('protonVersion'),resolution:fd.get('resolution'),averageFps:fd.get('averageFps'),minimumFps:fd.get('minimumFps'),powerWatts:fd.get('powerWatts'),temperatureC:fd.get('temperatureC'),issues:fd.get('issues'),recommendedConfig:fd.get('recommendedConfig'),lastTestedAt:dateOnly(),updatedAt:isoNow()};if(id)state.performanceProfiles=state.performanceProfiles.map(x=>x.id===id?obj:x);else state.performanceProfiles.push(obj);save();closeModal();}

  function addMaintenance(deviceId=''){modal('记录设备维护',`<form class="dr-form" onsubmit="DutyRoom.submitMaintenance(event)"><label>设备<select name="deviceId">${state.devices.filter(d=>!d.archived).map(d=>`<option value="${d.id}" ${d.id===deviceId?'selected':''}>${e(d.name)}</option>`).join('')}</select></label><label>维护类型<select name="maintenanceType"><option>电池检查</option><option>充电</option><option>系统更新</option><option>存档备份</option><option>清洁</option><option>维修</option><option>配件整理</option></select></label><label>完成日期<input name="completedAt" type="date" value="${dateOnly()}"></label><label>下次到期<input name="nextDueAt" type="date" value="${addDays(new Date(),60)}"></label><label>当前电量 %<input name="batteryLevel" type="number" min="0" max="100"></label><label class="full">备注<textarea name="notes"></textarea></label><div class="dr-form-actions"><button type="button" onclick="DutyRoom.closeModal()">取消</button><button class="dr-primary">保存维护记录</button></div></form>`);}
  function submitMaintenance(ev){ev.preventDefault();const fd=new FormData(ev.target);state.maintenance.push({id:uid('maint'),deviceId:fd.get('deviceId'),maintenanceType:fd.get('maintenanceType'),completedAt:fd.get('completedAt'),nextDueAt:fd.get('nextDueAt'),batteryLevel:fd.get('batteryLevel'),notes:fd.get('notes'),createdAt:isoNow()});save();closeModal();}
  function addAchievement(){modal('新增自定义成就',`<form class="dr-form" onsubmit="DutyRoom.submitAchievement(event)"><label>名称<input name="name" required></label><label>图标<input name="icon" value="⭐"></label><label class="full">说明<textarea name="description" required></textarea></label><div class="dr-form-actions"><button type="button" onclick="DutyRoom.closeModal()">取消</button><button class="dr-primary">保存</button></div></form>`);}
  function submitAchievement(ev){ev.preventDefault();const fd=new FormData(ev.target);state.customAchievements.push({id:uid('custom-ach'),name:fd.get('name'),description:fd.get('description'),icon:fd.get('icon'),createdAt:isoNow()});save();closeModal();}

  function saveSettings(ev){ev.preventDefault();const fd=new FormData(ev.target);state.settings={...state.settings,rotationMode:fd.get('rotationMode'),minimumAttendanceMinutes:Number(fd.get('minimumAttendanceMinutes'))||15,primaryDurationDays:Number(fd.get('primaryDurationDays'))||14,portableDurationDays:Number(fd.get('portableDurationDays'))||7,dualMode:fd.get('dualMode')==='on',weights:{idle:Number(fd.get('weightIdle'))||0,cycle:Number(fd.get('weightCycle'))||0,unfinished:Number(fd.get('weightUnfinished'))||0,scene:Number(fd.get('weightScene'))||0,preference:Number(fd.get('weightPreference'))||0}};save();toast('值班室设置已保存');}
  function pauseRotation(){state.settings.rotationPaused=!state.settings.rotationPaused;save();toast(state.settings.rotationPaused?'轮换已暂停':'轮换已恢复');}
  function resetSchedule(){if(!confirm('重置未来排班？历史游玩记录与已完成计划会保留。'))return;state.plans=state.plans.filter(p=>p.status==='completed');state.plans.push(...makeSchedule(state.devices));save();}
  function resetAll(){if(!confirm('完全重置掌机值班室？这会清除值班室内所有设备修改、排班、游玩和维护数据，但不会影响原有游戏生涯。'))return;localStorage.removeItem(STORAGE_KEY);state=initialState();save();activeView='overview';}
  function deleteSession(id){if(!confirm('删除这条游玩记录？'))return;state.sessions=state.sessions.filter(s=>s.id!==id);save();}

  function exportData(){const blob=new Blob([JSON.stringify({type:'handheld-duty-room-backup',exportedAt:isoNow(),data:state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`handheld-duty-room-${dateOnly()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function importData(ev){const file=ev.target.files?.[0];ev.target.value='';if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(reader.result),incoming=normalizeState(parsed.data||parsed);if(!confirm(`导入摘要：${incoming.devices.length} 台设备、${incoming.sessions.length} 条游玩、${incoming.plans.length} 条排班。\n\n将按稳定 ID 合并，同 ID 以导入数据为准。继续？`))return;const merge=(a,b)=>[...new Map([...a,...b].map(x=>[x.id,x])).values()];state={...state,...incoming,devices:merge(state.devices,incoming.devices),plans:merge(state.plans,incoming.plans),sessions:merge(state.sessions,incoming.sessions),performanceProfiles:merge(state.performanceProfiles,incoming.performanceProfiles),maintenance:merge(state.maintenance,incoming.maintenance),customAchievements:merge(state.customAchievements,incoming.customAchievements),unlockedAchievements:{...state.unlockedAchievements,...incoming.unlockedAchievements},settings:{...state.settings,...incoming.settings}};save();toast('值班室数据已合并导入')}catch(err){alert('导入失败：'+err.message)}};reader.readAsText(file);}
  function exportIcs(){const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Game Life Log//Handheld Duty Room//CN','CALSCALE:GREGORIAN'];state.plans.forEach(p=>{const d=device(p.deviceId);lines.push('BEGIN:VEVENT',`UID:${p.id}@game-life-log`,`DTSTART;VALUE=DATE:${p.startDate.replaceAll('-','')}`,`DTEND;VALUE=DATE:${addDays(p.endDate,1).replaceAll('-','')}`,`SUMMARY:${p.role==='primary'?'主力':'随身'}值班：${d?.name||'自由返场'}`,`DESCRIPTION:${(p.plannedGameTitle||'自由选择').replace(/\n/g,' ')}`,'END:VEVENT')});lines.push('END:VCALENDAR');downloadText(`handheld-duty-${dateOnly()}.ics`,lines.join('\r\n'),'text/calendar');}
  function exportAnnualReport(){const year=String(new Date().getFullYear()),ss=state.sessions.filter(s=>String(s.startedAt).startsWith(year)),by={};ss.forEach(s=>by[s.deviceId]=(by[s.deviceId]||0)+(Number(s.durationMinutes)||0));const ranked=Object.entries(by).sort((a,b)=>b[1]-a[1]);const body=`# ${year} 掌机生涯报告\n\n- 年度总时长：${formatMinutes(ss.reduce((n,s)=>n+(Number(s.durationMinutes)||0),0))}\n- 年度游玩次数：${ss.length}\n- 使用设备数：${ranked.length}\n- 设备覆盖率：${Math.round(ranked.length/Math.max(1,validDevices().length)*100)}%\n\n## 设备排行\n\n${ranked.map(([id,min],i)=>`${i+1}. ${device(id)?.name||id} — ${formatMinutes(min)}`).join('\n')||'暂无真实游玩记录'}\n`;downloadText(`handheld-year-${year}.md`,body,'text/markdown');}
  function downloadText(name,text,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

  function onKey(ev){const modalEl=document.getElementById('drModal');if(ev.key==='Escape'&&modalEl){closeModal();return}const mount=document.getElementById('dutyRoomApp');if(!mount||!document.getElementById('dutyRoom')?.classList.contains('active'))return;if(['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(ev.key)){const list=[...mount.querySelectorAll('button:not([disabled]),select,input,textarea')].filter(x=>x.offsetParent!==null),i=list.indexOf(document.activeElement);if(i>=0){ev.preventDefault();const delta=['ArrowDown','ArrowRight'].includes(ev.key)?1:-1;list[(i+delta+list.length)%list.length]?.focus()}}}

  const api={
    open(){load();render()},view(id){activeView=id;render();window.scrollTo({top:document.getElementById('dutyRoom')?.offsetTop||0,behavior:'smooth'})},render,closeModal,
    quickLog,submitSession,editSession:id=>quickLog('','',id),deleteSession,startTimer,submitTimer,toggleTimerPause,stopTimer,cancelTimer,
    editDevice,submitDevice,moveDevice,deviceDetail,recommend,extend,handover,swap,submitSwap,editPlan,submitPlan,
    draw,toggleDrawLock,acceptDraw,editPerformance,submitPerformance,addMaintenance,submitMaintenance,addAchievement,submitAchievement,
    saveSettings,pauseRotation,resetSchedule,resetAll,exportData,importData,exportIcs,exportAnnualReport
  };
  window.DutyRoom=api;
  document.addEventListener('keydown',onKey);
  load();
})();
