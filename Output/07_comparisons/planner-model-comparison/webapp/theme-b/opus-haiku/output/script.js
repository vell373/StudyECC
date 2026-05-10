/**
 * ポモドーロタイマー + タスク管理アプリ
 *
 * 状態管理:
 * - グローバル state オブジェクトが唯一の真実のソース (SSOT)
 * - 変更後に render() と persist() を呼ぶ単純な Flux 風パターン
 * - localStorage に自動永続化
 */

// ===== 定数 =====
const FOCUS_DURATION = 25 * 60; // 25分（秒）
const SHORT_BREAK_DURATION = 5 * 60; // 5分（秒）
const LONG_BREAK_DURATION = 15 * 60; // 15分（秒）
const SESSIONS_FOR_LONG_BREAK = 4; // 長休憩までのセッション数

const STORAGE_KEYS = {
    TASKS: 'pomodo_tasks',
    SESSIONS: 'pomodo_sessions',
    SETTINGS: 'pomodo_settings',
};

const PHASE = {
    FOCUS: 'focus',
    SHORT_BREAK: 'short_break',
    LONG_BREAK: 'long_break',
};

const PRIORITY = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
};

// ===== グローバル状態 =====
let state = {
    timer: {
        phase: PHASE.FOCUS,
        totalSeconds: FOCUS_DURATION,
        remainingSeconds: FOCUS_DURATION,
        isRunning: false,
        startTime: null, // タブ非アクティブ対応用
    },
    sessions: {
        total: 0,
        today: {
            date: getTodayDate(),
            count: 0,
        },
    },
    tasks: [], // { id, text, completed, priority }
    settings: {
        darkMode: false,
    },
};

let timerInterval = null;

// ===== ユーティリティ関数 =====

/**
 * 今日の日付を YYYY-MM-DD 形式で取得
 */
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
}

/**
 * 秒数を mm:ss 形式に変換
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * localStorage に状態を保存
 */
function persist() {
    try {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(state.sessions));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    } catch (error) {
        console.error('localStorage 保存失敗:', error);
        showNotification('ストレージに保存できません', 'error');
    }
}

/**
 * localStorage から状態を読み込む
 */
function loadState() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
        const savedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
        const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

        if (savedTasks) state.tasks = JSON.parse(savedTasks);
        if (savedSessions) {
            const saved = JSON.parse(savedSessions);
            state.sessions = saved;
            // 日付が変わっていたら本日のセッション数をリセット
            if (saved.today.date !== getTodayDate()) {
                state.sessions.today = { date: getTodayDate(), count: 0 };
            }
        }
        if (savedSettings) state.settings = JSON.parse(savedSettings);
    } catch (error) {
        console.error('localStorage 読み込み失敗:', error);
    }
}

/**
 * 通知を表示
 */
function showNotification(message, type = 'success') {
    const notifEl = document.getElementById('notification');
    notifEl.textContent = message;
    notifEl.className = `notification ${type === 'error' ? 'error' : ''}`;
    notifEl.classList.remove('hidden');

    setTimeout(() => {
        notifEl.classList.add('hidden');
    }, 3000);
}

/**
 * フェーズ終了時の通知（音声 / alert フォールバック）
 */
function notifyPhaseComplete() {
    // Notification API を試す
    if (Notification.permission === 'granted') {
        const phaseText = state.timer.phase === PHASE.FOCUS ? '集中時間終了' : '休憩時間終了';
        new Notification(phaseText, {
            body: state.timer.phase === PHASE.FOCUS ? '休憩時間です' : '次の集中時間を開始してください',
            tag: 'pomodo-timer',
        });
    }

    // Audio 再生を試す
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        // Audio 再生失敗時は alert にフォールバック
        const message = state.timer.phase === PHASE.FOCUS ? '集中時間終了！' : '休憩時間終了！';
        alert(message);
    }
}

/**
 * タイマーを開始（または再開）
 */
function startTimer() {
    if (state.timer.isRunning) return;

    state.timer.isRunning = true;
    state.timer.startTime = Date.now() - (state.timer.totalSeconds - state.timer.remainingSeconds) * 1000;

    if (timerInterval) clearInterval(timerInterval);

    // 1秒ごとに更新（UI 表示用）
    // 実際の時間は Date.now() と startTime から計算
    timerInterval = setInterval(() => {
        updateTimer();
    }, 100);

    render();
}

/**
 * タイマーを一時停止
 */
function pauseTimer() {
    if (!state.timer.isRunning) return;

    state.timer.isRunning = false;
    if (timerInterval) clearInterval(timerInterval);

    render();
}

/**
 * タイマーをリセット
 */
function resetTimer() {
    state.timer.isRunning = false;
    state.timer.remainingSeconds = state.timer.totalSeconds;
    state.timer.startTime = null;

    if (timerInterval) clearInterval(timerInterval);

    render();
}

/**
 * タイマーの時間更新（精度確保用に Date.now() を使用）
 */
function updateTimer() {
    if (!state.timer.isRunning) return;

    const elapsed = Math.floor((Date.now() - state.timer.startTime) / 1000);
    const remaining = state.timer.totalSeconds - elapsed;

    if (remaining <= 0) {
        completePhase();
    } else {
        state.timer.remainingSeconds = remaining;
        render();
    }
}

/**
 * 現在のフェーズを完了して次のフェーズへ
 */
function completePhase() {
    state.timer.isRunning = false;
    if (timerInterval) clearInterval(timerInterval);

    // UI とアラートを通知
    const message = state.timer.phase === PHASE.FOCUS
        ? '集中時間終了！休憩します。'
        : '休憩時間終了！次の集中タイムを始めてください。';
    showNotification(message);
    notifyPhaseComplete(); // 音声・Notification API を呼び出し

    if (state.timer.phase === PHASE.FOCUS) {
        // セッション完了
        state.sessions.total += 1;
        state.sessions.today.count += 1;

        // 4セッション完了時に長休憩提案
        if (state.sessions.total % SESSIONS_FOR_LONG_BREAK === 0) {
            showLongBreakDialog();
        } else {
            transitionToShortBreak();
        }
    } else {
        // 休憩完了 → 次の集中タイムへ
        transitionToFocus();
    }

    persist();
    render();
}

/**
 * 短い休憩(5分)へ遷移
 */
function transitionToShortBreak() {
    state.timer.phase = PHASE.SHORT_BREAK;
    state.timer.totalSeconds = SHORT_BREAK_DURATION;
    state.timer.remainingSeconds = SHORT_BREAK_DURATION;
    state.timer.startTime = null;
    state.timer.isRunning = false;
}

/**
 * 集中タイム(25分)へ遷移
 */
function transitionToFocus() {
    state.timer.phase = PHASE.FOCUS;
    state.timer.totalSeconds = FOCUS_DURATION;
    state.timer.remainingSeconds = FOCUS_DURATION;
    state.timer.startTime = null;
    state.timer.isRunning = false;
}

/**
 * 長休憩ダイアログを表示
 */
function showLongBreakDialog() {
    const confirmed = confirm(
        `4セッション完了しました！\n\n次は15分の長休憩をお勧めします。\n始めますか？`
    );

    if (confirmed) {
        state.timer.phase = PHASE.LONG_BREAK;
        state.timer.totalSeconds = LONG_BREAK_DURATION;
        state.timer.remainingSeconds = LONG_BREAK_DURATION;
        state.timer.startTime = null;
        state.timer.isRunning = false;
    } else {
        transitionToFocus();
    }
}

/**
 * プログレスバー（円形）を更新
 */
function updateProgressCircle() {
    const progress = 1 - (state.timer.remainingSeconds / state.timer.totalSeconds);
    const circumference = 282.7; // 2 * π * 45（SVG の radius）
    const offset = circumference * (1 - progress);

    const fillEl = document.getElementById('progressFill');
    if (fillEl) {
        fillEl.style.strokeDashoffset = offset;
    }
}

// ===== タスク管理 =====

/**
 * タスクを追加
 */
function addTask(text, priority) {
    if (!text.trim()) {
        showNotification('タスク名を入力してください', 'error');
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        priority: priority,
    };

    state.tasks.push(newTask);
    persist();
    render();
}

/**
 * タスクの完了状態を切り替え
 */
function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        persist();
        render();
    }
}

/**
 * タスクを削除
 */
function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    persist();
    render();
}

/**
 * 完了タスク数を取得
 */
function getCompletedTaskCount() {
    return state.tasks.filter(t => t.completed).length;
}

// ===== レンダリング =====

/**
 * UI を更新（メイン関数）
 */
function render() {
    updateTimerDisplay();
    updateTaskList();
    updateSessionInfo();
    updateProgress();
    updateButtonStates();
}

/**
 * タイマー表示を更新
 */
function updateTimerDisplay() {
    const timerEl = document.getElementById('timerValue');
    const phaseEl = document.getElementById('timerPhase');

    if (timerEl) {
        timerEl.textContent = formatTime(state.timer.remainingSeconds);
    }

    if (phaseEl) {
        const phaseText = {
            [PHASE.FOCUS]: '集中タイム',
            [PHASE.SHORT_BREAK]: '短い休憩',
            [PHASE.LONG_BREAK]: '長い休憩',
        }[state.timer.phase];
        phaseEl.textContent = phaseText;
    }

    updateProgressCircle();
}

/**
 * タスクリストを更新
 */
function updateTaskList() {
    const taskListEl = document.getElementById('taskList');
    if (!taskListEl) return;

    taskListEl.innerHTML = '';

    state.tasks.forEach(task => {
        const liEl = document.createElement('li');
        liEl.className = `task-item priority-${task.priority}`;
        if (task.completed) liEl.classList.add('completed');

        const checkboxEl = document.createElement('input');
        checkboxEl.type = 'checkbox';
        checkboxEl.className = 'task-checkbox';
        checkboxEl.checked = task.completed;
        checkboxEl.setAttribute('aria-label', `タスク: ${task.text}`);
        checkboxEl.addEventListener('change', () => toggleTask(task.id));

        const textEl = document.createElement('span');
        textEl.className = 'task-text';
        textEl.textContent = task.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger task-delete';
        deleteBtn.textContent = '削除';
        deleteBtn.setAttribute('aria-label', `削除: ${task.text}`);
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        liEl.appendChild(checkboxEl);
        liEl.appendChild(textEl);
        liEl.appendChild(deleteBtn);

        taskListEl.appendChild(liEl);
    });

    // タスク数を更新
    const totalEl = document.getElementById('totalTaskCount');
    const completedEl = document.getElementById('completedTaskCount');
    if (totalEl) totalEl.textContent = state.tasks.length;
    if (completedEl) completedEl.textContent = getCompletedTaskCount();
}

/**
 * セッション情報を更新
 */
function updateSessionInfo() {
    const totalEl = document.getElementById('totalSessions');
    const todayEl = document.getElementById('todaySessions');

    if (totalEl) totalEl.textContent = state.sessions.total;
    if (todayEl) todayEl.textContent = state.sessions.today.count;
}

/**
 * プログレスバーを更新
 */
function updateProgress() {
    updateProgressCircle();
}

/**
 * ボタンの有効/無効を更新
 */
function updateButtonStates() {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');

    if (startBtn) {
        startBtn.disabled = state.timer.isRunning;
        startBtn.textContent = state.timer.isRunning ? '実行中...' : '開始';
    }

    if (pauseBtn) {
        pauseBtn.disabled = !state.timer.isRunning;
    }
}

// ===== イベントリスナー =====

function setupEventListeners() {
    // タイマーボタン
    document.getElementById('startBtn').addEventListener('click', startTimer);
    document.getElementById('pauseBtn').addEventListener('click', pauseTimer);
    document.getElementById('resetBtn').addEventListener('click', resetTimer);

    // タスク追加
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');

    addTaskBtn.addEventListener('click', () => {
        const priority = document.getElementById('prioritySelect').value;
        addTask(taskInput.value, priority);
        taskInput.value = '';
        taskInput.focus();
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const priority = document.getElementById('prioritySelect').value;
            addTask(taskInput.value, priority);
            taskInput.value = '';
        }
    });

    // ダークモード
    const darkModeBtn = document.getElementById('darkModeToggle');
    darkModeBtn.addEventListener('click', () => {
        state.settings.darkMode = !state.settings.darkMode;
        document.body.classList.toggle('dark-mode');
        persist();
    });

    // Notification 許可をリクエスト
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ===== 初期化 =====

function initialize() {
    loadState();

    // ダークモード設定を反映
    if (state.settings.darkMode) {
        document.body.classList.add('dark-mode');
    }

    setupEventListeners();
    render();

    // タブが非アクティブだった期間をチェック
    checkMissedPhase();
}

/**
 * タブがアクティブでなかった期間に フェーズが完了したかチェック
 */
function checkMissedPhase() {
    if (state.timer.isRunning && state.timer.startTime) {
        const elapsed = Math.floor((Date.now() - state.timer.startTime) / 1000);
        if (elapsed >= state.timer.totalSeconds) {
            completePhase();
        }
    }
}

// ページロード時に初期化
document.addEventListener('DOMContentLoaded', initialize);

// タブが再度フォーカスされた時にチェック
window.addEventListener('focus', checkMissedPhase);
