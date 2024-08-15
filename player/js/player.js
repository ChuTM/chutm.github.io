const paths = {
    img: 'assets/defaults/art/',
    sounds: 'assets/defaults/music/',
    lists: 'assets/defaults/lists/',
    lyrics: 'assets/defaults/lyrics',
};

var search = window.location.search;
var searchParams = new URLSearchParams(search);
var search_json = searchParams.get('s');
var list_a = searchParams.get('list');
var list_done = searchParams.get('list_done');

var list_data = {};
if (list_a) {
    fetch(paths.lists + list_a + '.json')
        .then(response => response.json())
        .then(data => {
            var songs = data.songs;

            list_data = data.songs;

            if (songs.length == 0) {
                Alert('No songs in this list.', 'error', 2000);
                return;
            }

            if (list_done) return;

            if (searchParams.get('index')) {
                var index = searchParams.get('index');
                if (index > songs.length) {
                    Alert('Invalid index.', 'error', 2000);
                    return;
                }
                var song = songs[index - 1];
            } else {
                var song = songs[0];
            }

            document.title = `${song.song} - ${song.artist} | ${song.album}`;
            searchParams.set('song', song.song);
            searchParams.set('album', song.album);
            searchParams.set('year', song.year);
            searchParams.set('artist', song.artist);
            searchParams.set('list_done', 'true');
            copyright_info = song.copyright;
            if (song.source) searchParams.set('source', song.source);
            if (song.lyrics) searchParams.set('lyrics', song.lyrics);
            else searchParams.set('lyrics', '');
            if (song.song_direct_url) searchParams.set('song_direct_url', song.album_art_direct_url);
            if (song.album_art_direct_url) searchParams.set('album_art_direct_url', song.album_art_direct_url);
            if (song.detail_direct_url) searchParams.set('detail_direct_url', song.detail_direct_url);
            searchParams.set('index', songs.indexOf(song) + 1);
            window.history.pushState({}, '', location.pathname + '?' + searchParams.toString());
            location.reload();

            setLyrics();
        });
}

if (search_json) {
    search = JSON.parse(decodeURI(search_json));
    for (var key in search) {
        searchParams.set(key, search[key]);
    }
    // remove s from search
    searchParams.delete('s');
    window.history.pushState({}, '', location.pathname + '?' + searchParams.toString());
}

let songName = searchParams.get('song') || 'Unknown';
let albumName = searchParams.get('album') || songName;
let albumYear = searchParams.get('year') || '';
let artistName = searchParams.get('artist') || '';
let source = searchParams.get('source') || 'Unknown';
let lyrics = searchParams.get('lyrics') || void 0;

document.title = `${songName} - ${artistName} | ${albumName}`

let copyright_info;

let song_direct_url = searchParams.get('song_direct_url') || void 0;
let album_art_direct_url = searchParams.get('album_art_direct_url') || void 0;
let detail_direct_url = searchParams.get('detail_direct_url') || void 0;
let fromUrl = song_direct_url != '' && album_art_direct_url != '' && detail_direct_url != '';

const albumArtElement = document.getElementById('albumArt');
const audio = document.getElementById('audio');

var img_ext = '.webp'; // !
var albumArt = album_art_direct_url || paths.img + albumName + img_ext; // Change this to the path of the album art

if (albumName != '') {
    albumArtElement.src = albumArt;
    document.body.style.backgroundImage = `url(${encodeURI(albumArt)})`;
}

// Change audio source
var ado_ext = '.mp3'; // !
audio.src = song_direct_url || paths.sounds + source; // Change this to the path of the audio file


// Change song title
var songTitle = document.getElementById('title');
songTitle.innerHTML = `<span>${songName}</span>`;

// For Title, try best make sure it's in one line, adjust font-size if needed
function changeFontSize(t) {
    songTitle.style.fontSize = '2rem';
    songTitle.classList.remove('running');
    if (t.length > 20) {
        songTitle.style.fontSize = '1.6rem';
    }
    if (t.length > 30) {
        songTitle.style.fontSize = '1.4rem';
    }
    if (t.length > 40) {
        songTitle.style.fontSize = '1.3rem';
    }

    // if overflow
    if (songTitle.scrollWidth > songTitle.clientWidth) {
        songTitle.classList.add('running');
    }
}

changeFontSize(songName);


// Change artist
var artist = document.getElementById('artist');
artist.innerHTML = artistName;
// Change album
var album = document.getElementById('album');
album.innerHTML = albumName;
// Change year
var year = document.getElementById('year');
year.innerHTML = albumYear;

var alert_boxes = [];

let originalBGC;

const AlertL = (html, scroll = false, id) => {
    originalBGC = document.body.style.backgroundColor;
    document.body.style.backgroundColor = 'rgba(46, 46, 46, 0.989)';
    var a = document.createElement('div');
    a.innerHTML = html;
    a.className = 'large-alert';
    if (scroll) {
        a.style.display = 'block';
        a.style.overflowY = 'scroll';
    };

    if (id) a.id = id;

    document.body.appendChild(a);
    alert_boxes.push(a);
    document.querySelector('.player').classList.add('alerted');
}

const $ = (s, a) => {
    if (a) return document.querySelectorAll(s);
    return document.querySelector(s);
};

var AlertTimeout;

const Alert = (m = '', t = 'error', T = 3000, S) => {
    if (AlertTimeout) clearTimeout(AlertTimeout);

    if (S) {
        $('.alert-text').style.userSelect = 'text';
        $('.alert-text').style.pointerEvents = 'auto';
    } else {
        $('.alert-text').style.userSelect = 'none';
        $('.alert-text').style.pointerEvents = 'none';
    }
    let type_list = {
        error: {
            i: 'close',
            c: 'color-red'
        },
        success: {
            i: 'check',
            c: 'bg-green'
        },
    };

    let icon;

    if (type_list[t]) icon = type_list[t].i || 'close';
    else icon = t;


    if (icon) {
        $('.alert-icon').innerHTML = `<icon data-icon="${icon}" class="alert-icon stroke ${type_list[t] ? type_list[t].c : ''}"></icon>`;
        icons();
    }
    $('.alert-text').innerHTML = m;

    $('.alert').classList.add('show');

    AlertTimeout = setTimeout(() => {
        $('.alert').classList.remove('show');
    }, T);
};

oneLinkHref = () => {
    // make all searches to JSON
    var search = new URLSearchParams(window.location.search);
    var search_json = {};
    search.forEach((v, k) => {
        search_json[k] = v;
    });
    return location.origin + location.pathname + '?s=' + encodeURI(JSON.stringify(search_json));
};

var alerts_toggled = [];

const app = {
    share: () => {
        if (!alerts_toggled.includes('share')) {
            alerts_toggled.push('share');
            AlertL(`
<h1>Share This Song</h1>
<button class="alphabrate-styled-button" onclick="app.copyLink()">
    <img src="assets/icons/contextMenu/link.svg">
    <span>Copy Link</span>
</button>
<div class="separator"></div>
<div class="flex">
    <a href="https://facebook.com/sharer/sharer.php?u=${oneLinkHref()}" target="_blank" class="small">
        <img src="assets/icons/logos/facebook.svg">
    </a>
    <a href="https://twitter.com/intent/tweet?url=${oneLinkHref()}&text=Listen to ${songName} by ${artistName}." target="_blank" class="small">
        <img src="assets/icons/logos/x.com.svg">
    </a>
    <a href="https://wa.me/?text=Listen to ${songName} by ${artistName}. ${oneLinkHref()}" target="_blank" class="small">
        <img src="assets/icons/logos/whatsapp.svg">
    </a>
</div>
<font style="color: gray;">or</font>
<button class="alphabrate-styled-button" onclick="app.shareApp()">
    <img src="assets/icons/contextMenu/ar.svg">
    <span>Share form your Device</span>
</button>
`, false, 'share');
        } else {
            $('#share').style.animation = 'slideout .5s';
            // remove from array
            try {
                setTimeout(() => {
                    $('#share').remove();
                    alerts_toggled.pop('share');
                }, 500);
            } catch { }
        }
    },
    shareApp: () => {
        // Device Share
        if (navigator.share) {
            navigator.share({
                title: songName,
                text: `Listen to ${songName} by ${artistName}.`,
                url: location.href
            }).then(() => {
                // 
            }).catch((error) => {
                Alert('Failed to share.', 'error', 2000);
            });
        } else {
            Alert('Your device does not support sharing.', 'error', 2000);
        }
    },
    copyLink: () => {

        try {
            navigator.clipboard.writeText(oneLinkHref());
            Alert('Copied to clipboard.', 'success', 2000)
        } catch {
            Alert('Failed to copy link.', 'error', 2000);
        }
    },
    settings: () => {
        if (!alerts_toggled.includes('settings')) {
            alerts_toggled.push('settings');
            AlertL(`
<div class"left-aligned">
    <h1>Settings</h1>
    <div class="flex left-aligned gap sameWidth">
        <font>Enable Auto Play</font>
        <span class="switch settings" onclick="app.toggle.autoplay();" id="s.autoplay"></span>
    </div>
    <div class="flex left-aligned gap sameWidth">
        <font>Default Context Menu</font>
        <span class="switch settings" onclick="app.toggle.dev();" id="s.dev"></span>
    </div>

    <div class="separator"></div>

    <div class="flex left-aligned gap sameWidth">
        <font>Hide on Lock Screen</font>
        <span class="switch settings" onclick="app.toggle.hideOnLock();" id="s.lock"></span>
    </div>
    <div class="flex left-aligned gap sameWidth">
        <font>Loop This Song</font>
        <span class="switch settings" onclick="app.toggle.loop();" id="s.loop"></span>
    </div>
    <div class="flex left-aligned gap sameWidth">
        <font>Show Duration</font>
        <span class="switch settings" onclick="app.toggle.duration();" id="s.duration"></span>
    </div>
    <div class="flex left-aligned gap sameWidth">
        <font>Shuffle All Songs</font>
        <span class="switch settings" onclick="app.toggle.shuffle();" id="s.shuffle"></span>
    </div>

    <div class="separator"></div>

        <p align="center">Read <a href="https://alphabrate.github.io/articles/user-manuals/music-player">User Guide</a>.</p>
</div>
        `, false, 'settings');

            document.querySelectorAll('.switch').forEach((s) => {
                s.addEventListener('click', () => {
                    s.classList.toggle('checked');
                });
            });

            // get all items from local storage, check if there is a switch with the same s.id, if there is, add class checked
            var settings = ['autoplay', 'dev', 'lock', 'loop', 'duration', 'shuffle', 'lyricsLockScreen'];
            settings.forEach((s) => {
                if (localStorage.getItem(s) == 'true') {
                    var switch_ = document.getElementById('s.' + s);
                    switch_.classList.add('checked');
                }
            });
        }
        else {
            $('#settings').style.animation = 'slideout .5s';
            // remove from array
            try {
                setTimeout(() => {
                    $('#settings').remove();
                    alerts_toggled.pop('settings');
                }, 500);
            } catch { }
        }

    },
    toggle: {
        autoplay: () => {
            let autoPlay = localStorage.getItem('autoplay');
            if (autoPlay == 'true') {
                localStorage.setItem('autoplay', 'false');
            } else {
                localStorage.setItem('autoplay', 'true');
            }
        },
        dev: () => {
            let dev = localStorage.getItem('dev');
            if (dev == 'true') {
                localStorage.setItem('dev', 'false');
            } else {
                localStorage.setItem('dev', 'true');
            }
        },
        shuffle: () => {
            let shuffle = localStorage.getItem('shuffle');
            if (shuffle == 'true') {
                localStorage.setItem('shuffle', 'false');
            } else {
                localStorage.setItem('shuffle', 'true');
            }
        },
        hideOnLock: () => {
            let lock = localStorage.getItem('lock');
            if (lock == 'true') {
                localStorage.setItem('lock', 'false');
                mediaSession();
            } else {
                localStorage.setItem('lock', 'true');
                // Remove media session
                navigator.mediaSession.metadata = null;
            }
        },
        loop: () => {
            let loop = localStorage.getItem('loop');
            if (loop == 'true') {
                localStorage.setItem('loop', 'false');
            } else {
                localStorage.setItem('loop', 'true');
            }
        },
        duration: () => {
            let duration = localStorage.getItem('duration');
            if (duration == 'true') {
                localStorage.setItem('duration', 'false');
                document.getElementById('duration').style.opacity = '0';
            } else {
                localStorage.setItem('duration', 'true');
                document.getElementById('duration').style.opacity = '1';
            }
        }
    },
    details: () => {
        if (alerts_toggled.includes('details')) {
            $('#details').style.animation = 'slideout .5s';
            // remove from array
            try {
                setTimeout(() => {
                    $('#details').remove();
                    alerts_toggled.pop('details');
                }, 500);
            } catch { }
        }
        AlertL(
            `
<h1>Details</h1>
<div class="flex col center">
    <div class="flex left-aligned gap sameWidth">
        <font style="color: gray;">Song Name:</font>
        <font>${songName}</font>
    </div>
    <div class="flex left-aligned gap sameWidth">
        <font style="color: gray;">Artist:</font>
        <font>${artistName}</font>
    </div>
    <div class="flex left-aligned gap sameWidth">
        <font style="color: gray;">Album:</font>
        <font>${albumName}</font>
    </div>
    <div class="flex left-aligned gap sameWidth">
        <font style="color: gray;">Year:</font>
        <font>${albumYear}</font>
    </div>
    <div class="flex gap sameWidth">
        <font style="color: gray;">Album Art:</font>
        <font><a href="${document.getElementById('albumArt').src}" target="_blank">View</a></font>
    </div>
    <div class="flex gap sameWidth">
        <font style="color: gray;">Audio:</font>
        <font><a href="${audio.src}" target="_blank">View</a></font>
    </div>
    <p>${copyright_info || ''}</p>
</div>
`, true, 'details');
        alerts_toggled.push('details');
    },
    queue: () => {
        document.querySelector(':root').style.setProperty('--random-indicator', `'${emojis[Math.floor(Math.random() * emojis.length)]}'`);
        if (alerts_toggled.includes('queue')) {
            // remove from array
            if (alert_boxes.length - 1 >=  0) {
                let player = document.querySelector('.player');
                player.classList.remove('alerted')
            }
            try {
                $('#queue').style.animation = 'slideout .5s';
                setTimeout(() => {
                    try { $('#queue').remove(); } catch { }
                    alerts_toggled.pop('queue');
                }, 500);
            } catch { }
        } else {
            let currentSong;
            let LIST = '';
            if (list_data.length > 0) {
                LIST = `<div class="separator"></div>
                <h1>Songs</h1>
                    <div class="flex col left-aligned">
                        ${list_data.map((s, i) => {
                    let CURRENT = '';
                    if (s.song === songName && s.album === albumName && s.artist === artistName) {
                        CURRENT = ' current';
                        currentSong = s;
                    }
                    return `
                    <div class="flex left-aligned gap sameWidth${CURRENT} queued-list-item" onclick="playSongFromList(${i})">
                        <img src="${s.album_art_direct_url || paths.img + s.album + img_ext}">
                        <div class="info">
                            <font class="title">${s.song}</font>
                            <font class="artist">${s.artist}</font>
                        </div>
                    </div>
                `;
                }).join('')}</div>`;
            }


            let current_mode = 'repeat';
            if (localStorage.getItem('shuffle') == 'true') {
                current_mode = 'shuffle';
            }
            if (localStorage.getItem('loop') == 'true') {
                current_mode = 'loop';
            }

            AlertL(`
                <h1>Queue</h1>
                    <div class="flex col center">
                        <div class="separator"></div>
                    </div>
                    <div class="flex left-aligned gap sameWidth current large queued-list-item">
                        <img src="${currentSong.album_art_direct_url || paths.img + currentSong.album + img_ext}" class="currentCover">
                        <div class="info">
                            <font class="title">${currentSong.song}</font>
                            <font class="artist">${currentSong.artist}</font>
                        </div>
                        <span class="play-mode" data-mode="${current_mode}" onclick="changeMode(this);">
                            <icon data-icon="${current_mode}"></icon>
                        </span>
                    </div>
                <div class="flex col center">
                    ${LIST}
                    <div class="separator"></div>
                </div>
            `, true, 'queue');
            alerts_toggled.push('queue');
            icons();
            document.querySelector('.currentCover').addEventListener('click', imageControls);
            document.querySelectorAll('.current.large.queued-list-item>.info>font').forEach(w => {
                w.addEventListener('click', () => {
                    Alert(w.innerText, '')
                });
            })
        }
    }
}

function mediaSession() {
    if ('mediaSession' in navigator && localStorage.getItem('lock') == 'false') {

        navigator.mediaSession.metadata = new MediaMetadata({
            title: songName,
            artist: artistName,
            album: albumName,
            artwork: [
                { src: albumArt, sizes: '512x512', type: 'image/' + img_ext.split('.')[1] },
            ]
        });

        navigator.mediaSession.setActionHandler('play', function () {
            audio.play();
        });

        navigator.mediaSession.setActionHandler('pause', function () {
            audio.pause();
        });

        navigator.mediaSession.setActionHandler('previoustrack', function () {
            previous();
        });

        navigator.mediaSession.setActionHandler('nexttrack', function () {
            next();
        });

        navigator.mediaSession.setActionHandler('stop', function () {
            audio.pause();
        });

        // Set the duration of the track
        navigator.mediaSession.metadata.duration = audio.duration;

        // Set the playback state
        navigator.mediaSession.playbackState = 'playing';

        // Seek to a new time
        navigator.mediaSession.setActionHandler('seekto', function (details) {
            if (details.seekTime) {
                audio.currentTime = details.seekTime;
            }
        });
    }
}

mediaSession();

const st = {
    repeat: 'Loop The List',
    shuffle: 'Shuffle All Songs',
    loop: 'Loop This Song'
}

function changeMode(e) {
    let mode = e.getAttribute('data-mode');
    let modes = ['repeat', 'shuffle', 'loop'];
    let current = modes.indexOf(mode);
    let next = modes[current + 1] || modes[0];
    Alert(st[next], 'success');
    e.setAttribute('data-mode', next);
    e.innerHTML = `<icon data-icon="${next}"></icon>`;
    if (next == 'repeat') {
        localStorage.setItem('shuffle', 'false');
        localStorage.setItem('loop', 'false');
    } else if (next == 'shuffle') {
        localStorage.setItem('shuffle', 'true');
        localStorage.setItem('loop', 'false');
    } else if (next == 'loop') {
        localStorage.setItem('shuffle', 'false');
        localStorage.setItem('loop', 'true');
    }
    icons();
}


var loaded_icons = {};

// Replace all <icon> to <svg>
var icon_holders = document.getElementsByTagName('icon');
async function icons() {
    if (icon_holders.length == 0) {
        return;
    }
    var icon = icon_holders[0].getAttribute('data-icon');
    var icon_element = icon_holders[0];
    var icon_parent = icon_element.parentElement;
    var svgUrl = `assets/icons/contextMenu/${icon}.svg`;
    if (loaded_icons[icon] == void 0) {
        await fetch(svgUrl)
            .then(response => response.text())
            .then(svg => {
                var span = document.createElement('span');
                span.innerHTML = svg;
                var icon_class = icon_element.getAttribute('class');
                span.setAttribute('class', icon_class);
                span.setAttribute('style', '--mask-i: url(' + svgUrl + ')');
                try { icon_parent.replaceChild(span, icon_element); } catch { }
                icons();
                loaded_icons[icon] = svg;
            });
    } else {
        var span = document.createElement('span');
        span.innerHTML = loaded_icons[icon];
        var icon_class = icon_element.getAttribute('class');
        span.setAttribute('class', icon_class);
        span.setAttribute('style', '--mask-i: url(' + svgUrl + ')');
        try { icon_parent.replaceChild(span, icon_element); } catch { }
        icons();
    }
}

icons();

function preloadIcon(icon) {
    if (loaded_icons[icon] == void 0) {
        fetch(`assets/icons/contextMenu/${icon}.svg`)
            .then(response => response.text())
            .then(svg => {
                loaded_icons[icon] = svg;
            });
    }
}

let preloadList = ['shuffle', 'loop', 'repeat'];

preloadList.forEach((icon) => preloadIcon(icon));

var folders = document.getElementsByClassName('folder');
var sets = document.getElementsByClassName('set');
// if a set contains more than one folder, add a class 'line' to the folders exclude the last one
for (var i = 0; i < sets.length; i++) {
    var set = sets[i];
    var folders = set.getElementsByClassName('folder');
    if (folders.length > 1) {
        for (var j = 0; j < folders.length - 1; j++) {
            if (!folders[j].classList.contains('no-line')) {
                folders[j].classList.add('line');
            }
        }
    }
}

let emojis = ['🎹', '🎶', '🏫', '😍', '😄', '⚔️', '🎼', '➡️', '👋🏻', '✔️', '😡', '🖊️', '📜', '🎤', '🏆', '😎', '👉🏻', '😁', '😍', '😘', '🥰', '😗', '😝', '👻', '🪡', '💎', '💍', '🪄', '🧸', '🎷', '🎻', '🎹', '📻', '🪗'];

if (CSS && 'paintWorklet' in CSS) CSS.paintWorklet.addModule('https://unpkg.com/smooth-corners');