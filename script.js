// 게임 상태
let currentLevel = 1;
let clickCount = 0;
const maxLevel = 50;
const clicksPerLevel = 5; // 레벨당 필요한 클릭 수 (5번으로 변경)
let selectedTime = 0;
let timeLeft = 0;
let timerInterval = null;
let gameStarted = false;

// 파티클 클래스
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4 - 2;
        this.life = 1;
        this.color = color || `hsl(${Math.random() * 60 + 40}, 100%, 60%)`;
        this.size = Math.random() * 4 + 2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // 중력
        this.life -= 0.02;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 파티클 생성
function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// 파티클 애니메이션
function animateParticles() {
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw(particleCtx);
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    if (particles.length > 0) {
        requestAnimationFrame(animateParticles);
    }
}

// 파티클 캔버스 초기화
function initParticleCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    particleCanvas.width = rect.width;
    particleCanvas.height = rect.height;
}

// 폭죽 생성 함수
function createFirework(x, y) {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#FFFFFF', '#FFA500', '#FF69B4', '#00FFA3'];
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const firework = document.createElement('div');
        firework.className = 'firework';
        
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 100 + Math.random() * 100;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        
        firework.style.left = x + 'px';
        firework.style.top = y + 'px';
        firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        firework.style.setProperty('--tx', tx + 'px');
        firework.style.setProperty('--ty', ty + 'px');
        firework.style.animation = `fireworkExplode ${0.8 + Math.random() * 0.4}s ease-out forwards`;
        
        document.body.appendChild(firework);
        
        setTimeout(() => {
            firework.remove();
        }, 1200);
    }
}

// 여러 개의 폭죽 발사
function launchFireworks() {
    const count = 5;
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * (window.innerHeight * 0.6);
            createFirework(x, y);
            playFireworkSound();
        }, i * 300);
    }
}

// DOM 요소
const levelText = document.getElementById('levelText');
const upgradeButton = document.getElementById('upgradeButton');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const canvas = document.getElementById('characterCanvas');
const ctx = canvas.getContext('2d');
const particleCanvas = document.getElementById('particleCanvas');
const particleCtx = particleCanvas.getContext('2d');
const levelUpEffect = document.getElementById('levelUpEffect');
const clickEffect = document.getElementById('clickEffect');
const milestoneEffect = document.getElementById('milestoneEffect');
const timeButtons = document.querySelectorAll('.time-btn');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const restartButton = document.getElementById('restartButton');
const timerText = document.getElementById('timerText');
const gameArea = document.getElementById('gameArea');
const gameOver = document.getElementById('gameOver');
const finalLevel = document.getElementById('finalLevel');
const timeSettings = document.querySelector('.time-settings');

// 파티클 시스템
const particles = [];

// 오디오 컨텍스트 생성
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 레벨업 효과음 생성 함수
function playLevelUpSound() {
    const now = audioContext.currentTime;
    
    // 메인 톤
    const oscillator1 = audioContext.createOscillator();
    const gainNode1 = audioContext.createGain();
    
    oscillator1.connect(gainNode1);
    gainNode1.connect(audioContext.destination);
    
    // 상승하는 음계 (C -> E -> G -> C)
    oscillator1.frequency.setValueAtTime(523.25, now); // C5
    oscillator1.frequency.setValueAtTime(659.25, now + 0.1); // E5
    oscillator1.frequency.setValueAtTime(783.99, now + 0.2); // G5
    oscillator1.frequency.setValueAtTime(1046.50, now + 0.3); // C6
    
    oscillator1.type = 'sine';
    
    gainNode1.gain.setValueAtTime(0.3, now);
    gainNode1.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    oscillator1.start(now);
    oscillator1.stop(now + 0.5);
    
    // 하모닉 톤 (더 풍부한 사운드)
    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    
    oscillator2.frequency.setValueAtTime(1046.50, now); // C6
    oscillator2.frequency.setValueAtTime(1318.51, now + 0.1); // E6
    oscillator2.frequency.setValueAtTime(1567.98, now + 0.2); // G6
    oscillator2.frequency.setValueAtTime(2093.00, now + 0.3); // C7
    
    oscillator2.type = 'triangle';
    
    gainNode2.gain.setValueAtTime(0.15, now);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    oscillator2.start(now);
    oscillator2.stop(now + 0.5);
}

// 클릭 효과음 생성 함수
function playClickSound() {
    const now = audioContext.currentTime;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    oscillator.start(now);
    oscillator.stop(now + 0.1);
}

// 게임 종료 효과음 생성 함수
function playGameOverSound() {
    const now = audioContext.currentTime;
    
    // 첫 번째 음 (하강)
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    
    osc1.frequency.setValueAtTime(800, now);
    osc1.frequency.exponentialRampToValueAtTime(400, now + 0.3);
    osc1.frequency.exponentialRampToValueAtTime(200, now + 0.6);
    
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    osc1.start(now);
    osc1.stop(now + 0.6);
    
    // 두 번째 음 (낮은 베이스)
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    
    osc2.frequency.setValueAtTime(150, now + 0.2);
    osc2.type = 'triangle';
    gain2.gain.setValueAtTime(0.2, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    
    osc2.start(now + 0.2);
    osc2.stop(now + 0.8);
}

// 폭죽 효과음 생성 함수
function playFireworkSound() {
    const now = audioContext.currentTime;
    
    // 폭발음
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(1000, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    oscillator.start(now);
    oscillator.stop(now + 0.3);
    
    // 반짝임 소리
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    
    osc2.frequency.setValueAtTime(2000, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(3000, now + 0.4);
    
    osc2.type = 'sine';
    
    gain2.gain.setValueAtTime(0.15, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    osc2.start(now + 0.1);
    osc2.stop(now + 0.4);
}

// 10레벨 달성 효과음
function playMilestoneSound() {
    const now = audioContext.currentTime;
    
    // 트럼펫 같은 팡파르 효과
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (한 옥타브 위)
    
    frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.setValueAtTime(freq, now + index * 0.15);
        osc.type = 'square';
        
        gain.gain.setValueAtTime(0.3, now + index * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.15 + 0.4);
        
        osc.start(now + index * 0.15);
        osc.stop(now + index * 0.15 + 0.4);
    });
    
    // 심벌 효과
    const cymbal = audioContext.createOscillator();
    const cymbalGain = audioContext.createGain();
    
    cymbal.connect(cymbalGain);
    cymbalGain.connect(audioContext.destination);
    
    cymbal.frequency.setValueAtTime(3000, now + 0.6);
    cymbal.type = 'sawtooth';
    
    cymbalGain.gain.setValueAtTime(0.2, now + 0.6);
    cymbalGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
    
    cymbal.start(now + 0.6);
    cymbal.stop(now + 1.2);
}

// 이미지 로드 (50개의 개별 이미지)
const characterImages = [];
let imagesLoaded = 0;

// 50개의 이미지를 미리 로드
for (let i = 1; i <= maxLevel; i++) {
    const img = new Image();
    // PNG 먼저 시도, 없으면 JPG 시도
    img.src = `images/level${i}.png`;
    img.onload = function() {
        imagesLoaded++;
        if (imagesLoaded === 1) {
            // 첫 번째 이미지가 로드되면 캔버스 초기화
            initCanvas();
            drawCharacter(currentLevel);
        }
    };
    img.onerror = function() {
        // PNG 실패 시 JPG 시도
        this.src = `images/level${i}.jpg`;
        this.onerror = function() {
            console.error(`이미지 로드 실패: level${i}`);
            imagesLoaded++;
            if (imagesLoaded === 1) {
                initCanvas();
                drawCharacter(currentLevel);
            }
        };
        this.onload = function() {
            imagesLoaded++;
            if (imagesLoaded === 1) {
                initCanvas();
                drawCharacter(currentLevel);
            }
        };
    };
    characterImages[i] = img;
}

// 캔버스 초기화
function initCanvas() {
    // 캔버스 크기를 고정 (중앙 배치용)
    const displaySize = 180;
    
    // 스타일 크기 고정
    canvas.style.width = displaySize + 'px';
    canvas.style.height = displaySize + 'px';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    
    // 실제 캔버스 크기 설정 (고해상도 지원)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    ctx.scale(dpr, dpr);
    
    // 이미지 렌더링 품질 설정
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
}

// 캐릭터 그리기
function drawCharacter(level) {
    if (level > maxLevel) level = maxLevel;
    if (level < 1) level = 1;
    
    const img = characterImages[level];
    if (!img || !img.complete) {
        // 이미지가 아직 로드되지 않았으면 기본 텍스트 표시
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#667eea';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const dpr = window.devicePixelRatio || 1;
    const displaySize = 180;
    
    // 캔버스 클리어 (흰색 배경)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, displaySize, displaySize);
    
    // 이미지를 캔버스 중앙에 꽉 차게 그리기
    ctx.drawImage(img, 0, 0, displaySize, displaySize);
}

// 레벨에 따른 테두리 색상 가져오기
function getBorderColorByLevel(level) {
    if (level >= 1 && level <= 9) {
        return 'rgba(255, 255, 255, 0.3)'; // 기본 흰색
    } else if (level >= 10 && level <= 19) {
        return '#FF4500'; // 진한 오렌지 레드
    } else if (level >= 20 && level <= 29) {
        return '#FF8C00'; // 다크 오렌지
    } else if (level >= 30 && level <= 39) {
        return '#FFD700'; // 골드
    } else if (level >= 40 && level <= 49) {
        return '#00FF00'; // 라임 그린
    } else if (level === 50) {
        return '#00FFFF'; // 시안 (최고 레벨)
    }
    return 'rgba(255, 255, 255, 0.3)';
}

// 레벨 업데이트
function updateLevel() {
    levelText.textContent = `LEVEL ${currentLevel}`;
    
    // 레벨에 따라 게임 영역 테두리 색상 변경
    const borderColor = getBorderColorByLevel(currentLevel);
    gameArea.style.borderColor = borderColor;
    
    // 레벨 10 이상일 때 빛나는 효과 추가
    if (currentLevel >= 10) {
        gameArea.classList.add('glowing');
        gameArea.style.boxShadow = `
            0 0 20px ${borderColor}80,
            0 0 40px ${borderColor}60,
            0 0 60px ${borderColor}40,
            0 10px 40px rgba(0, 0, 0, 0.5)
        `;
    } else {
        gameArea.classList.remove('glowing');
        gameArea.style.boxShadow = `0 10px 40px rgba(0, 0, 0, 0.5)`;
    }
    
    // 레벨 업 애니메이션
    levelText.parentElement.classList.add('level-up-animation');
    setTimeout(() => {
        levelText.parentElement.classList.remove('level-up-animation');
    }, 800);
}

// 진행도 업데이트
function updateProgress() {
    const progress = (clickCount % clicksPerLevel) / clicksPerLevel * 100;
    progressFill.style.width = progress + '%';
    progressText.textContent = `${clickCount % clicksPerLevel} / ${clicksPerLevel}`;
}

// 시간 제한 버튼 이벤트
timeButtons.forEach(button => {
    button.addEventListener('click', function() {
        // 모든 버튼에서 selected 클래스 제거
        timeButtons.forEach(btn => btn.classList.remove('selected'));
        
        // 현재 버튼에 selected 클래스 추가
        this.classList.add('selected');
        
        // 선택된 시간 저장
        selectedTime = parseInt(this.getAttribute('data-time'));
        
        // 시작 버튼 활성화
        startButton.disabled = false;
    });
});

// 게임 시작 버튼 이벤트
startButton.addEventListener('click', function() {
    if (selectedTime === 0) {
        alert('시간을 선택해주세요!');
        return;
    }
    
    // 게임 시작
    startGame();
});

// 게임 시작 함수
function startGame() {
    gameStarted = true;
    timeLeft = selectedTime;
    currentLevel = 1;
    clickCount = 0;
    
    // 오디오 컨텍스트 활성화 (사용자 상호작용 필요)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // UI 전환
    timeSettings.style.display = 'none';
    gameArea.style.display = 'block';
    gameOver.style.display = 'none';
    
    // 파티클 캔버스 초기화
    initParticleCanvas();
    
    // 초기화
    updateLevel();
    updateProgress();
    drawCharacter(currentLevel);
    updateTimer();
    
    // 타이머 시작
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// 타이머 업데이트
function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerText.textContent = `남은 시간: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // 10초 이하일 때 빨간색 + 경고 애니메이션
    if (timeLeft <= 10) {
        timerText.parentElement.classList.add('warning');
        timerText.style.color = '#ff4757';
    } else {
        timerText.parentElement.classList.remove('warning');
        timerText.style.color = '#FFFFFF';
    }
}

// 게임 종료
function endGame() {
    gameStarted = false;
    clearInterval(timerInterval);
    
    // 게임 종료 효과음 재생
    playGameOverSound();
    
    // 폭죽 효과 발사
    setTimeout(() => {
        launchFireworks();
    }, 300);
    
    // UI 전환
    gameArea.style.display = 'none';
    gameOver.style.display = 'block';
    
    // 최종 레벨 표시
    finalLevel.textContent = `최종 레벨: ${currentLevel}`;
    
    // 최대 레벨 달성 시 특별 메시지
    if (currentLevel === maxLevel) {
        finalLevel.textContent += ' 🎊 최고 레벨 달성! 🎊';
        // 최대 레벨 달성 시 추가 폭죽
        setTimeout(() => {
            launchFireworks();
        }, 1500);
    }
}

// 다시 시작 버튼 (게임 중)
resetButton.addEventListener('click', function() {
    if (confirm('게임을 다시 시작하시겠습니까?')) {
        clearInterval(timerInterval);
        gameArea.style.display = 'none';
        timeSettings.style.display = 'block';
        
        // 선택 초기화
        timeButtons.forEach(btn => btn.classList.remove('selected'));
        selectedTime = 0;
        startButton.disabled = true;
    }
});

// 다시 도전하기 버튼 (게임 종료 후)
restartButton.addEventListener('click', function() {
    gameOver.style.display = 'none';
    timeSettings.style.display = 'block';
    
    // 선택 초기화
    timeButtons.forEach(btn => btn.classList.remove('selected'));
    selectedTime = 0;
    startButton.disabled = true;
});

// 클릭 효과 표시
function showClickEffect(x, y) {
    clickEffect.style.left = x + 'px';
    clickEffect.style.top = y + 'px';
    clickEffect.classList.remove('active');
    void clickEffect.offsetWidth; // 리플로우 강제
    clickEffect.classList.add('active');
    
    setTimeout(() => {
        clickEffect.classList.remove('active');
    }, 800);
}

// 10레벨 달성 이펙트 표시
function showMilestoneEffect(level) {
    const milestoneText = milestoneEffect.querySelector('.milestone-text');
    
    // 레벨을 10, 20, 30, 40, 50으로 고정
    let displayLevel = level;
    if (level % 10 !== 0) {
        displayLevel = Math.floor(level / 10) * 10;
    }
    
    milestoneText.textContent = `LEVEL ${displayLevel} 달성!`;
    
    milestoneEffect.classList.remove('active');
    void milestoneEffect.offsetWidth; // 리플로우 강제
    milestoneEffect.classList.add('active');
    
    // 효과음 재생
    playMilestoneSound();
    
    // 폭죽 효과
    setTimeout(() => {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * (window.innerHeight * 0.5);
                createFirework(x, y);
                playFireworkSound();
            }, i * 200);
        }
    }, 500);
    
    setTimeout(() => {
        milestoneEffect.classList.remove('active');
    }, 2000);
}

// 레벨업 효과 표시
function showLevelUpEffect() {
    // 레벨업 효과음 재생
    playLevelUpSound();
    
    levelUpEffect.classList.remove('active');
    void levelUpEffect.offsetWidth; // 리플로우 강제
    levelUpEffect.classList.add('active');
    
    setTimeout(() => {
        levelUpEffect.classList.remove('active');
    }, 1000);
    
    // 화려한 파티클 생성
    const centerX = particleCanvas.width / 2;
    const centerY = particleCanvas.height / 2;
    
    // 여러 색상의 파티클을 여러 번 생성
    createParticles(centerX, centerY, 50, '#FFFFFF'); // 흰색
    createParticles(centerX, centerY, 30, '#FFD700'); // 금색
    createParticles(centerX, centerY, 30, '#FFA500'); // 주황
    createParticles(centerX, centerY, 30, '#FF69B4'); // 핑크
    
    animateParticles();
    
    // 화면 진동 효과
    const characterDisplay = document.querySelector('.character-display');
    characterDisplay.style.animation = 'shake 0.3s ease';
    setTimeout(() => {
        characterDisplay.style.animation = '';
    }, 300);
    
    // 레벨 텍스트 빛나는 효과
    levelText.style.textShadow = '0 0 20px #FFFFFF, 0 0 40px #FFFFFF, 0 0 60px #FFFFFF';
    setTimeout(() => {
        levelText.style.textShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
    }, 800);
}

// 버튼 클릭 이벤트
upgradeButton.addEventListener('click', function(e) {
    if (!gameStarted) return;
    
    if (currentLevel >= maxLevel) {
        // 최대 레벨 도달
        return;
    }
    
    // 클릭 효과음 재생
    playClickSound();
    
    // 버튼 애니메이션
    this.classList.add('clicked');
    setTimeout(() => {
        this.classList.remove('clicked');
    }, 200);
    
    // 클릭 효과 (버튼 중앙에 표시)
    const rect = canvas.getBoundingClientRect();
    showClickEffect(rect.left + rect.width / 2, rect.top + rect.height / 2);
    
    // 작은 파티클 생성
    const centerX = particleCanvas.width / 2;
    const centerY = particleCanvas.height / 2;
    createParticles(centerX, centerY, 5, '#FFFFFF');
    if (particles.length === 5) {
        animateParticles();
    }
    
    // 클릭 카운트 증가
    clickCount++;
    
    // 진행도 업데이트
    updateProgress();
    
    // 레벨 업 체크
    if (clickCount % clicksPerLevel === 0) {
        currentLevel++;
        
        // 버튼 성공 애니메이션
        this.classList.add('success');
        setTimeout(() => {
            this.classList.remove('success');
        }, 500);
        
        // 레벨업 효과
        showLevelUpEffect();
        
        // UI 업데이트
        updateLevel();
        drawCharacter(currentLevel);
        updateProgress();
        
        // 10의 배수 레벨 달성 시 특별 이펙트 (10, 20, 30, 40, 50) - 즉시 표시
        if (currentLevel % 10 === 0) {
            // 즉시 효과 표시
            showMilestoneEffect(currentLevel);
            
            // 최대 레벨(50) 달성 시 게임 종료
            if (currentLevel === maxLevel) {
                setTimeout(() => {
                    endGame();
                }, 3000);
            }
        }
        
        // 최대 레벨이 아닌데 도달한 경우 (혹시 모를 경우)
        if (currentLevel === maxLevel && currentLevel % 10 !== 0) {
            setTimeout(() => {
                endGame();
            }, 1000);
        }
    }
});

// 초기 상태 설정
startButton.disabled = true;

