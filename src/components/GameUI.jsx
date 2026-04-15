import React from 'react';
import { GearIcon, ItemSkin, PlayerSkin, MerchantPortrait } from './Skins';
import { ITEMS, SKILLS } from '../data/constants';
import { useTranslation } from 'react-i18next';
import lichSprite from '../assets/sprites/lich.png';
import princessSprite from '../assets/sprites/princess.png';
import warriorSprite from '../assets/sprites/warrior.png';

const getItemTooltip = (item, t) => {
  if (!item || !ITEMS[item.type]) return "";
  const base = ITEMS[item.type];
  let text = t(`item_descs.${item.type}`);
  
  if (base.slot === 'consumable') {
      const isHp = item.type.includes('hp');
      text += `\n+${base.effect} ${isHp ? t('ui.hp') : t('ui.mp')}`;
  } else {
      const atk = item.atk ?? base.atk;
      const def = item.def ?? base.def;
      if (atk) text += `\n⚔️ ${atk}`;
      if (def) text += `\n🛡️ ${def}`;
      if (base.crit) text += `\n🎯 ${Math.floor(base.crit * 100)}%`;
  }
  return text;
};

export const IntroScene = React.memo(({ onComplete }) => {
  const [step, setStep] = React.useState(0);
  const dialogs = [
    { speaker: "LICH KING", text: "MWAHAHA! THE PRINCESS IS MINE NOW, FOOLISH HERO!", color: "text-red-400", portrait: lichSprite, imgClass: "scale-[8] translate-y-24" },
    { speaker: "PRINCESS", text: "HELP ME, BRAVE WARRIOR! HE IS TAKING ME TO THE 20TH FLOOR!", color: "text-pink-300", portrait: princessSprite, imgClass: "scale-[2] translate-y-8" },
    { speaker: "WARRIOR", text: "HANG ON! I WILL TEAR THIS DUNGEON APART TO FIND YOU!", color: "text-sky-400", portrait: warriorSprite, imgClass: "scale-[2.5] translate-y-12" }
  ];

  const nextStep = () => {
    if (step < dialogs.length - 1) setStep(step + 1);
    else onComplete();
  };

  const current = dialogs[step];

  return (
    <div className="absolute inset-0 bg-black/60 z-[100] flex flex-col justify-end p-10 font-['Press_Start_2P']" onClick={nextStep}>
      <div className="relative w-full max-w-4xl mx-auto bg-[#1a1c2c] border-4 border-slate-600 p-1 ring-4 ring-black shadow-2xl">
        <div className="absolute -top-28 left-8 flex items-end gap-4">
          <div className="w-24 h-24 bg-[#1a1c2c] border-4 border-slate-600 p-1 ring-4 ring-black overflow-hidden">
            <img src={current.portrait} className={`w-full h-full object-contain ${current.imgClass}`} style={{ imageRendering: 'pixelated' }} alt="portrait" />
          </div>
          <div className={`text-lg mb-2 bg-black/90 px-5 py-2 border-2 border-slate-700 ${current.color}`}>
            {current.speaker}
          </div>
        </div>
        <div className="p-8 text-xl leading-relaxed text-slate-200 min-h-[140px]">
          {current.text}
          <div className="absolute bottom-4 right-4 text-[10px] text-slate-500 animate-pulse uppercase tracking-widest">▼ Click to continue</div>
        </div>
      </div>
    </div>
  );
});

export const EndingScene = React.memo(({ onComplete }) => {
  const [step, setStep] = React.useState(0);
  const dialogs = [
    { speaker: "PRINCESS", text: "MY HERO! YOU DEFEATED THE LICH AND SAVED ME!", color: "text-pink-300", portrait: princessSprite, imgClass: "scale-[2] translate-y-8" },
    { speaker: "WARRIOR", text: "IT WAS DANGEROUS, BUT YOU ARE SAFE NOW. LET'S GO TO THE VILLAGE.", color: "text-sky-400", portrait: warriorSprite , imgClass: "scale-[2.5] translate-y-12" }
  ];

  const nextStep = () => {
    if (step < dialogs.length - 1) setStep(step + 1);
    else onComplete();
  };

  const current = dialogs[step];

  return (
    <div className="absolute inset-0 bg-black/60 z-[100] flex flex-col justify-end p-10 font-['Press_Start_2P']" onClick={nextStep}>
      <div className="relative w-full max-w-4xl mx-auto bg-[#1a1c2c] border-4 border-slate-600 p-1 ring-4 ring-black shadow-2xl">
        <div className="absolute -top-28 left-8 flex items-end gap-4">
          <div className="w-24 h-24 bg-[#1a1c2c] border-4 border-slate-600 p-1 ring-4 ring-black overflow-hidden">
            <img src={current.portrait} className={`w-full h-full object-contain ${current.imgClass}`} style={{ imageRendering: 'pixelated' }} alt="portrait" />
          </div>
          <div className={`text-lg mb-2 bg-black/90 px-5 py-2 border-2 border-slate-700 ${current.color}`}>
            {current.speaker}
          </div>
        </div>
        <div className="p-8 text-xl leading-relaxed text-slate-200 min-h-[140px]">
          {current.text}
          <div className="absolute bottom-4 right-4 text-[10px] text-slate-500 animate-pulse uppercase tracking-widest">▼ Click to continue</div>
        </div>
      </div>
    </div>
  );
});

export const TrueEndingScene = React.memo(({ onComplete }) => {
  const [step, setStep] = React.useState(0);
  const dialogs = [
    { speaker: "PRINCESS", text: "YOU HAVE PROVEN YOUR VALOR AND KINDNESS... I LOVE YOU!", color: "text-pink-300", portrait: princessSprite, imgClass: "scale-[2] translate-y-8" },
    { speaker: "PRINCESS", text: "*KISSES YOU GENTLY*", color: "text-red-400", portrait: princessSprite, imgClass: "scale-[2.5] translate-y-6" },
    { speaker: "WARRIOR", text: "...", color: "text-sky-400", portrait: warriorSprite, imgClass: "scale-[2.5] translate-y-12" }
  ];

  const nextStep = () => {
    if (step < dialogs.length - 1) setStep(step + 1);
    else onComplete();
  };

  const current = dialogs[step];

  return (
    <div className="absolute inset-0 bg-black/60 z-[100] flex flex-col justify-end p-10 font-['Press_Start_2P']" onClick={nextStep}>
      <div className="relative w-full max-w-4xl mx-auto bg-[#1a1c2c] border-4 border-slate-600 p-1 ring-4 ring-black shadow-2xl">
        <div className="absolute -top-28 left-8 flex items-end gap-4">
          <div className="w-24 h-24 bg-[#1a1c2c] border-4 border-slate-600 p-1 ring-4 ring-black overflow-hidden">
            <img src={current.portrait} className={`w-full h-full object-contain ${current.imgClass}`} style={{ imageRendering: 'pixelated' }} alt="portrait" />
          </div>
          <div className={`text-lg mb-2 bg-black/90 px-5 py-2 border-2 border-slate-700 ${current.color}`}>
            {current.speaker}
          </div>
        </div>
        <div className="p-8 text-xl leading-relaxed text-slate-200 min-h-[140px]">
          {current.text}
          <div className="absolute bottom-4 right-4 text-[10px] text-slate-500 animate-pulse uppercase tracking-widest">▼ Click to continue</div>
        </div>
      </div>
    </div>
  );
});

export const VictoryScreen = React.memo(({ onRestart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#0f172a] text-white gap-10 font-['Press_Start_2P'] z-[100] absolute inset-0 text-center">
       <h1 className="text-6xl text-yellow-400 leading-tight drop-shadow-[6px_6px_0_rgba(0,0,0,1)] uppercase">TRUE VICTORY!<br/><span className="text-xl text-white tracking-[0.3em]">YOU SAVED THE REALM</span></h1>
       <img src={princessSprite} className="w-40 h-40 animate-bounce" style={{ imageRendering: 'pixelated' }} />
       <button onClick={onRestart} className="py-6 px-12 bg-emerald-600 hover:bg-emerald-500 border-b-8 border-emerald-900 active:border-b-0 active:translate-y-2 transition-all text-2xl font-bold">RETURN TO MENU</button>
    </div>
  );
});

export const PrincessMenu = React.memo(({ onClose, relationship, playerGold, onAction }) => {
  return (
    <div className="absolute inset-0 bg-black/95 z-[100] flex items-center justify-center font-['Press_Start_2P'] p-6 text-white">
        <div className="w-full max-w-2xl bg-[#1e293b] border-4 border-pink-900 p-8 flex flex-col gap-8 shadow-2xl">
            <h2 className="text-3xl text-pink-400 text-center uppercase tracking-widest border-b-4 border-pink-900 pb-4">PRINCESS</h2>
            <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-black border-4 border-pink-900 p-2"><img src={princessSprite} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} /></div>
                <div className="flex-1">
                    <div className="text-xs mb-3 text-pink-200">RELATIONSHIP: {relationship}%</div>
                    <div className="w-full h-6 bg-black border-2 border-slate-700 p-1"><div className="h-full bg-pink-500 transition-all" style={{width: `${relationship}%`}} /></div>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                {relationship < 100 ? (
                    <button onClick={() => onAction('gift')} className={`w-full py-5 border-b-4 transition-all active:translate-y-1 active:border-b-0 ${playerGold >= 1000 ? 'bg-pink-700 hover:bg-pink-600 border-pink-950' : 'bg-slate-700 text-slate-500 border-slate-900 cursor-not-allowed'}`}>GIVE GIFT (1000G)</button>
                ) : (
                    <button onClick={() => onAction('confess')} className="w-full py-5 bg-red-600 hover:bg-red-500 border-b-4 border-red-900 transition-all active:translate-y-1 active:border-b-0 animate-pulse">CONFESS LOVE</button>
                )}
                <button onClick={onClose} className="w-full py-5 bg-slate-700 hover:bg-slate-600 border-b-4 border-slate-900 transition-all active:translate-y-1 active:border-b-0">LEAVE</button>
            </div>
        </div>
    </div>
  );
});

export const TrainerMenu = React.memo(({ onClose, playerGold, onAction }) => {
  return (
    <div className="absolute inset-0 bg-black/95 z-[100] flex items-center justify-center font-['Press_Start_2P'] p-6 text-white">
        <div className="w-full max-w-2xl bg-[#1e293b] border-4 border-amber-900 p-8 flex flex-col gap-8 shadow-2xl">
            <h2 className="text-3xl text-amber-400 text-center uppercase tracking-widest border-b-4 border-amber-900 pb-4">TRAINING</h2>
            <div className="text-center text-yellow-400 mb-2">YOUR GOLD: {playerGold}G</div>
            <div className="flex flex-col gap-4">
                <button onClick={() => onAction('hp')} className={`w-full py-5 border-b-4 transition-all active:translate-y-1 active:border-b-0 ${playerGold >= 300 ? 'bg-amber-700 hover:bg-amber-600 border-amber-950' : 'bg-slate-700 text-slate-500 border-slate-900 cursor-not-allowed'}`}>+20 MAX HP (300G)</button>
                <button onClick={() => onAction('atk')} className={`w-full py-5 border-b-4 transition-all active:translate-y-1 active:border-b-0 ${playerGold >= 500 ? 'bg-amber-700 hover:bg-amber-600 border-amber-950' : 'bg-slate-700 text-slate-500 border-slate-900 cursor-not-allowed'}`}>+2 BASE ATK (500G)</button>
                <button onClick={onClose} className="w-full py-5 bg-slate-700 hover:bg-slate-600 border-b-4 border-slate-900 transition-all active:translate-y-1 active:border-b-0 mt-4">LEAVE</button>
            </div>
        </div>
    </div>
  );
});

export const ShopMenu = React.memo(({ onClose, inventory, onSell, onBuy, gold, playerLvl }) => {
  const { t } = useTranslation();
  const shopItems = React.useMemo(() => {
      const allItems = Object.keys(ITEMS);
      return Array.from({ length: 5 }, () => {
          const type = allItems[Math.floor(Math.random() * allItems.length)];
          const baseData = ITEMS[type];
          const itemLvl = Math.max(1, playerLvl + Math.floor(Math.random() * 3) - 1);
          return { id: Math.random(), type, itemLvl, price: baseData.basePrice * itemLvl, ...baseData, atk: baseData.atk ? Math.floor(baseData.atk * (1 + itemLvl * 0.2)) : 0 };
      });
  }, [playerLvl]);

  return (
    <div className="absolute inset-0 bg-black/95 z-[100] flex items-center justify-center font-['Press_Start_2P'] p-6 text-white">
        <div className="w-full max-w-5xl bg-[#1e293b] border-4 border-slate-700 p-1 ring-4 ring-black flex flex-col gap-6 shadow-2xl">
            <div className="flex justify-between items-center bg-slate-900 p-6 border-b-4 border-slate-700">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-slate-800 border-2 border-amber-600 p-1"><MerchantPortrait /></div>
                    <h2 className="text-3xl text-amber-500 uppercase tracking-widest italic">DUNGEON SHOP</h2>
                </div>
                <div className="text-yellow-400 text-2xl bg-black px-6 py-4 border-2 border-yellow-600/30 shadow-inner italic">💰 {gold}G</div>
            </div>

            <div className="flex gap-6 p-4 h-[500px]">
                <div className="flex-1 bg-black/20 p-5 border-2 border-slate-700 overflow-y-auto custom-scrollbar">
                    <h3 className="text-xs text-emerald-400 mb-6 sticky top-0 bg-[#1e293b] py-2 underline decoration-double text-center font-bold">BUY</h3>
                    <div className="grid gap-3">
                        {shopItems.map((item) => (
                            <div key={item.id} onClick={() => onBuy(item)} className="p-4 bg-slate-800/80 hover:bg-slate-700 border-2 border-transparent hover:border-emerald-500 cursor-pointer flex justify-between items-center transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 shrink-0 bg-black/40 p-1 border border-slate-600"><ItemSkin type={item.type}/></div>
                                    <div className="text-[11px]">
                                      <div className="text-white group-hover:text-emerald-300">{t(`items.${item.type}`)}</div>
                                      <div className="text-slate-500 mt-1 uppercase italic">Lv.{item.itemLvl}</div>
                                    </div>
                                </div>
                                <div className={`text-sm ${gold >= item.price ? 'text-yellow-400' : 'text-rose-500'}`}>{item.price}G</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-black/20 p-5 border-2 border-slate-700 overflow-y-auto custom-scrollbar">
                    <h3 className="text-xs text-rose-400 mb-6 sticky top-0 bg-[#1e293b] py-2 underline decoration-double text-center font-bold">SELL</h3>
                    <div className="grid gap-3">
                        {inventory.map((item) => {
                            const price = Math.floor((ITEMS[item.type].basePrice * (item.itemLvl || 1)) / 2); 
                            return (
                                <div key={item.id} onClick={() => onSell(item, price)} className="p-4 bg-slate-800/80 hover:bg-slate-700 border-2 border-transparent hover:border-rose-500 cursor-pointer flex justify-between items-center transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-black/40 p-1 border border-slate-600 group-hover:scale-110 transition-transform"><ItemSkin type={item.type}/></div>
                                        <div className="text-[11px] text-white">
                                          {t(`items.${item.type}`)} {item.count > 1 && <span className="text-sky-400 ml-1">x{item.count}</span>}
                                        </div>
                                    </div>
                                    <div className="text-sm text-emerald-400 font-bold">+{price}G</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="mx-6 mb-6 py-5 bg-slate-700 hover:bg-rose-900 text-white text-lg border-b-4 border-black transition-all active:border-b-0 active:translate-y-1 font-bold">LEAVE</button>
        </div>
    </div>
  );
});

export const MainMenu = React.memo(({ onStart, onContinue, hasSave, onSettings, difficulty, setDifficulty, t }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#0a0a0a] text-white font-['Press_Start_2P'] relative overflow-hidden">
      <div className="z-10 flex flex-col items-center">
        <div className="mb-20 relative text-center">
          <h1 className="text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-500 to-red-600 drop-shadow-[8px_8px_0_rgba(0,0,0,1)] italic">PIXELATED<br/>KISSES</h1>
        </div>
        <div className="flex flex-col gap-5 w-[400px]">
          {hasSave && <button onClick={onContinue} className="w-full py-6 bg-sky-700 hover:bg-sky-600 border-b-6 border-sky-950 text-xl font-bold transition-all transform hover:-translate-y-1">{t('menu.continue')}</button>}
          <button onClick={onStart} className="w-full py-6 bg-emerald-700 hover:bg-emerald-600 border-b-6 border-emerald-950 text-xl font-bold transition-all transform hover:-translate-y-1">{t('menu.play')}</button>
          <button onClick={onSettings} className="w-full py-5 bg-slate-800 hover:bg-slate-700 border-b-4 border-black text-sm transition-all font-bold opacity-80 hover:opacity-100 uppercase">{t('menu.settings')}</button>
          
          <div className="flex justify-between items-center bg-black/50 p-4 border-2 border-slate-700 mt-4 cursor-pointer hover:border-yellow-500 transition-all" onClick={() => setDifficulty(d => d === 'normal' ? 'hardcore' : 'normal')}>
            <span className="text-xs text-slate-300">MODE:</span>
            <span className={`text-sm ${difficulty === 'hardcore' ? 'text-red-500' : 'text-emerald-500'}`}>{difficulty.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export const LevelUpModal = React.memo(({ options, onSelect, t }) => (
  <div className="absolute inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center font-['Press_Start_2P'] p-10">
    <h2 className="text-8xl text-yellow-400 mb-12 animate-pulse tracking-tighter drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">LEVEL UP!</h2>
    <div className="grid gap-5 w-full max-w-xl">
      {options.map((opt) => (
        <button key={opt.key} onClick={() => onSelect(opt)} className="group bg-[#1e293b] border-4 border-slate-700 p-6 flex items-center gap-14 hover:border-yellow-500 hover:bg-slate-800 transition-all text-left transform hover:scale-105">
          <div className="text-8xl group-hover:scale-110 transition-transform">{opt.icon}</div>
          <div>
            <div className="text-2xl text-yellow-200 uppercase mb-2 font-bold">{t(`upgrades.${opt.key}`)}</div>
          </div>
        </button>
      ))}
    </div>
  </div>
));

export const SettingsMenu = React.memo(({ lang, setLang, volume, setVolume, resolution, onChangeResolution, isFullscreen, onToggleFullscreen, onBack, t }) => (
  <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#0f172a] text-white gap-8 font-['Press_Start_2P'] p-10 z-50 absolute inset-0">
    <h2 className="text-4xl text-gray-300 border-b-4 border-slate-700 pb-6 italic uppercase">Settings</h2>
    <div className="flex flex-col gap-8 w-[550px] bg-[#1e293b] p-10 border-4 border-black shadow-[0_0_0_6px_#334155]">
      <div>
        <label className="text-yellow-500 text-sm block mb-4 font-bold uppercase">{t('menu.language')}</label>
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full p-5 bg-black text-white text-lg border-2 border-slate-700 cursor-pointer">
          <option value="tr">TÜRKÇE</option>
          <option value="en">ENGLISH</option>
        </select>
      </div>
      <div>
        <label className="text-yellow-500 text-sm block mb-4 font-bold uppercase">{t('menu.resolution')}</label>
        <select value={resolution} onChange={(e) => onChangeResolution(e.target.value)} className="w-full p-5 bg-black text-white text-lg border-2 border-slate-700 cursor-pointer">
          <option value="1024x768">1024x768</option>
          <option value="1280x720">1280x720</option>
          <option value="1920x1080">1920x1080</option>
        </select>
      </div>
      <div className="flex items-center justify-between bg-black p-5 border-2 border-slate-700 cursor-pointer hover:border-sky-500 transition-all" onClick={onToggleFullscreen}>
        <span className="text-yellow-500 text-sm font-bold uppercase">{t('menu.fullscreen')}</span>
        <div className={`w-8 h-8 border-2 border-white ${isFullscreen ? 'bg-emerald-500' : 'bg-rose-900'}`}></div>
      </div>
      <div>
        <label className="text-yellow-500 text-sm block mb-4 font-bold uppercase">{t('menu.sound')} {volume}%</label>
        <input type="range" value={volume} min="0" max="100" onChange={(e) => setVolume(e.target.value)} className="w-full h-6 cursor-pointer accent-sky-500"/>
      </div>
    </div>
    <button onClick={onBack} className="mt-8 px-16 py-6 bg-rose-800 hover:bg-rose-700 text-white text-xl border-b-6 border-rose-950 transition-all uppercase">Back</button>
  </div>
));

export const MainGameUI = React.memo(({ t, player, dungeonLevel, inventory, equipment, onUseItem, onUnequip, onUseSkill, skillCooldown, isGameOver, onRestart, onSaveAndExit, onSettings, log }) => {
  const weaponItem = equipment.weapon ? ITEMS[equipment.weapon.type] : null;
  const activeSkillKey = weaponItem ? weaponItem.skill : null;

  return (
  <div className="w-[460px] flex flex-col h-full font-['Press_Start_2P'] border-l-4 border-black bg-[#1a1c2c] text-white z-50 relative shadow-[-10px_0_40px_rgba(0,0,0,0.7)]">
    
    <div className="p-7 bg-[#243137] border-b-4 border-black">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-base text-slate-400 bg-black/40 px-4 py-2 inline-block border border-slate-700 uppercase">{dungeonLevel === 0 ? 'Village' : `Floor ${dungeonLevel}`}</div>
        </div>
        <div className="flex flex-col items-end gap-3">
           <div className="text-base bg-black px-4 py-2 border-2 border-slate-600 shadow-xl text-yellow-400 italic">LVL {player.lvl}</div>
           <button onClick={onSettings} className="p-3 hover:bg-slate-700 rounded-sm border border-transparent hover:border-slate-500 transition-all scale-125 active:scale-110"><GearIcon /></button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="relative h-9 bg-black border-2 border-slate-800 p-1">
          <div className="h-full bg-gradient-to-r from-rose-800 to-rose-500 transition-all duration-500" style={{ width: `${(player.hp/player.maxHp)*100}%` }} />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold drop-shadow-[2px_2px_0_rgba(0,0,0,1)] uppercase">HP {player.hp} / {player.maxHp}</div>
        </div>
        <div className="relative h-9 bg-black border-2 border-slate-800 p-1">
          <div className="h-full bg-gradient-to-r from-sky-800 to-sky-500 transition-all duration-500" style={{ width: `${(player.mp/player.maxMp)*100}%` }} />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold drop-shadow-[2px_2px_0_rgba(0,0,0,1)] uppercase">MP {player.mp} / {player.maxMp}</div>
        </div>
        <div className="relative h-3 bg-black overflow-hidden border border-slate-900">
          <div className="h-full bg-yellow-500 transition-all" style={{ width: `${(player.exp/(player.nextLvlExp || player.lvl*100))*100}%` }} />
        </div>
      </div>

      <div className="flex justify-between mt-8 text-sm bg-black/50 p-5 border-2 border-slate-800 shadow-inner rounded-sm font-bold">
        <span className="text-rose-400 flex items-center gap-2 scale-110">⚔️ {player.atk}</span>
        <span className="text-sky-400 flex items-center gap-2 scale-110">🛡️ {player.def || 0}</span>
        <span className="text-yellow-400 flex items-center gap-2 scale-110">💰 {player.gold}</span>
      </div>
    </div>

    <div className="p-5 flex flex-col gap-6 overflow-hidden grow bg-[#1a1c2c]">
      <div className="flex gap-3">
        <div className="flex-[1.2] bg-[#243137] p-3 border-4 border-black flex justify-around items-center h-24 shadow-xl">
          <div onClick={() => equipment.weapon && onUnequip('weapon')} title={getItemTooltip(equipment.weapon, t)} className={`w-14 h-14 bg-black/60 border-2 flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${equipment.weapon ? 'border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'border-slate-800 opacity-40'}`}>
            <div className="scale-[1.8]">{equipment.weapon ? <ItemSkin type={equipment.weapon.type} /> : <span className="text-[9px] text-slate-600 font-bold uppercase italic">Wpn</span>}</div>
          </div>
          <div onClick={() => equipment.armor && onUnequip('armor')} title={getItemTooltip(equipment.armor, t)} className={`w-14 h-14 bg-black/60 border-2 flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${equipment.armor ? 'border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'border-slate-800 opacity-40'}`}>
            <div className="scale-[1.8]">{equipment.armor ? <ItemSkin type={equipment.armor.type} /> : <span className="text-[9px] text-slate-600 font-bold uppercase italic">Arm</span>}</div>
          </div>
        </div>
        <div className="flex-1 bg-[#243137] border-4 border-black p-3 flex flex-col gap-2 shadow-xl">
          <div className="text-[8px] text-slate-500 text-center uppercase font-bold tracking-tighter">Skill Slot</div>
          <button onClick={onUseSkill} disabled={skillCooldown > 0 || !activeSkillKey} className={`grow flex items-center justify-center text-xs border-b-6 active:border-b-0 active:translate-y-1 transition-all font-bold shadow-md ${skillCooldown > 0 || !activeSkillKey ? 'bg-slate-800 border-black text-slate-600' : 'bg-indigo-700 border-indigo-950 text-white hover:bg-indigo-600'}`}>
            {skillCooldown > 0 ? skillCooldown : activeSkillKey ? `${SKILLS[activeSkillKey].cost}MP` : '---'}
          </button>
        </div>
      </div>

      <div className="bg-[#243137] border-4 border-black p-4 grow min-h-0 flex flex-col shadow-xl">
        <div className="text-[10px] text-slate-400 mb-4 border-b border-slate-700 pb-2 flex justify-between uppercase font-bold tracking-widest">
          <span>Inventory</span>
          <span className="text-sky-500">{inventory.length} / 15</span>
        </div>
        <div className="grid grid-cols-5 gap-3 overflow-y-auto pr-1 custom-scrollbar">
          {inventory.map((item) => (
            <div key={item.id} onClick={() => onUseItem(item)} title={getItemTooltip(item, t)} className="aspect-square bg-black/50 border-2 border-slate-700 hover:border-white transition-all flex items-center justify-center relative group cursor-pointer hover:bg-slate-800">
              <div className="scale-[1.4] group-hover:scale-[1.6] transition-transform"><ItemSkin type={item.type} /></div>
              {item.count > 1 && <span className="absolute -bottom-1 -right-1 bg-sky-700 text-[7px] px-1 py-0.5 border border-black font-bold">{item.count}</span>}
            </div>
          ))}
          {Array.from({ length: Math.max(0, 15 - inventory.length) }).map((_, i) => <div key={i} className="aspect-square bg-black/10 border border-slate-800/40 rounded-sm" />)}
        </div>
      </div>

      <div className="h-44 bg-black border-2 border-slate-800 p-4 text-[11px] leading-5 overflow-y-auto custom-scrollbar font-sans tracking-tight shadow-inner italic">
        {log.map((entry, i) => {
          let content;
          if (typeof entry === 'string') {
              content = entry;
          } else {
              const params = { ...entry.params };
              ['target', 'source', 'item', 'skill'].forEach(key => {
                  if (params[key]) {
                      if (key === 'skill') {
                           const sk = `skills.${params[key]}.name`;
                           const tr = t(sk);
                           if (tr !== sk) { params[key] = tr; return; }
                      }
                      const tKey = `items.${params[key]}`;
                      const tVal = t(tKey);
                      if (tVal !== tKey) params[key] = tVal;
                      else if (typeof params[key] === 'string') params[key] = params[key].charAt(0).toUpperCase() + params[key].slice(1);
                  }
              });
              content = t(entry.key, params);
          }
          return (
              <div key={entry.id || i} className={`mb-2 pb-2 border-b border-slate-900/50 last:border-0 ${i === 0 ? "text-yellow-400 font-bold not-italic border-l-2 border-l-yellow-600 pl-3" : "text-slate-500 pl-3"}`}>
                {content}
              </div>
          );
        })}
      </div>
    </div>

    <div className="p-6 bg-[#1a1c2c] border-t-4 border-slate-800">
      {isGameOver ? 
        <button onClick={onRestart} className="w-full py-5 bg-rose-700 hover:bg-rose-600 text-lg font-bold border-b-6 border-rose-950 transition-all active:border-b-0 active:translate-y-1 uppercase tracking-widest">Retry Mission</button> : 
        <button onClick={onSaveAndExit} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-[10px] border-b-4 border-black text-slate-400 hover:text-white transition-all font-bold uppercase tracking-widest">Save & Exit</button>
      }
    </div>
  </div>
  );
});