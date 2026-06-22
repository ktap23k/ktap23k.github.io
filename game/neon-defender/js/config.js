export const COLORS = {
  player: '#00f0ff',
  playerCore: '#ffffff',
  playerEngine: '#39ff14',
  drone: '#ff2a6d',
  interceptor: '#fcee0a',
  tank: '#39ff14',
  bullet: '#00f0ff',
  health: '#39ff14',
  rapid: '#fcee0a',
  text: '#f0f0f5',
};

export const SIZES = {
  player: { width: 48, height: 58 },
  bullet: { width: 4, height: 18 },
  powerup: 18,
};

export const ENEMY_TYPES = {
  DRONE: 0,
  INTERCEPTOR: 1,
  TANK: 2,
};

export const ENEMY_SPECS = {
  [ENEMY_TYPES.DRONE]: {
    name: 'drone',
    sides: 6,
    color: COLORS.drone,
    baseSize: 28,
    sizeVar: 6,
    baseSpeed: 70,
    speedVar: 30,
    baseHp: 1,
    spin: 0.04,
    score: 10,
  },
  [ENEMY_TYPES.INTERCEPTOR]: {
    name: 'interceptor',
    sides: 3,
    color: COLORS.interceptor,
    baseSize: 24,
    sizeVar: 5,
    baseSpeed: 130,
    speedVar: 50,
    baseHp: 1,
    spin: 0.08,
    score: 15,
  },
  [ENEMY_TYPES.TANK]: {
    name: 'tank',
    sides: 8,
    color: COLORS.tank,
    baseSize: 38,
    sizeVar: 8,
    baseSpeed: 45,
    speedVar: 15,
    baseHp: 4,
    spin: 0.02,
    score: 40,
  },
};

export const PLAYER = {
  maxHp: 100,
  baseShootInterval: 0.22,
  rapidShootInterval: 0.09,
  rapidDuration: 5000,
  invulnerableTime: 1.2,
  damage: 25,
  collisionDamage: 25,
};

export const AUDIO = {
  masterVolume: 0.6,
  shootVolume: 0.12,
  explosionVolume: 0.18,
  hitVolume: 0.1,
  powerupVolume: 0.12,
  levelUpVolume: 0.2,
};

export const STORAGE_KEYS = {
  highScore: 'neon_defender_highscore',
  sound: 'neon_defender_sound',
};
