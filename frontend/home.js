/*





*/

window.onload = async function (ev) {
  const weekly = document.getElementById("habitFrequency");
  weekly.addEventListener("change", (ev) => {
    toggleSelect();
  });

  console.log("problem");
  await displayAllHabits();
  console.log("sandwich");

  const habitBoxes = document.getElementsByClassName("habit-checkbox");
  for (let habitBox of habitBoxes) {
    habitBox.addEventListener("change", async (ev) => {
      toggleCheckBox(habitBox.id);
      const id = parseInt(habitBox.id.replace("habit-", ""));

      if (habitBox.checked) {
        await logHabitCompletion(id);
      } else {
        await deleteHabitLog(id);
      }
    });
  }

  const habitForm = document.getElementById("habit-form");
  habitForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevents page refresh

    const data = validateForm();
    console.log(data);
    await createHabit(data);
    window.location.href = "/";
  });

  initializeProgressPage();
};

/*





*/

async function displayAllHabits() {
  let date = new Date();
  let today = date
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  const habits = await getHabitsForToday(today);
  console.log(habits);

  for (let habit of habits) {
    console.log(habit);
    createHabitElement(habit.id, habit.title, habit.frequency);
  }
}

function createHabitElement(id, title, frequency) {
  // Create the <li> element
  const li = document.createElement("li");
  li.className =
    "list-group-item d-flex justify-content-between align-items-center";

  // Create the <div> with class "form-check"
  const div = document.createElement("div");
  div.className = "form-check";

  // Create the <input> checkbox
  const input = document.createElement("input");
  input.className = "form-check-input habit-checkbox";
  input.type = "checkbox";
  input.id = "habit-" + id;

  // Create the <label> for the checkbox
  const label = document.createElement("label");
  label.className = "form-check-label";
  label.htmlFor = "habit-" + id;
  label.textContent = title;

  // Append the input and label to the div
  div.appendChild(input);
  div.appendChild(label);

  // Create the <span> element
  const span = document.createElement("span");
  let pillBackground = "bg-primary";
  if (frequency === "WEEKLY") pillBackground = "bg-success";
  else if (frequency === "INTERVAL") pillBackground = "bg-warning";

  span.className = "badge rounded-pill " + pillBackground;
  span.textContent = capitalize(frequency);

  // Append the div and span to the <li>
  li.appendChild(div);
  li.appendChild(span);

  // Append the <li> to an existing <ul> or <ol> (example: #habitList)
  document.getElementById("habit-list").appendChild(li);
}

function toggleHidden(id) {
  const element = document.getElementById(id);
  element.classList.toggle("d-none");
}

function addHidden(id) {
  const element = document.getElementById(id);
  element.classList.add("d-none");
}

function toggleSelect() {
  const select = document.getElementById("habitFrequency");
  let optionText = select.options[select.selectedIndex].label
    .toLowerCase()
    .trim();
  console.log("text: " + optionText);
  if (optionText === "weekly") {
    toggleHidden("weekly-option");
  } else {
    addHidden("weekly-option");
  }
}

function toggleCheckBox(id) {
  const checkBox = document.getElementById(id);
  console.log(checkBox.parentElement.parentElement);
  checkBox.parentElement.parentElement.classList.toggle("bg-secondary-subtle");
  checkBox.nextElementSibling.classList.toggle("text-decoration-line-through");
}

function validateForm() {
  const title = document.getElementById("title").value;

  const select = document.getElementById("habitFrequency");
  const frequency = select.options[select.selectedIndex].value
    .trim()
    .toUpperCase();
  const checkBoxes = document.querySelectorAll(
    "#weekly-option .form-check-input:checked"
  );
  let daysOfWeek = [];
  for (checkBox of checkBoxes) {
    daysOfWeek.push(checkBox.value);
  }
  const startDate = new Date(
    document.getElementById("startDate").value
  ).toISOString();
  startDate.setHours(0, 0, 0, 0);

  let goalDays = document.getElementById("goalDays").value;
  if (!goalDays) {
    goalDays = null;
  }

  return {
    title: title,
    frequency: frequency,
    daysOfWeek: daysOfWeek,
    startDate: startDate,
    goalDays: parseInt(goalDays),
  };
}
