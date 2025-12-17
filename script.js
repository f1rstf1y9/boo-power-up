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

// 레벨 업데이트
function updateLevel() {
    levelText.textContent = `LEVEL ${currentLevel}`;
    
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
        timerText.style.color = '#667eea';
    }
}

// 게임 종료
function endGame() {
    gameStarted = false;
    clearInterval(timerInterval);
    
    // UI 전환
    gameArea.style.display = 'none';
    gameOver.style.display = 'block';
    
    // 최종 레벨 표시
    finalLevel.textContent = `최종 레벨: ${currentLevel}`;
    
    // 최대 레벨 달성 시 특별 메시지
    if (currentLevel === maxLevel) {
        finalLevel.textContent += ' 🎊 최고 레벨 달성! 🎊';
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

// 레벨업 효과 표시
function showLevelUpEffect() {
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
    createParticles(centerX, centerY, 50, '#FFD700'); // 금색
    createParticles(centerX, centerY, 30, '#FF6B6B'); // 빨강
    createParticles(centerX, centerY, 30, '#4ECDC4'); // 청록
    createParticles(centerX, centerY, 30, '#95E1D3'); // 민트
    
    animateParticles();
    
    // 화면 진동 효과
    const characterDisplay = document.querySelector('.character-display');
    characterDisplay.style.animation = 'shake 0.3s ease';
    setTimeout(() => {
        characterDisplay.style.animation = '';
    }, 300);
    
    // 레벨 텍스트 빛나는 효과
    levelText.style.textShadow = '0 0 20px #FFD700, 0 0 40px #FFA500, 0 0 60px #FF8C00';
    setTimeout(() => {
        levelText.style.textShadow = '0 0 10px rgba(102, 126, 234, 0.5)';
    }, 800);
}

// 버튼 클릭 이벤트
upgradeButton.addEventListener('click', function(e) {
    if (!gameStarted) return;
    
    if (currentLevel >= maxLevel) {
        // 최대 레벨 도달
        return;
    }
    
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
    createParticles(centerX, centerY, 5, '#4facfe');
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
        
        // 최대 레벨 달성 시
        if (currentLevel === maxLevel) {
            setTimeout(() => {
                endGame();
            }, 1000);
        }
    }
});

// 초기 상태 설정
startButton.disabled = true;

