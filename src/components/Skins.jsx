import React, { useState, useEffect, useRef } from 'react';

import warriorSprite from '../assets/sprites/warrior.png';

import slimeSprite from '../assets/sprites/slime.png';
import batSprite from '../assets/sprites/bat.png';
import skeletonSprite from '../assets/sprites/skeleton.png';
import orcSprite from '../assets/sprites/orc.png';
import dragonSprite from '../assets/sprites/dragon.png';
import lichSprite from '../assets/sprites/lich.png';
import princessSprite from '../assets/sprites/princess2.png';

const generatedCreatures = import.meta.glob('../assets/tiles/entity_*.bmp', { eager: true, import: 'default' });

import hpPotSprite from '../assets/sprites/hp_pot.png';
import mpPotSprite from '../assets/sprites/mp_pot.png';
import rustySwordSprite from '../assets/sprites/rusty_sword.png';
import daggerSprite from '../assets/sprites/dagger.png';
import fireWandSprite from '../assets/sprites/fire_wand.png';
import iceWandSprite from '../assets/sprites/ice_wand.png';
import healingWandSprite from '../assets/sprites/healing_wand.png';
import leatherArmorSprite from '../assets/sprites/leather_armor.png';

import merchantPortraitSrc from '../assets/tiles/merchant_portrait.bmp';

export const MerchantPortrait = () => (
    <img src={merchantPortraitSrc} alt="Merchant" className="w-full h-full object-cover pixelated shadow-2xl border-4 border-amber-900 rounded-lg" style={{imageRendering: 'pixelated'}} />
);

const tiles = import.meta.glob('../assets/tiles/*.bmp', { eager: true, import: 'default' });

const getTileImage = (type, biome, variant) => {
    const path = `../assets/tiles/${type}_${biome}_${variant}.bmp`;
    return tiles[path];
};

const getVariant = (x, y, variants) => {
    const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    const idx = Math.floor(Math.abs(hash) % variants.length);
    return variants[idx];
};

export const FloorTile = React.memo(({ biome = 'dungeon', x, y }) => {
    const isSpecial = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1) > 0.92;
    let variant = 'tile';
    
    if (isSpecial) {
        const variants = ['small_tile', 'noise', 'paver']; 
        const hash = Math.floor(Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % variants.length);
        variant = variants[hash];
    }
    
    const src = getTileImage('floor', biome, variant);

    return (
        <div className="w-full h-full bg-[#202025] relative">
            {src ? (
                <img 
                    src={src} 
                    alt="floor" 
                    className="w-full h-full object-cover pixelated" 
                    style={{imageRendering: 'pixelated', filter: 'brightness(1.1)'}} 
                />
            ) : (
                <div className="w-full h-full border border-white/5 opacity-20" />
            )}
        </div>
    );
});

export const WallTile = React.memo(({ biome = 'dungeon', x, y }) => {
    const isSpecial = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1) > 0.95;
    let variant = 'brick';
    
    if (isSpecial) {
        const variants = ['bigblock', 'pillar', 'cracked', 'ornate'];
        const hash = Math.floor(Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % variants.length);
        variant = variants[hash];
    }
    
    const src = getTileImage('wall', biome, variant);

    return (
        <div className="w-full h-full bg-slate-950 relative overflow-hidden">
            {src ? (
                <>
                    <img 
                        src={src} 
                        alt="wall" 
                        className="w-full h-full object-cover pixelated" 
                        style={{imageRendering: 'pixelated', filter: 'brightness(0.9)'}} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/10 pointer-events-none" />
                </>
            ) : (
                <div className="w-full h-full bg-[#101015] border border-white/10" />
            )}
        </div>
    );
});

export const DoorTile = React.memo(({ isOpen }) => (
  <div className="w-full h-full relative">
    {isOpen ? (
      <div className="w-full h-full bg-[#14141a] relative flex justify-between">
        <div className="w-1.5 h-full bg-[#3e2723] border-r border-[#222] shadow-md"></div>
        <div className="w-1.5 h-full bg-[#3e2723] border-l border-[#222] shadow-md"></div>
        <div className="absolute bottom-0 w-full h-full bg-black/20"></div>
      </div>
    ) : (
      <div className="w-full h-full bg-[#4e342e] relative border border-[#271c19] shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-b from-[#5d4037] to-[#3e2723]"></div>
        <div className="absolute top-2 w-full h-px bg-[#271c19] opacity-50"></div>
        <div className="absolute bottom-2 w-full h-px bg-[#271c19] opacity-50"></div>
        <div className="absolute left-1/2 w-px h-full bg-[#271c19] opacity-50"></div>
        <div className="absolute top-1/2 right-1 w-1.5 h-1.5 bg-yellow-600 rounded-full border border-yellow-800 shadow-sm"></div>
        <div className="absolute top-1 left-0.5 w-1 h-1 bg-gray-600"></div>
        <div className="absolute bottom-1 left-0.5 w-1 h-1 bg-gray-600"></div>
      </div>
    )}
  </div>
));

export const StairsDownTile = React.memo(() => (
  <div className="w-full h-full bg-black flex flex-col items-center justify-center relative border border-[#333]">
     <div className="w-3/4 h-3/4 bg-gradient-to-br from-[#222] to-black border border-[#444] grid grid-rows-3">
        <div className="bg-[#333] border-b border-black"></div>
        <div className="bg-[#222] border-b border-black"></div>
        <div className="bg-[#111]"></div>
     </div>
     <div className="absolute text-[6px] text-red-500 font-bold bottom-0.5 animate-pulse">DOWN</div>
  </div>
));

export const StairsUpTile = React.memo(() => (
  <div className="w-full h-full bg-[#1a1a24] flex flex-col items-center justify-center relative border border-[#333]">
     <div className="w-3/4 h-3/4 bg-gradient-to-tl from-[#222] to-[#444] border border-[#555] grid grid-rows-3 shadow-lg">
        <div className="bg-[#555] border-b border-[#333]"></div>
        <div className="bg-[#444] border-b border-[#333]"></div>
        <div className="bg-[#333]"></div>
     </div>
     <div className="absolute text-[6px] text-cyan-400 font-bold top-0.5">UP</div>
  </div>
));

export const PlayerSkin = React.memo(({ player, charClass, isGameOver }) => {
  const currentClass = player ? player.class : charClass;

  const [isHit, setIsHit] = useState(false);
  const prevHp = useRef(player ? player.hp : 100);

  useEffect(() => {
    if (player && player.hp !== undefined && player.hp < prevHp.current) {
      setIsHit(true);
      const timer = setTimeout(() => setIsHit(false), 300);
      return () => clearTimeout(timer);
    }
    if (player && player.hp !== undefined) {
      prevHp.current = player.hp;
    }
  }, [player ? player.hp : undefined]);

  if (isGameOver) return <div className="text-4xl">💀</div>;

  const animClass = isHit ? 'animate-hit' : '';
  const shadow = "drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]";
  
  let SpriteSrc = null;
  SpriteSrc = warriorSprite;
  if (SpriteSrc) {
    return <img src={SpriteSrc} alt={currentClass} className={`w-full h-full object-contain ${shadow} ${animClass}`} />;
  }

  return <div className={`w-full h-full bg-blue-500 border-2 border-white rounded-full ${animClass}`}></div>;
});

export const ShopkeeperSkin = React.memo(() => (
  <div className="w-full h-full flex items-center justify-center drop-shadow-lg relative">
     <div className="absolute bottom-0 w-full h-3 bg-[#5d4037] border-t-2 border-[#3e2723] rounded-sm z-20"></div>
     <div className="w-6 h-7 bg-amber-800 rounded-t-full border border-amber-950 relative z-10 bg-gradient-to-b from-amber-700 to-amber-900">
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white rounded-full border border-gray-300 shadow-sm"></div> 
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full border border-blue-700 shadow-[0_0_2px_blue]"></div> 
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-3 bg-[#e0ac69] rounded-full"> 
           <div className="absolute top-1 left-0.5 w-0.5 h-0.5 bg-black"></div>
           <div className="absolute top-1 right-0.5 w-0.5 h-0.5 bg-black"></div>
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-black rounded-b-full opacity-80"></div> 
        </div>
     </div>
  </div>
));

export const MonsterSkin = React.memo(({ monster }) => {
  if (!monster) return null;
  
  const [isHit, setIsHit] = useState(false);
  const prevHp = useRef(monster.hp);

  useEffect(() => {
    if (monster.hp < prevHp.current) {
      setIsHit(true);
      const timer = setTimeout(() => setIsHit(false), 300);
      return () => clearTimeout(timer);
    }
    prevHp.current = monster.hp;
  }, [monster.hp]);

  const animClass = isHit ? 'animate-hit' : '';
  const shadow = "drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]";
  
  const scaleMap = {
    lich: 'scale-350',
    princess: 'scale-100',
    slime:'scale-180',
    bat:'scale-140'
    
  };

  const monsterSpriteMap = {
    slime: slimeSprite,
    bat: batSprite,
    skeleton: skeletonSprite,
    orc: orcSprite,
    dragon: dragonSprite,
    lich: lichSprite,
    princess: princessSprite
  };
  const { type } = monster;
  const customScale = scaleMap[type] || 'scale-100';

  const renderVisual = () => {
    let SpriteSrc = monsterSpriteMap[type]; 
    
    if (!SpriteSrc) {
        const genKey = `../assets/tiles/entity_${type}.bmp`;
        if (generatedCreatures[genKey]) {
            SpriteSrc = generatedCreatures[genKey];
        }
    }

    if (SpriteSrc) {
      return <img src={SpriteSrc} alt={type} className={`w-full h-full object-contain ${shadow} ${animClass} ${customScale}`} style={{imageRendering: 'pixelated'}} />;
    }
    return <div className={`w-full h-full bg-red-800 rounded-full border-2 border-red-950 ${animClass} ${customScale}`}></div>;
  };

  return (
    <>
      {renderVisual()}
      {type !== 'princess' && (
        <div className={`absolute top-0 left-0 w-full h-1 bg-red-900 mt-[-4px] z-30 ${animClass}`}>
              <div className="bg-red-500 h-full transition-all duration-200" style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }}/>
        </div>
      )}
    </>
  );
});

export const ItemSkin = React.memo(({ type }) => {
  const shadow = "drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]";
  const itemSpriteMap = {
    potion_hp: hpPotSprite,
    potion_mp: mpPotSprite,
    sword_rusty: rustySwordSprite,
    sword_iron: rustySwordSprite, 
    dagger_iron: daggerSprite,
    dagger_shadow: daggerSprite,
    wand_fire: fireWandSprite,
    wand_ice: iceWandSprite,
    wand_heal: healingWandSprite,
    armor_leather: leatherArmorSprite,
    armor_chain: leatherArmorSprite, 
  };

  const scaleMap = {
    potion_hp: 'scale-75',
    potion_mp: 'scale-75',
    sword_iron: 'scale-110'
  };

  let SpriteSrc = itemSpriteMap[type];
  const customScale = scaleMap[type] || 'scale-100';
  let finalClassName = `w-full h-full object-contain ${shadow} ${customScale}`;

  if (type === 'potion_hp') {
    finalClassName += ' animate-bounce';
  } else if (type === 'potion_mp') {
    finalClassName += ' animate-bounce delay-75';
  }

  if (!SpriteSrc) {
    if (type.includes('sword')) {
      SpriteSrc = rustySwordSprite;
    } else if (type.includes('dagger')) {
      SpriteSrc = daggerSprite;
    } else if (type.includes('wand')) {
      SpriteSrc = fireWandSprite;
    } else if (type.includes('armor')) {
      SpriteSrc = leatherArmorSprite;
    }
  }

  if (SpriteSrc) {
    return <img src={SpriteSrc} alt={type} className={finalClassName} />;
  }

  return <div className="text-xs text-gray-500">?</div>;
});

export const BedTile = React.memo(() => (
  <div className="w-full h-full bg-red-900 border-2 border-red-950 shadow-md flex items-center justify-center relative">
     <div className="w-[80%] h-[30%] bg-white rounded-sm absolute top-1"></div>
     <div className="w-full h-1/2 bg-red-700 absolute bottom-0 border-t border-red-800"></div>
  </div>
));

export const DungeonEntranceTile = React.memo(() => (
  <div className="w-full h-full bg-black border-4 border-slate-800 rounded-t-full shadow-inner flex items-center justify-center">
    <div className="w-[70%] h-[70%] bg-slate-900 rounded-t-full flex items-center justify-center">
        <div className="text-[5px] text-red-500 animate-pulse font-bold">ENTER</div>
    </div>
  </div>
));

export const PrincessNpcTile = React.memo(() => (
  <div className="w-full h-full flex items-center justify-center">
     <img src={princessSprite} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
  </div>
));

export const TrainerNpcTile = React.memo(() => (
  <div className="w-full h-full flex items-center justify-center drop-shadow-lg">
     <img src={warriorSprite} className="w-full h-full object-contain filter grayscale sepia sepia-[.5] hue-rotate-180" style={{ imageRendering: 'pixelated' }} />
  </div>
));

export const GearIcon = React.memo(() => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-400 hover:text-yellow-400 transition-colors drop-shadow-sm"><path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.343c-.2.143-.321.173-.425.173-.103 0-.225-.03-.425-.173L7.38 4.356c-.722-.515-1.72-.456-2.38.163l-1.393 1.325c-.626.596-.732 1.53-.254 2.234l1.246 1.83c.123.182.123.417 0 .599l-1.246 1.83c-.478.704-.372 1.638.254 2.234l1.393 1.325c.66.62 1.658.678 2.38.163l.82-.582c.2-.143.322-.173.425-.173.103 0 .225.03.425.173l.82.582c.918.65 1.698.59 2.38-.059l1.393-1.325c.626-.596.732-1.53.254-2.234l-1.246-1.83a.423.423 0 010-.599l1.246-1.83c.478-.704.372-1.638-.254-2.234l-1.393-1.325c-.66-.62-1.658-.678-2.38-.163l-.82.582c-.151-.904-.933-1.567-1.85-1.567h-1.933zM12 14.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" /></svg>));