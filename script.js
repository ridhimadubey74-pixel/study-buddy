const noteForm = document.getElementById('note-form');
const noteTitle = document.getElementById('note-title');
const noteBody = document.getElementById('note-body');
const notesList = document.getElementById('notes-list');
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoItems = document.getElementById('todo-items');
const todoCount = document.getElementById('todo-count');
const todoCompleted = document.getElementById('todo-completed');
const metricNotes = document.getElementById('metric-notes');
const metricCompleted = document.getElementById('metric-completed');
const metricProgress = document.getElementById('metric-progress');
const goalStatus = document.getElementById('goal-status');
const goalFill = document.getElementById('goal-fill');
const aiForm = document.getElementById('ai-form');
const aiInput = document.getElementById('ai-input');
const aiMessages = document.getElementById('ai-messages');
const suggestionButtons = document.querySelectorAll('[data-prompt]');

const NOTES_KEY = 'studentNotesAppNotes';
const TODO_KEY = 'studentNotesAppTodos';

let notes = JSON.parse(localStorage.getItem(NOTES_KEY)) || [];
let todos = JSON.parse(localStorage.getItem(TODO_KEY)) || [];

function saveNotes() {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function saveTodos() {
  localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}

function renderNotes() {
  notesList.innerHTML = '';

  if (notes.length === 0) {
    notesList.innerHTML = '<div class="empty-state">No notes yet. Add a quick thought and save it for later.</div>';
    return;
  }

  notes.slice().reverse().forEach((note) => {
    const noteCard = document.createElement('div');
    noteCard.className = 'note-card';

    const title = document.createElement('h3');
    title.textContent = note.title || 'Untitled note';

    const body = document.createElement('p');
    body.textContent = note.body || 'No details added.';

    const meta = document.createElement('div');
    meta.className = 'note-meta';
    meta.textContent = `Saved ${new Date(note.createdAt).toLocaleString()}`;

    noteCard.append(title, body, meta);
    notesList.appendChild(noteCard);
  });
}

function renderTodos() {
  todoItems.innerHTML = '';

  if (todos.length === 0) {
    todoItems.innerHTML = '<div class="empty-state">Your task list is empty. Add a task to stay on track.</div>';
  } else {
    todos.forEach((todo, index) => {
      const item = document.createElement('div');
      item.className = 'todo-item';

      const left = document.createElement('div');
      left.className = 'todo-left';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.addEventListener('change', () => {
        todos[index].completed = checkbox.checked;
        saveTodos();
        renderTodos();
      });

      const text = document.createElement('span');
      text.className = 'todo-text' + (todo.completed ? ' completed' : '');
      text.textContent = todo.text;

      left.append(checkbox, text);

      const actions = document.createElement('div');
      actions.className = 'todo-actions';

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'icon-button';
      removeButton.innerHTML = '🗑';
      removeButton.title = 'Remove task';
      removeButton.addEventListener('click', () => {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
      });

      actions.appendChild(removeButton);
      item.append(left, actions);
      todoItems.appendChild(item);
    });
  }

  todoCount.textContent = todos.length;
  const completedCount = todos.filter((todo) => todo.completed).length;
  todoCompleted.textContent = completedCount;
  updateTracker();
}

function updateTracker() {
  metricNotes.textContent = notes.length;
  const completedCount = todos.filter((todo) => todo.completed).length;
  metricCompleted.textContent = completedCount;

  const progressValue = todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100);
  metricProgress.textContent = `${progressValue}%`;
  goalFill.style.width = `${progressValue}%`;
  goalStatus.textContent = progressValue === 0 ? 'Get started' : progressValue < 50 ? 'Keep going' : 'Great progress';
}

function createChatBubble(message, sender) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.textContent = message;
  aiMessages.appendChild(bubble);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function generateAIResponse(question) {
  const normalized = question.toLowerCase();

  if (normalized.includes('summary') || normalized.includes('summarize')) {
    return 'Here is a concise study note summary: highlight the main topic, include 2–3 key concepts, and list one example or formula to remember.';
  }

  if (normalized.includes('quiz') || normalized.includes('question')) {
    return 'Try these quiz prompts: 1) Explain the main concept in your own words. 2) List 3 supporting facts. 3) Solve a sample problem step by step.';
  }

  if (normalized.includes('plan') || normalized.includes('schedule') || normalized.includes('exam')) {
    return 'Build a study plan: block 45-minute review sessions, alternate subjects, add short breaks, and revisit your notes at the end of each day.';
  }

  if (normalized.includes('formula') || normalized.includes('concept')) {
    return 'For formulas, write the full expression, define each variable, and attach a quick example that shows how to use it.';
  }

  return 'I recommend starting with a short note structure: topic, key points, supporting examples, and next steps for review. Want me to create a study outline for a specific subject?';
}

function addAIMessage(prompt) {
  if (!prompt) return;
  createChatBubble(prompt, 'user');
  aiInput.value = '';

  setTimeout(() => {
    const response = generateAIResponse(prompt);
    createChatBubble(response, 'bot');
  }, 350);
}

noteForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = noteTitle.value.trim();
  const body = noteBody.value.trim();

  if (!title && !body) {
    return;
  }

  notes.push({
    title,
    body,
    createdAt: new Date().toISOString(),
  });

  saveNotes();
  renderNotes();
  noteTitle.value = '';
  noteBody.value = '';
});

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = todoInput.value.trim();
  if (!text) {
    return;
  }

  todos.push({
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  });

  saveTodos();
  renderTodos();
  todoInput.value = '';
});

aiForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const prompt = aiInput.value.trim();
  addAIMessage(prompt);
});

suggestionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    addAIMessage(button.dataset.prompt);
  });
});

renderNotes();
renderTodos();
updateTracker();
