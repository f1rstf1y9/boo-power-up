// 게임 요소
const introScreen = document.getElementById('introScreen');
const gameScreen = document.getElementById('gameScreen');
const cheerScreen = document.getElementById('cheerScreen');
const cheerText = document.getElementById('cheerText');
const endScreen = document.getElementById('endScreen');
const acceptButton = document.getElementById('acceptButton');
const buCharacter = document.getElementById('buCharacter');
const buChoiceText = document.getElementById('buChoice');
const resultText = document.getElementById('resultText');
const startButton = document.getElementById('startButton');
const homeButton = document.getElementById('homeButton');
const homeButtonContainer = document.getElementById('homeButtonContainer');
const particleContainer = document.getElementById('particleContainer');
const bgmToggle = document.getElementById('bgmToggle');

// 배경 음악 (사이트 전체)
const siteBgm = new Audio('bgm.mp3');
siteBgm.loop = true; // 반복 재생
siteBgm.volume = 0.15; // 기본 볼륨 15%

// 초대 화면 음악
const cheerBgm = new Audio('부위바위보.mp3');
cheerBgm.volume = 0.25; // 볼륨 25%

// 페이지 로드 시 배경음악 자동 재생 시도
window.addEventListener('load', () => {
    siteBgm.play().catch(e => {
        console.log('Auto-play prevented, will start on user interaction');
        // 자동 재생 실패 시 첫 클릭에 시작
        document.body.addEventListener('click', () => {
            if (bgmEnabled) {
                siteBgm.play().catch(err => console.log('BGM play failed:', err));
            }
        }, { once: true });
    });
});

// BGM 토글 버튼
bgmToggle.addEventListener('click', () => {
    bgmEnabled = !bgmEnabled;
    
    if (bgmEnabled) {
        // BGM 켜기
        bgmToggle.textContent = '🔔';
        bgmToggle.classList.remove('off');
        siteBgm.currentTime = 0; // 처음부터 재생
        siteBgm.play().catch(e => console.log('BGM play failed:', e));
    } else {
        // BGM 끄기
        bgmToggle.textContent = '🔕';
        bgmToggle.classList.add('off');
        siteBgm.pause();
        siteBgm.currentTime = 0;
    }
});

// 게임 상태
let isPlaying = false;
let bgmEnabled = true;

// 선택지
const choices = ['가위', '바위', '보'];
const choiceEmojis = {
    '가위': '✌️',
    '바위': '✊',
    '보': '✋'
};

// 이미지 매핑
const choiceImages = {
    '가위': 'boo_new_2.png',  // 가위
    '바위': 'boo_new_1.png',  // 주먹
    '보': 'boo_new_3.png'     // 보
};

// 효과음 생성 (Web Audio API 사용)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playCountSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playRevealSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playCheerSound() {
    // 응원 효과음 (밝고 경쾌한 소리)
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    
    osc1.frequency.setValueAtTime(523.25, audioContext.currentTime); // 도
    osc1.frequency.exponentialRampToValueAtTime(1046.50, audioContext.currentTime + 0.15); // 높은 도
    osc1.type = 'sine';
    
    gain1.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    osc1.start(audioContext.currentTime);
    osc1.stop(audioContext.currentTime + 0.3);
    
    // 하모니
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    
    osc2.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // 미
    osc2.frequency.exponentialRampToValueAtTime(1318.51, audioContext.currentTime + 0.25); // 높은 미
    osc2.type = 'triangle';
    
    gain2.gain.setValueAtTime(0.1, audioContext.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    osc2.start(audioContext.currentTime + 0.1);
    osc2.stop(audioContext.currentTime + 0.4);
    
    // 반짝이는 소리
    const osc3 = audioContext.createOscillator();
    const gain3 = audioContext.createGain();
    
    osc3.connect(gain3);
    gain3.connect(audioContext.destination);
    
    osc3.frequency.value = 2000;
    osc3.type = 'sine';
    
    gain3.gain.setValueAtTime(0.08, audioContext.currentTime + 0.2);
    gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    osc3.start(audioContext.currentTime + 0.2);
    osc3.stop(audioContext.currentTime + 0.5);
}

function playCrowdCheerSound() {
    // 환호 효과음 - 더 밝고 축제 같은 느낌
    
    // 상승하는 멜로디 (팡파르 느낌)
    const melody = [
        { freq: 523.25, time: 0 },      // 도
        { freq: 659.25, time: 0.15 },   // 미
        { freq: 783.99, time: 0.3 },    // 솔
        { freq: 1046.50, time: 0.45 }   // 높은 도
    ];
    
    melody.forEach(note => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.value = note.freq;
        osc.type = 'triangle';
        
        gain.gain.setValueAtTime(0, audioContext.currentTime + note.time);
        gain.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + note.time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.time + 0.3);
        
        osc.start(audioContext.currentTime + note.time);
        osc.stop(audioContext.currentTime + note.time + 0.3);
    });
    
    // 화음 (풍성한 느낌)
    const chords = [
        [523.25, 659.25, 783.99],  // C 코드
        [587.33, 739.99, 880.00]   // D 코드
    ];
    
    chords.forEach((chord, chordIndex) => {
        chord.forEach(freq => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            const startTime = audioContext.currentTime + 0.6 + (chordIndex * 0.3);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.06, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
            
            osc.start(startTime);
            osc.stop(startTime + 0.4);
        });
    });
    
    // 반짝이는 고음 (축하 느낌)
    for (let i = 0; i < 8; i++) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.value = 2000 + Math.random() * 1000;
        osc.type = 'sine';
        
        const startTime = audioContext.currentTime + 0.2 + (i * 0.1);
        gain.gain.setValueAtTime(0.05, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
        
        osc.start(startTime);
        osc.stop(startTime + 0.15);
    }
}

// 떨어지는 캐릭터 생성
function createFallingCharacters() {
    const images = ['chzzk_4.png', 'chzzk_6.png', 'chzzk_9.png'];
    const characterCount = 20; // 떨어지는 캐릭터 개수 증가
    
    // 각 이미지별 크기 범위 (다양하게)
    const sizeRanges = {
        'chzzk_4.png': { min: 40, max: 70 },
        'chzzk_6.png': { min: 30, max: 55 },
        'chzzk_9.png': { min: 35, max: 65 }
    };
    
    for (let i = 0; i < characterCount; i++) {
        const img = document.createElement('img');
        const selectedImage = images[Math.floor(Math.random() * images.length)];
        img.src = selectedImage;
        img.className = 'falling-character';
        
        // 각 캐릭터마다 다른 크기
        const sizeRange = sizeRanges[selectedImage];
        const size = sizeRange.min + Math.random() * (sizeRange.max - sizeRange.min);
        img.style.width = size + 'px';
        
        // 랜덤 위치 (화면 전체 너비)
        img.style.left = Math.random() * 100 + '%';
        
        // 랜덤 딜레이와 지속시간
        const delay = Math.random() * 1;
        const duration = 2.5 + Math.random() * 1.5;
        
        img.style.animationDelay = delay + 's';
        img.style.animationDuration = duration + 's';
        
        cheerScreen.appendChild(img);
        
        // 애니메이션 끝나면 제거
        setTimeout(() => {
            img.remove();
        }, (delay + duration) * 1000);
    }
}

// 인트로에서 게임으로 전환
acceptButton.addEventListener('click', () => {
    // 배경음악 볼륨 낮추기 (초대 화면 동안)
    siteBgm.volume = 0.05;
    
    // 응원 문구
    cheerText.textContent = '부위바위보 세계로 초대합니다 🔥🏆';
    
    // 인트로 페이드아웃
    introScreen.classList.add('fade-out');
    
    setTimeout(() => {
        introScreen.style.display = 'none';
        introScreen.classList.remove('fade-out');
        
        // 응원 문구 표시
        cheerScreen.style.display = 'flex';
        
        // 응원 효과음 재생 & 캐릭터 떨어지기
        setTimeout(() => {
            playCheerSound();
            createFallingCharacters();
            
            // 0.5초 후 환호 효과음 추가
            setTimeout(() => {
                playCrowdCheerSound();
            }, 500);
            
            // 1초 후 초대 화면 음악 재생
            setTimeout(() => {
                cheerBgm.currentTime = 0;
                cheerBgm.play().catch(e => console.log('Audio play failed:', e));
            }, 1000);
        }, 100);
        
        // 5초 후 게임 화면으로 전환 (더 오래 머무름)
        setTimeout(() => {
            cheerScreen.classList.add('fade-out');
            
            setTimeout(() => {
                cheerScreen.style.display = 'none';
                cheerScreen.classList.remove('fade-out');
                
                // 남은 캐릭터 이미지 정리
                const remainingChars = cheerScreen.querySelectorAll('.falling-character');
                remainingChars.forEach(char => char.remove());
                
                // 초대 화면 음악 정지
                cheerBgm.pause();
                cheerBgm.currentTime = 0;
                
                // 배경음악 볼륨 원래대로
                siteBgm.volume = 0.15;
                
                // 게임 화면으로 전환하면서 버튼 상태 초기화
                gameScreen.style.display = 'block';
                
                // 시작 버튼 명확하게 표시
                startButton.style.display = 'inline-block';
                startButton.style.opacity = '1';
                startButton.disabled = false;
                startButton.textContent = '시작';
                startButton.classList.remove('fade-in');
                
                // 처음으로 버튼 숨기기
                homeButtonContainer.style.display = 'none';
                homeButtonContainer.classList.remove('fade-in');
                
                // 게임 상태 초기화
                isPlaying = false;
                buCharacter.src = 'chzzk_1.png';
                buChoiceText.textContent = '';
                resultText.textContent = '시작 버튼을 눌러주세요!';
            }, 500);
        }, 5000);
    }, 500);
});

// 폭죽 효과 생성
function createFireworks() {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F06292', '#AED581'];
    const fireworkCount = 40;
    
    for (let i = 0; i < fireworkCount; i++) {
        const firework = document.createElement('div');
        firework.className = 'end-firework';
        const color = colors[Math.floor(Math.random() * colors.length)];
        firework.style.background = color;
        firework.style.color = color;
        firework.style.left = '50%';
        firework.style.top = '50%';
        
        const angle = (Math.PI * 2 * i) / fireworkCount;
        const distance = 150 + Math.random() * 150;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        firework.style.setProperty('--tx', tx + 'px');
        firework.style.setProperty('--ty', ty + 'px');
        firework.style.animation = `fireworkExplode ${0.8 + Math.random() * 0.5}s ease-out forwards`;
        firework.style.animationDelay = Math.random() * 0.3 + 's';
        
        endScreen.appendChild(firework);
        
        setTimeout(() => firework.remove(), 2000);
    }
}

// 연속 폭죽 효과
function createMultipleFireworks() {
    createFireworks();
    setTimeout(() => createFireworks(), 800);
    setTimeout(() => createFireworks(), 1600);
}

// 종료 효과음
function playEndSound() {
    // 팡파르 멜로디
    const melody = [
        { freq: 523.25, time: 0 },      // 도
        { freq: 659.25, time: 0.15 },   // 미
        { freq: 783.99, time: 0.3 },    // 솔
        { freq: 1046.50, time: 0.45 },  // 높은 도
        { freq: 783.99, time: 0.7 },    // 솔
        { freq: 1046.50, time: 0.85 }   // 높은 도
    ];
    
    melody.forEach(note => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.value = note.freq;
        osc.type = 'triangle';
        
        gain.gain.setValueAtTime(0.2, audioContext.currentTime + note.time);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.time + 0.25);
        
        osc.start(audioContext.currentTime + note.time);
        osc.stop(audioContext.currentTime + note.time + 0.25);
    });
    
    // 드럼 효과
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const bufferSize = audioContext.sampleRate * 0.1;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let j = 0; j < bufferSize; j++) {
                data[j] = (Math.random() * 2 - 1) * 0.3;
            }
            
            const noise = audioContext.createBufferSource();
            const noiseGain = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            noise.buffer = buffer;
            filter.type = 'lowpass';
            filter.frequency.value = 200;
            
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(audioContext.destination);
            
            noiseGain.gain.setValueAtTime(0.2, audioContext.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            noise.start(audioContext.currentTime);
            noise.stop(audioContext.currentTime + 0.1);
        }, i * 300);
    }
}

// 처음으로 버튼
homeButton.addEventListener('click', () => {
    // 라운드 종료 화면 표시
    gameScreen.style.display = 'none';
    endScreen.style.display = 'flex';
    
    // 효과음 및 폭죽 효과
    playEndSound();
    setTimeout(() => {
        createMultipleFireworks();
    }, 300);
    
    // 3초 후 인트로로 전환
    setTimeout(() => {
        endScreen.classList.add('fade-out');
        
        setTimeout(() => {
            endScreen.style.display = 'none';
            endScreen.classList.remove('fade-out');
            
            // 남은 폭죽 정리
            const remainingFireworks = endScreen.querySelectorAll('.end-firework');
            remainingFireworks.forEach(fw => fw.remove());
            
            // 게임 초기화
            buCharacter.src = 'chzzk_1.png';
            buChoiceText.textContent = '';
            resultText.textContent = '시작 버튼을 눌러주세요!';
            startButton.textContent = '시작';
            startButton.disabled = false;
            isPlaying = false;
            startButton.style.display = 'inline-block';
            
            // 버튼들 숨기기
            homeButtonContainer.style.display = 'none';
            
            // fade-in 클래스 제거
            startButton.classList.remove('fade-in');
            homeButtonContainer.classList.remove('fade-in');
            
            // 인트로 화면으로 돌아가기
            introScreen.style.display = 'block';
        }, 400);
    }, 3000);
});

// 파티클 이펙트 생성
function createParticles(choice) {
    const emoji = choiceEmojis[choice];
    const rect = buCharacter.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 이모지 파티클
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = emoji;
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        
        const angle = (Math.PI * 2 * i) / 8;
        const distance = 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        
        particleContainer.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1500);
    }
    
    // 반짝이 파티클
    for (let i = 0; i < 15; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = centerX + 'px';
        sparkle.style.top = centerY + 'px';
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        sparkle.style.setProperty('--tx', tx + 'px');
        sparkle.style.setProperty('--ty', ty + 'px');
        
        particleContainer.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 1000);
    }
}

// 게임 플레이
function playGame() {
    if (isPlaying) return;
    isPlaying = true;
    
    // 버튼들 숨기기
    startButton.style.display = 'none';
    homeButtonContainer.style.display = 'none';
    
    // 초기화
    buChoiceText.textContent = '';
    buCharacter.src = 'chzzk_1.png';
    resultText.textContent = '';
    
    // 최종 선택 미리 결정
    const finalChoice = choices[Math.floor(Math.random() * choices.length)];
    
    // 카운트다운: 3, 2, 1
    let countdown = 3;
    resultText.textContent = countdown;
    resultText.classList.add('countdown');
    playCountSound();
    
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            resultText.textContent = countdown;
            resultText.classList.add('countdown');
            playCountSound();
        } else {
            resultText.classList.remove('countdown');
            resultText.textContent = '';
            clearInterval(countdownInterval);
            
            // 바로 결과 공개
            setTimeout(() => {
                buChoiceText.textContent = choiceEmojis[finalChoice];
                
                // 이미지 변경 및 애니메이션
                buCharacter.src = choiceImages[finalChoice];
                buCharacter.classList.add('show-choice');
                
                // 효과음 재생
                playRevealSound();
                
                // 파티클 이펙트
                createParticles(finalChoice);
                
                setTimeout(() => {
                    buCharacter.classList.remove('show-choice');
                }, 500);
                
                showResult(finalChoice);
            }, 300);
        }
    }, 1000); // 1초마다 카운트다운
}

// 시작 버튼 리셋 기능 추가
startButton.addEventListener('click', () => {
    // 게임이 끝난 상태면 초기화 후 시작
    startButton.textContent = '시작';
    startButton.classList.remove('fade-in');
    homeButtonContainer.classList.remove('fade-in');
    playGame();
});

// 결과 표시
function showResult(choice) {
    const messages = {
        '가위': '부가 가위를 냈어요! ✌️',
        '바위': '부가 바위를 냈어요! ✊',
        '보': '부가 보를 냈어요! ✋'
    };
    
    resultText.textContent = messages[choice];
    
    // 0.5초 후 버튼 표시 (페이드인 효과)
    setTimeout(() => {
        startButton.style.display = 'inline-block';
        startButton.style.opacity = '0';
        startButton.disabled = false;
        isPlaying = false;
        startButton.textContent = '다시 시작';
        
        // 애니메이션 클래스 추가
        setTimeout(() => {
            startButton.classList.add('fade-in');
        }, 10);
        
        // 처음으로 버튼도 함께 표시
        homeButtonContainer.style.display = 'flex';
        homeButtonContainer.classList.add('fade-in');
    }, 500);
}

