const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const INPUT_LOGO = 'c:/miniproject app/voting-app/public/logo.png';
const RES_DIR = 'c:/miniproject app/voting-app/android/app/src/main/res';

const SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
};

async function generateIcons() {
    for (const [folder, size] of Object.entries(SIZES)) {
        const targetFolder = path.join(RES_DIR, folder);
        if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder, { recursive: true });

        // Standard icon
        await sharp(INPUT_LOGO)
            .resize(size, size)
            .toFile(path.join(targetFolder, 'ic_launcher.png'));

        // Foreground icon (for adaptive icons)
        await sharp(INPUT_LOGO)
            .resize(size, size)
            .toFile(path.join(targetFolder, 'ic_launcher_foreground.png'));

        // Round icon (simple crop)
        await sharp(INPUT_LOGO)
            .resize(size, size)
            .composite([{
                input: Buffer.from(`<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}" /></svg>`),
                blend: 'dest-in'
            }])
            .toFile(path.join(targetFolder, 'ic_launcher_round.png'));
            
        console.log(`Generated icons for ${folder} (${size}x${size})`);
    }
}

generateIcons().catch(console.error);
