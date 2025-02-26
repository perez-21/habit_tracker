async function initializeProgressPage() {
  await addHabitsAsOptions();

  const statSelect = document.getElementById("stat-select");
  statSelect.addEventListener("change", (ev) => {
    // set mode
    setStatMode();
    // update statistics

    /* if all habits, show and calculate graph and completion rate
    /* calculate completions, calculate longest streak, calculate current streak */
  });
  statSelect.value = "All Habits";
  statSelect.dispatchEvent(new Event("change"));
}

async function addHabitsAsOptions() {
  const select = document.getElementById("stat-select");
  let date = new Date();
  let today = date
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  const habits = await getHabitsForToday(today);
  console.log(habits);
  for (habit of habits) {
    select.appendChild(createOption(habit.id, habit.title));
  }
}

function createOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

async function setStatMode() {
  const statSelect = document.getElementById("stat-select");
  const currentOption = statSelect.options[statSelect.selectedIndex];

  if (currentOption.label.trim() !== "All Habits") {
    await habitMode(currentOption.value);
  } else {
    allHabitsMode();
  }
}

async function allHabitsMode() {
  const chart = document.getElementById("habit-chart-container");
  chart.classList.remove("d-none");

  const heatmap = document.getElementById("calendar-heatmap-container");
  heatmap.classList.add("d-none");

  const completeCon = document.getElementById("completion-container");
  heatmap.classList.add("d-none");

  // calculate stuff

  await createChart();
}

async function habitMode(optionValue) {
  const chart = document.getElementById("habit-chart-container");
  chart.classList.add("d-none");

  const heatmap = document.getElementById("calendar-heatmap-container");
  heatmap.classList.remove("d-none");

  const completeCon = document.getElementById("completion-container");
  heatmap.classList.remove("d-none");

  // calculate stuff
  const day = 86400000;
  const habit = await getHabitById(optionValue);
  const weeklys = {
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
    7: "sunday",
  };
  const expectedCompletions = [];
  if ((habit.frequency = "DAILY")) {
    let startDate = new Date(habit.startDate).getTime();
    const today = Date.now();
    if (startDate >= today) {
      return;
    }
    while (startDate <= today) {
      let foo = new Date(startDate).toISOString();
      expectedCompletions.push(foo);
      startDate += day;
    }
  } else {
    const startDate = new Date(habit.startDate).getTime();
    const today = Date.now();
    if (startDate >= today) {
      return;
    }
    while (startDate <= today) {
      let foo = new Date(startDate);
      if (habit.daysOfWeek.find(weeklys[foo.getDay])) {
        expectedCompletions.push(foo);
      }
      startDate += day;
    }
  }

  const habitLogs = await getHabitLogs(optionValue);
  const logDates = habitLogs.map((log) => log.date);

  const completionRate = parseInt(
    (logDates.length / expectedCompletions.length) * 100
  );

  // omo
  createHeatMap(optionValue);
  setAllStats(completionRate);
}

function setAllStats(
  completionRate,
  totalCompletions,
  longestStreak,
  currentStreak
) {
  if (completionRate) {
    const compRateText = document.getElementById("completionRateText");
    compRateText.textContent = completionRate + "%";

    const rateBar = document.getElementById("completionRateBar");
    rateBar.style = `width: ${completionRate}%`;
  }

  if (totalCompletions) {
    const totalComp = document.getElementById("totalCompletions");
    totalComp.textContent = totalCompletions;
  }

  if (longestStreak) {
    const streakLen = document.getElementById("longestStreak");
    streakLen.textContent = longestStreak;
  }

  if (currentStreak) {
    const currStreak = document.getElementById("currentStreak");
    currStreak.textContent = currentStreak;
  }
}

async function createChart() {
  const habitLogs = await getHabitLogs();
  const logCounts = habitLogs.reduce((acc, log) => {
    const date = log.date; //.split("T")[0]; // Extract YYYY-MM-DD
    acc[date] = (acc[date] || 0) + 1; // Increase count or initialize to 1
    return acc;
  }, {});

  const logCountsArray = Object.entries(logCounts).map(([date, count]) => ({
    date,
    count,
  }));

  const labels = logCountsArray.map(({ date, count }) => date.split("T")[0]);

  const dailyCompletionHistory = logCountsArray.map((val) => val.count);

  const ctx = document.getElementById("habitChart").getContext("2d");
  new Chart(ctx, {
    type: "bar", // Defines a line chart
    data: {
      labels: labels, // X-axis labels
      datasets: [
        {
          label: "Daily Completion (%)", // Legend name
          data: dailyCompletionHistory, // Y-axis values
          borderColor: "rgba(75, 192, 192, 1)", // Line color
          backgroundColor: "rgba(75, 192, 192, 0.2)", // Area fill color
          borderWidth: 2, // Line thickness
          fill: true, // Fill the area under the line
          tension: 0.4, // Smooth curves
        },
      ],
    },
    options: {
      responsive: true, // Adjusts to screen size
      //maintainAspectRatio: false, // Allows flexible resizing
      scales: {
        y: {
          beginAtZero: true, // Y-axis starts at 0
          // Y-axis max value is 100
          ticks: { stepSize: 1 }, // Increments of 10 on the Y-axis
        },
      },
    },
  });
}

async function createHeatMap(optionValue) {
  // Create Habit Completion Data
  // const habitData = [
  //   { date: new Date("2024-02-01").toISOString(), value: 1 },
  //   { date: new Date("2024-02-02").toISOString(), value: 1 },
  //   { date: new Date("2024-02-03").toISOString(), value: 1 },
  //   { date: new Date("2024-02-04").toISOString(), value: 1 },
  //   { date: new Date("2024-02-05").toISOString(), value: 1 },
  //   { date: new Date("2024-02-06").toISOString(), value: 1 },
  //   { date: new Date("2024-02-07").toISOString(), value: 1 },
  //   { date: new Date("2024-02-08").toISOString(), value: 1 },
  //   { date: new Date("2024-02-09").toISOString(), value: 1 },
  // ];
  const startDate = new Date();
  startDate.setMonth(1);
  startDate.setDate(1);
  const habitLogs = await getHabitLogs(optionValue, startDate.toISOString());
  const logCounts = habitLogs.reduce((acc, log) => {
    const date = log.date; //.split("T")[0]; // Extract YYYY-MM-DD
    acc[date] = (acc[date] || 0) + 1; // Increase count or initialize to 1
    return acc;
  }, {});

  const logCountsArray = Object.entries(logCounts).map(([date, value]) => ({
    date,
    value,
  }));

  // Initialize Cal-Heatmap
  const cal = new CalHeatmap();
  cal.paint({
    itemSelector: "#calendar-heatmap",
    date: {
      start: startDate,
    },
    data: {
      source: logCountsArray,
      type: "json",
      x: "date",
      y: "value",
      // groupY: "sum",
      defaultValue: 0,
    },
    range: 12,
    scale: {
      color: { range: ["gray", "green"], type: "categorical", domain: [0, 1] },
    },
    domain: { type: "month", gutter: 4 },
    subDomain: { type: "day", radius: 3, width: 15, height: 20 },
    verticalOrientation: false,
  });
}
