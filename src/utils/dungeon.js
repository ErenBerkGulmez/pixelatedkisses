import { GRID_SIZE, MONSTER_TYPES, ITEMS, BIOMES } from '../data/constants';

export const generateDungeon = (level, entryType = 'start') => { 
  const biomeIndex = Math.min(Math.floor((level - 1) / 5), BIOMES.length - 1);
  const biome = BIOMES[biomeIndex];

  const world = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('wall'));
  const rooms = [];
  const floors = [];
  const monsters = [];
  const items = [];

  if (level > 0 && level % 5 === 0) {
      const w = 12; const h = 10;
      const x = Math.floor((GRID_SIZE - w) / 2);
      const y = Math.floor((GRID_SIZE - h) / 2);
      
      const safeRoom = { x, y, w, h };
      createRoom(safeRoom, world, floors);
      rooms.push(safeRoom);

      const npcX = x + Math.floor(w/2);
      const npcY = y + Math.floor(h/2) - 2;
      world[npcY][npcX] = 'shop_npc';
      world[npcY][npcX + 2] = 'dungeon_entrance';

      const startPos = { x: x + Math.floor(w/2), y: y + 1 };
      const endPos = { x: x + Math.floor(w/2), y: y + h - 2 };
      
      if(level > 1) world[startPos.y][startPos.x] = 'stairs_up';
      world[endPos.y][endPos.x] = 'stairs_down';

      let playerSpawn = startPos;
      if (entryType === 'up') playerSpawn = endPos;

      return { world, rooms, floors, playerSpawn, monsters, items, isSafe: true, map: world, biome };
  }

  let retries = 0;
  let success = false;
  
  while (retries < 10 && !success) {
      rooms.length = 0;
      floors.length = 0;
      for(let y=0; y<GRID_SIZE; y++) for(let x=0; x<GRID_SIZE; x++) world[y][x] = 'wall';

      const maxRooms = Math.floor(Math.random() * 8) + 8;
      const minRoomSize = 4;
      const maxRoomSize = 12;

      for (let i = 0; i < maxRooms; i++) {
        const w = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
        const h = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
        const x = Math.floor(Math.random() * (GRID_SIZE - w - 2)) + 1;
        const y = Math.floor(Math.random() * (GRID_SIZE - h - 2)) + 1;

        const newRoom = { x, y, w, h };
        let failed = false;

        for (let other of rooms) {
          if (newRoom.x - 1 <= other.x + other.w && newRoom.x + newRoom.w + 1 >= other.x && newRoom.y - 1 <= other.y + other.h && newRoom.y + newRoom.h + 1 >= other.y) {
            failed = true; break;
          }
        }

        if (!failed) {
          createRoom(newRoom, world, floors);
          if (rooms.length > 0) {
            const prev = rooms[rooms.length - 1];
            const prevCenter = { x: Math.floor(prev.x + prev.w / 2), y: Math.floor(prev.y + prev.h / 2) };
            const newCenter = { x: Math.floor(newRoom.x + newRoom.w / 2), y: Math.floor(newRoom.y + newRoom.h / 2) };
            if (Math.random() > 0.5) {
              createHCorridor(prevCenter.x, newCenter.x, prevCenter.y, world, floors);
              createVCorridor(prevCenter.y, newCenter.y, newCenter.x, world, floors);
            } else {
              createVCorridor(prevCenter.y, newCenter.y, prevCenter.x, world, floors);
              createHCorridor(prevCenter.x, newCenter.x, newCenter.y, world, floors);
            }
          }
          rooms.push(newRoom);
        }
      }
      
      if (rooms.length >= 5) success = true;
      retries++;
  }

  for (let y = 1; y < GRID_SIZE - 1; y++) {
    for (let x = 1; x < GRID_SIZE - 1; x++) {
      if (world[y][x] === 'floor') {
        const n = world[y-1][x], s = world[y+1][x], w = world[y][x-1], e = world[y][x+1];
        
        let isDoorway = false;
        if (n === 'wall' && s === 'wall' && w === 'floor' && e === 'floor') {
            const westIsRoom = world[y-1][x-1] === 'floor' || world[y+1][x-1] === 'floor';
            const eastIsRoom = world[y-1][x+1] === 'floor' || world[y+1][x+1] === 'floor';
            
            if (westIsRoom || eastIsRoom) isDoorway = true;
        }
        else if (w === 'wall' && e === 'wall' && n === 'floor' && s === 'floor') {
            const northIsRoom = world[y-1][x-1] === 'floor' || world[y-1][x+1] === 'floor';
            const southIsRoom = world[y+1][x-1] === 'floor' || world[y+1][x+1] === 'floor';
            
            if (northIsRoom || southIsRoom) isDoorway = true;
        }

        if (isDoorway && Math.random() > 0.3) {
            let tooClose = false;
            for(let dy=-2; dy<=2; dy++) {
                for(let dx=-2; dx<=2; dx++) {
                    if(world[y+dy]?.[x+dx] === 'door_closed') tooClose = true;
                }
            }
            if (!tooClose) {
                world[y][x] = 'door_closed';
            }
        }
      }
    }
  }

  const firstRoom = rooms[0];
  const lastRoom = rooms[rooms.length - 1];
  const startPos = { x: Math.floor(firstRoom.x + firstRoom.w / 2), y: Math.floor(firstRoom.y + firstRoom.h / 2) };
  const endPos = { x: Math.floor(lastRoom.x + lastRoom.w / 2), y: Math.floor(lastRoom.y + lastRoom.h / 2) };
  
  world[startPos.y][startPos.x] = 'floor';
  world[endPos.y][endPos.x] = 'floor';

  if (level > 1) world[startPos.y][startPos.x] = 'stairs_up';
  world[endPos.y][endPos.x] = 'stairs_down';
  
  let playerSpawn = startPos;
  if (entryType === 'up') {
      playerSpawn = endPos;
  }

  const validSpawnTiles = floors.filter(tile => 
    !(tile.x === playerSpawn.x && tile.y === playerSpawn.y) && 
    world[tile.y][tile.x] !== 'stairs_up' && 
    world[tile.y][tile.x] !== 'stairs_down' &&
    world[tile.y][tile.x] !== 'door_closed'
  );

  const numMonsters = Math.floor(Math.random() * (4 + level)) + 2;
  const availableMonsterTypes = MONSTER_TYPES.filter(m => level >= m.minFloor);

  for (let i = 0; i < numMonsters; i++) {
    if (availableMonsterTypes.length === 0) break;
    const monsterType = availableMonsterTypes[Math.floor(Math.random() * availableMonsterTypes.length)];
    const spawnIndex = Math.floor(Math.random() * validSpawnTiles.length);
    const spawnTile = validSpawnTiles.splice(spawnIndex, 1)[0];

    if (spawnTile) {
        const monsterLevel = level;
        monsters.push({
            id: `monster-${i}-${level}-${Date.now()}`,
            x: spawnTile.x,
            y: spawnTile.y,
            type: monsterType.type,
            hp: monsterType.baseHp + (monsterLevel * 5),
            maxHp: monsterType.baseHp + (monsterLevel * 5),
            atk: monsterType.baseAtk + (monsterLevel * 2),
            exp: monsterType.baseExp + (monsterLevel * 10),
            gold: Math.floor(Math.random() * (monsterType.gold[1] - monsterType.gold[0] + 1)) + monsterType.gold[0],
            ai: monsterType.ai,
            level: monsterLevel
        });
    }
  }

  const numItems = Math.floor(Math.random() * 3) + 1;
  const availableItems = Object.values(ITEMS).filter(item => item.minFloor ? level >= item.minFloor : true);

  for (let i = 0; i < numItems; i++) {
    if (availableItems.length === 0) break;
    const itemType = availableItems[Math.floor(Math.random() * availableItems.length)];
    const spawnIndex = Math.floor(Math.random() * validSpawnTiles.length);
    const spawnTile = validSpawnTiles.splice(spawnIndex, 1)[0];

    if (spawnTile) {
        const itemLevel = itemType.slot === 'consumable' ? 1 : level; 
        const newItem = {
            id: `item-${i}-${level}-${Date.now()}`,
            x: spawnTile.x,
            y: spawnTile.y,
            type: itemType.type,
            itemLvl: itemLevel,
            ...itemType, 
            atk: itemType.atk ? Math.floor(itemType.atk + (itemLevel * 0.5)) : undefined, 
            def: itemType.def ? Math.floor(itemType.def + (itemLevel * 0.25)) : undefined 
        };
        items.push(newItem);
    }
  }
  
  return { world, rooms, floors, playerSpawn, monsters, items, isSafe: false, map: world, biome };
};

const createRoom = (room, world, floors) => {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      world[y][x] = 'floor';
      floors.push({ x, y });
    }
  }
};
const createHCorridor = (x1, x2, y, world, floors) => {
  for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
    if (world[y][x] === 'wall') { world[y][x] = 'floor'; floors.push({ x, y }); }
  }
};
const createVCorridor = (y1, y2, x, world, floors) => {
  for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
    if (world[y][x] === 'wall') { world[y][x] = 'floor'; floors.push({ x, y }); }
  }
};