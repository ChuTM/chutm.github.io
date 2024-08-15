function removetheme() {
    // Remove all style sheets, apart from player.css
    var styles = document.querySelectorAll('link');
    styles.forEach(function (style) {
        if (style.href != 'player.css') {
            style.remove();
        }
    });
}
function theme(t) {
    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = t;
    document.head.appendChild(style);
}

var immerse = (e) => {
    if (searchParams.get('lyrics') != '') {
        var style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = 'themes/immerse.css';
        style.id = 'immerse';
        document.head.appendChild(style);
        e.getElementsByTagName('img')[0].src = 'assets/icons/contextMenu/immersive_filled.svg';
        e.onclick = () => normal(e);
        localStorage.setItem('theme', 'immerse');
    } else {
        Alert('No lyrics found for this song.')
    }
}

var normal = (e) => {
    // Add style sheet to document
    try {
        e.getElementsByTagName('img')[0].src = 'assets/icons/contextMenu/immersive_stroke.svg';
        e.onclick = () => immerse(e);
        document.getElementById('immerse').remove();
    } catch { }

    localStorage.setItem('theme', 'normal');

}

var mobile = () => {
    // Add style sheet to document
    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'themes/mobile.css';
    style.id = 'mobile';
    document.head.appendChild(style);
}

var resize_TO;
window.addEventListener('resize', function () {
    clearTimeout(resize_TO);
    try {
        resize_TO = setTimeout(function () {
            if (innerWidth < innerHeight) mobile();
            else document.getElementById('mobile').remove();
        }, 500);
    } catch { }
    changeFontSize(songName);
});

if (innerWidth < innerHeight) mobile();

function getAverageRGB(imgEl, dim = 0.5, if_bottom = false) {
    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = { r: 0, g: 0, b: 0 }, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = { r: 0, g: 0, b: 0 },
        count = 0;

    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;


    context.drawImage(imgEl, 0, 0);

    // dimmer
    context.fillStyle = 'rgba(0, 0, 0, ' + dim + ')';
    context.fillRect(0, 0, width, height);

    // blur
    context.filter = 'blur(79px) saturate(1.8)';

    try {
        data = context.getImageData(0, 0, width, height);
    } catch (e) {
        /* security error, img on diff domain */
        return defaultRGB;
    }

    var startY, endY;
    if (if_bottom) {
        startY = height * 0.9;
        endY = height;
    } else {
        startY = 0;
        endY = height * 0.1;
    }

    for (let y = startY; y < endY; y += blockSize) {
        for (let x = 0; x < width; x += blockSize) {
            let index = (y * width + x) * 4;
            count++;
            rgb.r += data.data[index];
            rgb.g += data.data[index + 1];
            rgb.b += data.data[index + 2];
        }
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r / count);
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);

    return rgb;
}

// wait albumArt to be loaded

document.getElementById('albumArt').onload = function () {
    updateColor();
}

function makeRgb(a) {
    return `rgb(${a.r}, ${a.g}, ${a.b})`;
}

let prev_hex;

function updateColor() {
    let rgb = getAverageRGB(document.getElementById('albumArt'));
    let rgb_color = makeRgb(rgb);

    let hex = rgb_color.replace(/rgb\(|\)|\s/g, '').split(',').map(function (x) {
        x = parseInt(x).toString(16);
        return (x.length == 1) ? '0' + x : x;
    }).join('');
    if (prev_hex != hex) {
        if (document.querySelector('meta[name="theme-color"]')) {
            document.querySelector('meta[name="theme-color"]').setAttribute('content', hex);
        } else {
            document.head.innerHTML += `<meta name="theme-color" content="${hex}">`;
        }
        prev_hex = hex;
    }

    let rgb_color_bottom = makeRgb(getAverageRGB(document.getElementById('albumArt'), 0.5, true));
    let hex_bottom = rgb_color_bottom.replace(/rgb\(|\)|\s/g, '').split(',').map(function (x) {
        x = parseInt(x).toString(16);
        return (x.length == 1) ? '0' + x : x;
    }).join('');

    document.body.style.backgroundColor = '#' + hex_bottom;

    // set to :root
    document.documentElement.style.setProperty('--color', rgb_color);
    document.documentElement.style.setProperty('--color_bottom', rgb_color_bottom);
}

