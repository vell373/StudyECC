/**
 * ポモドーロタイマー + タスク管理 アプリケーション
 *
 * LocalStorage スキーマ:
 * - tasks: タスク配列 [{id, title, completed, priority, createdAt, completedAt}, ...]
 * - sessionCount: 本日のセッション完了数
 * - lastSessionDate: 最後のセッション日付 (YYYY-MM-DD)
 * - theme: "light" | "dark"
 * - timerState: {isRunning, isBreak, remainingSeconds, totalSeconds}
 */

// ================================
// アプリケーション状態管理
// ================================

const App = (() => {
    // プライベート変数
    const CONFIG = {
        WORK_DURATION: 25 * 60,      // 25分（秒）
        BREAK_DURATION: 5 * 60,       // 5分（秒）
        LONG_BREAK_DURATION: 15 * 60, // 15分（秒）
        SESSION_INTERVAL: 4,          // 4セッション後に長休憩
        UPDATE_INTERVAL: 1000,        // 1秒ごと更新
    };

    let state = {
        tasks: [],
        sessionCount: 0,
        lastSessionDate: getCurrentDate(),
        timerState: {
            isRunning: false,
            isBreak: false,
            remainingSeconds: CONFIG.WORK_DURATION,
            totalSeconds: CONFIG.WORK_DURATION,
        },
        currentPriority: 'medium',
        theme: getSystemTheme(),
    };

    let timerInterval = null;

    /**
     * 現在の日付を YYYY-MM-DD 形式で取得
     */
    function getCurrentDate() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }

    /**
     * システムテーマを検出
     */
    function getSystemTheme() {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    }

    /**
     * LocalStorage からの読み込み
     */
    function loadState() {
        try {
            const saved = localStorage.getItem('pomodoroState');
            if (saved) {
                const loaded = JSON.parse(saved);
                state.tasks = loaded.tasks || [];
                state.currentPriority = loaded.currentPriority || 'medium';
                state.theme = loaded.theme || getSystemTheme();

                // 日付が変わった場合、セッションカウントをリセット
                const today = getCurrentDate();
                if (loaded.lastSessionDate && loaded.lastSessionDate !== today) {
                    state.sessionCount = 0;
                    state.lastSessionDate = today;
                } else {
                    state.sessionCount = loaded.sessionCount || 0;
                    state.lastSessionDate = loaded.lastSessionDate || today;
                }
            }
        } catch (error) {
            console.warn('Failed to load state from localStorage:', error);
        }
    }

    /**
     * LocalStorage への保存
     */
    function saveState() {
        try {
            const toSave = {
                tasks: state.tasks,
                sessionCount: state.sessionCount,
                lastSessionDate: state.lastSessionDate,
                currentPriority: state.currentPriority,
                theme: state.theme,
            };
            localStorage.setItem('pomodoroState', JSON.stringify(toSave));
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                showNotification('LocalStorage が満杯です。古いタスクを削除してください。', 'warning');
            } else {
                console.warn('Failed to save state to localStorage:', error);
            }
        }
    }

    /**
     * タスク追加
     */
    function addTask(title, priority = 'medium') {
        if (!title.trim()) {
            showNotification('タスク名を入力してください', 'warning');
            return null;
        }

        const task = {
            id: Date.now().toString(),
            title: title.trim(),
            completed: false,
            priority: priority,
            createdAt: new Date().toISOString(),
            completedAt: null,
        };

        state.tasks.unshift(task);
        saveState();
        return task;
    }

    /**
     * タスク完了/解除
     */
    function toggleTask(taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return false;

        task.completed = !task.completed;
        if (task.completed) {
            task.completedAt = new Date().toISOString();
        } else {
            task.completedAt = null;
        }

        saveState();
        return true;
    }

    /**
     * タスク削除
     */
    function deleteTask(taskId) {
        const index = state.tasks.findIndex(t => t.id === taskId);
        if (index === -1) return false;

        state.tasks.splice(index, 1);
        saveState();
        return true;
    }

    /**
     * タイマー開始
     */
    function startTimer() {
        if (state.timerState.isRunning) return;

        state.timerState.isRunning = true;

        timerInterval = setInterval(() => {
            state.timerState.remainingSeconds--;

            if (state.timerState.remainingSeconds <= 0) {
                onTimerComplete();
            } else {
                render();
            }
        }, CONFIG.UPDATE_INTERVAL);

        render();
    }

    /**
     * タイマー一時停止
     */
    function pauseTimer() {
        if (!state.timerState.isRunning) return;

        state.timerState.isRunning = false;
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        render();
    }

    /**
     * タイマーリセット
     */
    function resetTimer() {
        pauseTimer();

        state.timerState.remainingSeconds = state.timerState.isBreak
            ? CONFIG.BREAK_DURATION
            : CONFIG.WORK_DURATION;

        render();
    }

    /**
     * タイマー完了時の処理
     */
    function onTimerComplete() {
        pauseTimer();

        if (!state.timerState.isBreak) {
            // 集中セッション終了 → 休憩へ
            state.sessionCount++;
            state.lastSessionDate = getCurrentDate();
            saveState();

            state.timerState.isBreak = true;
            state.timerState.remainingSeconds = CONFIG.BREAK_DURATION;
            state.timerState.totalSeconds = CONFIG.BREAK_DURATION;

            playNotificationSound();
            showNotification('25分完了！休憩を取ってください。', 'success');

            // 4セッション後に長休憩を提案
            if (state.sessionCount % CONFIG.SESSION_INTERVAL === 0) {
                showNotification(`${CONFIG.SESSION_INTERVAL}セッション完了！15分の長休憩を検討してください。`, 'info');
            }
        } else {
            // 休憩終了 → 集中へ
            state.timerState.isBreak = false;
            state.timerState.remainingSeconds = CONFIG.WORK_DURATION;
            state.timerState.totalSeconds = CONFIG.WORK_DURATION;

            playNotificationSound();
            showNotification('休憩終了。次のセッションを始めましょう！', 'success');
        }

        render();
    }

    /**
     * テーマ切り替え
     */
    function toggleTheme() {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        saveState();
        applyTheme();
    }

    /**
     * セッションリセット（本日）
     */
    function resetSessionCount() {
        if (confirm('本日のセッションカウントをリセットしてもいいですか？')) {
            state.sessionCount = 0;
            state.lastSessionDate = getCurrentDate();
            saveState();
            render();
        }
    }

    /**
     * タスク優先度ソート（優先度の高い順）
     */
    function getSortedTasks() {
        const priorityMap = { high: 0, medium: 1, low: 2 };
        return [...state.tasks].sort((a, b) => {
            // 未完了を上に
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            // 優先度でソート
            return priorityMap[a.priority] - priorityMap[b.priority];
        });
    }

    /**
     * 統計情報を取得
     */
    function getStats() {
        const total = state.tasks.length;
        const completed = state.tasks.filter(t => t.completed).length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        return { total, completed, percentage };
    }

    // パブリック API
    return {
        getState: () => ({ ...state }),
        getConfig: () => ({ ...CONFIG }),
        loadState,
        saveState,
        addTask,
        toggleTask,
        deleteTask,
        startTimer,
        pauseTimer,
        resetTimer,
        toggleTheme,
        resetSessionCount,
        getSortedTasks,
        getStats,
        getCurrentDate,
        setCurrentPriority: (priority) => { state.currentPriority = priority; },
    };
})();

// ================================
// UI レンダリング
// ================================

/**
 * 全画面再レンダリング
 */
function render() {
    renderTimer();
    renderProgress();
    renderSessionCounter();
    renderTaskList();
    renderTaskStats();
    updateControlButtons();
}

/**
 * タイマー表示の更新
 */
function renderTimer() {
    const { timerState } = App.getState();
    const minutes = Math.floor(timerState.remainingSeconds / 60);
    const seconds = timerState.remainingSeconds % 60;
    const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const timerEl = document.getElementById('timerDisplay');
    const statusEl = document.getElementById('timerStatus');
    const timerDisplayEl = document.querySelector('.timer-display');

    timerEl.textContent = display;

    let status = '停止中';
    if (timerState.isRunning) {
        status = timerState.isBreak ? '休憩中' : '集中中';
        timerDisplayEl?.classList.add('active');
    } else {
        timerDisplayEl?.classList.remove('active');
    }

    statusEl.textContent = status;
}

/**
 * プログレスバーの更新
 */
function renderProgress() {
    const { timerState } = App.getState();
    const progress = ((timerState.totalSeconds - timerState.remainingSeconds) / timerState.totalSeconds) * 100;

    const progressEl = document.getElementById('progressBar');
    const textEl = document.getElementById('progressText');

    progressEl.value = progress;
    textEl.textContent = `${Math.round(progress)}%`;
}

/**
 * セッションカウンターの更新
 */
function renderSessionCounter() {
    const { sessionCount } = App.getState();

    document.getElementById('sessionCount').textContent = sessionCount;

    // セッションドット表示（4セッションまで表示）
    const dotsContainer = document.getElementById('sessionDots');
    dotsContainer.innerHTML = '';

    for (let i = 0; i < 4; i++) {
        const dot = document.createElement('div');
        dot.className = `session-dot ${i < sessionCount % 4 ? 'active' : ''}`;
        dotsContainer.appendChild(dot);
    }
}

/**
 * タスクリストの更新
 */
function renderTaskList() {
    const tasks = App.getSortedTasks();
    const listEl = document.getElementById('taskList');
    listEl.innerHTML = '';

    if (tasks.length === 0) {
        listEl.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-secondary);">タスクを追加してみましょう</div>';
        return;
    }

    tasks.forEach(task => {
        const item = document.createElement('div');
        item.className = `task-item ${task.completed ? 'completed' : ''}`;
        item.setAttribute('role', 'listitem');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.setAttribute('aria-label', `タスク: ${task.title}`);
        checkbox.addEventListener('change', () => {
            App.toggleTask(task.id);
            render();
        });

        const content = document.createElement('div');
        content.className = 'task-content';

        const text = document.createElement('div');
        text.className = 'task-text';
        text.textContent = task.title;

        const priority = document.createElement('div');
        priority.className = `task-priority ${task.priority}`;
        priority.title = `優先度: ${task.priority}`;

        content.appendChild(text);
        content.appendChild(priority);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-delete-btn';
        deleteBtn.innerHTML = '✕';
        deleteBtn.setAttribute('aria-label', `削除: ${task.title}`);
        deleteBtn.addEventListener('click', () => {
            if (confirm(`「${task.title}」を削除してもいいですか？`)) {
                App.deleteTask(task.id);
                render();
            }
        });

        item.appendChild(checkbox);
        item.appendChild(content);
        item.appendChild(deleteBtn);

        listEl.appendChild(item);
    });
}

/**
 * タスク統計の更新
 */
function renderTaskStats() {
    const { total, completed, percentage } = App.getStats();

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('taskProgress').textContent = `${percentage}%`;
}

/**
 * ボタンの有効/無効を更新
 */
function updateControlButtons() {
    const { timerState } = App.getState();
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');

    startBtn.disabled = timerState.isRunning;
    pauseBtn.disabled = !timerState.isRunning;
}

/**
 * テーマを適用
 */
function applyTheme() {
    const { theme } = App.getState();
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.querySelector('.theme-toggle').textContent = '☀️';
    } else {
        document.documentElement.removeAttribute('data-theme');
        document.querySelector('.theme-toggle').textContent = '🌙';
    }
}

/**
 * 通知を表示
 */
function showNotification(message, type = 'info') {
    // コンソール出力
    console.log(`[${type.toUpperCase()}] ${message}`);

    // ブラウザアラート（オプション）
    if (type === 'success') {
        // 成功時は音声通知のみ
    }
}

/**
 * 通知音を再生（Web Audio API）
 */
function playNotificationSound() {
    try {
        // シンプルなビープ音を生成
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.frequency.value = 800; // Hz
        oscillator.type = 'sine';

        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.warn('Failed to play notification sound:', error);
        // フォールバック: alert を使用
        try {
            alert('タイマー完了！');
        } catch (e) {
            console.log('Timer completed');
        }
    }
}

// ================================
// イベントリスナー登録
// ================================

function initializeEventListeners() {
    // タイマーコントロール
    document.getElementById('startBtn').addEventListener('click', () => {
        App.startTimer();
    });

    document.getElementById('pauseBtn').addEventListener('click', () => {
        App.pauseTimer();
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        App.resetTimer();
    });

    // タスク入力
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');

    function addTaskFromInput() {
        const title = taskInput.value;
        const priority = App.getState().currentPriority;

        if (App.addTask(title, priority)) {
            taskInput.value = '';
            taskInput.focus();
            render();
        }
    }

    addTaskBtn.addEventListener('click', addTaskFromInput);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTaskFromInput();
        }
    });

    // 優先度ボタン
    const priorityButtons = {
        high: document.getElementById('priorityHigh'),
        medium: document.getElementById('priorityMid'),
        low: document.getElementById('priorityLow'),
    };

    Object.entries(priorityButtons).forEach(([priority, btn]) => {
        btn.addEventListener('click', () => {
            // 活動状態を更新
            Object.values(priorityButtons).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            App.setCurrentPriority(priority);
        });
    });

    // テーマ切り替え
    document.querySelector('.theme-toggle').addEventListener('click', () => {
        App.toggleTheme();
        applyTheme();
        render();
    });

    // 本日リセット
    document.getElementById('resetDayBtn').addEventListener('click', () => {
        App.resetSessionCount();
    });

    // キーボードショートカット
    document.addEventListener('keydown', (e) => {
        if (e.target === taskInput) return; // 入力中は無視

        if (e.key === ' ') {
            e.preventDefault();
            const { timerState } = App.getState();
            if (timerState.isRunning) {
                App.pauseTimer();
            } else {
                App.startTimer();
            }
        }
    });
}

// ================================
// 初期化
// ================================

function initialize() {
    // アプリ状態を読み込み
    App.loadState();

    // テーマを適用
    applyTheme();

    // 初期表示
    render();

    // イベントリスナーを登録
    initializeEventListeners();

    // 日付が変わったかを定期的に確認（1分ごと）
    setInterval(() => {
        const today = App.getCurrentDate();
        const { lastSessionDate } = App.getState();

        if (lastSessionDate !== today) {
            App.loadState(); // 状態を再読み込み（日付チェック）
            render();
        }
    }, 60000);
}

// ページロード時に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// ページアンロード時に状態を保存
window.addEventListener('beforeunload', () => {
    App.saveState();
});
