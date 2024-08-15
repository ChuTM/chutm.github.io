function playSong() {
    var audio = document.getElementById('audio');
    audio.play();
    // Change button#toggle 's data-playing to true
    var toggle = document.getElementById('toggle');
    toggle.setAttribute('data-playing', 'true');
    // Change button#toggle 's innerHTML to 'pause.svg'
    var toggleIcon = document.getElementById('toggleIcon');
    toggleIcon.src = 'assets/icons/controls/pause.svg';
    // .active play-state
    document.querySelectorAll('.active').forEach(e => {
        e.style.animationPlayState = 'running';
    });
}

if (localStorage.getItem('autoplay') === 'true') {
    playSong();
}

var toggleIcons = ['assets/icons/controls/play.svg', 'assets/icons/controls/pause.svg']

// On click button#toggle
function toggleSong() {
    var audio = document.getElementById('audio');
    var toggle = document.getElementById('toggle');
    var toggleIcon = document.getElementById('toggleIcon');
    if (toggle.getAttribute('data-playing') === 'true') {
        audio.pause();
        toggle.setAttribute('data-playing', 'false');
        toggleIcon.src = toggleIcons[0];
        document.querySelectorAll('.active').forEach(e => {
            e.style.animationPlayState = 'paused';
        });
    } else {
        audio.play();
        toggle.setAttribute('data-playing', 'true');
        toggleIcon.src = toggleIcons[1];
        document.querySelectorAll('.active').forEach(e => {
            e.style.animationPlayState = 'running';
        });
    }
    setTimeCursor();
}
document.getElementById('toggle').addEventListener('click', toggleSong);

// Check if song is playing every 100ms
function checkPlaying() {
    var audio = document.getElementById('audio');
    var toggle = document.getElementById('toggle');
    var toggleIcon = document.getElementById('toggleIcon');
    // update #duration
    var duration = document.getElementById('duration');
    // show CURRENT:TIME/TOTAL:DURATION
    var currentTime = audio.currentTime;
    var totalDuration = audio.duration;
    var currentMinute = Math.floor(currentTime / 60);
    var currentSecond = Math.floor(currentTime % 60);
    var totalMinute = Math.floor(totalDuration / 60) || '0';
    var totalSecond = Math.floor(totalDuration % 60) || '0';


    if (currentSecond < 10) {
        currentSecond = '0' + currentSecond;
    }
    if (totalSecond < 10) {
        totalSecond = '0' + totalSecond;
    }    
    duration.innerHTML = currentMinute + ':' + currentSecond + '/' + totalMinute + ':' + totalSecond;

    if (audio.paused) {
        toggle.setAttribute('data-playing', 'false');
        toggleIcon.src = toggleIcons[0];
        // Check if song is ended
        if (audio.currentTime === audio.duration) {
            audio.currentTime = 0;
            if (localStorage.getItem('loop') === 'true') {
                audio.play();
            } else {
                songEnded();
            }
        }
    } else {
        toggle.setAttribute('data-playing', 'true');
        toggleIcon.src = toggleIcons[1];
    }
}
setInterval(() => {
    try { updateColor(); } catch { }
    try { checkPlaying(); } catch { }
    try { setTimeCursor(); } catch { }
    try { updateLyrics(); } catch { }
}, 30);

// Set time cursor
function setTimeCursor() {
    var audio = document.getElementById('audio');
    var currentTime = audio.currentTime || 0;
    var duration = audio.duration || 100;
    var percentage = currentTime / duration * 100;
    document.getElementById('tc').value = percentage;
    // Set time
    var time = document.getElementById('time');
    var date = new Date();
    var hour = date.getHours();
    var minute = date.getMinutes();
    if (minute < 10) {
        minute = '0' + minute;
    }
    time.innerHTML = hour + ':' + minute;
}

// On input time cursor
document.getElementById('tc').addEventListener('input', function () {
    var audio = document.getElementById('audio');
    var percentage = document.getElementById('tc').value;
    var duration = audio.duration;
    var currentTime = duration * percentage / 100;
    audio.currentTime = currentTime;
});

const nextSong = () => next();
const previousSong = () => {
    prev_from = true;
    previous();
};

function playSongFromList(i) {
    if (i >= list_data.length) {
        i = 0;
    }
    if (i < 0) {
        i = list_data.length - 1;
    }
    let song = list_data[i];
    document.title = `${song.song} - ${song.artist} | ${song.album}`;
    searchParams.set('song', song.song);
    searchParams.set('artist', song.artist);
    searchParams.set('album', song.album);
    searchParams.set('year', song.year);
    copyright_info = song.copyright;
    if (song.source) searchParams.set('source', song.source);
    if (song.lyrics) searchParams.set('lyrics', song.lyrics);
    else searchParams.set('lyrics', '');
    if (song.song_direct_url) searchParams.set('song_direct_url', song.song_direct_url);
        else searchParams.delete('song_direct_url');
    if (song.album_art_direct_url) searchParams.set('album_art_direct_url', song.album_art_direct_url);
        else searchParams.delete('album_art_direct_url');
    if (song.detail_direct_url) searchParams.set('detail_direct_url', song.detail_direct_url);
        else searchParams.delete('detail_direct_url');
    searchParams.set('index', i + 1);
    window.history.pushState({}, '', location.pathname + '?' + searchParams.toString());

    source = searchParams.get('source') || 'Unknown';
    lyrics = searchParams.get('lyrics') || void 0;
    // change song src
    var audio = document.getElementById('audio');
    audio.src = song_direct_url || paths.sounds + '/' + source;
    // change album art
    var albumArt = document.getElementById('albumArt');
    let img = searchParams.get('album_art_direct_url') || paths.img + song.album + img_ext;
    albumArt.src = img;
    // change song title
    var songTitle = document.getElementById('title');
    songTitle.innerHTML = `<span>${song.song}</span>`;

    // change font size
    changeFontSize(song.song);

    // change artist
    var artist = document.getElementById('artist');
    artist.innerHTML = song.artist;
    // change album
    var album = document.getElementById('album');
    album.innerHTML = song.album;
    // change year
    var year = document.getElementById('year');
    year.innerHTML = song.year;
    // change background
    document.body.style.backgroundImage = 'url(' + encodeURIComponent(img) + ')';
    playSong();

    setLyrics();

    // Change variables
    songName = song.song;
    artistName = song.artist;
    albumName = song.album;
    albumYear = song.year;
    albumArt = img;

    // Update mediaSession
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.song,
            artist: song.artist,
            album: song.album,
            artwork: [{ src: img, sizes: '512x512', type: 'image/png' }]
        });
    }
    if (alerts_toggled.includes('queue')) {
        app.queue();
    }
}

function next() {
    // Go to next song in the list
    let currentSongIndex = searchParams.get('index') - 1;
    let nextSongIndex = currentSongIndex + 1;

    if (localStorage.getItem('shuffle') === 'true') {
        nextSongIndex = Math.floor(Math.random() * list_data.length);
    }

    playSongFromList(nextSongIndex);
}
document.getElementById('next').addEventListener('click', next);

var songEnded = () => {
    // What to do when song ended
    // if loop is false and autoplay is true, go to next song
    if (localStorage.getItem('loop') != 'true' && localStorage.getItem('autoplay') == 'true') {
        next();
    }
};

if (localStorage.getItem('duration') === 'true') {
    document.getElementById('duration').style.opacity = 1;
}

// On click button#previous
var prev_from = false;
function previous() {
    if (prev_from) {
        // Go to previous song in the list
        let currentSongIndex = searchParams.get('index') - 1;
        let prevSongIndex = currentSongIndex - 1;
        playSongFromList(prevSongIndex);
        return
    }

    prev_from = true;

    // all the way back
    var audio = document.getElementById('audio');
    audio.currentTime = 0;
    // Update time cursor
    setTimeCursor();

    setTimeout(() => {
        prev_from = false;
    }, 2000);
}
document.getElementById('prev').addEventListener('click', previous);

document.body.addEventListener('keydown', function (e) {
    // Spacebar
    if (e.which === 32) {
        e.preventDefault();
        toggleSong();
    }
    // Left arrow, go five seconds back
    if (e.which === 37) {
        var audio = document.getElementById('audio');
        audio.currentTime -= 5;
        // Update time cursor
        setTimeCursor();
    }
    // Right arrow, go five seconds forward
    if (e.which === 39) {
        var audio = document.getElementById('audio');
        audio.currentTime += 5;
        // Update time cursor
        setTimeCursor();
    }
});


// Double click to skip to next song
// Triple click to skip to previous song
var clicks = 0;
var timer, timeout = 200;

function imageControls() {
    clearTimeout(timer);
    clicks++;
    timer = setTimeout(function () {
        if (clicks == 1) toggleSong();
        if (clicks == 2) nextSong();
        if (clicks == 3) previousSong();
        clicks = 0;
    }, timeout);
}

document.getElementById('albumArt').addEventListener('click', imageControls);