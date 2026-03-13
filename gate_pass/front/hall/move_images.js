const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'img');
const publicSlidesDir = path.join(__dirname, 'public', 'slides');

if (!fs.existsSync(publicSlidesDir)) {
    fs.mkdirSync(publicSlidesDir, { recursive: true });
}

const files = fs.readdirSync(imgDir);

files.forEach(file => {
    const oldPath = path.join(imgDir, file);
    const newPath = path.join(publicSlidesDir, file);

    fs.copyFileSync(oldPath, newPath);
    console.log(`Copied ${file} to public/slides/`);
});

console.log('All files copied successfully.');
