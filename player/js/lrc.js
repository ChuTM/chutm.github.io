let lyricsWithTime = [];
let layer = 0;

let wordByWord = false;

let lyrics_setup = {
    offset: 0
};

let LSName;

function setLyrics() {
    if (songName == LSName) return;

    document.querySelector('.lyrics').innerHTML = '';
    LSName = songName;
    lyricsWithTime = [];
    layer = 0;
    
    if (searchParams.get('lyrics') == '') {
        document.querySelector('.lyrics').innerHTML = '';
        document.querySelector('.current-lyric').innerHTML = '';
        normal();
        return;
    }

    if (paths.lyrics + '/' + searchParams.get('lyrics')) {
        fetch(paths.lyrics + '/' + lyrics)
            .then(data => data.text())
            .then(text => {
                let lrc = text.split('\n');

                let lyrics_element = document.querySelector('.lyrics');
                lrc.forEach(l => {
                    l += '\r';
                    try {
                        let T = l.match(/\[\d+:\d+\.\d+\]/g);
                        if (!T) {
                            // read variable by matching
                            let variable = l.match(/\[(\w+):(.+)]/);
                            if (variable) {
                                lyrics_setup[variable[1]] = variable[2];
                            }

                        }
                    } catch { }
                    // add class .word for each-word LRC, add .line for each-line LRC. add data-duration if it is each-word LRC for me to add style animation.
                    try {
                        let line = l.split(']');
                        if (line.length > 2) {
                            wordByWord = true;
                            line.forEach(w => {
                                try {
                                    word = w.split('[');
                                    if (word[0].includes('\r') || word[0].includes('\n')) {
                                        layer++;
                                        lyricsWithTime[layer] = [];
                                    } else {
                                        try {
                                            let time;
                                            try {
                                                time = word[1].replace('[', '').split(':');
                                            } catch {
                                                time = word[0].split(':');
                                            }
                                            let min = parseInt(time[0]);
                                            let sec = parseFloat(time[1]);
                                            let timeInSec = min * 60 + sec + parseFloat(lyrics_setup.offset);
                                            let lyric = word[0];
                                            lyricsWithTime[layer].push({
                                                time: timeInSec,
                                                lyric: lyric
                                            });
                                        } catch (e) {
                                            layer++;
                                            lyricsWithTime[layer] = [];
                                        }
                                    }
                                } catch { }
                            })
                        } else {
                            wordByWord = false;
                            let time = line[0].replace('[', '').split(':');
                            let min = parseInt(time[0]);
                            let sec = parseFloat(time[1]);
                            let timeInSec = min * 60 + sec + parseFloat(lyrics_setup.offset);
                            if (timeInSec != NaN) {
                                let lyric = line[1];
                                lyricsWithTime.push({
                                    time: timeInSec,
                                    lyric: lyric
                                });
                            }
                        }
                    } catch { }
                });
                if (wordByWord) {
                    for (let i = 0; i < lyricsWithTime.length; i++) {
                        let span = document.createElement('span');
                        span.id = 'l' + i;
                        span.classList.add('l-line');
                        for (let j = 0; j < lyricsWithTime[i].length; j++) {
                            try {
                                let span2 = document.createElement('span');
                                span2.innerHTML = lyricsWithTime[i][j].lyric.replaceAll(' ', '<space> </space>');
                                span2.dataset.lyric = lyricsWithTime[i][j].lyric;
                                span2.id = 'li' + j;
                                let index = i, jndex = j;
                                if (jndex - 1 >= lyricsWithTime[index].length) {
                                    if (index - 1 < lyricsWithTime.length) {
                                        index--;
                                        jndex = 0;
                                    }
                                } else {
                                    jndex--;
                                }

                                if (lyricsWithTime[index][jndex + 1]) {
                                    span2.dataset.duration = lyricsWithTime[index][jndex + 1].time
                                        - lyricsWithTime[index][jndex].time;
                                } else if (lyricsWithTime[index + 1]) {
                                    span2.dataset.duration = lyricsWithTime[index + 1][0].time
                                        - lyricsWithTime[index][jndex].time
                                }
                                span2.style.animationDuration = span2.dataset.duration + 's';
                                span2.style.setProperty('--duration', span2.dataset.duration + 's');
                                span.appendChild(span2);
                            } catch { }
                        }
                        // data-time
                        try { span.dataset.time = lyricsWithTime[i][0].time; } catch { }
                        span.addEventListener('click', () => {
                            audio.currentTime = span.dataset.time;
                        });
                        lyrics_element.appendChild(span);
                    }
                } else {
                    for (let i = 0; i < lyricsWithTime.length; i++) {
                        let span = document.createElement('span');
                        span.id = 'l' + i;
                        span.innerHTML = lyricsWithTime[i].lyric;
                        span.dataset.time = lyricsWithTime[i].time;
                        span.addEventListener('click', () => {
                            audio.currentTime = span.dataset.time;
                        });
                        lyrics_element.appendChild(span);
                    }
                }
            });
    }
}

let current = {
    lyric: '',
    index: 0,
    jndex: 0,
};

function updateLyrics() {
    setLyrics();
    let currentTime = audio.currentTime;
    let index = 0;
    let jndex = 0;

    try {
        if (wordByWord) {
            for (let i = 0; i < lyricsWithTime.length; i++) {
                lineLyric = '';
                for (let j = 0; j < lyricsWithTime[i].length; j++) {
                    if (currentTime > lyricsWithTime[i][j].time) {
                        index = i;
                        jndex = j;
                    }
                }
            }

            // add 1 to jndex, if can't add 1 to index and set jndex to 0
            if (jndex + 1 >= lyricsWithTime[index].length) {
                if (index + 1 < lyricsWithTime.length) {
                    index++;
                    jndex = 0;
                }
            } else {
                jndex++;
            }

            let lyric = lyricsWithTime[index][jndex];
            if (jndex != current.jndex || index != current.index) {

                let lyrics = document.querySelector('.lyrics');
                if (index != current.index) {
                    let spans = lyrics.querySelectorAll('span');
                    spans.forEach(s => {
                        try {
                            s.classList.remove('active');
                            s.classList.remove('inline');
                            s.querySelectorAll('span').forEach(e => {
                                if (e.className == 'active') {
                                    e.classList.remove('active');
                                    e.classList.add('removed-active');
                                }
                            })
                        } catch { }
                    });
                }
                current.lyric = lyric.lyric;
                current.jndex = jndex;
                current.index = index;

                let lyricE = document.querySelector('#l' + index).querySelector('#li' + jndex);
                document.querySelector('#l' + index).classList.add('inline');
                lyricE.className = 'active';

                lyrics.scrollTop = lyricE.offsetTop - lyrics.offsetHeight / 2;
            }
        }
        else {
            for (let i = 0; i < lyricsWithTime.length; i++) {
                if (currentTime > lyricsWithTime[i].time) {
                    index = i;
                }
            }
            let lyric = lyricsWithTime[index].lyric;

            if (index != current.index) {
                current.lyric = lyric;
                current.index = index;
                let lyrics = document.querySelector('.lyrics');
                let spans = lyrics.querySelectorAll('span');
                spans.forEach(s => {
                    s.classList.remove('active');
                    s.classList.remove('inline');

                });
                spans[index].classList.add('active');
                spans[index].classList.add('inline');
                lyrics.scrollTop = spans[index].offsetTop - lyrics.offsetHeight / 2;
            }
        }

        document.querySelector('.current-lyric').innerHTML = document.querySelector('.inline').innerText;
    } catch {

    }
}