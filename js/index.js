const formNewTask = document.querySelector(".todo__new");
const btnDelete = document.querySelector(".todo__close");
const todoInput = document.querySelector(".todo__item--add");
const todoGroup = document.querySelector(".todo__group");
const tasksCounter = document.querySelector(".todo__items-count--counter");
const formTasks = document.querySelector(".todo__form-tasks");
const todoOptions = document.querySelector(".todo__options");
const todoClear = document.querySelector(".todo__clear");

class Todo {
  _isCompleted = false;
  id = String(Date.now());
  constructor(taskName) {
    this.taskName = taskName;
  }
}

class App {
  _parentElement = document.querySelector(".todo__tasks");
  _tasks = [];
  task;
  data;
  #taskType;

  constructor() {
    // Load Event on WINDOW
    window.addEventListener("load", this._getLocalStorage("tasks"));
    // set tasks counter
    tasksCounter.textContent = this._tasksCounter(this._tasks);
    // clear window location
    this._clearWindowLocation();
    // From New Tasks Submit
    formNewTask.addEventListener("submit", this.addTask.bind(this));
    // Delete Tasks
    this._parentElement.addEventListener("click", this.deleteTask.bind(this));
    // Mark As Completed Tasks
    //prettier-ignore
    this._parentElement.addEventListener("click", this.markAsCompleted.bind(this));
    // Display Tasks as its type
    todoOptions.addEventListener("click", this.renderSpecificTasks.bind(this));
    // Clear Local Storage
    todoClear.addEventListener("click", this._clearLocalStorage.bind(this));
  }

  renderSpecificTasks(e) {
    const btn = e.target.closest(".todo__option");
    if (!btn) return;

    this.#removeChildrenActiveClass(e, "todo__option--active");

    e.target.classList.add("todo__option--active");

    this.#taskType = btn.dataset.type;

    this.render(this.#taskType);
  }

  #removeChildrenActiveClass(e, className) {
    e.target.parentElement
      .querySelectorAll("*")
      .forEach((item) => item.classList.remove(className));
  }

  addTask(e) {
    e.preventDefault();

    this.#removeChildrenActiveClass(e, "todo__option--active");
    todoOptions.firstElementChild.classList.add("todo__option--active");

    // Get the data
    const value = todoInput.value;

    // Check if data is valid
    if (!value) return;

    if (window.location.hash) {
      this.data = this.task;
      this.data.taskName = todoInput.value;
      const itemDOM = this._parentElement.querySelector(
        `.todo__item[data-id="${window.location.hash.slice(1)}"]`
      );
      itemDOM.firstChild.textContent = this.data.taskName;
    } else {
      // Add task to tasks array
      this.data = new Todo(value);
      this._tasks.push(this.data);
      this.render();
    }

    // Clear input after submitting
    this._clearInputs();

    // Clear hash from URL
    this._clearWindowLocation();

    // Tasks Counter ++
    this._tasksCounter(this._tasks);

    // Set Local Storage | Add to Local Storage
    this._setLocalStorage(this._tasks);
  }

  _tasksCounter(data) {
    return (tasksCounter.textContent = +data.length);
  }

  render(type) {
    // Create Markup
    const markup = this._generateMarkup(type);

    // Clear parent element
    this._clearParentElement();

    // Render to DOM
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  update(type) {
    // Create Markup
    const markup = this._generateMarkup(type);

    const newDOM = document.createRange().createContextualFragment(markup);

    const curElements = this._parentElement.querySelectorAll("*");
    const newElements = newDOM.querySelectorAll("*");

    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      if (!newEl.isEqualNode(curEl)) {
        curEl.innerHTML = newEl.innerHTML;
      }
    });
  }

  _generateMarkup(type = "all") {
    if (type === "all") {
      this._tasksCounter(this._tasks);
      return this._tasks.map((task) => this._markup(task)).join("");
    }
    if (type === "active") {
      const activeTasks = this._tasks.filter((task) => !task._isCompleted);
      const generatedMarkup = activeTasks
        .map((task) => this._markup(task))
        .join("");
      this._tasksCounter(activeTasks);
      return generatedMarkup;
    }
    if (type === "completed") {
      const completedTasks = this._tasks.filter((task) => task._isCompleted);
      const generatedMarkup = completedTasks
        .map((task) => this._markup(task))
        .join("");
      this._tasksCounter(completedTasks);
      return generatedMarkup;
    }
  }

  _markup(data) {
    return `<li class="todo__group" data-id="${data.id}">
        <input
          type="checkbox"
          class="todo__checkbox todo__checkbox--${data.id}"
          name="item${data.id}"
          value="item${data.id}"
          id="todo__item--${data.id}"
        />
        <span class="todo__custom-checkbox ${
          !data._isCompleted ? "hidden--checkbox" : ""
        }"
          ><img src="./images/icon-check.svg" alt=""
        /></span>
        <label for="todo__item--${data.id}" class="todo__label todo__label--${
      data.id
    }">
          <span class="todo__radio"></span>
          <div class="todo__task">
            ${data.taskName}
            <span class="todo__complete ${
              data._isCompleted ? "todo__done" : ""
            }"></span>
          </div>
        </label>
        <a href='#' class="todo__close">
          <img src="./images/icon-cross.svg" alt="" />
        </a>
      </li>`;
  }

  deleteTask(e) {
    const btn = e.target.parentElement.closest(".todo__close");

    if (!btn) return;

    const taskItem = btn.closest(".todo__group");

    const taskItemIndex = this._tasks.findIndex(
      (task) => task.id === taskItem.dataset.id
    );

    taskItem.classList.add("hidden-task");

    setTimeout(() => {
      this._parentElement.removeChild(taskItem);
    }, 350);

    this._tasks.splice(taskItemIndex, 1);

    // // Clear hash from URL
    this._clearWindowLocation();

    // // Clear Input
    this._clearInputs();

    // Tasks Counter --
    this._tasksCounter(this._tasks);

    // Set Local Storage | Add to Local Storage
    this._setLocalStorage(this._tasks);
  }

  markAsCompleted(e) {
    //prettier-ignore
    const input = e.target.closest(".todo__checkbox");
    if (!input) return;

    const parent = e.target.parentElement;

    // Mark isCompleted True if it checked
    const taskObject = this._tasks.find((t) => t.id === parent.dataset.id);

    // Mark as complete Animation
    this._markAsCompletedAnimation(input, parent, taskObject);

    // Set Local Storage | Add to Local Storage
    this._setLocalStorage(this._tasks);
  }

  _markAsCompletedAnimation(input, parent, obj) {
    if (input.checked) {
      parent.querySelector(".todo__complete").classList.add("todo__done");
      parent
        .querySelector(".todo__custom-checkbox")
        .classList.remove("hidden--checkbox");
      obj._isCompleted = true;
    } else {
      parent.querySelector(".todo__complete").classList.remove("todo__done");
      parent
        .querySelector(".todo__custom-checkbox")
        .classList.add("hidden--checkbox");
      obj._isCompleted = false;
    }
  }

  _clearParentElement() {
    this._parentElement.innerHTML = "";
  }

  _clearWindowLocation() {
    window.location.hash = "";
  }

  _clearInputs() {
    todoInput.value = "";
  }

  _setLocalStorage(data) {
    localStorage.setItem("tasks", JSON.stringify(data));
  }

  _getLocalStorage(data) {
    const tasks = JSON.parse(localStorage.getItem(data));
    if (!tasks) return;
    this._tasks = tasks;
    this._tasks.forEach((_) => {
      this.render();
    });
  }

  _clearLocalStorage() {
    const activeTasks = this._tasks.filter((task) => !task._isCompleted);

    this._tasks = activeTasks;

    // Set Local Storage | Add to Local Storage
    this._setLocalStorage(this._tasks);

    this._tasksCounter(this._tasks);

    this.render();
  }
}

const app = new App();
