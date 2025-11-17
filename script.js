const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList =document.getElementById("task-list");
const themeToggle = document.getElementById("theme-toggle");
const searchTask = document.getElementById("search-task");
const sortTasks = document.getElementById("sort-tasks");
const deleteModal = document.getElementById("delete-modal");
const confirmDeleteBtn = document.getElementById("confirm-delete");
const cancelDeleteBtn = document.getElementById("cancel-delete");
const taskCategory = document.getElementById("task-category");

const icons = {
  work: "💼",
  personal: "🧍",
  study: "📚",
  shopping: "🛒",
  health: "🏥",
  other: "📌"
};

const savedTheme = localStorage.getItem("theme");
if(savedTheme){
  document.body.classList.add(savedTheme);
  themeToggle.textContent = savedTheme === "dark-mode" ? "🌞" : "🌙";
}
else{
  document.body.classList.add("light-mode");
}

themeToggle.addEventListener("click",()=>{
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");

  const currentTheme = document.body.classList.contains("dark-mode");
  themeToggle.textContent = currentTheme ? "🌞" : "🌙";
  localStorage.setItem("theme", currentTheme ? "dark-mode" : "light-mode");
  
});

let tasks=JSON.parse(localStorage.getItem("tasks")) || [];
let editTaskIndex = null;

let currentFilter="all";

const autoSelectCategory=(task)=>{
    const text = task.toLowerCase();

    if(text.includes("project") || text.includes("office") || text.includes("meeting") || text.includes("code")) {
        return "work";
    }
    if(text.includes("study") || text.includes("learn") || text.includes("read") || text.includes("assignment")) {
        return "study";
    }
    if(text.includes("buy") || text.includes("cook") || text.includes("clean") || text.includes("groceries") || text.includes("dish")) {
        return "personal";
    }
    return "others";
}

const addTask= ()=>{
    const inputTask= taskInput.value.trim();
    const category = autoSelectCategory(inputTask);

    if(!inputTask){
        alert("Please enter a task!");
        return;
    }

    if(editTaskIndex === null){
        tasks.push({task:inputTask , completed:false , indexedAt: tasks.length , category});
    }
    else{
        tasks[editTaskIndex].task = inputTask;
        tasks[editTaskIndex].category = category;
        editTaskIndex = null;
        addTaskBtn.innerText = "Add Task";
    }
    localStorage.setItem("tasks",JSON.stringify(tasks));
    renderTasks();
    taskInput.value = "";
};

const startEdit=(index)=>{
    taskInput.value = tasks[index].task;
    editTaskIndex = index;
    addTaskBtn.innerText = "Update Task";
}

let taskToDeleteIndex = null;
const deleteTask = (index)=>{
  taskToDeleteIndex = index;
  deleteModal.showModal();
};

confirmDeleteBtn.addEventListener("click",()=>{
  if(taskToDeleteIndex !== null){
    tasks.splice(taskToDeleteIndex,1);
    localStorage.setItem("tasks",JSON.stringify(tasks));
    renderTasks();
  }
  deleteModal.close();
  taskToDeleteIndex = null;
});

cancelDeleteBtn.addEventListener("click",()=>{
  deleteModal.close();
  taskToDeleteIndex = null;
});

function updateActiveFilterBtn(activeId) {
  document.querySelectorAll(".filter-buttons button").forEach(btn => {
    btn.classList.remove("active");
  });
  document.getElementById(activeId).classList.add("active");
}

const updateTaskSummary=()=>{
    document.getElementById("totalCount").innerText= tasks.length;
    document.getElementById("completedCount").innerText = tasks.filter(task => task.completed).length;
    document.getElementById("pendingCount").innerText = tasks.filter(task => !task.completed).length;

}
const renderTasks = () => {
  taskList.innerHTML = "";

  let filteredTasks = [];
  if (currentFilter === "completed") {
    filteredTasks = tasks.filter(task => task.completed);
  } else if (currentFilter === "pending") {
    filteredTasks = tasks.filter(task => !task.completed);
  } else {
    filteredTasks = tasks;
  }

  const selectedCategory = document.getElementById("task-category").value;
  if(selectedCategory !== "all"){
    filteredTasks = filteredTasks.filter(task=> (task.category || "others") === selectedCategory);
  }

  filteredTasks = filteredTasks.filter(task=> task.task.toLowerCase().includes(searchTask.value.toLowerCase()));

  if(filteredTasks.length === 0){
    taskList.innerHTML = "<li>No tasks found!</li>";
    updateTaskSummary();
    return;
  }

  const sortValue= sortTasks.value;
  if(sortValue === "a-z"){
    filteredTasks.sort((a,b)=> a.task.localeCompare(b.task));
  }
  else if(sortValue === "z-a"){
    filteredTasks.sort((a,b)=> b.task.localeCompare(a.task));
  }
  else if(sortValue === "newest"){
    filteredTasks.sort((a,b)=> tasks.indexOf(b)-tasks.indexOf(a));
  }
  else if(sortValue === "oldest"){
    filteredTasks.sort((a,b)=> tasks.indexOf(a)-tasks.indexOf(b));
  }

  filteredTasks.forEach((item, index) => {
    const li = document.createElement("li");

    const spanText = document.createElement("span");
    const icon = icons[item.category] || icons.other;
    spanText.innerText = item.completed ? `✅ ${icon} ${item.task}` : `${icon} ${item.task}`;
    
    if (item.completed) {
      spanText.classList.add("completed");
    }

    spanText.addEventListener("click", (e) => {
      e.stopPropagation();
      item.completed = !item.completed;
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
    });
    
    li.appendChild(spanText);

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.classList.add("editBtn");
    editBtn.innerText = "Edit";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      startEdit(tasks.indexOf(item));
    });
    li.appendChild(editBtn);

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("deleteBtn");
    deleteBtn.innerText = "Delete";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTask(tasks.indexOf(item));
    });
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
  });
  updateTaskSummary();
};


addTaskBtn.addEventListener("click",addTask);
renderTasks();

taskInput.addEventListener("keypress",(e)=>{
    if(e.key === "Enter" && taskInput.value.trim() !== ""){
        addTask();
        alert("Task Added Successfully!");
    }
});

taskInput.addEventListener("input",()=>{
    addTaskBtn.disabled = taskInput.value.trim().length === 0;
});

if(taskInput.value.trim().length === 0){
    addTaskBtn.disabled = true;
}

document.getElementById("show-all").addEventListener("click",()=>{
    currentFilter = "all";
    updateActiveFilterBtn("show-all");
    renderTasks();
});

document.getElementById("show-completed").addEventListener("click",()=>{
    currentFilter = "completed";
    updateActiveFilterBtn("show-completed");
    renderTasks();
});

document.getElementById("show-pending").addEventListener("click",()=>{
    currentFilter = "pending";
    updateActiveFilterBtn("show-pending");
    renderTasks();
});

searchTask.addEventListener("input",renderTasks);
searchTask.addEventListener("keypress",(e)=>{
  if(e.key === "Enter") renderTasks();
  e.stopPropagation();
})

sortTasks.addEventListener("change",renderTasks);
taskCategory.addEventListener("change",renderTasks);
