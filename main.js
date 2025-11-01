//유저가 값을 입력한다
//check버튼을 누르면 할일이 끝나면서 밑줄이 간다.
//진행중 끝남 탭을 누르면,언더바가 이동한다
//끝남탭은, 끝난 아이템만, 진행중탭은 진행중 아이템만 나온다
//전체 탭을 누르면 다시 전체아이템으로 돌아옴

//---1. 데이터 정의---

const categories = [
  { name: "업무", color: "#DFF2D8" },
  { name: "개인", color: "#F4BBD3" },
  { name: "학습", color: "#F686BD" }
];

const initialTodos = [
  { id: 1, title: "JavaScript 복습", done: false, category: "학습", color: categories.find(c => c.name === "학습")?.color || "#999", dueDate: "2025-11-10" },
  { id: 2, title: "점심 약속 잡기", done: false, category: "개인", color: categories.find(c => c.name === "개인")?.color || "#999", dueDate: "2025-10-27" },
  { id: 3, title: "프로젝트 기획서 작성", done: true, category: "업무", color: categories.find(c => c.name === "업무")?.color || "#999", dueDate: "2025-10-25" }
];

let taskInput = document.getElementById('task-input');
const todoDeadline = document.getElementById('todo-deadline');
const addBtn = document.getElementById('add-button');
const categorySelect = document.getElementById('category-select');
const taskBoard = document.getElementById('task-board');
const taskList = initialTodos.map((todo) => ({ ...todo }));

let nextTodoId = taskList.length > 0 ? Math.max(...taskList.map((todo) => todo.id || 0)) + 1 : 1;

if (!taskInput) {
  const inputArea = document.querySelector('.input-area');

  if (inputArea) {
    taskInput = document.createElement('input');
    taskInput.type = 'text';
    taskInput.id = 'task-input';
    taskInput.placeholder = '할 일을 입력하세요';
    taskInput.className = 'input-field';

    if (addBtn) {
      inputArea.insertBefore(taskInput, addBtn);
    } else if (todoDeadline) {
      inputArea.insertBefore(taskInput, todoDeadline);
    } else {
      inputArea.appendChild(taskInput);
    }
  } else {
    console.warn('입력 영역을 찾을 수 없어 할 일 입력칸을 생성하지 못했습니다.');
  }
}

if (addBtn) {
  addBtn.addEventListener('click', addTask);
}

if (taskInput) {
  taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      addTask();
    }
  });
}

if (categorySelect) {
  categorySelect.addEventListener('change', handleCategorySelectChange);
}

function handleCategoryKeyup(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    addCategory();
  }
}

function handleCategorySelectChange(event) {
  if (event.target.value !== '__create__') {
    return;
  }

  const createdCategory = addCategory({ fromSelect: true });

  if (!createdCategory) {
    event.target.selectedIndex = 0;
    return;
  }

  event.target.value = createdCategory.name;
}

//개별 버튼 처리
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('check-button')) {
    handleCheck(e.target);
    return;
  }

  if (e.target.classList.contains('delete-button')) {
    handleDelete(e.target);
  }
});

populateCategories();
render();

function addTask() {
  if (!taskInput) {
    console.warn('할 일 입력칸이 없어 새로운 할 일을 추가할 수 없습니다.');
    return;
  }

  const taskContent = taskInput.value.trim();
  const deadline = todoDeadline ? todoDeadline.value : '';
  const selectedCategoryName = categorySelect ? categorySelect.value : '';
  const isCreateCategoryOption = selectedCategoryName === '__create__';
  const categoryInfo = selectedCategoryName
    ? categories.find((category) => category.name === selectedCategoryName)
    : undefined;

  if (isCreateCategoryOption) {
    showNotification('새 카테고리를 먼저 추가해주세요.', '#f87171');
    if (categorySelect) {
      categorySelect.selectedIndex = 0;
    }
    return;
  }

  if (!taskContent) {
    return;
  }

  taskList.push({
    id: nextTodoId++,
    title: taskContent,
    dueDate: deadline,
    done: false,
    category: categoryInfo ? categoryInfo.name : '',
    color: categoryInfo ? categoryInfo.color : ''
  });

  taskInput.value = '';

  if (todoDeadline) {
    todoDeadline.value = '';
  }

  if (categorySelect) {
    categorySelect.selectedIndex = 0;
  }

  render();
}

function render() {
  if (!taskBoard) {
    return;
  }

  let resultHTML = '';

  for (let i = 0; i < taskList.length; i++) {
    const { title, dueDate, done, category, color, content, deadline } = taskList[i];
    const taskTitle = title || content || '';
    const deadlineValue = dueDate || deadline || '';
    const deadlineText = deadlineValue ? deadlineValue : '없음';
    const taskStatusClass = done ? 'task-done' : '';
    const checkButtonText = done ? '↩️' : '✅';
    const categoryBadge = category
      ? `<span class="category-badge" style="background-color: ${color || '#e5e7eb'}">${category}</span>`
      : '';

    resultHTML += `
      <div class="task ${taskStatusClass}" data-index="${i}">
        <ul class="task-info">
          <li>${i + 1}. ${taskTitle} ${categoryBadge}</li>
          <span class="deadline">마감: ${deadlineText}</span>
        </ul>
        <div>
          <button class="check-button" data-index="${i}">${checkButtonText}</button>
          <button class="delete-button" data-index="${i}">🗑️</button>
        </div>
      </div>
    `;
  }

  taskBoard.innerHTML = resultHTML;
}

function handleCheck(button) {
  const taskElement = button.closest('.task');
  if (!taskElement) {
    return;
  }

  const index = Number(taskElement.dataset.index);
  if (Number.isNaN(index) || index < 0 || index >= taskList.length) {
    return;
  }

  taskList[index].done = !taskList[index].done;
  render();
}

function handleDelete(button) {
  const taskElement = button.closest('.task');
  if (!taskElement) {
    return;
  }

  const index = Number(taskElement.dataset.index);
  if (Number.isNaN(index) || index < 0 || index >= taskList.length) {
    return;
  }

  taskList.splice(index, 1);
  render();
}

/**
 * 새로운 카테고리를 추가합니다.
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

  if (!name) {
    showNotification('카테고리 이름을 입력해주세요.', '#f87171');
    nameInput.focus();
    return null;
  }

  const duplicated = categories.some((category) => category.name === name);
  if (duplicated) {
    showNotification('이미 존재하는 카테고리예요.', '#f59e0b');
    nameInput.focus();
    return null;
  }

  const newCategory = { name, color };
  categories.push(newCategory);

  populateCategories();

  if (categorySelect) {
    categorySelect.value = newCategory.name;
  }

  nameInput.value = '';
  colorInput.value = '#3b82f6';

  showNotification(`'${newCategory.name}' 카테고리를 추가했어요!`, newCategory.color);

  if (!options.fromSelect) {
    nameInput.focus();
  }

  return newCategory;
}

/**
 * 카테고리 드롭다운 옵션을 동적으로 생성합니다.
 */
function populateCategories() {
  const select = document.getElementById('category-select');
  if (!select) {
    return;
  }

  const currentValue = select.value;
  select.innerHTML = '';

  //기본 옵션 추가
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '카테고리 선택';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  select.appendChild(defaultOption);

  //정의된 카테고리 옵션 추가
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.name;
    option.textContent = category.name;
    select.appendChild(option);
  });

  const createOption = document.createElement('option');
  createOption.value = '__create__';
  createOption.textContent = '➕ 새 카테고리 추가';
  select.appendChild(createOption);

  if (currentValue && currentValue !== '__create__' && categories.some((category) => category.name === currentValue)) {
    select.value = currentValue;
  } else {
    select.selectedIndex = 0;
  }
}

/**
 * 사용자에게 메시지를 보여주는 임시 알림 함수(alert() 대체)
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
    font-family: "Noto Sans KR", sans-serif;
  `;

  document.body.appendChild(notification);

  requestAnimationFrame(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  });

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(20px)';

    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 2000);
}