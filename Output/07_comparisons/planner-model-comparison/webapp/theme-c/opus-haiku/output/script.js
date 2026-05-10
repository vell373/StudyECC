/**
 * シンプルな習慣トラッカー - メインアプリケーション
 *
 * このアプリケーションは、毎日の習慣を追跡し、連続実施日数を可視化します。
 * すべてのデータはブラウザのローカルストレージに保存されます。
 */

// ストレージキーの定数化
const STORAGE_KEYS = {
  HABITS: 'habits_data',
  RECORDS: 'habits_records',
};

// アプリケーション全体の状態管理
const appState = {
  habits: [], // { id, name, color }
  records: {}, // { habitId: ['2026-05-09', '2026-05-08', ...] }
};

// ==========================================
// ユーティリティ関数（日付処理）
// ==========================================

/**
 * 今日の日付を YYYY-MM-DD 形式で取得
 * @returns {string} 日付文字列（例：2026-05-09）
 */
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

/**
 * 指定日付から N 日前の日付を YYYY-MM-DD 形式で取得
 * @param {number} daysAgo - 何日前か（0 = 今日、1 = 昨日）
 * @returns {string} 日付文字列
 */
function getDateString(daysAgo = 0) {
  const now = new Date();
  now.setDate(now.getDate() - daysAgo);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

/**
 * 日付文字列をDate オブジェクトに変換（時刻は無視）
 * @param {string} dateString - YYYY-MM-DD 形式の日付
 * @returns {Date} Date オブジェクト
 */
function parseDate(dateString) {
  const [year, month, date] = dateString.split('-').map(Number);
  return new Date(year, month - 1, date);
}

/**
 * 2つの日付が連続しているか判定
 * @param {string} dateA - YYYY-MM-DD 形式
 * @param {string} dateB - YYYY-MM-DD 形式
 * @returns {boolean} dateA が dateB の次の日の場合 true
 */
function areDatesConsecutive(dateA, dateB) {
  const d1 = parseDate(dateA);
  const d2 = parseDate(dateB);
  const diff = (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
  return Math.abs(diff - 1) < 0.01; // 浮動小数点誤差対策
}

// ==========================================
// ストレージ管理
// ==========================================

/**
 * ローカルストレージからデータを読み込む
 */
function loadFromStorage() {
  try {
    const habitsData = localStorage.getItem(STORAGE_KEYS.HABITS);
    const recordsData = localStorage.getItem(STORAGE_KEYS.RECORDS);

    appState.habits = habitsData ? JSON.parse(habitsData) : [];
    appState.records = recordsData ? JSON.parse(recordsData) : {};

    // 習慣ごとの記録配列が存在しない場合は初期化
    appState.habits.forEach(habit => {
      if (!appState.records[habit.id]) {
        appState.records[habit.id] = [];
      }
    });
  } catch (error) {
    console.error('LocalStorage 読み込みエラー:', error);
    appState.habits = [];
    appState.records = {};
  }
}

/**
 * 状態をローカルストレージに保存
 */
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(appState.habits));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(appState.records));
  } catch (error) {
    console.error('LocalStorage 保存エラー:', error);
    if (error.name === 'QuotaExceededError') {
      alert('ブラウザのストレージが満杯です。古いデータを削除してください。');
    }
  }
}

// ==========================================
// 習慣管理機能
// ==========================================

/**
 * 新しい習慣を追加
 * @param {string} name - 習慣名
 * @param {string} color - カラーコード（16進数）
 * @returns {boolean} 成功した場合 true
 */
function addHabit(name, color) {
  // 入力検証
  const trimmedName = name.trim();
  if (!trimmedName) {
    alert('習慣名を入力してください');
    return false;
  }

  // 最大10個の制限
  if (appState.habits.length >= 10) {
    return false;
  }

  // 習慣オブジェクトを作成
  const habit = {
    id: `habit_${Date.now()}`,
    name: trimmedName,
    color: color || '#4CAF50',
  };

  appState.habits.push(habit);
  appState.records[habit.id] = [];

  saveToStorage();
  return true;
}

/**
 * 習慣を削除
 * @param {string} habitId - 習慣ID
 */
function deleteHabit(habitId) {
  if (!confirm('この習慣を削除しますか？この操作は取り消せません。')) {
    return;
  }

  appState.habits = appState.habits.filter(h => h.id !== habitId);
  delete appState.records[habitId];

  saveToStorage();
  render();
}

/**
 * 本日の実施を記録
 * @param {string} habitId - 習慣ID
 */
function checkInHabit(habitId) {
  const today = getTodayString();
  const records = appState.records[habitId];

  // 既に本日記録済みか確認
  if (records.includes(today)) {
    return;
  }

  // 本日の日付を先頭に追加
  records.unshift(today);
  saveToStorage();
}

// ==========================================
// 連続日数計算
// ==========================================

/**
 * 習慣の現在の連続日数を計算
 * @param {string} habitId - 習慣ID
 * @returns {number} 連続日数
 */
function calculateCurrentStreak(habitId) {
  const records = appState.records[habitId];
  if (records.length === 0) {
    return 0;
  }

  let streak = 0;
  const today = getTodayString();

  // 今日から順番に遡って連続日数をカウント
  for (let i = 0; i < records.length; i++) {
    const expectedDate = getDateString(i);
    if (records[i] === expectedDate) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * 習慣の最高連続日数を計算
 * @param {string} habitId - 習慣ID
 * @returns {number} 最高連続日数
 */
function calculateMaxStreak(habitId) {
  const records = appState.records[habitId];
  if (records.length === 0) {
    return 0;
  }

  let maxStreak = 0;
  let currentStreak = 1;

  for (let i = 1; i < records.length; i++) {
    if (areDatesConsecutive(records[i - 1], records[i])) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
  }

  maxStreak = Math.max(maxStreak, currentStreak);
  return maxStreak;
}

/**
 * 本日実施済みかどうか
 * @param {string} habitId - 習慣ID
 * @returns {boolean} 実施済みの場合 true
 */
function isCheckedInToday(habitId) {
  const today = getTodayString();
  return appState.records[habitId].includes(today);
}

// ==========================================
// 週ビュー計算
// ==========================================

/**
 * 過去7日間の一覧を取得（新しい順）
 * @returns {string[]} 日付文字列の配列
 */
function getLast7Days() {
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(getDateString(i));
  }
  return days.reverse(); // 古い順に
}

/**
 * 指定習慣が指定日に実施済みか
 * @param {string} habitId - 習慣ID
 * @param {string} dateString - YYYY-MM-DD 形式
 * @returns {boolean} 実施済みの場合 true
 */
function isCompletedOnDate(habitId, dateString) {
  return appState.records[habitId].includes(dateString);
}

// ==========================================
// 統計計算
// ==========================================

/**
 * 本週の実施率を計算
 * @returns {object} { rate: 0-100, message: string }
 */
function calculateWeeklyStats() {
  if (appState.habits.length === 0) {
    return null;
  }

  const last7Days = getLast7Days();
  let totalPossible = appState.habits.length * last7Days.length;
  let totalCompleted = 0;

  appState.habits.forEach(habit => {
    last7Days.forEach(date => {
      if (isCompletedOnDate(habit.id, date)) {
        totalCompleted++;
      }
    });
  });

  const rate = Math.round((totalCompleted / totalPossible) * 100);

  let message = '';
  if (rate === 100) {
    message = '完璧な週！';
  } else if (rate >= 80) {
    message = '好調な週 (80%以上)';
  } else if (rate >= 50) {
    message = '頑張ろう (50%以上)';
  } else {
    message = 'もう少し頑張れば (50%未満)';
  }

  return { rate, message, completed: totalCompleted, possible: totalPossible };
}

// ==========================================
// UI レンダリング
// ==========================================

/**
 * 習慣リストをレンダリング
 */
function renderHabits() {
  const container = document.getElementById('habitsList');

  if (appState.habits.length === 0) {
    container.innerHTML = '<p class="empty-message">習慣をまだ追加していません。上から追加してみましょう！</p>';
    return;
  }

  container.innerHTML = appState.habits
    .map(habit => {
      const currentStreak = calculateCurrentStreak(habit.id);
      const maxStreak = calculateMaxStreak(habit.id);
      const isCheckedIn = isCheckedInToday(habit.id);

      return `
        <div class="habit-item" style="--habit-color: ${habit.color};">
          <div class="habit-name">${escapeHtml(habit.name)}</div>
          <div class="habit-stats">
            <div class="stat">
              <div class="stat-label">連続日数</div>
              <div class="stat-value">${currentStreak}</div>
            </div>
            <div class="stat">
              <div class="stat-label">最高記録</div>
              <div class="stat-value">${maxStreak}</div>
              <div class="stat-max"></div>
            </div>
          </div>
          <div class="habit-actions">
            <button class="btn-checkin ${isCheckedIn ? 'completed' : ''}"
                    onclick="handleCheckIn('${habit.id}')"
                    ${isCheckedIn ? 'disabled' : ''}>
              ${isCheckedIn ? '✓ 実施済み' : '今日実施'}
            </button>
            <button class="btn btn-danger" onclick="deleteHabit('${habit.id}')">削除</button>
          </div>
        </div>
      `;
    })
    .join('');
}

/**
 * 週ビューをレンダリング
 */
function renderWeeklyView() {
  const container = document.getElementById('weeklyView');

  if (appState.habits.length === 0) {
    container.innerHTML = '<p class="empty-message">習慣がありません</p>';
    return;
  }

  const last7Days = getLast7Days();
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  let html = '<div class="weekly-grid">';

  // ヘッダー行
  html += '<div class="weekly-header-habit">習慣</div>';
  last7Days.forEach(dateStr => {
    const date = parseDate(dateStr);
    const dayIndex = date.getDay();
    const dayName = dayNames[dayIndex];
    const day = date.getDate();
    html += `
      <div class="weekly-header-date">
        <span class="weekly-date-day">${dayName}</span>
        ${day}
      </div>
    `;
  });

  // 習慣ごとの行
  appState.habits.forEach(habit => {
    html += `<div class="weekly-header-habit">${escapeHtml(habit.name)}</div>`;

    last7Days.forEach(dateStr => {
      const isCompleted = isCompletedOnDate(habit.id, dateStr);
      const today = getTodayString();
      const isFuture = dateStr > today;

      let cellClass = 'weekly-cell ';
      let cellContent = '';

      if (isFuture) {
        cellClass += 'future';
        cellContent = '-';
      } else if (isCompleted) {
        cellClass += 'done';
        cellContent = '✔';
      } else {
        cellClass += 'pending';
        cellContent = '○';
      }

      html += `<div class="${cellClass}">${cellContent}</div>`;
    });
  });

  html += '</div>';
  container.innerHTML = html;
}

/**
 * 統計をレンダリング
 */
function renderStats() {
  const container = document.getElementById('statsContainer');

  const stats = calculateWeeklyStats();
  if (!stats) {
    container.innerHTML = '<p class="empty-message">データがありません</p>';
    return;
  }

  const html = `
    <div class="stats-message">${stats.message}</div>
    <div class="stats-details">
      <div class="stat-box">
        <div class="stat-box-label">本週実施率</div>
        <div class="stat-box-value">${stats.rate}%</div>
      </div>
      <div class="stat-box">
        <div class="stat-box-label">実施数</div>
        <div class="stat-box-value">${stats.completed} / ${stats.possible}</div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * 習慣追加フォームの状態を更新
 */
function updateAddHabitForm() {
  const message = document.getElementById('habitCountMessage');
  const input = document.getElementById('habitInput');
  const btn = document.querySelector('.btn-primary');

  if (appState.habits.length >= 10) {
    message.textContent = '最大10個まで登録できます';
    message.classList.add('visible');
    btn.disabled = true;
    input.disabled = true;
  } else {
    message.classList.remove('visible');
    btn.disabled = false;
    input.disabled = false;
  }
}

/**
 * HTML特殊文字をエスケープ（XSS対策）
 * @param {string} text - エスケープ対象のテキスト
 * @returns {string} エスケープ済みテキスト
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * 全要素をレンダリング
 */
function render() {
  renderHabits();
  renderWeeklyView();
  renderStats();
  updateAddHabitForm();
}

// ==========================================
// イベントハンドラ
// ==========================================

/**
 * 習慣追加フォームの送信処理
 */
function handleAddHabit(event) {
  event.preventDefault();

  const input = document.getElementById('habitInput');
  const colorInput = document.getElementById('colorInput');
  const name = input.value;
  const color = colorInput.value;

  if (addHabit(name, color)) {
    input.value = '';
    colorInput.value = '#4CAF50';
    render();
  }
}

/**
 * チェックインボタンの処理
 * @param {string} habitId - 習慣ID
 */
function handleCheckIn(habitId) {
  checkInHabit(habitId);
  render();
}

// ==========================================
// 初期化
// ==========================================

/**
 * アプリケーションの初期化
 */
function initialize() {
  loadFromStorage();
  render();

  // フォーム送信イベント
  document.getElementById('addHabitForm').addEventListener('submit', handleAddHabit);

  // キーボードショートカット（Enterキーで追加）
  document.getElementById('habitInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddHabit(new Event('submit'));
    }
  });

  // storage イベント（複数タブ同期）
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.HABITS || e.key === STORAGE_KEYS.RECORDS) {
      loadFromStorage();
      render();
    }
  });
}

// ページロード時に初期化
document.addEventListener('DOMContentLoaded', initialize);
