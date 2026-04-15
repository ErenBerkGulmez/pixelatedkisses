import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../src/assets/tiles');

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Helper: Create BMP Buffer
function createBMP(width, height, getPixel) {
    const rowSize = (width * 3 + 3) & ~3;
    const size = 54 + rowSize * height;
    const buffer = Buffer.alloc(size);

    buffer.write('BM');
    buffer.writeUInt32LE(size, 2);
    buffer.writeUInt32LE(0, 6);
    buffer.writeUInt32LE(54, 10);
    buffer.writeUInt32LE(40, 14);
    buffer.writeInt32LE(width, 18);
    buffer.writeInt32LE(height, 22);
    buffer.writeUInt16LE(1, 26);
    buffer.writeUInt16LE(24, 28);
    buffer.writeUInt32LE(0, 30);
    buffer.writeUInt32LE(0, 34);
    buffer.writeInt32LE(2835, 38);
    buffer.writeInt32LE(2835, 42);
    buffer.writeUInt32LE(0, 46);
    buffer.writeUInt32LE(0, 50);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const [r, g, b] = getPixel(x, y);
            const fileY = height - 1 - y;
            const offset = 54 + fileY * rowSize + x * 3;
            buffer[offset] = Math.min(255, Math.max(0, b));
            buffer[offset + 1] = Math.min(255, Math.max(0, g));
            buffer[offset + 2] = Math.min(255, Math.max(0, r));
        }
    }
    return buffer;
}

// Color Helpers
const darken = (c, amount) => c.map(v => Math.max(0, v - amount));
const lighten = (c, amount) => c.map(v => Math.min(255, v + amount));
const noise = (c, amount) => {
    const n = Math.random() * amount - (amount / 2);
    return c.map(v => Math.max(0, Math.min(255, v + n)));
};
const mix = (c1, c2, factor) => c1.map((v, i) => v * (1 - factor) + c2[i] * factor);

// --- BIOME DEFINITIONS ---
// We define separate base colors for walls and floors to ensure visual distinction
const BIOMES = [
    { 
        name: 'dungeon',    
        wall: [70, 70, 80], floor: [130, 130, 140],
        accent: [40, 40, 50],  highlight: [100, 100, 110] 
    },
    { 
        name: 'mossy',      
        wall: [40, 60, 40], floor: [100, 130, 100],
        accent: [20, 40, 20],  highlight: [80, 110, 80] 
    },
    { 
        name: 'prison',     
        wall: [50, 50, 60], floor: [110, 110, 120],
        accent: [20, 20, 30],  highlight: [80, 80, 90] 
    },
    { 
        name: 'ice',        
        wall: [80, 140, 220], floor: [200, 230, 255],
        accent: [50, 100, 180], highlight: [220, 240, 255] 
    },
    { 
        name: 'lava',       
        wall: [30, 20, 20], floor: [60, 50, 50],
        accent: [255, 60, 0],  highlight: [80, 40, 40] 
    },
    { 
        name: 'forest',     
        wall: [20, 50, 20], floor: [60, 120, 60],
        accent: [80, 40, 20],  highlight: [40, 80, 40] 
    },
    { 
        name: 'desert',     
        wall: [160, 130, 80], floor: [230, 200, 150],
        accent: [120, 90, 40], highlight: [255, 240, 200] 
    },
    { 
        name: 'sewer',      
        wall: [40, 50, 20], floor: [90, 100, 60],
        accent: [20, 30, 10],  highlight: [60, 70, 30] 
    },
    { 
        name: 'crystal',    
        wall: [100, 40, 140], floor: [200, 150, 240],
        accent: [60, 20, 80],  highlight: [240, 180, 255] 
    },
    { 
        name: 'royal',      
        wall: [180, 150, 40], floor: [250, 250, 250],
        accent: [140, 110, 20], highlight: [255, 230, 100] 
    },
    { 
        name: 'wooden',     
        wall: [80, 50, 20], floor: [140, 100, 60],
        accent: [50, 30, 10],  highlight: [110, 70, 30] 
    },
    { 
        name: 'burnt',      
        wall: [20, 20, 20], floor: [70, 70, 70],
        accent: [0, 0, 0], highlight: [50, 50, 50] 
    },
    { 
        name: 'aquatic',    
        wall: [20, 60, 80], floor: [100, 180, 220],
        accent: [10, 40, 60],  highlight: [40, 100, 140] 
    },
    { 
        name: 'sky',        
        wall: [120, 120, 180], floor: [220, 220, 255],
        accent: [80, 80, 140], highlight: [180, 180, 240] 
    },
    { 
        name: 'necropolis', 
        wall: [30, 30, 40], floor: [70, 70, 80],
        accent: [0, 255, 100], highlight: [50, 50, 60] 
    },
    { 
        name: 'lab',        
        wall: [100, 100, 110], floor: [220, 220, 230],
        accent: [60, 60, 70],  highlight: [150, 150, 160] 
    },
    { 
        name: 'candy',      
        wall: [255, 80, 150], floor: [255, 200, 220],
        accent: [255, 255, 255], highlight: [255, 150, 200] 
    },
    { 
        name: 'ethereal',   
        wall: [100, 50, 150], floor: [150, 255, 255],
        accent: [255, 100, 255], highlight: [200, 100, 255] 
    },
    { 
        name: 'clockwork',  
        wall: [100, 60, 20], floor: [180, 140, 80],
        accent: [60, 30, 10],  highlight: [140, 100, 40] 
    },
    { 
        name: 'flesh',      
        wall: [100, 30, 30], floor: [200, 120, 120],
        accent: [60, 10, 10],  highlight: [150, 50, 50] 
    },
];

// --- PATTERN GENERATORS (32x32) ---

const PATTERNS = {
    // Walls
    wall_brick: (x, y, biome) => {
        const rowHeight = 8;
        const brickWidth = 16;
        const row = Math.floor(y / rowHeight);
        const rowOffset = (row % 2) * (brickWidth / 2);
        const isGrout = y % rowHeight === 0 || (x + rowOffset) % brickWidth === 0;
        if (isGrout) return darken(biome.wall, 40);
        
        let c = noise(biome.wall, 10);
        // Add 3D bevel
        if (y % rowHeight === 1) c = lighten(c, 20);
        if (y % rowHeight === 7) c = darken(c, 20);
        return c;
    },
    wall_bigblock: (x, y, biome) => {
        const size = 16;
        const isGrout = x % size === 0 || y % size === 0;
        if (isGrout) return darken(biome.wall, 50);
        
        let c = noise(biome.wall, 5);
        if ((x % size === 1) || (y % size === 1)) c = lighten(c, 30);
        if ((x % size === size - 1) || (y % size === size - 1)) c = darken(c, 30);
        return c;
    },
    wall_pillar: (x, y, biome) => {
        const col = Math.floor(x / 8);
        const isRecess = col % 2 === 1;
        if (isRecess) return darken(biome.wall, 40);
        let c = noise(biome.wall, 10);
        if (x % 8 === 1) c = lighten(c, 20);
        if (x % 8 === 7) c = darken(c, 20);
        return c;
    },
    wall_cracked: (x, y, biome) => {
        const isCrack = (Math.sin(x * 0.5 + y * 0.8) * Math.cos(y * 0.2)) > 0.8;
        if (isCrack) return biome.accent;
        return noise(biome.wall, 15);
    },
    wall_ornate: (x, y, biome) => {
        if (x < 2 || x > 29 || y < 2 || y > 29) return biome.accent;
        if (Math.abs(x - 16) + Math.abs(y - 16) < 6) return biome.accent;
        return noise(biome.wall, 10);
    },

    // Floors
    floor_tile: (x, y, biome) => {
        const size = 16;
        const isGrout = x % size === 0 || y % size === 0;
        if (isGrout) return darken(biome.floor, 30); 
        
        let c = noise(biome.floor, 15);
        // Add subtle speckles
        if (Math.random() > 0.9) c = darken(c, 20);
        return c;
    },
    floor_small_tile: (x, y, biome) => {
        const size = 8;
        const isGrout = x % size === 0 || y % size === 0;
        if (isGrout) return darken(biome.floor, 25);
        return noise(biome.floor, 12);
    },
    floor_noise: (x, y, biome) => {
        let c = noise(biome.floor, 30);
        if (Math.random() > 0.95) c = lighten(c, 40); // Sparkle/grit
        return c;
    },
    floor_checker: (x, y, biome) => {
        const size = 16;
        const isBlack = ((Math.floor(x / size) + Math.floor(y / size)) % 2) === 0;
        return isBlack ? noise(biome.floor, 10) : darken(noise(biome.floor, 10), 20);
    },
    floor_paver: (x, y, biome) => {
        const size = 8;
        const offX = (Math.floor(y / size) % 2) * 4;
        const isGrout = (x + offX) % size === 0 || y % size === 0;
        if (isGrout) return darken(biome.floor, 40);
        return noise(biome.floor, 15);
    }
};

// --- SOPHISTICATED SPRITE BUILDER ---
class SpriteBuilder {
    constructor(width, height) {
        this.w = width;
        this.h = height;
        this.pixels = new Array(width * height).fill(null);
    }

    // Set a pixel (safe bounds check)
    set(x, y, color) {
        x = Math.floor(x); y = Math.floor(y);
        if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
        this.pixels[y * this.w + x] = color;
    }

    get(x, y) {
        x = Math.floor(x); y = Math.floor(y);
        if (x < 0 || x >= this.w || y < 0 || y >= this.h) return null;
        return this.pixels[y * this.w + x];
    }

    // Draw a rectangle
    rect(x, y, w, h, color) {
        for(let iy=y; iy<y+h; iy++) {
            for(let ix=x; ix<x+w; ix++) {
                this.set(ix, iy, color);
            }
        }
        return this;
    }

    // Draw a circle/ellipse
    circle(cx, cy, r, color) {
        for(let y=cy-r; y<=cy+r; y++) {
            for(let x=cx-r; x<=cx+r; x++) {
                if ((x-cx)**2 + (y-cy)**2 <= r*r) {
                    this.set(x, y, color);
                }
            }
        }
        return this;
    }

    // Fill vertical symmetry (Left -> Right)
    mirror() {
        const cx = Math.floor(this.w / 2);
        for(let y=0; y<this.h; y++) {
            for(let x=0; x<cx; x++) {
                const color = this.get(x, y);
                if (color) {
                    this.set(this.w - 1 - x, y, color);
                }
            }
        }
        return this;
    }

    // Add noise texture to existing pixels
    noise(amount = 20) {
        for(let i=0; i<this.pixels.length; i++) {
            if (this.pixels[i]) {
                const [r, g, b] = this.pixels[i];
                const n = (Math.random() - 0.5) * amount;
                this.pixels[i] = [
                    Math.max(0, Math.min(255, r + n)),
                    Math.max(0, Math.min(255, g + n)),
                    Math.max(0, Math.min(255, b + n))
                ];
            }
        }
        return this;
    }

    // Add a dark outline around the sprite
    outline(color = [20, 20, 30]) {
        const oldPixels = [...this.pixels];
        for(let y=0; y<this.h; y++) {
            for(let x=0; x<this.w; x++) {
                if (oldPixels[y*this.w+x]) {
                    // Check neighbors
                    const neighbors = [
                        [x-1, y], [x+1, y], [x, y-1], [x, y+1]
                    ];
                    for(const [nx, ny] of neighbors) {
                        if (nx >= 0 && nx < this.w && ny >= 0 && ny < this.h) {
                            if (!oldPixels[ny*this.w+nx]) {
                                this.set(nx, ny, color);
                            }
                        }
                    }
                }
            }
        }
        return this;
    }

    // Render to BMP buffer
    toBuffer() {
        return createBMP(this.w, this.h, (x, y) => this.get(x, y) || [0,0,0,0]);
    }
}

// --- GENERATORS ---
const creatures = {
    rat: () => {
        const s = new SpriteBuilder(32, 32);
        s.circle(12, 20, 5, [140, 140, 140]); // Body
        s.circle(18, 22, 3, [140, 140, 140]); // Head
        s.rect(20, 21, 2, 1, [0, 0, 0]); // Eye
        s.rect(4, 20, 6, 2, [180, 100, 100]); // Tail
        return s.noise(10).outline().toBuffer();
    },
    spider: () => {
        const s = new SpriteBuilder(32, 32);
        // Body (Left side only, will mirror)
        s.circle(16, 16, 6, [60, 40, 40]); 
        s.circle(16, 22, 4, [40, 30, 30]); // Head
        // Legs (Left)
        s.rect(10, 14, 6, 2, [30, 20, 20]);
        s.rect(8, 16, 2, 6, [30, 20, 20]);
        s.rect(10, 20, 6, 2, [30, 20, 20]);
        s.rect(6, 22, 4, 2, [30, 20, 20]);
        // Eyes
        s.set(15, 23, [255, 0, 0]);
        return s.mirror().noise(15).outline().toBuffer();
    },
    goblin: () => {
        const s = new SpriteBuilder(32, 32);
        const skin = [80, 160, 60];
        // Head
        s.circle(16, 10, 5, skin);
        s.rect(9, 8, 4, 2, skin); // Left Ear
        // Body
        s.rect(13, 15, 6, 8, [100, 80, 50]);
        // Legs
        s.rect(13, 23, 2, 5, skin);
        // Arm
        s.rect(10, 16, 3, 5, skin);
        // Dagger
        s.rect(8, 14, 2, 6, [200, 200, 200]);
        return s.mirror().noise(10).outline().toBuffer();
    },
    ghost: () => {
        const s = new SpriteBuilder(32, 32);
        const white = [230, 230, 255];
        // Head/Body
        s.circle(16, 12, 7, white);
        s.rect(10, 12, 12, 12, white);
        // Tattered bottom
        s.rect(10, 24, 3, 4, white);
        s.rect(15, 24, 2, 3, white);
        s.rect(19, 24, 3, 5, white);
        // Eyes
        s.rect(13, 11, 2, 2, [50, 50, 80]);
        s.rect(17, 11, 2, 2, [50, 50, 80]);
        return s.noise(5).outline([100,100,150]).toBuffer();
    },
    mimic: () => {
        const s = new SpriteBuilder(32, 32);
        const wood = [120, 80, 40];
        // Box Base
        s.rect(8, 16, 16, 10, wood);
        // Lid (Open)
        s.rect(8, 6, 16, 8, wood);
        // Teeth
        s.rect(9, 14, 2, 2, [255,255,255]);
        s.rect(13, 14, 2, 2, [255,255,255]);
        s.rect(17, 14, 2, 2, [255,255,255]);
        s.rect(21, 14, 2, 2, [255,255,255]);
        // Tongue
        s.rect(14, 16, 4, 8, [200, 50, 50]);
        return s.noise(15).outline().toBuffer();
    },
    golem: () => {
        const s = new SpriteBuilder(32, 32);
        const stone = [140, 140, 150];
        // Torso
        s.rect(10, 10, 12, 10, stone);
        // Head
        s.rect(13, 5, 6, 5, stone);
        // Eye
        s.rect(15, 7, 2, 1, [100, 255, 255]);
        // Arms
        s.rect(6, 10, 4, 12, stone);
        // Legs
        s.rect(11, 20, 4, 8, stone);
        return s.mirror().noise(20).outline().toBuffer();
    },
    lich: () => {
        const s = new SpriteBuilder(32, 32);
        const robe = [80, 40, 100];
        // Body
        s.rect(12, 12, 8, 16, robe);
        // Head (Skull)
        s.circle(16, 9, 4, [220, 220, 200]);
        // Hood
        s.rect(11, 5, 10, 4, robe);
        // Staff (Right hand -> Mirror -> Left hand)
        // We'll draw staff on one side and NOT mirror it? No, mirror mirrors everything.
        // Let's draw symmetrical staff or just one side.
        s.rect(8, 6, 2, 20, [100, 80, 40]);
        s.circle(9, 6, 3, [50, 255, 50]);
        return s.mirror().noise(10).outline().toBuffer();
    },
    minotaur: () => {
        const s = new SpriteBuilder(32, 32);
        const fur = [120, 80, 50];
        // Body
        s.rect(10, 12, 12, 12, fur);
        // Head
        s.rect(12, 6, 8, 8, fur);
        // Horns
        s.rect(10, 4, 2, 4, [220, 220, 200]);
        // Legs
        s.rect(11, 24, 4, 6, fur);
        // Axe (One side)
        s.rect(6, 14, 2, 10, [100, 100, 100]); // Handle
        s.rect(4, 14, 6, 4, [180, 180, 180]); // Blade
        return s.mirror().noise(15).outline().toBuffer();
    },
    hydra: () => {
        const s = new SpriteBuilder(32, 32);
        const green = [40, 120, 60];
        // Body
        s.rect(10, 20, 12, 8, green);
        // Necks
        s.rect(11, 12, 2, 8, green); // Left
        s.rect(15, 10, 2, 10, green); // Center
        // Heads
        s.circle(12, 11, 3, green);
        s.circle(16, 9, 3, green);
        return s.mirror().noise(10).outline().toBuffer();
    },
    demon: () => {
        const s = new SpriteBuilder(32, 32);
        const red = [180, 40, 40];
        // Body
        s.rect(12, 12, 8, 10, red);
        // Head
        s.circle(16, 9, 4, red);
        // Horns
        s.rect(12, 5, 2, 3, [50, 50, 50]);
        // Wings
        s.rect(6, 8, 6, 10, [100, 20, 20]);
        // Legs
        s.rect(12, 22, 3, 6, red);
        return s.mirror().noise(10).outline().toBuffer();
    },
    titan: () => {
        const s = new SpriteBuilder(32, 32);
        const skin = [200, 160, 120];
        const gold = [220, 200, 50];
        // Body
        s.rect(10, 10, 12, 14, gold);
        // Head
        s.rect(13, 4, 6, 6, skin);
        // Helmet
        s.rect(13, 2, 6, 3, gold);
        // Arms
        s.rect(6, 10, 4, 10, skin);
        // Legs
        s.rect(11, 24, 4, 8, gold);
        return s.mirror().noise(5).outline([200, 200, 0]).toBuffer(); // Gold outline
    },
    beholder: () => {
        const s = new SpriteBuilder(32, 32);
        const purple = [120, 40, 180];
        s.circle(16, 16, 10, purple); // Body
        s.circle(16, 16, 5, [255, 255, 255]); // Large Eye
        s.circle(16, 16, 2, [0, 0, 0]); // Pupil
        // Stalks
        s.rect(8, 4, 2, 6, purple);
        s.rect(22, 4, 2, 6, purple);
        s.circle(9, 4, 2, [255, 0, 0]); // Tiny eyes
        s.circle(23, 4, 2, [255, 0, 0]);
        return s.noise(15).outline().toBuffer();
    },
    wraith: () => {
        const s = new SpriteBuilder(32, 32);
        const shadow = [40, 40, 60];
        s.circle(16, 12, 8, shadow);
        s.rect(8, 12, 16, 12, shadow);
        s.rect(8, 24, 4, 6, shadow);
        s.rect(20, 24, 4, 6, shadow);
        s.rect(13, 10, 2, 2, [0, 255, 255]); // Glowing eyes
        s.rect(17, 10, 2, 2, [0, 255, 255]);
        return s.noise(20).outline([0,0,0]).toBuffer();
    },
    basilisk: () => {
        const s = new SpriteBuilder(32, 32);
        const green = [60, 100, 40];
        s.rect(6, 18, 20, 8, green); // Long Body
        s.rect(24, 14, 6, 6, green); // Head
        s.rect(28, 16, 2, 1, [255, 255, 0]); // Eye
        s.rect(8, 26, 2, 4, green); // Leg 1
        s.rect(14, 26, 2, 4, green); // Leg 2
        s.rect(20, 26, 2, 4, green); // Leg 3
        return s.noise(10).outline().toBuffer();
    },
    paladin: () => {
        const s = new SpriteBuilder(32, 32);
        const steel = [180, 180, 200];
        s.rect(10, 10, 12, 14, steel); // Full Plate
        s.rect(12, 4, 8, 6, steel); // Great Helm
        s.rect(14, 7, 4, 1, [20, 20, 20]); // Visor slit
        s.rect(6, 10, 4, 14, steel); // Shield
        s.rect(22, 10, 4, 14, steel); // Arm
        s.rect(23, 4, 2, 8, [200, 200, 200]); // Mace/Sword
        return s.mirror().noise(5).outline().toBuffer();
    },
    succubus: () => {
        const s = new SpriteBuilder(32, 32);
        const skin = [255, 150, 180];
        s.circle(16, 10, 5, skin); // Head
        s.rect(12, 15, 8, 10, [100, 20, 50]); // Robe
        s.rect(4, 8, 8, 12, [60, 10, 30]); // Wing L
        s.rect(20, 8, 8, 12, [60, 10, 30]); // Wing R
        s.rect(12, 25, 3, 5, skin); // Leg L
        s.rect(17, 25, 3, 5, skin); // Leg R
        return s.noise(5).outline().toBuffer();
    }
};

Object.entries(creatures).forEach(([name, drawer]) => {
    fs.writeFileSync(path.join(OUT_DIR, `entity_${name}.bmp`), drawer());
});

console.log('Generated sophisticated creature sprites in src/assets/tiles');

console.log(`Generating ${BIOMES.length} biomes * ${Object.keys(PATTERNS).length} patterns...`);

BIOMES.forEach(biome => {

    Object.entries(PATTERNS).forEach(([patternName, generator]) => {

        // Generate file name: e.g., wall_dungeon_brick.bmp

        // Parse patternName to prefix: wall_brick -> wall, brick

        const [type, ...rest] = patternName.split('_');

        const variant = rest.join('_');

        

        const filename = `${type}_${biome.name}_${variant}.bmp`;

        const buffer = createBMP(32, 32, (x, y) => generator(x, y, biome));

        

        fs.writeFileSync(path.join(OUT_DIR, filename), buffer);

    });

});



// --- MERCHANT PORTRAIT (128x128) ---

const merchantPortrait = createBMP(128, 128, (x, y) => {

    // Background

    let r=40, g=30, b=50;



    // Shelves

    if ((y > 20 && y < 30) || (y > 50 && y < 60)) {

        r=80; g=50; b=30;

    }



    // Body/Robes

    if (x > 40 && x < 88 && y > 60 && y <= 110) {

        r=100; g=40; b=150;

    }



    // Head

    const dx = x - 64;

    const dyHead = y - 45;

    if (dx*dx + dyHead*dyHead < 400) {

        // Face skin

        if (Math.abs(dx) < 12 && dyHead > -5) {

            r=255; g=200; b=150;

            // Eyes

            if (Math.abs(dyHead - 0) < 2 && Math.abs(Math.abs(dx)-5) < 2) { r=0; g=0; b=0; }

        } else {

            // Hood

            r=80; g=30; b=120;

        }

    }



    // Counter

    if (y > 100) {

        r=120; g=80; b=40;

        // Grain

        if (x % 10 === 0) { r-=20; g-=20; }

    }



    return [r, g, b];

});

fs.writeFileSync(path.join(OUT_DIR, 'merchant_portrait.bmp'), merchantPortrait);



console.log(`Done! Created ${BIOMES.length * Object.keys(PATTERNS).length + 1} files in ${OUT_DIR}`);
