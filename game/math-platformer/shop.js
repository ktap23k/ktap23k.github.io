/* =========================================
   MATH JUMP ADVENTURE — SHOP + SKINS
   =========================================
   Currency, unlockable skins, shop items,
   inventory/persistent unlocks.
   ========================================= */

const Shop = (function () {
  const SKINS = {
    fox: { id: 'fox', name: 'Cáo cam', color: '#f97316', secondary: '#ea580c', unlock: 'default' },
    blue: { id: 'blue', name: 'Cáo xanh', color: '#3b82f6', secondary: '#2563eb', unlock: 'segment10' },
    ninja: { id: 'ninja', name: 'Cáo Ninja', color: '#4b5563', secondary: '#111827', unlock: 'score5000' },
    golden: { id: 'golden', name: 'Cáo vàng', color: '#facc15', secondary: '#ca8a04', unlock: 'coins1000' },
    rainbow: { id: 'rainbow', name: 'Cáo cầu vồng', color: '#ec4899', secondary: '#8b5cf6', unlock: 'combo10' }
  };

  const state = {
    coins: 0,
    ownedItems: { extraLife: 0, shieldStart: 0, hintRemove: 0, slowMotion: 0 },
    unlockedSkins: ['fox'],
    currentSkin: 'fox'
  };

  const ITEMS = [
    { id: 'extraLife', name: 'Extra Life', desc: '+1 mạng khi bắt đầu màn', cost: 100, effect: 'life' },
    { id: 'shieldStart', name: 'Shield Start', desc: 'Bắt đầu với 3s bất tử', cost: 200, effect: 'shield' },
    { id: 'hintRemove', name: 'Hint Remove', desc: 'Loại bỏ 1 đáp án sai trong game', cost: 50, effect: 'hint' },
    { id: 'slowMotion', name: 'Slow Motion', desc: 'Slow motion 3s khi gần rơi', cost: 150, effect: 'slow' }
  ];

  function init(saved) {
    if (saved) load(saved);
  }

  function getSkin(id) {
    return SKINS[id] || SKINS.fox;
  }

  function getCurrentSkin() {
    return getSkin(state.currentSkin);
  }

  function setSkin(id) {
    if (state.unlockedSkins.includes(id)) {
      state.currentSkin = id;
      save();
      return true;
    }
    return false;
  }

  function addCoins(amount) {
    state.coins += amount;
    save();
    return state.coins;
  }

  function getCoins() {
    return state.coins;
  }

  function getOwnedItems() {
    return { ...state.ownedItems };
  }

  function canAfford(cost) {
    return state.coins >= cost;
  }

  function buy(itemId) {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return { ok: false, msg: 'Không tìm thấy vật phẩm' };
    if (!canAfford(item.cost)) return { ok: false, msg: 'Không đủ coins' };
    state.coins -= item.cost;
    state.ownedItems[itemId] = (state.ownedItems[itemId] || 0) + 1;
    save();
    return { ok: true, msg: `Đã mua ${item.name}` };
  }

  function useItem(itemId) {
    if (!state.ownedItems[itemId]) return false;
    state.ownedItems[itemId]--;
    save();
    return true;
  }

  function hasItem(itemId) {
    return (state.ownedItems[itemId] || 0) > 0;
  }

  function checkUnlocks(stats) {
    const newUnlocks = [];
    const check = [
      { id: 'blue', condition: stats.segmentIndex >= 10 },
      { id: 'ninja', condition: stats.score >= 5000 },
      { id: 'golden', condition: state.coins >= 1000 },
      { id: 'rainbow', condition: stats.comboMax >= 10 }
    ];
    check.forEach(c => {
      if (c.condition && !state.unlockedSkins.includes(c.id)) {
        state.unlockedSkins.push(c.id);
        newUnlocks.push(SKINS[c.id].name);
      }
    });
    if (newUnlocks.length) save();
    return newUnlocks;
  }

  function getUnlockedSkins() {
    return [...state.unlockedSkins];
  }

  function isUnlocked(id) {
    return state.unlockedSkins.includes(id);
  }

  function getItems() {
    return ITEMS.map(i => ({ ...i }));
  }

  function load(saved) {
    if (saved.coins !== undefined) state.coins = saved.coins;
    if (saved.ownedItems) state.ownedItems = { ...state.ownedItems, ...saved.ownedItems };
    if (Array.isArray(saved.unlockedSkins)) state.unlockedSkins = saved.unlockedSkins;
    if (saved.currentSkin && SKINS[saved.currentSkin]) state.currentSkin = saved.currentSkin;
  }

  function save() {
    try {
      const progress = JSON.parse(localStorage.getItem('mathjump_progress') || '{}');
      progress.coins = state.coins;
      progress.ownedItems = state.ownedItems;
      progress.unlockedSkins = state.unlockedSkins;
      progress.currentSkin = state.currentSkin;
      localStorage.setItem('mathjump_progress', JSON.stringify(progress));
    } catch (e) { /* ignore */ }
  }

  function getState() {
    return {
      coins: state.coins,
      ownedItems: { ...state.ownedItems },
      unlockedSkins: [...state.unlockedSkins],
      currentSkin: state.currentSkin
    };
  }

  return {
    init,
    getSkin,
    getCurrentSkin,
    setSkin,
    addCoins,
    getCoins,
    getOwnedItems,
    canAfford,
    buy,
    useItem,
    hasItem,
    checkUnlocks,
    getUnlockedSkins,
    isUnlocked,
    getItems,
    load,
    save,
    getState
  };
})();

if (typeof window !== 'undefined') {
  window.Shop = Shop;
}
