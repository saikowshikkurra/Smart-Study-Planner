const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");

// ===== SELECT ELEMENTS =====
const form = document.getElementById("form");
const taskName = document.getElementById("taskName");
const subject = document.getElementById("subject");
const dueDate = document.getElementById("dueDate");
const priority = document.getElementById("priority");
const notes = document.getElementById("notes");

const tasksList = document.getElementById("tasks");
const completedList = document.getElementById("completedTasks");



// Modal Elements
const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");

// ===== STATE =====
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editTaskId = null;
let taskToDelete = null;

// ===== INITIAL RENDER =====
renderTasks();

// ===== ADD / EDIT TASK =====
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = taskName.value.trim();
  if (!name) {
    alert("Please enter a task name.");
    return;
  }

  if (editTaskId) {
    tasks = tasks.map(task =>
      task.id === editTaskId
        ? { ...task, name, subject: subject.value.trim(), dueDate: dueDate.value, priority: priority.value, notes: notes.value.trim() }
        : task
    );
    editTaskId = null;
    formTitle.textContent = "Add New Task";
    submitBtn.textContent = "Add Task";
  } else {
    const task = {
      id: Date.now(),
      name,
      subject: subject.value.trim(),
      dueDate: dueDate.value,
      priority: priority.value,
      notes: notes.value.trim(),
      completed: false,
    };
    tasks.push(task);
  }

  saveTasks();
  renderTasks();
  form.reset();
});

// ===== SAVE TO LOCAL STORAGE =====
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ===== RENDER TASKS =====
function renderTasks() {
  tasksList.innerHTML = "";
  completedList.innerHTML = "";

  if (tasks.length === 0) {
    tasksList.innerHTML = "<p>No tasks yet. Add one!</p>";
    updateProgress();
    return;
  }

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.classList.add("task-card", `priority-${task.priority}`);

    const dueText = task.dueDate ? formatDate(task.dueDate) : "No due date";

    li.innerHTML = `
      <h3>${escapeHtml(task.name)}</h3>
      <p><b>Subject:</b> ${escapeHtml(task.subject || "")}</p>
      <p><b>Due:</b> ${escapeHtml(dueText)}</p>
      <p><b>Priority:</b> <span style="text-transform:capitalize">${escapeHtml(task.priority)}</span></p>
      <p>${escapeHtml(task.notes || "")}</p>
      <div class="task-actions">
        <button class="complete-btn" onclick="toggleComplete(${task.id})">
          ${task.completed ? "✅ Completed" : "✔ Mark Complete"}
        </button>
        <button class="edit-btn" onclick="editTask(${task.id})">✏ Edit</button>
        <button class="delete-btn" onclick="confirmDelete(${task.id})">🗑 Delete</button>
      </div>
    `;

    if (task.completed) {
      li.style.opacity = "0.7";
      li.style.textDecoration = "line-through";
      completedList.appendChild(li);
    } else {
      tasksList.appendChild(li);
    }
  });

  updateProgress();
}

// ===== TOGGLE COMPLETE =====
function toggleComplete(id) {
  tasks = tasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task));
  saveTasks();
  renderTasks();
}

// ===== EDIT TASK =====
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  taskName.value = task.name;
  subject.value = task.subject || "";
  dueDate.value = task.dueDate || "";
  priority.value = task.priority || "low";
  notes.value = task.notes || "";

  editTaskId = id;
  formTitle.textContent = "Edit Task";
  submitBtn.textContent = "Update Task";

  taskName.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ===== DELETE (Modal) =====
function confirmDelete(id) {
  taskToDelete = id;
  deleteModal.classList.add("show");
  document.body.style.overflow = "hidden";
}

confirmDeleteBtn.addEventListener("click", () => {
  if (taskToDelete) {
    tasks = tasks.filter(task => task.id !== taskToDelete);
    saveTasks();
    renderTasks();
    taskToDelete = null;
  }
  deleteModal.classList.remove("show");
  document.body.style.overflow = "";
});

cancelDeleteBtn.addEventListener("click", () => {
  taskToDelete = null;
  deleteModal.classList.remove("show");
  document.body.style.overflow = "";
});

window.addEventListener("click", (e) => {
  if (e.target === deleteModal) {
    taskToDelete = null;
    deleteModal.classList.remove("show");
    document.body.style.overflow = "";
  }
});

// ===== UPDATE PROGRESS =====
function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressFill.style.width = percent + "%";
  progressText.textContent = `${percent}% Completed`;
}

// ===== HELPERS =====
function formatDate(iso) {
  try {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
