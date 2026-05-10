/**
 * シンプルな習慣トラッカー
 * Haiku-Opus パターン実装
 *
 * 概要：
 * - Store パターンで習慣データと記録を一元管理
 * - LocalStorage で永続化
 * - 連続日数計算は日付文字列ベース（タイムゾーン対応）
 */

// ============================================================================
// Store: 状態管理と永続化
// ============================================================================

const Store = {
    storageKey: 'habitTrackerData',

    // デフォルトの初期状態
    initialState: {
        habits: [],      // { id, name, createdAt }
        records: {}      // { habitId: ['YYYY-MM-DD', ...] }
    },

    /**
     * 現在の状態を取得（LocalStorage から復元）
     */
    getState() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (!stored) return JSON.parse(JSON.stringify(this.initialState));
            return JSON.parse(stored);
        } catch (error) {
            console.error('Failed to load state from localStorage:', error);
            return JSON.parse(JSON.stringify(this.initialState));
        }
    },

    /**
     * 状態を LocalStorage に保存
     */
    setState(state) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save state to localStorage:', error);
            if (error.name === 'QuotaExceededError') {
                alert('ブラウザのストレージが満杯です。古い記録を削除してください。');
            }
        }
    },

    /**
     * 習慣を追加
     * @param {string} name - 習慣名
     * @returns {boolean} - 成功したか
     */
    addHabit(name) {
        const state = this.getState();

        // バリデーション: 空文字、スペースのみ
        const trimmedName = name.trim();
        if (!trimmedName) return false;

        // バリデーション: 重複チェック
        if (state.habits.some(h => h.name === trimmedName)) return false;

        // バリデーション: 最大10個
        if (state.habits.length >= 10) return false;

        const id = Date.now().toString();
        state.habits.push({
            id,
            name: trimmedName,
            createdAt: new Date().toISOString()
        });
        state.records[id] = [];

        this.setState(state);
        return true;
    },

    /**
     * 習慣を削除（記録も同時削除）
     * @param {string} habitId - 習慣 ID
     */
    deleteHabit(habitId) {
        const state = this.getState();
        state.habits = state.habits.filter(h => h.id !== habitId);
        delete state.records[habitId];
        this.setState(state);
    },

    /**
     * 本日の日付を正規化（YYYY-MM-DD 形式）
     * ローカルタイムゾーンで判定
     */
    getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * 習慣を今日実施したとマーク（重複防止）
     * @param {string} habitId - 習慣 ID
     * @returns {boolean} - 実施を記録したか（重複時は false）
     */
    checkInToday(habitId) {
        const state = this.getState();
        const today = this.getTodayDate();

        if (!state.records[habitId]) {
            state.records[habitId] = [];
        }

        // 本日がすでに記録されていたら何もしない
        if (state.records[habitId].includes(today)) {
            return false;
        }

        state.records[habitId].push(today);
        this.setState(state);
        return true;
    },

    /**
     * 習慣の連続実施日数を計算
     * 本日から遡って、連続して記録がある日数をカウント
     *
     * 例：
     * - 本日あり → 1日
     * - 昨日あり、今日あり → 2日
     * - 昨日なし → 0日（記録がない場合、連続はリセット）
     */
    getConsecutiveDays(habitId) {
        const state = this.getState();
        const records = state.records[habitId] || [];
        if (records.length === 0) return 0;

        const today = this.getTodayDate();
        let current = new Date();
        let consecutiveDays = 0;

        // 本日から遡ってチェック
        for (let i = 0; i < 366; i++) {  // 最大 1 年分確認
            const dateStr = this.formatDate(current);

            if (records.includes(dateStr)) {
                consecutiveDays++;
            } else if (i === 0 && dateStr !== today) {
                // 本日が記録されていない場合
                break;
            } else if (consecutiveDays > 0) {
                // 連続が途切れた
                break;
            }

            // 前日へ
            current.setDate(current.getDate() - 1);
        }

        return consecutiveDays;
    },

    /**
     * 習慣の最高連続日数を計算
     * すべての記録から最長の連続期間を抽出
     */
    getMaxConsecutiveDays(habitId) {
        const state = this.getState();
        const records = state.records[habitId] || [];
        if (records.length === 0) return 0;

        // 記録を日付でソート
        const sorted = records
            .map(d => new Date(d).getTime())
            .sort((a, b) => a - b);

        let maxStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < sorted.length; i++) {
            const diff = (sorted[i] - sorted[i - 1]) / (1000 * 60 * 60 * 24);

            // 1日差なら連続、それ以外はリセット
            if (diff === 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return maxStreak;
    },

    /**
     * 日付オブジェクトを YYYY-MM-DD 形式にフォーマット
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
};

// ============================================================================
// UI: 画面表示
// ============================================================================

const UI = {
    /**
     * 全習慣をレンダリング
     */
    renderHabits() {
        const state = Store.getState();
        const habitsList = document.getElementById('habitsList');

        if (state.habits.length === 0) {
            habitsList.innerHTML = '<p class="empty-state">習慣をまだ追加していません。上から追加してください。</p>';
            return;
        }

        habitsList.innerHTML = state.habits.map(habit => {
            const consecutive = Store.getConsecutiveDays(habit.id);
            const maxConsecutive = Store.getMaxConsecutiveDays(habit.id);
            const today = Store.getTodayDate();
            const records = state.records[habit.id] || [];
            const checkedInToday = records.includes(today);

            return `
                <div class="habit-item">
                    <div class="habit-content">
                        <div class="habit-name">${this.escapeHtml(habit.name)}</div>
                        <div class="habit-stats">
                            <div class="stat">
                                <div class="stat-label">連続日数</div>
                                <div class="stat-value">${consecutive}</div>
                            </div>
                            <div class="stat">
                                <div class="stat-label">最高記録</div>
                                <div class="stat-max">${maxConsecutive}</div>
                            </div>
                            <div class="stat">
                                <div class="stat-label">総記録</div>
                                <div class="stat-value">${records.length}</div>
                            </div>
                        </div>
                        ${checkedInToday ? '<div class="habit-item-today">✓ 本日実施済み</div>' : ''}
                    </div>
                    <div class="habit-actions">
                        <button
                            class="btn btn-secondary"
                            data-habit-id="${habit.id}"
                            ${checkedInToday ? 'disabled' : ''}
                        >
                            ${checkedInToday ? '✓ 実施済み' : '今日実施'}
                        </button>
                        <button
                            class="btn btn-danger"
                            data-delete-id="${habit.id}"
                        >
                            削除
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        this.attachHabitHandlers();
    },

    /**
     * 統計情報をレンダリング
     */
    renderStatistics() {
        const state = Store.getState();
        const statisticsDiv = document.getElementById('statistics');

        if (state.habits.length === 0) {
            statisticsDiv.innerHTML = '<p class="empty-state">統計情報は習慣追加後に表示されます。</p>';
            return;
        }

        const totalHabits = state.habits.length;
        const totalRecords = Object.values(state.records).reduce((sum, records) => sum + records.length, 0);
        const habitWithMaxStreak = state.habits.reduce((max, habit) => {
            const streak = Store.getMaxConsecutiveDays(habit.id);
            return streak > (max.streak || 0) ? { ...habit, streak } : max;
        }, {});

        statisticsDiv.innerHTML = `
            <div class="stat-card">
                <div class="stat-card-title">登録習慣数</div>
                <div class="stat-card-value">${totalHabits} / 10</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-title">総記録数</div>
                <div class="stat-card-value">${totalRecords}</div>
            </div>
            ${habitWithMaxStreak.name ? `
                <div class="stat-card">
                    <div class="stat-card-title">最高記録を持つ習慣</div>
                    <div><strong>${this.escapeHtml(habitWithMaxStreak.name)}</strong>: ${habitWithMaxStreak.streak}日連続</div>
                </div>
            ` : ''}
        `;
    },

    /**
     * 習慣アイテムのイベントハンドラーを追加
     */
    attachHabitHandlers() {
        // 「今日実施」ボタン
        document.querySelectorAll('[data-habit-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const habitId = btn.getAttribute('data-habit-id');
                Controller.onCheckIn(habitId);
            });
        });

        // 削除ボタン
        document.querySelectorAll('[data-delete-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const habitId = btn.getAttribute('data-delete-id');
                Controller.onDeleteHabit(habitId);
            });
        });
    },

    /**
     * フォームメッセージを表示
     */
    showMessage(message, type = 'error') {
        const msgElement = document.getElementById('formMessage');
        msgElement.textContent = message;
        msgElement.className = `form-message ${type}`;

        if (type === 'success') {
            setTimeout(() => {
                msgElement.textContent = '';
                msgElement.className = 'form-message';
            }, 3000);
        }
    },

    /**
     * HTML エスケープ（XSS 対策）
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ============================================================================
// Controller: イベント処理
// ============================================================================

const Controller = {
    /**
     * 習慣追加フォーム送信処理
     */
    onAddHabit(e) {
        e.preventDefault();
        const input = document.getElementById('habitInput');
        const name = input.value;

        if (!name.trim()) {
            UI.showMessage('1文字以上入力してください', 'error');
            return;
        }

        if (Store.getState().habits.some(h => h.name === name.trim())) {
            UI.showMessage('この習慣は既に登録されています', 'error');
            return;
        }

        if (Store.getState().habits.length >= 10) {
            UI.showMessage('最大10個まで習慣を登録できます', 'error');
            return;
        }

        if (Store.addHabit(name)) {
            UI.showMessage('習慣を追加しました！', 'success');
            input.value = '';
            this.refreshUI();
        } else {
            UI.showMessage('習慣の追加に失敗しました', 'error');
        }
    },

    /**
     * チェックイン処理（本日実施をマーク）
     */
    onCheckIn(habitId) {
        const success = Store.checkInToday(habitId);

        if (success) {
            UI.showMessage('本日の実施を記録しました！', 'success');
        } else {
            UI.showMessage('本日はすでに実施済みです', 'error');
        }

        this.refreshUI();
    },

    /**
     * 習慣削除処理
     */
    onDeleteHabit(habitId) {
        const state = Store.getState();
        const habit = state.habits.find(h => h.id === habitId);

        if (!habit) return;

        const confirmed = confirm(`「${habit.name}」を削除してもよろしいですか？\n(記録も削除されます)`);
        if (!confirmed) return;

        Store.deleteHabit(habitId);
        UI.showMessage('習慣を削除しました', 'success');
        this.refreshUI();
    },

    /**
     * UI 全体を更新
     */
    refreshUI() {
        UI.renderHabits();
        UI.renderStatistics();
    }
};

// ============================================================================
// 初期化
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // フォーム送信イベント
    document.getElementById('habitForm').addEventListener('submit',
        e => Controller.onAddHabit(e)
    );

    // 初期表示
    Controller.refreshUI();
});
