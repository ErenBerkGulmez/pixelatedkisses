export const BIOMES = [
  'dungeon',
  'mossy',
  'prison',
  'sewer',
  'forest',
  'ice',
  'aquatic',
  'desert',
  'wooden',
  'royal',
  'crystal',
  'clockwork',
  'lab',
  'necropolis',
  'flesh',
  'burnt',
  'lava',
  'sky',
  'ethereal',
  'candy'
];

export const GRID_SIZE = 30;
export const TILE_SIZE = 64; 

export const MONSTER_TYPES = [
  { type: 'slime', baseHp: 15, baseAtk: 3, baseExp: 20, minFloor: 1, ai: 'chase', gold: [4, 10] },
  { type: 'bat', baseHp: 5, baseAtk: 5, baseExp: 35, minFloor: 1, ai: 'wander', gold: [2, 5] },
  { type: 'skeleton', baseHp: 35, baseAtk: 3, baseExp: 55, minFloor: 4, ai: 'ranged', gold: [25, 45] }, 
  { type: 'orc', baseHp: 70, baseAtk: 7, baseExp: 100, minFloor: 9, ai: 'chase', gold: [100, 300] },
  { type: 'dragon', baseHp: 600, baseAtk: 40, baseExp: 2000, minFloor: 40, ai: 'chase', gold: [400, 800] },
];

export const ITEMS = {
  potion_hp: { type: 'potion_hp', slot: 'consumable', effect: 80, basePrice: 15, minFloor: 1 },
  potion_mp: { type: 'potion_mp', slot: 'consumable', effect: 80, basePrice: 15, minFloor: 3 },
  
  sword_rusty: { type: 'sword_rusty', slot: 'weapon', atk: 8, crit: 0.1, dur: 40, maxDur: 40, skill: 'bash', basePrice: 40, minFloor: 1 },
  sword_iron: { type: 'sword_iron', slot: 'weapon', atk: 18, crit: 0.15, dur: 80, maxDur: 80, skill: 'power_strike', basePrice: 120, minFloor: 4 },
  
  dagger_iron: { type: 'dagger_iron', slot: 'weapon', atk: 8, crit: 0.35, dur: 55, maxDur: 55, skill: 'stab', basePrice: 100, minFloor: 2 },
  dagger_shadow: { type: 'dagger_shadow', slot: 'weapon', atk: 14, crit: 0.60, dur: 40, maxDur: 40, skill: 'assassinate', basePrice: 250, minFloor: 7 },

  wand_fire: { type: 'wand_fire', slot: 'weapon', atk: 6, crit: 0.0, dur: 40, maxDur: 40, skill: 'fireball', basePrice: 150, minFloor: 5 },
  wand_ice: { type: 'wand_ice', slot: 'weapon', atk: 6, crit: 0.0, dur: 40, maxDur: 40, skill: 'freeze', basePrice: 150, minFloor: 6 },
  wand_heal: { type: 'wand_heal', slot: 'weapon', atk: 4, crit: 0.0, dur: 30, maxDur: 30, skill: 'heal', basePrice: 200, minFloor: 3 },

  armor_leather: { type: 'armor_leather', slot: 'armor', def: 6, dur: 70, maxDur: 70, basePrice: 80, minFloor: 1 },
  armor_chain: { type: 'armor_chain', slot: 'armor', def: 12, dur: 120, maxDur: 120, basePrice: 200, minFloor: 5 },
};

export const SKILLS = {
    bash: { cost: 5 },
    power_strike: { cost: 10 },
    stab: { cost: 5 },
    assassinate: { cost: 15 },
    fireball: { cost: 15 },
    freeze: { cost: 15 },
    heal: { cost: 20 },
    teleport: { cost: 10 }
};

export const CHAR_CLASSES = {
  warrior: { hp: 180, mp: 60, attack: 18, defense: 6, class: 'warrior' },
};