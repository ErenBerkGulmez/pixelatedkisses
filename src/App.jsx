import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GRID_SIZE, TILE_SIZE, ITEMS, SKILLS } from './data/constants';
import { getNextStep } from './utils/pathfinding';
import { generateDungeon } from './utils/dungeon';
import { WallTile, FloorTile, DoorTile, StairsDownTile, StairsUpTile, ShopkeeperSkin, PlayerSkin, MonsterSkin, ItemSkin, BedTile, DungeonEntranceTile, PrincessNpcTile, TrainerNpcTile } from './components/Skins';
import { MainMenu, SettingsMenu, IntroScene, EndingScene, TrueEndingScene, VictoryScreen, PrincessMenu, TrainerMenu, LevelUpModal, MainGameUI, ShopMenu } from './components/GameUI';

import menuMusicSrc from './assets/audio/menu_music.mp3';
import gameMusicSrc from './assets/audio/game_music.mp3';
import deathSoundSrc from './assets/audio/death_sound.mp3';
import lvlUpSoundSrc from './assets/audio/lvl_up.mp3';
import buttonSoundSrc from './assets/audio/button_sound.mp3';
import damageSoundSrc from './assets/audio/damage_sound.mp3';

const VISION_RADIUS = 7;

const UPGRADE_POOL = [
  { key: 'hp_boost', icon: '❤️', effect: (p) => ({ ...p, maxHp: p.maxHp + 20, hp: p.hp + 20 }) },
  { key: 'mp_boost', icon: '💙', effect: (p) => ({ ...p, maxMp: p.maxMp + 20, mp: p.mp + 20 }) },
  { key: 'atk_boost', icon: '⚔️', effect: (p) => ({ ...p, baseAtk: p.baseAtk + 2 }) },
  { key: 'full_heal', icon: '✨', effect: (p) => ({ ...p, hp: p.maxHp, mp: p.maxMp }) },
];

const GridTile = React.memo(({ x, y, tile, isVisible, biome }) => {
  const needsFloorBg = ['shop_npc', 'princess_npc', 'trainer_npc', 'bed'].includes(tile);

  return (
    <div className="absolute" style={{ left: x*TILE_SIZE, top: y*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
        {needsFloorBg && <FloorTile biome={biome} x={x} y={y} />}
        {tile === 'wall' ? <WallTile biome={biome} x={x} y={y} /> : 
         tile === 'door_closed' ? <DoorTile isOpen={false}/> : 
         tile === 'door_open' ? <DoorTile isOpen={true}/> : 
         tile === 'stairs_down' ? <StairsDownTile /> : 
         tile === 'stairs_up' ? <StairsUpTile /> : 
         tile === 'shop_npc' ? <div className="absolute inset-0"><ShopkeeperSkin /></div> : 
         tile === 'bed' ? <div className="absolute inset-0"><BedTile /></div> :
         tile === 'dungeon_entrance' ? <DungeonEntranceTile /> :
         tile === 'princess_npc' ? <div className="absolute inset-0"><PrincessNpcTile /></div> :
         tile === 'trainer_npc' ? <div className="absolute inset-0"><TrainerNpcTile /></div> :
         !needsFloorBg ? <FloorTile biome={biome} x={x} y={y} /> : null}
        {!isVisible && <div className="absolute inset-0 bg-[#0d0d12] opacity-80 z-10 pointer-events-none" />}
    </div>
  );
});

const ItemEntity = React.memo(({ item, isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className="absolute z-20" style={{ left: item.x*TILE_SIZE, top: item.y*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
      <div className="scale-90"><ItemSkin type={item.type}/></div>
    </div>
  );
});

const MonsterEntity = React.memo(({ m, isVisible }) => {
  if (!isVisible) return null;
  return (
     <div className="absolute z-20 transition-all duration-200" style={{ left: m.x*TILE_SIZE, top: m.y*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, transform: `translate(${m.recoilX || 0}px, ${m.recoilY || 0}px)`, filter: m.isHurt ? 'drop-shadow(0 0 10px red) brightness(2)' : 'none' }}>
         <MonsterSkin monster={m} />
         {m.isHurt && m.lastDamage && (
             <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full font-bold z-50 animate-bounce ${m.isCrit ? 'text-yellow-400 text-2xl scale-125' : 'text-red-500 text-lg'}`}>
                 -{m.lastDamage}
             </div>
         )}
     </div>
  );
});

const PlayerEntity = React.memo(({ player, isGameOver }) => (
  <div className="absolute z-30 transition-all duration-100" style={{ left: player.x*TILE_SIZE, top: player.y*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, filter: player.isHurt ? 'drop-shadow(0 0 10px red) brightness(2)' : 'none' }}>
      {isGameOver ? '💀' : <PlayerSkin player={player} />}
      {player.isHurt && player.lastDamage && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full text-red-500 font-bold text-lg animate-bounce z-50">
              -{player.lastDamage}
          </div>
      )}
  </div>
));

const App = () => {
  const { t, i18n } = useTranslation();
  const viewportRef = useRef(null);
  const [viewportSize, setViewportSize] = useState({ w: 800, h: 600 });

  const [screen, setScreen] = useState('MENU');
  const [prevScreen, setPrevScreen] = useState('MENU');
  const [lang, setLang] = useState(i18n.language || 'en');
  const [volume, setVolume] = useState(50);
  const [resolution, setResolution] = useState('1920x1080');
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [hasSave, setHasSave] = useState(false);

  const [difficulty, setDifficulty] = useState('normal');
  const [relationship, setRelationship] = useState(0);
  const [isCampaignCleared, setIsCampaignCleared] = useState(false);

  const [dungeonLevel, setDungeonLevel] = useState(1);
  const [world, setWorld] = useState([]);
  const [floors, setFloors] = useState([]); 
  const [biome, setBiome] = useState('dungeon');
  const [dungeonMap, setDungeonMap] = useState({});
  const [shopInventories, setShopInventories] = useState({});

  const [player, setPlayer] = useState({ 
    x: 1, y: 1, hp: 180, maxHp: 180, mp: 60, maxMp: 60, 
    baseAtk: 18, atk: 18, def: 2, lvl: 1, exp: 0, nextLvlExp: 40, class: 'warrior', gold: 0 
  });
  
  const [equipment, setEquipment] = useState({ weapon: null, armor: null });
  const [inventory, setInventory] = useState([]); 
  const [itemsOnFloor, setItemsOnFloor] = useState([]); 
  const [monsters, setMonsters] = useState([]);
  const [visitedTiles, setVisitedTiles] = useState(new Set()); 
  const [visibleTiles, setVisibleTiles] = useState(new Set()); 

  const [log, setLog] = useState([]); 
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [levelUpOptions, setLevelUpOptions] = useState([]);
  const [skillCooldown, setSkillCooldown] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  const [isShopping, setIsShopping] = useState(false);
  const [isPrincessMenuOpen, setIsPrincessMenuOpen] = useState(false);
  const [isTrainerMenuOpen, setIsTrainerMenuOpen] = useState(false);
  const [isImmortal, setIsImmortal] = useState(false);
  const cheatBuffer = useRef("");

  const [sounds] = useState(() => {
    const menu = new Audio(menuMusicSrc);
    const game = new Audio(gameMusicSrc);
    const death = new Audio(deathSoundSrc);
    const lvlUp = new Audio(lvlUpSoundSrc);
    const btn = new Audio(buttonSoundSrc);
    const damage = new Audio(damageSoundSrc);
    menu.loop = true;
    game.loop = true;
    return { menu, game, death, lvlUp, btn, damage };
  });

  const playButtonSound = useCallback(() => {
    sounds.btn.currentTime = 0;
    sounds.btn.play().catch(() => {});
  }, [sounds]);

  const playDamageSound = useCallback(() => {
    sounds.damage.currentTime = 0;
    sounds.damage.play().catch(() => {});
  }, [sounds]);

  useEffect(() => {
    const vol = volume / 100;
    sounds.menu.volume = vol;
    sounds.game.volume = vol;
    sounds.death.volume = vol;
    sounds.lvlUp.volume = vol;
    sounds.btn.volume = vol;
    sounds.damage.volume = vol;
  }, [volume, sounds]);

  useEffect(() => {
    if (screen === 'MENU' || screen === 'SETTINGS') {
      sounds.game.pause();
      sounds.game.currentTime = 0;
      sounds.menu.play().catch(() => {});
    } else if (screen === 'GAME' || screen === 'INTRO' || screen === 'ENDING' || screen === 'TRUE_ENDING' || screen === 'VICTORY') {
      sounds.menu.pause();
      sounds.menu.currentTime = 0;
      if (!isGameOver) {
        sounds.game.play().catch(() => {});
      }
    }
  }, [screen, isGameOver, sounds]);

  useEffect(() => {
    if (isGameOver) {
      sounds.game.pause();
      sounds.death.currentTime = 0;
      sounds.death.play().catch(() => {});
    }
  }, [isGameOver, sounds]);

  useEffect(() => {
    if (isLevelingUp) {
      sounds.lvlUp.currentTime = 0;
      sounds.lvlUp.play().catch(() => {});
    }
  }, [isLevelingUp, sounds]);

  useEffect(() => { if (i18n.changeLanguage) i18n.changeLanguage(lang); }, [lang, i18n]);

  useEffect(() => {
    const handleResize = () => {
       if (viewportRef.current) {
          setViewportSize({ w: viewportRef.current.clientWidth, h: viewportRef.current.clientHeight });
       }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, [screen]);

  const addLog = useCallback((key, params) => setLog(prev => [{ id: `${Date.now()}-${Math.random()}`, key, params }, ...prev].slice(0, 15)), []);

  const isLineOfSightClear = (x1, y1, x2, y2, currentWorld) => {
    let dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
    let sx = (x1 < x2) ? 1 : -1, sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;
    while (true) {
      if (x1 === x2 && y1 === y2) return true;
      const isTarget = (x1 === x2 && y1 === y2);
      if (currentWorld[y1] && currentWorld[y1][x1]) {
          const tile = currentWorld[y1][x1];
          if ((tile === 'wall' || tile === 'door_closed') && !isTarget) {
               if (!(x1 === player.x && y1 === player.y)) return false;
          }
      }
      let e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x1 += sx; }
      if (e2 < dx) { err += dx; y1 += sy; }
    }
  };

  const updateVisibility = (px, py, currentVisited, currentWorld) => {
    const newVisited = new Set(currentVisited);
    const newVisible = new Set();
    for (let y = py - VISION_RADIUS; y <= py + VISION_RADIUS; y++) {
      for (let x = px - VISION_RADIUS; x <= px + VISION_RADIUS; x++) {
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
          const dist = Math.sqrt((x - px)**2 + (y - py)**2);
          if (dist <= VISION_RADIUS) {
            if (isLineOfSightClear(px, py, x, y, currentWorld)) {
                const key = `${x},${y}`; newVisible.add(key); newVisited.add(key);
            }
          }
        }
      }
    }
    setVisibleTiles(newVisible); setVisitedTiles(newVisited);
  };

  useEffect(() => { const s = localStorage.getItem('pixelDungeonSave'); if(s) setHasSave(true); }, []);
  
  const saveGame = useCallback(() => {
    playButtonSound();
    const currentLevelState = { world, floors, itemsOnFloor, monsters, visitedTiles: [...visitedTiles], biome };
    const newMap = { ...dungeonMap, [dungeonLevel]: currentLevelState };
    localStorage.setItem('pixelDungeonSave', JSON.stringify({ 
        dungeonLevel, dungeonMap: newMap, player, equipment, inventory, log, isLevelCleared, shopInventories,
        difficulty, relationship, isCampaignCleared
    }));
    setHasSave(true); addLog('logs.game_saved', {}); setScreen('MENU');
  }, [world, floors, itemsOnFloor, monsters, visitedTiles, biome, dungeonMap, dungeonLevel, player, equipment, inventory, log, isLevelCleared, shopInventories, difficulty, relationship, isCampaignCleared, addLog, playButtonSound]);

  const loadGame = useCallback(() => {
    playButtonSound();
    const s = localStorage.getItem('pixelDungeonSave');
    if (!s) return;
    let d;
    try { d = JSON.parse(s); } catch (e) { setHasSave(false); return; }

    if (!d || !d.dungeonMap || !d.dungeonLevel || !d.player || !d.equipment || !d.inventory || !d.log) {
        setHasSave(false);
        return;
    }

    setDungeonMap(d.dungeonMap); setDungeonLevel(d.dungeonLevel); setPlayer(d.player);
    setEquipment(d.equipment); setInventory(d.inventory); setLog(d.log);
    setIsLevelCleared(d.isLevelCleared); setShopInventories(d.shopInventories || {});
    setDifficulty(d.difficulty || 'normal');
    setRelationship(d.relationship || 0);
    setIsCampaignCleared(d.isCampaignCleared || false);

    const lvlData = d.dungeonMap[d.dungeonLevel];
    if(lvlData && lvlData.world && lvlData.floors && lvlData.itemsOnFloor && lvlData.monsters && lvlData.visitedTiles) {
        setWorld(lvlData.world); setFloors(lvlData.floors); setItemsOnFloor(lvlData.itemsOnFloor);
        setMonsters(lvlData.monsters); setBiome(lvlData.biome || 'dungeon');
        setVisitedTiles(new Set(lvlData.visitedTiles));
        updateVisibility(d.player.x, d.player.y, new Set(lvlData.visitedTiles), lvlData.world);
    } else {
        setHasSave(false); return;
    }
    setScreen('GAME');
  }, [playButtonSound]);

  const updateWindowSettings = (res, full) => { if (window.electronAPI) { const [w, h] = res.split('x').map(Number); window.electronAPI.resizeWindow(w, h, full); } };
  const handleResolutionChange = (res) => { playButtonSound(); setResolution(res); updateWindowSettings(res, isFullscreen); };
  const toggleFullscreen = () => { playButtonSound(); const s = !isFullscreen; setIsFullscreen(s); updateWindowSettings(resolution, s); };

  useEffect(() => {
    const wAtk = equipment.weapon ? equipment.weapon.atk : 0; 
    const aDef = equipment.armor ? equipment.armor.def : 0;
    let totalAtk = player.baseAtk + wAtk;
    if (equipment.weapon && equipment.weapon.type.includes('sword')) totalAtk = Math.floor(totalAtk * 1.25);
    setPlayer(p => ({ ...p, atk: totalAtk, def: aDef }));
  }, [equipment, player.baseAtk]);

  const reduceDurability = (slot, amount = 1) => {
      setEquipment(prev => {
          const item = prev[slot];
          if (!item || !item.dur) return prev;
          const newDur = item.dur - amount;
          if (newDur <= 0) {
              addLog('logs.item_broken', { item: item.type });
              return { ...prev, [slot]: null };
          }
          return { ...prev, [slot]: { ...item, dur: newDur } };
      });
  };

  const handleUseSkill = useCallback(() => {
      if (skillCooldown > 0 || isGameOver) { addLog('logs.cooldown', {}); return; }
      const weapon = equipment.weapon ? ITEMS[equipment.weapon.type] : null;
      if (!weapon || !weapon.skill) { addLog('logs.no_skill', {}); return; }
      
      const skillId = weapon.skill; 
      const skill = SKILLS[skillId];
      
      if (player.mp < skill.cost) { addLog('logs.no_mana', {}); return; }

      let newPlayer = { ...player, mp: player.mp - skill.cost };
      let skillUsed = false;
      let multiplier = 1.0;

      if (skillId === "heal") {
          const amount = Math.floor(40 * multiplier);
          newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + amount);
          skillUsed = true; addLog('logs.use_potion', { amount });
      } 
      else if (skillId === "fireball" || skillId === "freeze") {
          const target = monsters.filter(m => m.type !== 'princess').sort((a,b) => (Math.abs(a.x-player.x)+Math.abs(a.y-player.y)) - (Math.abs(b.x-player.x)+Math.abs(b.y-player.y)))[0];
          if (target && (Math.abs(target.x-player.x)+Math.abs(target.y-player.y)) < 6) {
             const dmg = Math.floor((25 + (player.lvl * 2)) * multiplier);
             const nhp = target.hp - dmg;
             if(nhp<=0) { 
                 newPlayer.exp += target.exp; 
                 newPlayer.gold += target.gold; 
                 setMonsters(p=>p.filter(m=>m.id!==target.id)); 
                 addLog('logs.kill',{target:target.type, xp:target.exp}); 
                 if (target.isBoss) {
                     setWorld(prev => {
                         const copy = prev.map(row => [...row]);
                         for(let y=0; y<GRID_SIZE; y++) for(let x=0; x<GRID_SIZE; x++) if(copy[y][x] === 'door_closed') copy[y][x] = 'door_open';
                         return copy;
                     });
                 }
             }
             else { 
                 const angle = Math.atan2(target.y - player.y, target.x - player.x);
                 const recoilX = Math.cos(angle) * 15;
                 const recoilY = Math.sin(angle) * 15;
                 setMonsters(p=>p.map(m=>m.id===target.id ? {...m, hp:nhp, isHurt: true, recoilX, recoilY, lastDamage: dmg} : m)); 
                 setTimeout(() => setMonsters(curr => curr.map(cm => cm.id === target.id ? { ...cm, isHurt: false, recoilX: 0, recoilY: 0, lastDamage: null } : cm)), 300);
                 addLog('logs.player_hit',{target:target.type, dmg}); 
             }
             skillUsed = true;
          } else { addLog('logs.no_target', {}); return; }
      }
      else if (skillId === "teleport") {
          const safeSpots = floors.filter(f => !monsters.some(m => m.x === f.x && m.y === f.y));
          if(safeSpots.length>0) {
              const spot = safeSpots[Math.floor(Math.random()*safeSpots.length)];
              newPlayer.x = spot.x; newPlayer.y = spot.y;
              skillUsed = true; updateVisibility(spot.x, spot.y, visitedTiles, world);
          }
      }
      else {
          const target = monsters.filter(m => m.type !== 'princess').find(m => Math.abs(m.x - player.x) <= 1 && Math.abs(m.y - player.y) <= 1);
          if (target) {
             let skillMult = 1.2;
             if (skillId === "power_strike") skillMult = 2.0;
             if (skillId === "assassinate") skillMult = 3.0;
             const dmg = Math.floor(player.atk * skillMult);
             const nhp = target.hp - dmg;
             if(nhp<=0) { 
                 newPlayer.exp += target.exp; 
                 newPlayer.gold += target.gold; 
                 setMonsters(p=>p.filter(m=>m.id!==target.id)); 
                 addLog('logs.kill',{target:target.type, xp:target.exp}); 
                 if (target.isBoss) {
                     setWorld(prev => {
                         const copy = prev.map(row => [...row]);
                         for(let y=0; y<GRID_SIZE; y++) for(let x=0; x<GRID_SIZE; x++) if(copy[y][x] === 'door_closed') copy[y][x] = 'door_open';
                         return copy;
                     });
                 }
             }
             else { 
                 const angle = Math.atan2(target.y - player.y, target.x - player.x);
                 const recoilX = Math.cos(angle) * 15;
                 const recoilY = Math.sin(angle) * 15;
                 setMonsters(p=>p.map(m=>m.id===target.id ? {...m, hp:nhp, isHurt: true, recoilX, recoilY, lastDamage: dmg} : m)); 
                 setTimeout(() => setMonsters(curr => curr.map(cm => cm.id === target.id ? { ...cm, isHurt: false, recoilX: 0, recoilY: 0, lastDamage: null } : cm)), 300);
                 addLog('logs.player_hit',{target:target.type, dmg}); 
             }
             skillUsed = true;
          } else { addLog('logs.no_target', {}); return; }
      }

      if (skillUsed) {
          setPlayer(newPlayer); setSkillCooldown(4); reduceDurability('weapon', 2); addLog('logs.skill_used', { skill: skillId }); 
      }
  }, [equipment, player, skillCooldown, isGameOver, monsters, floors, visitedTiles, world, addLog]);

  const handleUseItem = useCallback((item) => {
    const d = ITEMS[item.type]; 
    const reqLvl = item.reqLvl || 1;
    if (player.lvl < reqLvl) { addLog('logs.level_low', { req: reqLvl }); return; }
    let np = {...player}; let ne = {...equipment}; let ni = [...inventory]; let used = false;
    if(d.slot === 'consumable') {
        if(item.type==='potion_hp' && np.hp < np.maxHp) { np.hp = Math.min(np.maxHp, np.hp + d.effect); used = true; }
        else if(item.type==='potion_mp' && np.mp < np.maxMp) { np.mp = Math.min(np.maxMp, np.mp + d.effect); used = true; }
        if(used) {
             addLog('logs.use_potion', {amount:d.effect}); setPlayer(np);
             const idx = ni.findIndex(i => i.id === item.id);
             if(idx > -1) { if(ni[idx].count > 1) ni[idx].count -= 1; else ni.splice(idx, 1); }
             setInventory(ni);
        }
    } else {
        const slot = d.slot; const oldItem = equipment[slot];
        if(oldItem) ni.push(oldItem); ne[slot] = item; setEquipment(ne); addLog('logs.equip_item', {item:item.type});
        const idx = ni.findIndex(i => i.id === item.id);
        if(idx > -1) ni.splice(idx, 1);
        setInventory(ni);
    }
  }, [player, equipment, inventory, addLog]);

  const handleUnequip = useCallback((slot) => { const i = equipment[slot]; if(!i) return; setEquipment(p=>({...p,[slot]:null})); setInventory(p => [...p, i]); }, [equipment]);
  
  const handleSellItem = useCallback((item, price) => { playButtonSound(); setPlayer(p => ({ ...p, gold: p.gold + price })); const ni = [...inventory]; const idx = ni.findIndex(i => i.id === item.id); if(idx > -1) { if(ni[idx].count > 1) ni[idx].count--; else ni.splice(idx, 1); } setInventory(ni); }, [inventory, playButtonSound]);
  
  const handleBuyItem = useCallback((item) => { 
      playButtonSound();
      if(player.gold >= item.price) { 
          setPlayer(p => ({ ...p, gold: p.gold - item.price })); 
          setInventory(p => [...p, { ...item }]); 
          setShopInventories(prev => ({ ...prev, [dungeonLevel]: prev[dungeonLevel].filter(i => i.id !== item.id) }));
      } 
  }, [player.gold, dungeonLevel, playButtonSound]);

  const changeLevel = (direction) => { 
      const currentLevelState = { world, floors, itemsOnFloor, monsters, visitedTiles: [...visitedTiles], biome };
      setDungeonMap(prev => ({ ...prev, [dungeonLevel]: currentLevelState }));
      const nextLevel = direction === 'down' ? dungeonLevel + 1 : dungeonLevel - 1;
      
      setDungeonLevel(nextLevel);
      if (dungeonMap[nextLevel]) {
          const lvl = dungeonMap[nextLevel];
          setWorld(lvl.world); setFloors(lvl.floors); setItemsOnFloor(lvl.itemsOnFloor); setMonsters(lvl.monsters); setVisitedTiles(new Set(lvl.visitedTiles)); setBiome(lvl.biome || 'dungeon');
          let spawnTile = direction === 'down' ? lvl.floors[0] : lvl.floors[lvl.floors.length - 1]; 
          setPlayer(p => ({ ...p, x: spawnTile.x, y: spawnTile.y }));
          updateVisibility(spawnTile.x, spawnTile.y, new Set(lvl.visitedTiles), lvl.world);
      } else { initLevel(nextLevel, direction); }
  };

  const initVillage = useCallback(() => {
    const nw = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('wall'));
    const nf = [];

    for (let y = 2; y < GRID_SIZE - 2; y++) {
        for (let x = 2; x < GRID_SIZE - 2; x++) {
            nw[y][x] = 'floor';
        }
    }

    for(let y=4; y<=8; y++) {
        for(let x=4; x<=8; x++) {
            if (y===4 || y===8 || x===4 || x===8) nw[y][x] = 'wall';
            else nw[y][x] = 'floor';
        }
    }
    nw[8][6] = 'door_closed';
    nw[5][5] = 'bed';

    for(let y=4; y<=8; y++) {
        for(let x=21; x<=25; x++) {
            if (y===4 || y===8 || x===21 || x===25) nw[y][x] = 'wall';
            else nw[y][x] = 'floor';
        }
    }
    nw[8][23] = 'door_closed';
    nw[6][23] = 'shop_npc';

    for(let y=13; y<=17; y++) {
        for(let x=4; x<=10; x++) {
            if ((y===13 || y===17 || x===4 || x===10) && (x !== 10 || y !== 15)) nw[y][x] = 'wall';
        }
    }
    nw[15][7] = 'trainer_npc';

    nw[14][14] = 'wall'; nw[14][16] = 'wall';
    nw[16][14] = 'wall'; nw[16][16] = 'wall';
    nw[15][15] = 'princess_npc';

    for(let x=12; x<=18; x++) nw[25][x] = 'wall';
    nw[25][15] = 'floor';
    nw[26][14] = 'wall'; nw[26][16] = 'wall';
    nw[27][14] = 'wall'; nw[27][16] = 'wall';
    nw[27][15] = 'dungeon_entrance';

    for(let i=0; i<40; i++) {
        let rx = Math.floor(Math.random() * 24) + 3;
        let ry = Math.floor(Math.random() * 24) + 3;
        if (nw[ry][rx] === 'floor' && ry !== 15 && ry !== 27 && ry !== 9 && ry !== 8 && ry !== 6 && rx !== 6 && rx !== 23 && rx !== 7) {
           nw[ry][rx] = 'wall';
        }
    }

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (nw[y][x] === 'floor') nf.push({x, y});
        }
    }

    setWorld(nw); setFloors(nf); 
    setPlayer(p => ({ ...p, x: 6, y: 9, hp: p.maxHp, mp: p.maxMp, isHurt: false, lastDamage: null }));
    setMonsters([]); setItemsOnFloor([]); setBiome('forest'); setIsLevelCleared(true); setDungeonLevel(0);
    updateVisibility(6, 9, new Set(), nw); addLog('logs.welcome', { floor: "Village" });
  }, [addLog]);

  const initLevel = (lvl, entryType) => {
    if (lvl === 20) {
        const nw = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('wall'));
        const nf = [];
        const cx = Math.floor(GRID_SIZE / 2);
        const cy = Math.floor(GRID_SIZE / 2);
        
        for (let y = cy - 6; y <= cy + 6; y++) {
            for (let x = cx - 6; x <= cx + 6; x++) {
                nw[y][x] = 'floor';
                nf.push({x, y});
            }
        }
        
        for (let y = cy - 6; y <= cy - 4; y++) {
            for (let x = cx - 6; x <= cx + 6; x++) {
                if (y === cy - 4) {
                    nw[y][x] = x === cx ? 'door_closed' : 'wall';
                } else {
                    nw[y][x] = 'floor';
                }
            }
        }
        
        nw[cy - 6][cx] = 'stairs_down';

        const playerSpawn = {x: cx, y: cy + 5};
        const boss = { id: 'lich', x: cx, y: cy - 1, type: 'lich', hp: 400, maxHp: 400, atk: 15, def: 3, exp: 5000, gold: 1000, ai: 'chase', isBoss: true };
        const princessEntity = { id: 'princess', x: cx, y: cy - 5, type: 'princess', hp: 9999, maxHp: 9999, atk: 0, def: 0, exp: 0, gold: 0, ai: 'idle', isBoss: false };
        
        setWorld(nw); setFloors(nf); setPlayer(p => ({ ...p, x: playerSpawn.x, y: playerSpawn.y }));
        setMonsters([boss, princessEntity]); setItemsOnFloor([]); setBiome('necropolis'); setIsLevelCleared(false);
        updateVisibility(playerSpawn.x, playerSpawn.y, new Set(), nw); addLog('logs.welcome', { floor: 20 });
        return;
    }

    const { world: nw, floors: nf, playerSpawn, isSafe, monsters: newMons, items: newItems, biome: newBiome } = generateDungeon(lvl, entryType);
    setWorld(nw); setFloors(nf); setPlayer(p => ({ ...p, x: playerSpawn.x, y: playerSpawn.y }));
    setMonsters(newMons); setItemsOnFloor(newItems); setBiome(newBiome); setIsLevelCleared(false);
    updateVisibility(playerSpawn.x, playerSpawn.y, new Set(), nw); addLog('logs.welcome', { floor: lvl });
  };

  const startNewGame = useCallback(() => {
    playButtonSound();
    const base = { hp: 180, mp: 60, atk: 18, def: 2 };
    setPlayer({ ...player, lvl:1, exp:0, nextLvlExp:40, class:'warrior', maxHp:base.hp, hp:base.hp, maxMp:base.mp, mp:base.mp, baseAtk:base.atk, def:base.def, gold: 0 });
    setEquipment({weapon:null, armor:null}); setInventory([]); setDungeonLevel(1); setDungeonMap({}); setShopInventories({}); 
    setRelationship(0); setIsCampaignCleared(false);
    initLevel(1, 'start'); setScreen('GAME'); setIsGameOver(false);
  }, [player, playButtonSound]);

  const handleVillageAction = useCallback((action) => {
    playButtonSound();
    if (action === 'gift' && player.gold >= 100) {
        setPlayer(p => ({ ...p, gold: p.gold - 100 }));
        setRelationship(r => Math.min(100, r + 10));
    } else if (action === 'hp' && player.gold >= 300) {
        setPlayer(p => ({ ...p, gold: p.gold - 300, maxHp: p.maxHp + 20, hp: p.hp + 20 }));
    } else if (action === 'atk' && player.gold >= 500) {
        setPlayer(p => ({ ...p, gold: p.gold - 500, baseAtk: p.baseAtk + 2 }));
    } else if (action === 'confess') {
        if (relationship >= 100) {
            setIsPrincessMenuOpen(false);
            setScreen('TRUE_ENDING');
        }
    }
  }, [player.gold, relationship, playButtonSound]);

  const handleTurn = (dx, dy) => {
    if (isGameOver || screen !== 'GAME' || isShopping || isPrincessMenuOpen || isTrainerMenuOpen) return;
    const tx = player.x + dx; const ty = player.y + dy;
    if (tx < 0 || tx >= GRID_SIZE || ty < 0 || ty >= GRID_SIZE || world[ty][tx] === 'wall') return;

    if (world[ty][tx] === 'door_closed') { const nw = [...world]; nw[ty][tx] = 'door_open'; setWorld(nw); updateVisibility(player.x, player.y, visitedTiles, nw); return; }
    if (world[ty][tx] === 'stairs_down') { changeLevel('down'); return; }
    if (world[ty][tx] === 'stairs_up') { changeLevel('up'); return; }
    
    if (world[ty][tx] === 'bed') { setPlayer(p => ({ ...p, hp: p.maxHp, mp: p.maxMp })); addLog('logs.use_potion', {amount: 999}); return; }
    if (world[ty][tx] === 'princess_npc') { setIsPrincessMenuOpen(true); return; }
    if (world[ty][tx] === 'trainer_npc') { setIsTrainerMenuOpen(true); return; }
    if (world[ty][tx] === 'dungeon_entrance') { 
        if (dungeonLevel === 0) {
            setDungeonLevel(1); setDungeonMap({}); setShopInventories({}); initLevel(1, 'start');
        } else {
            initVillage();
        }
        return; 
    }

    if (world[ty][tx] === 'shop_npc') { 
        if (!shopInventories[dungeonLevel]) {
            const allItems = Object.keys(ITEMS);
            const items = [];
            for(let i=0; i<6; i++) {
                const type = allItems[Math.floor(Math.random() * allItems.length)];
                const baseData = ITEMS[type];
                const itemLvl = baseData.slot === 'consumable' ? 1 : Math.max(1, player.lvl + Math.floor(Math.random() * 3) - 1);
                const price = baseData.basePrice * itemLvl;
                items.push({ id: Math.random(), type, itemLvl, price, ...baseData, atk: baseData.atk ? Math.floor(baseData.atk * (1 + itemLvl * 0.2)) : 0 });
            }
            setShopInventories(prev => ({ ...prev, [dungeonLevel]: items }));
        }
        setIsShopping(true); return; 
    }

    let np = { ...player }; let acted = false; let nextMonsters = [...monsters];
    const mIndex = nextMonsters.findIndex(m => m.x === tx && m.y === ty);
    const m = nextMonsters[mIndex];
    
    if (m) {
        if (m.type === 'princess') {
            setScreen('ENDING');
            return;
        }

        let dmgMultiplier = 1.0; let critBonus = 0.0;
        if(equipment.weapon) {
            if(equipment.weapon.type.includes('sword')) dmgMultiplier = 1.25;
        }
        const weaponData = equipment.weapon ? ITEMS[equipment.weapon.type] : { crit: 0.05 };
        const isCrit = Math.random() < (weaponData.crit + critBonus);
        const dmg = Math.floor((player.atk * dmgMultiplier) * (isCrit ? 2 : 1));
        const rem = m.hp - dmg; 
        
        addLog(isCrit?'logs.player_crit':'logs.player_hit', {target:m.type, dmg});
        
        if (rem <= 0) { 
            np.exp += m.exp; np.gold += m.gold; addLog('logs.kill', {target: m.type, xp: m.exp}); nextMonsters.splice(mIndex, 1);
            if (m.isBoss) {
                setWorld(prev => {
                    const copy = prev.map(row => [...row]);
                    for(let y=0; y<GRID_SIZE; y++) for(let x=0; x<GRID_SIZE; x++) if(copy[y][x] === 'door_closed') copy[y][x] = 'door_open';
                    return copy;
                });
            }
        } else { 
            const angle = Math.atan2(m.y - player.y, m.x - player.x);
            const recoilX = Math.cos(angle) * 15; const recoilY = Math.sin(angle) * 15;
            nextMonsters[mIndex] = { ...m, hp: rem, isHurt: true, recoilX, recoilY, lastDamage: dmg, isCrit };
            setTimeout(() => setMonsters(curr => curr.map(cm => cm.id === m.id ? { ...cm, isHurt: false, recoilX: 0, recoilY: 0, lastDamage: null, isCrit: false } : cm)), 300);
        }
        reduceDurability('weapon', 1); acted = true;
    } else {
        np.x = tx; np.y = ty;
        const i = itemsOnFloor.find(i=>i.x===tx && i.y===ty);
        if(i) { 
            const itemDef = ITEMS[i.type];
            setInventory(p=> {
                 if(itemDef.slot === 'consumable') {
                     const exIdx = p.findIndex(x=>x.type===i.type);
                     if(exIdx > -1) { const copy = [...p]; copy[exIdx].count += 1; return copy; }
                     return [...p, { ...i, count: 1 }];
                 } 
                 return [...p, { ...i, dur: itemDef.maxDur, maxDur: itemDef.maxDur, count: 1 }];
            }); 
            setItemsOnFloor(p=>p.filter(x=>x.id!==i.id)); addLog('logs.item_pickup', {item:i.type}); 
        }
        acted = true;
    }

    if(np.exp >= np.nextLvlExp) { setLevelUpOptions([...UPGRADE_POOL].sort(()=>0.5-Math.random()).slice(0,3)); setIsLevelingUp(true); }
    setTurnCount(prev => prev + 1);
    setPlayer(np); updateVisibility(np.x, np.y, visitedTiles, world);
    if (acted) processMonsters(np, nextMonsters);
  };

  const processMonsters = (cp, currentMonsters) => {
    let totalDmgToPlayer = 0;
    const occupiedThisTurn = new Set([`${cp.x},${cp.y}`]);
    const baseMonsterObstacles = currentMonsters.map(om => `${om.x},${om.y}`);
    const shuffledMonsters = [...currentMonsters].sort(() => Math.random() - 0.5);

    const newMonsters = shuffledMonsters.map(m => {
        if (m.ai === 'idle') {
            occupiedThisTurn.add(`${m.x},${m.y}`);
            return m;
        }

        let mx = m.x, my = m.y; 
        const dist = Math.abs(cp.x - m.x) + Math.abs(cp.y - m.y);
        const lineOfSight = isLineOfSightClear(m.x, m.y, cp.x, cp.y, world);
        let move = false; let tPos = { x: mx, y: my };

        if (m.ai === 'ranged' && dist <= 4 && lineOfSight) {
            const dmg = Math.max(0, m.atk - (cp.def || 0));
            if (dmg > 0) totalDmgToPlayer += dmg;
            occupiedThisTurn.add(`${m.x},${m.y}`);
            return m; 
        } else if ((m.ai === 'chase' || m.ai === 'ranged') && dist < 8 && lineOfSight) { 
            const obstacles = new Set([...occupiedThisTurn, ...baseMonsterObstacles.filter(pos => pos !== `${m.x},${m.y}`)]);
            tPos = getNextStep(m, cp, world, obstacles);
            if (tPos.x === mx && tPos.y === my) { occupiedThisTurn.add(`${m.x},${m.y}`); return m; }
            move = true; 
        } else if (Math.random() < 0.3) {
            const d = [[0,1],[0,-1],[1,0],[-1,0]]; 
            const shuffledDirections = d.sort(() => Math.random() - 0.5);
            for (let i = 0; i < shuffledDirections.length; i++) {
                const r = shuffledDirections[i];
                let potentialTPos = {x:mx+r[0], y:my+r[1]};
                const potentialTPosKey = `${potentialTPos.x},${potentialTPos.y}`;

                if (world[potentialTPos.y]?.[potentialTPos.x] === 'floor' && 
                    !occupiedThisTurn.has(potentialTPosKey) &&
                    !currentMonsters.filter(om => om.id !== m.id).some(om => om.x === potentialTPos.x && om.y === potentialTPos.y) &&
                    world[potentialTPos.y][potentialTPos.x] !== 'door_closed' &&
                    world[potentialTPos.y][potentialTPos.x] !== 'shop_npc' &&
                    world[potentialTPos.y][potentialTPos.x] !== 'bed' &&
                    world[potentialTPos.y][potentialTPos.x] !== 'dungeon_entrance' &&
                    world[potentialTPos.y][potentialTPos.x] !== 'princess_npc' &&
                    world[potentialTPos.y][potentialTPos.x] !== 'trainer_npc'
                    ) { tPos = potentialTPos; move = true; break; }
            }
        }

        if (move) {
            if (tPos.x === cp.x && tPos.y === cp.y) {
                const dmg = Math.max(0, m.atk - (cp.def || 0));
                if (dmg > 0) totalDmgToPlayer += dmg;
                occupiedThisTurn.add(`${m.x},${m.y}`);
                return m;
            } else if (!occupiedThisTurn.has(`${tPos.x},${tPos.y}`) &&
                       !currentMonsters.filter(om => om.id !== m.id).some(om => om.x === tPos.x && om.y === tPos.y) &&
                       world[tPos.y][tPos.x] !== 'door_closed' && 
                       world[tPos.y][tPos.x] !== 'shop_npc' &&
                       world[tPos.y][tPos.x] !== 'bed' &&
                       world[tPos.y][tPos.x] !== 'dungeon_entrance' &&
                       world[tPos.y][tPos.x] !== 'princess_npc' &&
                       world[tPos.y][tPos.x] !== 'trainer_npc'
                      ) { 
                occupiedThisTurn.add(`${tPos.x},${tPos.y}`); return { ...m, x: tPos.x, y: tPos.y };
            }
        }
        occupiedThisTurn.add(`${m.x},${m.y}`);
        return m;
    });

    if (totalDmgToPlayer > 0) {
        if (isImmortal) {
            addLog('logs.cheat_activated', { msg: "IMMORTAL MODE ACTIVE" });
        } else {
            const nhp = cp.hp - totalDmgToPlayer;
            if (nhp <= 0) {
                if (difficulty === 'normal' && isCampaignCleared) {
                    initVillage();
                } else {
                    setPlayer(p => ({ ...p, hp: nhp, isHurt: true, lastDamage: totalDmgToPlayer }));
                    setIsGameOver(true);
                }
            } else {
                setPlayer(p => ({ ...p, hp: nhp, isHurt: true, lastDamage: totalDmgToPlayer }));
                setTimeout(() => setPlayer(curr => ({ ...curr, isHurt: false, lastDamage: null })), 300);
                addLog('logs.enemy_hit', { source: "Enemies", dmg: totalDmgToPlayer });
                playDamageSound();
            }
        }
    }
    setMonsters(newMonsters);
    if (skillCooldown > 0) setSkillCooldown(p => p - 1);
  };

  useEffect(() => {
    const k = (e) => { 
        cheatBuffer.current = (cheatBuffer.current + e.key.toLowerCase()).slice(-20);
        
        if (cheatBuffer.current.endsWith("immortal")) {
            setIsImmortal(prev => !prev);
            addLog(isImmortal ? 'CHEAT: IMMORTALITY OFF' : 'CHEAT: IMMORTALITY ON', {});
            cheatBuffer.current = ""; return;
        }

        const gotoMatch = cheatBuffer.current.match(/goto(0[1-9]|1[0-9]|20)$/);
        if (gotoMatch) {
            const targetFloor = parseInt(gotoMatch[1], 10);
            const currentLevelState = { world, floors, itemsOnFloor, monsters, visitedTiles: [...visitedTiles], biome };
            setDungeonMap(prev => ({ ...prev, [dungeonLevel]: currentLevelState }));
            setDungeonLevel(targetFloor);
            
            if (dungeonMap[targetFloor]) {
                const lvl = dungeonMap[targetFloor];
                setWorld(lvl.world); setFloors(lvl.floors); setItemsOnFloor(lvl.itemsOnFloor); setMonsters(lvl.monsters); setVisitedTiles(new Set(lvl.visitedTiles)); setBiome(lvl.biome || 'dungeon');
                let spawnTile = lvl.floors[0];
                setPlayer(p => ({ ...p, x: spawnTile.x, y: spawnTile.y }));
                updateVisibility(spawnTile.x, spawnTile.y, new Set(lvl.visitedTiles), lvl.world);
            } else {
                initLevel(targetFloor, 'start');
            }
            addLog('logs.cheat_activated', { msg: `TELEPORTED TO FLOOR ${targetFloor}` });
            cheatBuffer.current = ""; return;
        }

        if (screen!=='GAME'||isLevelingUp||isShopping||isPrincessMenuOpen||isTrainerMenuOpen) return; 
        const m={w:[0,-1],arrowup:[0,-1],s:[0,1],arrowdown:[0,1],a:[-1,0],arrowleft:[-1,0],d:[1,0],arrowright:[1,0]}; 
        if(m[e.key.toLowerCase()]) handleTurn(...m[e.key.toLowerCase()]); 
        if(e.code==='Space') handleUseSkill(); 
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [player, monsters, screen, isLevelingUp, skillCooldown, world, isShopping, isImmortal, dungeonLevel, dungeonMap, floors, itemsOnFloor, visitedTiles, biome, isPrincessMenuOpen, isTrainerMenuOpen]);

  const handleRestart = useCallback(() => {
      playButtonSound();
      setScreen('MENU');
  }, [playButtonSound]);
  
  const handleSettings = useCallback(() => { playButtonSound(); setPrevScreen('GAME'); setScreen('SETTINGS'); }, [playButtonSound]);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center font-['Press_Start_2P'] select-none overflow-hidden text-white">
       {screen === 'MENU' && <MainMenu onStart={() => { playButtonSound(); setScreen('INTRO'); }} onContinue={() => { playButtonSound(); loadGame(); }} hasSave={hasSave} onSettings={() => { playButtonSound(); setScreen('SETTINGS'); }} difficulty={difficulty} setDifficulty={(d) => { playButtonSound(); setDifficulty(d); }} t={t} />}
       {screen === 'INTRO' && <IntroScene onComplete={() => { playButtonSound(); startNewGame(); }} />}
       {screen === 'ENDING' && <EndingScene onComplete={() => { playButtonSound(); setIsCampaignCleared(true); initVillage(); setScreen('GAME'); }} />}
       {screen === 'TRUE_ENDING' && <TrueEndingScene onComplete={() => { playButtonSound(); setScreen('VICTORY'); }} />}
       {screen === 'VICTORY' && <VictoryScreen onRestart={handleRestart} />}
       {screen === 'SETTINGS' && <SettingsMenu lang={lang} setLang={(l) => { playButtonSound(); setLang(l); }} volume={volume} setVolume={setVolume} resolution={resolution} onChangeResolution={handleResolutionChange} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} onBack={() => { playButtonSound(); setScreen(prevScreen); }} t={t} />}
       {isLevelingUp && <LevelUpModal options={levelUpOptions} onSelect={(opt) => { 
           playButtonSound();
           setPlayer(prev => {
               const withEffect = opt.effect(prev);
               return { ...withEffect, lvl: prev.lvl + 1, exp: prev.exp - prev.nextLvlExp, nextLvlExp: Math.floor(prev.nextLvlExp * 1.5) };
           });
           setIsLevelingUp(false); addLog('logs.level_up', {}); 
       }} t={t} />}
       {isShopping && <ShopMenu onClose={() => { playButtonSound(); setIsShopping(false); }} inventory={inventory} gold={player.gold} playerLvl={player.lvl} onSell={handleSellItem} onBuy={handleBuyItem} shopItems={shopInventories[dungeonLevel] || []} t={t} />}
       {isPrincessMenuOpen && <PrincessMenu onClose={() => { playButtonSound(); setIsPrincessMenuOpen(false); }} relationship={relationship} playerGold={player.gold} onAction={handleVillageAction} />}
       {isTrainerMenuOpen && <TrainerMenu onClose={() => { playButtonSound(); setIsTrainerMenuOpen(false); }} playerGold={player.gold} onAction={handleVillageAction} />}

       {screen === 'GAME' && (
         <div className="flex w-full h-full">
            <div className="flex-1 relative overflow-hidden bg-[#0d0d12]" ref={viewportRef}>
               <div 
                  className="absolute transition-transform duration-200 ease-out will-change-transform"
                  style={{ 
                     width: GRID_SIZE * TILE_SIZE, height: GRID_SIZE * TILE_SIZE,
                     transform: `translate3d(${viewportSize.w/2 - player.x*TILE_SIZE - TILE_SIZE/2}px, ${viewportSize.h/2 - player.y*TILE_SIZE - TILE_SIZE/2}px, 0)`
                  }}
               >
                  {world.map((row, y) => row.map((tile, x) => {
                      const tileKey = `${x},${y}`;
                      if (!visitedTiles.has(tileKey)) return null;
                      return <GridTile key={tileKey} x={x} y={y} tile={tile} isVisible={visibleTiles.has(tileKey)} biome={biome} />;
                  }))}
                  
                  {itemsOnFloor.map(i => <ItemEntity key={i.id} item={i} isVisible={visibleTiles.has(`${i.x},${i.y}`)} />)}
                  {monsters.map(m => <MonsterEntity key={m.id} m={m} isVisible={visibleTiles.has(`${m.x},${m.y}`)} />)}
                  
                  <PlayerEntity player={player} isGameOver={isGameOver} />
               </div>
            </div>
            <MainGameUI t={t} player={player} dungeonLevel={dungeonLevel} inventory={inventory} equipment={equipment} log={log} onUseItem={handleUseItem} onUnequip={handleUnequip} onUseSkill={handleUseSkill} skillCooldown={skillCooldown} isGameOver={isGameOver} onRestart={handleRestart} onSaveAndExit={saveGame} onSettings={handleSettings} />
         </div>
       )}
    </div>
  );
};

export default App;