//=====================================
// 1. 초기 데이터 설정
//=====================================

/**
 * 랜덤 ID 생성하기 (먼저 선언)
 */
function randomIDGenerate() {
  return '_' + Math.random().toString(36).substring(2, 9);
}

// 카테고리 목록
const categories = [
  { name: '업무', color: '#DFF2D8' },
  { name: '개인', color: '#F4BBD3' },
  { name: '학습', color: '#F686BD' },
];

// 초기 할 일 목록
const initialTodos = [
  {
    number: 1,
    title: 'JavaScript 복습',
    done: false,
    category: '학습',
    color: '#F686BD',
    dueDate: '2025-11-10',
  },
  {
    number: 2,
    title: '점심 약속 잡기',
    done: false,
    category: '개인',
    color: '#F4BBD3',
    dueDate: '2025-10-27',
  },
  {
    number: 3,
    title: '프로젝트 기획서 작성',
    done: true,
    category: '업무',
    color: '#DFF2D8',
    dueDate: '2025-10-25',
  },
];

// 할 일 목록에 ID 추가
const taskList = initialTodos.map((todo) => ({
  ...todo,
  id: todo.id ?? randomIDGenerate(),
}));

// 현재 필터 모드 ('all', 'ongoing', 'done')
let currentFilterMode = 'all';

//=====================================
// 2. HTML 요소 가져오기
//=====================================

let taskInput = document.getElementById('task-input');
let tabs = document.querySelectorAll('.task-tabs div');
const todoDeadline = document.getElementById('todo-deadline');
const addBtn = document.getElementById('add-button');
const categorySelect = document.getElementById('category-select');
const taskBoard = document.getElementById('task-board');

// 모든 탭에 필터 이벤트 리스너 추가 (under-line 제외)
tabs.forEach((tab) => {
  if (tab.id && tab.id !== 'under-line') {
    tab.addEventListener('click', function (event) {
      filter(event);
    });
  }
});
//=====================================
// 3. 할 일 입력창 생성 (없을 경우)
//=====================================

if (!taskInput) {
  const inputArea = document.querySelector('.input-area');

  if (inputArea) {
    // 새로운 입력창 만들기
    taskInput = document.createElement('input');
    taskInput.type = 'text';
    taskInput.id = 'task-input';
    taskInput.placeholder = '할 일을 입력하세요';
    taskInput.className = 'input-field';

    // 적절한 위치에 입력창 추가
    if (addBtn) {
      inputArea.insertBefore(taskInput, addBtn);
    } else if (todoDeadline) {
      inputArea.insertBefore(taskInput, todoDeadline);
    } else {
      inputArea.appendChild(taskInput);
    }
  }
}

//=====================================
// 4. 이벤트 리스너 등록
//=====================================

// 추가 버튼 클릭
if (addBtn) {
  addBtn.addEventListener('click', addTask);
}

// Enter 키로 할 일 추가
if (taskInput) {
  taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      addTask();
    }
  });
}

// 카테고리 선택 변경
if (categorySelect) {
  categorySelect.addEventListener('change', handleCategorySelect);
}

function handleCategoryKeyup(event) {
  if (event.key !== 'Enter') {
    return;
  }

  event.preventDefault();
  addCategory();
}

// 체크/삭제 버튼 클릭 처리
document.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const taskId = button.dataset.id;

  // 체크 버튼 (완료/취소)
  if (button.classList.contains('check-button')) {
    toggleTaskDone(taskId);
    return;
  }

  if (button.classList.contains('up-button')) {
    moveTaskUp(taskId);
    return;
  }

  if (button.classList.contains('down-button')) {
    moveTaskDown(taskId);
    return;
  }

  // 삭제 버튼
  if (button.classList.contains('delete-button')) {
    deleteTask(taskId);
  }
});

//=====================================
// 5. 초기 화면 렌더링
//=====================================

populateCategories(); // 카테고리 드롭다운 채우기
render(); // 할 일 목록 표시

//=====================================
// 6. 핵심 함수들
//=====================================

/**
 * 새로운 할 일 추가하기
 */
function addTask() {
  if (!taskInput) {
    showNotification('할 일 입력칸이 없습니다.', '#f87171');
    return;
  }

  // 입력값 가져오기
  const taskTitle = taskInput.value.trim();
  const deadline = todoDeadline ? todoDeadline.value : '';
  const selectedCategory = categorySelect ? categorySelect.value : '';

  // 카테고리 추가 옵션 선택 시
  if (selectedCategory === '__create__') {
    showNotification('새 카테고리를 먼저 추가해주세요.', '#f87171');
    categorySelect.selectedIndex = 0;
    return;
  }

  // 할 일 내용이 비어있으면 추가 안 함
  if (!taskTitle) {
    return;
  }

  // 선택한 카테고리 정보 찾기
  const categoryInfo = categories.find((cat) => cat.name === selectedCategory);

  // 새로운 할 일 추가
  taskList.push({
    id: randomIDGenerate(),
    title: taskTitle,
    dueDate: deadline,
    done: false,
    category: categoryInfo ? categoryInfo.name : '',
    color: categoryInfo ? categoryInfo.color : '',
  });

  // 입력창 초기화
  taskInput.value = '';
  if (todoDeadline) todoDeadline.value = '';
  if (categorySelect) categorySelect.selectedIndex = 0;

  // 화면 새로고침
  render();
}

/**
 * 할 일 목록 화면에 표시하기
 */
function render() {
  if (!taskBoard) return;

  // 필터 모드에 따라 표시할 리스트 결정
  let displayList = taskList;
  if (currentFilterMode === 'ongoing') {
    displayList = taskList.filter((task) => task.done === false);
  } else if (currentFilterMode === 'done') {
    displayList = taskList.filter((task) => task.done === true);
  }

  const html = displayList
    .map((task, index) => {
      const isDone = Boolean(task.done);
      const checkIcon = isDone ? '↩️' : '✅';
      const taskClass = isDone ? 'task task-done' : 'task';
      const deadlineText = task.dueDate || '없음';
      const categoryBadge = task.category
        ? `<span class="category-badge" style="background-color: ${
            task.color || '#e5e7eb'
          }">${task.category}</span>`
        : '';

      return `
        <div class="${taskClass}">
          <ul class="task-info">
            <li>${index + 1}. ${task.title} ${categoryBadge}</li>
            <span class="deadline">마감: ${deadlineText}</span>
          </ul>
          <div>
            <button class="move-button up-button" data-id="${
              task.id
            }" aria-label="위로 이동">▲</button>
            <button class="move-button down-button" data-id="${
              task.id
            }" aria-label="아래로 이동">▼</button>
            <button class="check-button" data-id="${
              task.id
            }">${checkIcon}</button>
            <button class="delete-button" data-id="${task.id}">🗑️</button>
          </div>
        </div>
      `;
    })
    .join('');

  taskBoard.innerHTML = html;
}

/**
 * 할 일 완료/취소 토글
 */
function toggleTaskDone(taskId) {
  const task = taskList.find((t) => t.id === taskId);
  if (!task) return;

  task.done = !task.done;
  render();
}

/**
 * 할 일 삭제하기
 */
function deleteTask(taskId) {
  const index = taskList.findIndex((t) => t.id === taskId);
  if (index === -1) return;

  taskList.splice(index, 1);
  render();
}

function moveTaskUp(taskId) {
  const index = taskList.findIndex((t) => t.id === taskId);
  if (index <= 0) {
    return;
  }

  [taskList[index - 1], taskList[index]] = [
    taskList[index],
    taskList[index - 1],
  ];
  render();
}

function moveTaskDown(taskId) {
  const index = taskList.findIndex((t) => t.id === taskId);
  if (index === -1 || index >= taskList.length - 1) {
    return;
  }

  [taskList[index], taskList[index + 1]] = [
    taskList[index + 1],
    taskList[index],
  ];
  render();
}

/**
 * 카테고리 선택 처리
 */
function handleCategorySelect(event) {
  if (event.target.value !== '__create__') return;

  const newCategory = addCategory({ fromSelect: true });

  if (newCategory) {
    event.target.value = newCategory.name;
  } else {
    event.target.selectedIndex = 0;
  }
}

/**
 * 새 카테고리 추가하기
 */
function addCategory(options = {}) {
  const nameInput = document.getElementById('new-category-name');
  const colorInput = document.getElementById('new-category-color');

  if (!nameInput || !colorInput) {
    showNotification('카테고리 입력 필드를 찾을 수 없어요.', '#f87171');
    return null;
  }

  const name = nameInput.value.trim();
  const color = colorInput.value || '#999';

  // 이름이 비어있으면
  if (!name) {
    showNotification('카테고리 이름을 입력해주세요.', '#f87171');
    nameInput.focus();
    return null;
  }

  // 이미 있는 카테고리면
  const isDuplicated = categories.some((cat) => cat.name === name);
  if (isDuplicated) {
    showNotification('이미 존재하는 카테고리예요.', '#f59e0b');
    nameInput.focus();
    return null;
  }

  // 새 카테고리 추가
  const newCategory = { name, color };
  categories.push(newCategory);

  // 드롭다운 새로고침
  populateCategories();

  if (categorySelect) {
    categorySelect.value = newCategory.name;
  }

  // 입력창 초기화
  nameInput.value = '';
  colorInput.value = '#3b82f6';

  showNotification(`'${name}' 카테고리를 추가했어요!`, color);

  if (!options.fromSelect) {
    nameInput.focus();
  }

  return newCategory;
}

/**
 * 카테고리 드롭다운 채우기
 */
function populateCategories() {
  const select = categorySelect;
  if (!select) return;

  const currentValue = select.value;
  select.innerHTML = '';

  // 기본 옵션
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '카테고리 선택';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  select.appendChild(defaultOption);

  // 카테고리 옵션들
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category.name;
    option.textContent = category.name;
    select.appendChild(option);
  });

  // 새 카테고리 추가 옵션
  const createOption = document.createElement('option');
  createOption.value = '__create__';
  createOption.textContent = '➕ 새 카테고리 추가';
  select.appendChild(createOption);

  // 이전 선택값 복원
  if (currentValue && currentValue !== '__create__') {
    const exists = categories.some((cat) => cat.name === currentValue);
    if (exists) {
      select.value = currentValue;
    }
  }
}

//=====================================
// 7. 유틸리티 함수들
//=====================================

/**
 * 알림 메시지 보여주기
 */
function showNotification(message, color = '#4b5563') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 20px;
    background-color: ${color};
    color: #111827;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    z-index: 2000;
    opacity: 0;
    transform: translateX(20px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    font-family: "Gamja Flower", sans-serif;
  `;

  document.body.appendChild(notification);

  // 애니메이션으로 나타나기
  requestAnimationFrame(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  });

  // 2초 후 사라지기
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(20px)';

    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 2000);
}

function filter(event) {
  if (!event || !event.target || !event.target.id) {
    return;
  }

  let mode = event.target.id;

  // 유효한 필터 모드인지 확인
  if (mode !== 'all' && mode !== 'ongoing' && mode !== 'done') {
    return;
  }

  // 현재 필터 모드 업데이트
  currentFilterMode = mode;

  // 필터 모드에 따라 화면 갱신
  render();
}
