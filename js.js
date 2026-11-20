// =====================================
// TASK CLASS
// =====================================

class Task {

  constructor(id, name, priority, deadline = "", completed = false) {
    this.id = id;
    this.name = name;
    this.priority = priority;
    this.deadline = deadline;
    this.completed = completed;
  }

  toggleComplete() {
    this.completed = !this.completed;
  }

  editTask(newName, newPriority, newDeadline) {
    this.name = newName;
    this.priority = newPriority;
    this.deadline = newDeadline;
  }

}

// =====================================
// GET SAVED TASKS
// =====================================

const savedTasks = JSON.parse(
  localStorage.getItem("todoTasks")
) || [];


// =====================================
// TASK MANAGER CLASS
// =====================================

class TaskManager {

  constructor() {

    this.tasks = savedTasks.map(task =>
      new Task(
        task.id,
        task.name,
        task.priority,
        task.deadline || "",
        task.completed
      )
    );

  }

  // ADD TASK

  addTask(name, priority, deadline) {

    const task = new Task(
      Date.now(),
      name,
      priority,
      deadline
    );

    this.tasks.push(task);

    this.saveTasks();
    this.displayTasks();

  }


  // EDIT TASK

  editTask(id, name, priority, deadline) {

    const task = this.tasks.find(
      task => task.id === id
    );

    if (task) {
      task.editTask(name, priority, deadline);
    }

    this.saveTasks();
    this.displayTasks();

  }

  // DELETE TASK

  deleteTask(id) {

    this.tasks = this.tasks.filter(
      task => task.id !== id
    );

    this.saveTasks();
    this.displayTasks();

  }

  // COMPLETE TASK

  toggleTask(id) {

    const task = this.tasks.find(
      task => task.id === id
    );

    if (task) {
      task.toggleComplete();
    }

    this.saveTasks();
    this.displayTasks();

  }

  // SAVE TASKS

  saveTasks() {

    localStorage.setItem(
      "todoTasks",
      JSON.stringify(this.tasks)
    );

  }

  // DISPLAY TASKS

  displayTasks(search = "") {

    const pendingList =
      document.getElementById("pendingList");

    const completedList =
      document.getElementById("completedList");

    pendingList.innerHTML = "";
    completedList.innerHTML = "";

    const filteredTasks = this.tasks.filter(task =>
      task.name.toLowerCase().includes(search.toLowerCase())
    );

    const pending = filteredTasks.filter(
      task => !task.completed
    );

    const completed = filteredTasks.filter(
      task => task.completed
    );

    // Display Pending Tasks

    if (pending.length === 0) {

      pendingList.innerHTML =
        '<p class="empty-message">No pending tasks found.</p>';

    }

    pending.forEach(task => {

      pendingList.appendChild(
        this.createTaskElement(task)
      );

    });


    // Display Completed Tasks

    if (completed.length === 0) {

      completedList.innerHTML =
        '<p class="empty-message">No completed tasks yet.</p>';

    }

    completed.forEach(task => {

      completedList.appendChild(
        this.createTaskElement(task)
      );

    });

    this.updateDashboard();

  }


  // CREATE TASK ELEMENT

  createTaskElement(task) {

    const item = document.createElement("div");

    item.className = "task-item";

    if (task.completed) {
      item.classList.add("completed");
    }

    // Left Side

    const left = document.createElement("div");

    left.className = "task-left";

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;

    checkbox.addEventListener("change", () => {
      this.toggleTask(task.id);
    });

    const name = document.createElement("span");

    name.className = "task-name";
    name.textContent = task.name;

    left.appendChild(checkbox);
    left.appendChild(name);


    // Right Side

    const right = document.createElement("div");

    right.className = "task-right";

    // Status

    const status = document.createElement("span");

    status.className = task.completed
      ? "status completed-status"
      : "status pending-status";

    status.textContent = task.completed
      ? "Completed"
      : "Pending";


    // Priority

    const priority = document.createElement("span");

    priority.className = "priority " + task.priority;

    const dot = document.createElement("span");

    dot.className = "priority-dot";

    priority.appendChild(dot);
    priority.appendChild(
      document.createTextNode(task.priority)
    );


    // Deadline

    const deadline = document.createElement("span");

    deadline.className = "task-deadline";

    if (task.deadline) {

      const date = new Date(task.deadline + "T00:00:00");

      deadline.textContent = "Due: " +
        date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        });

    } else {

      deadline.textContent = "No Deadline";

    }


    // Edit Button

    const editButton = document.createElement("button");

    editButton.className = "icon-btn";
    editButton.textContent = "✎";
    editButton.title = "Edit Task";

    editButton.onclick = () => {
      openModal(task);
    };


    // Delete Button

    const deleteButton = document.createElement("button");

    deleteButton.className = "icon-btn delete-icon";
    deleteButton.textContent = "▣";
    deleteButton.title = "Delete Task";

    deleteButton.onclick = () => {

      if (confirm("Do you want to delete this task?")) {
        this.deleteTask(task.id);
      }

    };


    // Combine Elements

    right.appendChild(status);
    right.appendChild(priority);
    right.appendChild(deadline);
    right.appendChild(editButton);
    right.appendChild(deleteButton);

    item.appendChild(left);
    item.appendChild(right);

    return item;

  }


  // UPDATE DASHBOARD

  updateDashboard() {

    const total = this.tasks.length;

    const completed = this.tasks.filter(
      task => task.completed
    ).length;

    const pending = total - completed;

    const rate = total === 0
      ? 0
      : Math.round((completed / total) * 100);


    document.getElementById("todayCount").textContent =
      pending;

    document.getElementById("totalTasks").textContent =
      total;

    document.getElementById("completedTasks").textContent =
      completed;

    document.getElementById("pendingTasks").textContent =
      pending;

    document.getElementById("completionRate").textContent =
      rate + "%";


    // Progress Bars

    document.getElementById("progressFill").style.width =
      rate + "%";

    const totalProgress = total === 0
      ? 0
      : Math.round((total / Math.max(total, 5)) * 100);

    document.getElementById("totalFill").style.width =
      totalProgress + "%";

  }

}


// =====================================
// CREATE TASK MANAGER OBJECT
// =====================================

const manager = new TaskManager();


// =====================================
// MODAL FUNCTIONS
// =====================================

let editingTaskId = null;


// OPEN MODAL

function openModal(task = null) {

  const deadline = document.getElementById("taskDeadline");

  const modal = document.getElementById("taskModal");

  const title = document.getElementById("modalTitle");

  const name = document.getElementById("taskName");

  const priority = document.getElementById("taskPriority");

  modal.style.display = "flex";

  if (task) {

    editingTaskId = task.id;

    deadline.value = task.deadline || "";

    title.textContent = "Edit Task";

    name.value = task.name;

    priority.value = task.priority;

  } else {

    editingTaskId = null;

    deadline.value = "";

    title.textContent = "Add New Task";

    name.value = "";

    priority.value = "Normal";

  }

  name.focus();

}


// CLOSE MODAL

function closeModal() {

  document.getElementById("taskModal").style.display =
    "none";

  editingTaskId = null;

}


function saveTask() {

  const name = document.getElementById("taskName")
    .value.trim();

  const priority = document.getElementById("taskPriority")
    .value;

  const deadline = document.getElementById("taskDeadline")
    .value;

  if (name === "") {
    alert("Please enter a task name!");
    return;
  }

  if (editingTaskId !== null) {

    manager.editTask(
      editingTaskId,
      name,
      priority,
      deadline
    );

  } else {

    manager.addTask(
      name,
      priority,
      deadline
    );

  }

  closeModal();

}


// =====================================
// SIGN IN AND USER PROFILE
// =====================================

let userName = localStorage.getItem("userName") || "";

const signinScreen = document.getElementById("signinScreen");
const dashboard = document.getElementById("dashboard");
const signinName = document.getElementById("signinName");
const signinBtn = document.getElementById("signinBtn");

// Show the correct screen when the page opens
function checkSignIn() {

  if (userName !== "") {
    signinScreen.style.display = "none";
    dashboard.style.display = "block";
    updateGreeting();
  } else {
    signinScreen.style.display = "flex";
    dashboard.style.display = "none";
  }

}

// Sign In Button
signinBtn.addEventListener("click", function () {

  const name = signinName.value.trim();

  if (name === "") {
    alert("Please enter your name.");
    return;
  }

  userName = name;

  localStorage.setItem("userName", userName);

  signinScreen.style.display = "none";
  dashboard.style.display = "block";

  updateGreeting();

});

// Enter key can also sign in
signinName.addEventListener("keydown", function (event) {

  if (event.key === "Enter") {
    signinBtn.click();
  }

});


// =====================================
// GREETING
// =====================================

function updateGreeting() {

  document.getElementById("greeting").textContent =
    "Good Day, " + userName + "!";

}


// =====================================
// THREE-LINE MENU
// =====================================

const menuBtn = document.getElementById("menuBtn");
const menuDropdown = document.getElementById("menuDropdown");

menuBtn.addEventListener("click", function () {

  menuDropdown.classList.toggle("show");

});


// =====================================
// PROFILE BUTTON
// =====================================

function editProfile() {

  const newName = prompt("Enter your new name:", userName);

  if (newName !== null && newName.trim() !== "") {

    userName = newName.trim();

    localStorage.setItem("userName", userName);

    updateGreeting();

    alert("Profile updated successfully!");

  }

}

document.getElementById("profileBtn")
  .addEventListener("click", editProfile);

document.getElementById("menuProfile")
  .addEventListener("click", function () {

    menuDropdown.classList.remove("show");
    editProfile();

  });


// =====================================
// SIGN OUT
// =====================================

document.getElementById("signOutBtn")
  .addEventListener("click", function () {

    const confirmSignOut = confirm("Are you sure you want to sign out?");

    if (confirmSignOut) {

      localStorage.removeItem("userName");

      userName = "";

      menuDropdown.classList.remove("show");

      dashboard.style.display = "none";
      signinScreen.style.display = "flex";

      signinName.value = "";

    }

  });


// =====================================
// SEARCH TASK
// =====================================

document.getElementById("searchInput")
  .addEventListener("input", function () {

    manager.displayTasks(this.value);

  });


// =====================================
// CLOSE MENU WHEN CLICKING OUTSIDE
// =====================================

document.addEventListener("click", function (event) {

  if (
    !menuBtn.contains(event.target) &&
    !menuDropdown.contains(event.target)
  ) {
    menuDropdown.classList.remove("show");
  }

});


// =====================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// =====================================

document.getElementById("taskModal")
  .addEventListener("click", function (event) {

    if (event.target === this) {
      closeModal();
    }

  });


// =====================================
// INITIALIZE
// =====================================

manager.displayTasks();
checkSignIn();
ConnectYourDomain Error | Wix.com
this.id