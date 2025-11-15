const overlayNext = document.getElementById('overlayNext'); // overlay inside video
const quizSection = document.getElementById('quizSection');
const videoPlayer = document.getElementById('videoPlayer');
const options = document.querySelectorAll('.option');
const result = document.getElementById('result');

// DEBUG: leave native controls on for now (toggle if you want)
const DEBUG_SHOW_CONTROLS = true;

// video list - UPDATED: all .mov changed to .mp4
const videos = [
    { src: 'videos/BottomLeft.mp4', correctAnswer: 'Bottom left', timer: 3.78 },
    { src: 'videos/BottomLeft2.mp4', correctAnswer: 'Bottom left', timer: 3.78 },
    { src: 'videos/Center.mp4', correctAnswer: 'Center', timer: 3.16 },
    { src: 'videos/Center2.mp4', correctAnswer: 'Center', timer: 3.16 },
    { src: 'videos/TopRight.mp4', correctAnswer: 'Top right', timer: 3.36 },
    { src: 'videos/TopRight2.mp4', correctAnswer: 'Top right', timer: 3.36 },
    { src: 'videos/BottomMiddle.mp4', correctAnswer: 'Bottom middle', timer: 3.64 },
    { src: 'videos/BottomMiddle2.mp4', correctAnswer: 'Bottom middle', timer: 3.64 },
    { src: 'videos/TopLeft.mp4', correctAnswer: 'Top left', timer: 3.42 },
    { src: 'videos/TopLeft2.mp4', correctAnswer: 'Top left', timer: 3.42 },
    { src: 'videos/MiddleLeft.mp4', correctAnswer: 'Middle left', timer: 3.54 },
    { src: 'videos/MiddleLeft2.mp4', correctAnswer: 'Middle left', timer: 3.54 },
    { src: 'videos/MiddleRight.mp4', correctAnswer: 'Middle right', timer: 3.56 },
    { src: 'videos/MiddleRight2.mp4', correctAnswer: 'Middle right', timer: 3.56 },
    { src: 'videos/TopMiddle.mp4', correctAnswer: 'Top middle', timer: 3.39 },
    { src: 'videos/TopMiddle2.mp4', correctAnswer: 'Top middle', timer: 3.39 },
    { src: 'videos/BottomRight.mp4', correctAnswer: 'Bottom right', timer: 3.57 },
    { src: 'videos/BottomRight2.mp4', correctAnswer: 'Bottom right', timer: 3.57 }
];

let timer;
let timeLeft;

/* --- audio context logic and diagnostics left intact --- */
let audioCtx = null;
let mediaElementSource = null;
function createAndConnectAudioContext() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (!mediaElementSource) {
            mediaElementSource = audioCtx.createMediaElementSource(videoPlayer);
            mediaElementSource.connect(audioCtx.destination);
        }
        if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => { });
    } catch (err) {
        console.error('Audio connect failed', err);
    }
}

/* diagnostics listeners */
videoPlayer.addEventListener('loadedmetadata', () => {
    if (DEBUG_SHOW_CONTROLS) videoPlayer.controls = true;
    console.log('loadedmetadata for', videoPlayer.currentSrc, 'duration', videoPlayer.duration);
});
videoPlayer.addEventListener('playing', () => {
    console.log('video playing event; muted=', videoPlayer.muted, 'volume=', videoPlayer.volume);
    createAndConnectAudioContext();
});
videoPlayer.addEventListener('error', (e) => {
    console.error('Media element error:', videoPlayer.error, e);
    result.textContent = 'Media error — see console';
    result.style.color = 'yellow';
});

/* Initial UI state: show quiz layout and disable options until user plays */
quizSection.classList.remove('hidden');
overlayNext.classList.remove('hidden');
overlayNext.textContent = 'Play';
overlayNext.disabled = false;
options.forEach(opt => {
    opt.disabled = true;
    opt.classList.remove('correct', 'incorrect');
});

// Force overlay above video element (extra safety)
try {
    overlayNext.style.zIndex = '9999';
    overlayNext.style.pointerEvents = 'auto';
} catch (e) { }

/* quiz flow */
function selectRandomVideo() {
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    console.log('Selected video:', randomVideo.src);
    videoPlayer.src = randomVideo.src.replace(/^\/+/, '/');
    videoPlayer.muted = false;
    videoPlayer.volume = 0.7;
    videoPlayer.load();

    result.textContent = '';
    options.forEach(option => {
        option.disabled = false; // enable options when a video loads
        option.classList.remove('correct', 'incorrect');
    });

    options.forEach(option => {
        const label = option.querySelector('span')?.textContent?.trim() ?? option.textContent.trim();
        option.dataset.correct = (label === randomVideo.correctAnswer.trim()) ? 'true' : 'false';
    });

    // update overlay button state
    overlayNext.disabled = true;
    overlayNext.textContent = 'Playing...';

    // Play using user gesture (overlayNext click) — will usually allow sound
    console.log('Calling videoPlayer.play()');
    videoPlayer.play().then(() => {
        console.log('play() resolved. muted=', videoPlayer.muted, 'volume=', videoPlayer.volume);
        createAndConnectAudioContext();
    }).catch((err) => {
        console.error('Video play failed:', err);
        result.textContent = 'Video failed to play — check format/path or user gesture';
        result.style.color = 'yellow';
        overlayNext.disabled = false;
        overlayNext.textContent = 'Next';
    });

    timeLeft = randomVideo.timer;
    clearInterval(timer);
    timer = setInterval(updateTimer, 100);
}

function updateTimer() {
    timeLeft -= 0.1;
    if (timeLeft <= 0) {
        clearInterval(timer);
        result.textContent = 'Too late';
        result.style.color = 'red';
        options.forEach(option => {
            option.disabled = true;
            if (option.dataset.correct === 'true') option.classList.add('correct');
        });
        overlayNext.disabled = false;
        overlayNext.textContent = 'Next';
    }
}

/* option click handling */
options.forEach(option => {
    option.addEventListener('click', () => {
        clearInterval(timer);
        if (option.dataset.correct === 'true') {
            result.textContent = 'Correct';
            result.style.color = 'lightgreen';
        } else {
            result.textContent = 'Incorrect';
            result.style.color = 'red';
        }
        options.forEach(opt => {
            opt.classList.add(opt.dataset.correct === 'true' ? 'correct' : 'incorrect');
            opt.disabled = true;
        });
        overlayNext.disabled = false;
        overlayNext.textContent = 'Next';
    });
});

/* overlay Next/Play pointerdown log to confirm interaction reaches the button */
overlayNext.addEventListener('pointerdown', (ev) => {
    console.log('overlayNext pointerdown; disabled=', overlayNext.disabled, 'event:', ev.type);
});

/* overlay Next/Play button (visible immediately) */
overlayNext.addEventListener('click', (e) => {
    console.log('overlayNext click; disabled=', overlayNext.disabled);
    e.stopPropagation();
    e.preventDefault();

    // user gesture ensures audio permissions for play/resume
    try { createAndConnectAudioContext(); } catch (err) { console.warn(err); }

    if (overlayNext.disabled) {
        console.log('overlayNext is disabled; ignoring click.');
        return;
    }

    selectRandomVideo();
});