// ======================
// 1. Configuration Constants
// ======================
const NEW_YEAR = new Date();
NEW_YEAR.setDate(1);
NEW_YEAR.setMonth(1);
const CONFIG = {
  API_BASE: "http://localhost:3000/api",
  SELECTORS: {
    HABIT_LIST: "#habit-list",
    HABIT_FORM: "#habit-form",
    FREQUENCY_SELECT: "#habitFrequency",
    WEEKLY_OPTION: "#weekly-option",
    STAT_SELECT: "#stat-select",
    COMPLETION_CONTAINER: "#completion-container",
    HEATMAP_CONTAINER: "#calendar-heatmap-container",
    CHART_CONTAINER: "#habit-chart-container",
  },
  CLASSES: {
    HIDDEN: "d-none",
    WEEKLY_PILL: "bg-success",
    DAILY_PILL: "bg-primary",
    INTERVAL_PILL: "bg-warning",
  },
  DAYS_OF_WEEK: [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ],
  ONE_DAY_MS: 86400000,
  NEW_YEAR: NEW_YEAR,
};

// ======================
// 2. API Service Module (Complete)
// ======================
const HabitService = {
  async fetchData(endpoint, options = {}) {
    try {
      console.log(`${CONFIG.API_BASE}${endpoint}`);

      const response = await fetch(`${CONFIG.API_BASE}${endpoint}`, options);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      DomUtils.showNotification(`Error: ${error.message}`, "danger");
      throw error;
    }
  },

  async createHabit(habitData) {
    return this.fetchData("/habit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(habitData),
    });
  },

  async getHabits(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.fetchData(`/habit?${query}`);
  },

  async getHabitById(id) {
    return this.fetchData(`/habit/${id}`);
  },

  async getHabitsForToday(dayOfWeek) {
    return this.fetchData(`/habit?today=${dayOfWeek.toLowerCase()}`);
  },

  async getHabitLogs(habitId, startDate) {
    const params = new URLSearchParams();
    if (habitId) params.append("habitId", habitId);
    if (startDate) params.append("start", startDate);
    return this.fetchData(`/habitlogs?${params.toString()}`);
  },

  async logHabitCompletion(habitId) {
    return this.fetchData("/habitlogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId: parseInt(habitId) }),
    });
  },

  async deleteHabitLog(habitId) {
    return this.fetchData(`/habitlogs/${habitId}`, { method: "DELETE" });
  },
};

// ======================
// 3. DOM Utilities Module (Complete)
// ======================
const DomUtils = {
  createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      key === "class"
        ? (element.className = value)
        : element.setAttribute(key, value);
    });
    children.forEach((child) => element.appendChild(child));
    return element;
  },

  toggleVisibility(element, isVisible) {
    element.classList.toggle(CONFIG.CLASSES.HIDDEN, !isVisible);
  },

  showNotification(message, type = "info") {
    const alert = this.createElement(
      "div",
      {
        class: `alert alert-${type} alert-dismissible fade show`,
        role: "alert",
      },
      [
        document.createTextNode(message),
        this.createElement("button", {
          type: "button",
          class: "btn-close",
          "data-bs-dismiss": "alert",
          "aria-label": "Close",
        }),
      ]
    );
    document.body.prepend(alert);
    setTimeout(() => alert.remove(), 5000);
  },

  createOption(value, text) {
    return this.createElement("option", { value }, [
      document.createTextNode(text),
    ]);
  },
};

// ======================
// 4. Habit Rendering Module (Complete)
// ======================
const HabitRenderer = {
  async renderHabitList() {
    try {
      const habits = await HabitService.getHabitsForToday(
        new Date()
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase()
      );
      const fragment = document.createDocumentFragment();

      habits.forEach((habit) =>
        fragment.appendChild(this.createHabitElement(habit))
      );

      const list = document.querySelector(CONFIG.SELECTORS.HABIT_LIST);
      list.innerHTML = "";
      list.appendChild(fragment);
      EventHandlers.initializeHabitCheckboxes();
    } catch (error) {
      console.error("Failed to render habits:", error);
    }
  },

  createHabitElement(habit) {
    return DomUtils.createElement(
      "li",
      {
        class:
          "list-group-item d-flex justify-content-between align-items-center",
      },
      [
        this.createCheckboxElement(habit),
        this.createFrequencyBadge(habit.frequency),
      ]
    );
  },

  createCheckboxElement(habit) {
    const checkbox = DomUtils.createElement("input", {
      type: "checkbox",
      class: "form-check-input habit-checkbox",
      id: `habit-${habit.id}`,
    });

    return DomUtils.createElement("div", { class: "form-check" }, [
      checkbox,
      DomUtils.createElement(
        "label",
        { class: "form-check-label", for: `habit-${habit.id}` },
        [document.createTextNode(habit.title)]
      ),
    ]);
  },

  createFrequencyBadge(frequency) {
    const className = {
      DAILY: CONFIG.CLASSES.DAILY_PILL,
      WEEKLY: CONFIG.CLASSES.WEEKLY_PILL,
      INTERVAL: CONFIG.CLASSES.INTERVAL_PILL,
    }[frequency.toUpperCase()];

    return DomUtils.createElement(
      "span",
      { class: `badge rounded-pill ${className}` },
      [document.createTextNode(Utils.capitalize(frequency))]
    );
  },
};

// ======================
// 5. Event Handlers (Complete)
// ======================
const EventHandlers = {
  initializeFormHandlers() {
    document
      .querySelector(CONFIG.SELECTORS.HABIT_FORM)
      .addEventListener("submit", (e) => this.handleFormSubmit(e));

    document
      .querySelector(CONFIG.SELECTORS.FREQUENCY_SELECT)
      .addEventListener("change", (e) => this.handleFrequencyChange(e));
  },

  async handleFormSubmit(event) {
    event.preventDefault();
    try {
      const formData = FormManager.validateForm();
      await HabitService.createHabit(formData);
      DomUtils.showNotification("Habit created successfully!", "success");
      window.location.reload();
    } catch (error) {
      DomUtils.showNotification(error.message, "danger");
    }
  },

  handleFrequencyChange(event) {
    const isWeekly = event.target.value.toLowerCase() === "weekly";
    DomUtils.toggleVisibility(
      document.querySelector(CONFIG.SELECTORS.WEEKLY_OPTION),
      isWeekly
    );
  },

  initializeHabitCheckboxes() {
    document.querySelectorAll(".habit-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", async () => {
        const habitId = checkbox.id.replace("habit-", "");
        try {
          checkbox.disabled = true;
          if (checkbox.checked) {
            await HabitService.logHabitCompletion(habitId);
          } else {
            await HabitService.deleteHabitLog(habitId);
          }
          this.toggleCheckboxStyles(checkbox);
        } catch (error) {
          checkbox.checked = !checkbox.checked;
        } finally {
          checkbox.disabled = false;
        }
      });
    });
  },

  toggleCheckboxStyles(checkbox) {
    const parentItem = checkbox.closest(".list-group-item");
    const label = checkbox.nextElementSibling;
    parentItem.classList.toggle("bg-secondary-subtle");
    label.classList.toggle("text-decoration-line-through");
  },
};

// ======================
// 6. Progress Manager (Complete)
// ======================
const ProgressManager = {
  async initialize() {
    await this.populateHabitSelector();
    this.setupStatSelector();
    this.handleInitialView();
  },

  async populateHabitSelector() {
    const selector = document.getElementById("stat-select");
    try {
      const habits = await HabitService.getHabitsForToday(
        new Date()
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase()
      );
      selector.innerHTML = "<option selected>All Habits</option>";
      habits.forEach((habit) => {
        selector.appendChild(DomUtils.createOption(habit.id, habit.title));
      });
    } catch (error) {
      console.error("Failed to populate habits:", error);
    }
  },

  setupStatSelector() {
    document
      .getElementById("stat-select")
      .addEventListener("change", async (e) => {
        try {
          if (e.target.value === "All Habits") {
            await this.showAllHabitsView();
          } else {
            console.log("habitId: " + e.target.value);
            await this.showSingleHabitView(e.target.value);
          }
        } catch (error) {
          DomUtils.showNotification("Failed to load progress data", "danger");
          console.log(error);
        }
      });
  },

  handleInitialView() {
    document
      .querySelector(CONFIG.SELECTORS.HEATMAP_CONTAINER)
      .classList.add(CONFIG.CLASSES.HIDDEN);
  },

  async showAllHabitsView() {
    DomUtils.toggleVisibility(
      document.querySelector(CONFIG.SELECTORS.COMPLETION_CONTAINER),
      false
    );
    DomUtils.toggleVisibility(
      document.querySelector(CONFIG.SELECTORS.HEATMAP_CONTAINER),
      false
    );

    DomUtils.toggleVisibility(
      document.querySelector(CONFIG.SELECTORS.CHART_CONTAINER),
      true
    );

    await VisualizationManager.renderChart();
  },

  async showSingleHabitView(habitId) {
    DomUtils.toggleVisibility(
      document.querySelector(CONFIG.SELECTORS.COMPLETION_CONTAINER),
      true
    );
    DomUtils.toggleVisibility(
      document.querySelector(CONFIG.SELECTORS.HEATMAP_CONTAINER),
      true
    );

    DomUtils.toggleVisibility(
      document.querySelector(CONFIG.SELECTORS.CHART_CONTAINER),
      false
    );
    await VisualizationManager.updateCompletionStats(habitId);
    await VisualizationManager.createHeatMap(habitId);
  },
};

// ======================
// 7. Visualization Manager (Complete)
// ======================
const VisualizationManager = {
  chartInstance: null,
  heatmapInstance: null,

  async prepareChartData() {
    const logs = await HabitService.getHabitLogs();
    const logCounts = logs.reduce((acc, log) => {
      const date = new Date(log.date).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(logCounts),
      values: Object.values(logCounts),
    };
  },

  getChartOptions() {
    return {
      responsive: true,
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    };
  },

  async renderChart() {
    if (this.chartInstance) this.chartInstance.destroy();

    const ctx = document.getElementById("habitChart").getContext("2d");
    const { labels, values } = await this.prepareChartData();

    this.chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Daily Completions",
            data: values,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
          },
        ],
      },
      options: this.getChartOptions(),
    });
  },

  async createHeatMap(habitId) {
    if (this.heatmapInstance) this.heatmapInstance.destroy();

    const startDate = new Date();
    startDate.setMonth(0, 1);
    const logs = await HabitService.getHabitLogs(
      habitId,
      startDate.toISOString()
    );

    this.heatmapInstance = new CalHeatmap();
    this.heatmapInstance.paint({
      itemSelector: "#calendar-heatmap",
      date: { start: startDate },
      data: {
        source: logs.map((log) => ({ date: log.date, value: 1 })),
        x: "date",
        y: "value",
        defaultValue: 0,
      },
      range: 12,
      scale: {
        color: {
          range: ["#ebedf0", "#216e39"],
          type: "linear",
          domain: [0, 1],
        },
      },
      domain: {
        type: "month",
        gutter: 4,
        label: { text: "MMM", textAlign: "start" },
      },
      subDomain: {
        type: "day",
        radius: 2,
        width: 15,
        height: 15,
        gutter: 2,
      },
    });
  },

  async updateCompletionStats(habitId) {
    const [habit, logs] = await Promise.all([
      HabitService.getHabitById(habitId),
      HabitService.getHabitLogs(habitId, CONFIG.NEW_YEAR),
    ]);

    const expectedDays = this.calculateExpectedDays(habit);
    console.log(logs);
    console.log(expectedDays + "  " + logs.length);
    const completionRate = Math.round((logs.length / expectedDays) * 100) || 0;

    document.getElementById(
      "completionRateText"
    ).textContent = `${completionRate}%`;
    document.getElementById(
      "completionRateBar"
    ).style.width = `${completionRate}%`;
  },

  calculateExpectedDays(habit) {
    let days = 0;
    const startDate = new Date(habit.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayIncrement = CONFIG.ONE_DAY_MS;

    while (startDate <= today) {
      if (habit.frequency === "DAILY") {
        days++;
      } else if (habit.frequency === "WEEKLY") {
        const dayName = today
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase();
        if (habit.daysOfWeek.includes(dayName)) {
          days++;
        }
      }
      startDate.setTime(startDate.getTime() + dayIncrement);
    }
    return days;
  },
};

// ======================
// 8. Form Manager (Complete)
// ======================
const FormManager = {
  validateForm() {
    const getElement = (id) => document.getElementById(id);
    const date = new Date(getElement("startDate").value);
    date.setHours(0, 0, 0, 0);

    return {
      title: getElement("title").value.trim(),
      frequency: getElement("habitFrequency").value.toUpperCase(),
      daysOfWeek: this.getSelectedDays(),
      startDate: date.toISOString(),
      goalDays: this.parseGoalDays(getElement("goalDays").value),
    };
  },

  getSelectedDays() {
    return Array.from(
      document.querySelectorAll("#weekly-option input:checked")
    ).map((input) => input.value.toUpperCase());
  },

  parseGoalDays(value) {
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  },
};

// ======================
// 9. Utilities (Complete)
// ======================
const Utils = {
  capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
  },

  capitalizeWords(str) {
    return str
      .split(" ")
      .map((word) => this.capitalize(word))
      .join(" ");
  },
};

// ======================
// 10. Initialization (Complete)
// ======================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await HabitRenderer.renderHabitList();
    EventHandlers.initializeFormHandlers();
    await ProgressManager.initialize();
    await VisualizationManager.renderChart();
  } catch (error) {
    DomUtils.showNotification("Failed to initialize application", "danger");
  }
});
