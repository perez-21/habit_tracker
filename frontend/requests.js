async function createHabit(habitObject) {
  try {
    const response = await fetch("http://localhost:3000/api/habit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        habitObject
        /*
        title: 'Morning Run',
        frequency: 'WEEKLY',
        daysOfWeek: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
        goalDays: 30,
        startDate: new Date().toISOString()*/
      ),
    });
    const data = await response.json();
    console.log("Created Habit:", data);
    return data;
  } catch (error) {
    console.error("Error:", error);
    return error;
  }
}

async function getHabits() {
  try {
    const response = await fetch("http://localhost:3000/api/habit");
    const data = await response.json();
    console.log("Habits:", data);
    return data;
  } catch (error) {
    console.error("Error:", error);
    return error;
  }
}

async function getHabitsForToday(dayOfTheWeek) {
  try {
    const today = dayOfTheWeek.toLowerCase();
    const response = await fetch(
      `http://localhost:3000/api/habit?today=${today}`
    );
    const data = await response.json();
    console.log(`Habits for ${today}:`, data);
    return data;
  } catch (error) {
    console.error("Error:", error);
    return error;
  }
}

async function getHabitById(habitId) {
  try {
    const response = await fetch(`http://localhost:3000/api/habit/${habitId}`);
    const data = await response.json();
    console.log("Habit:", data);
    return data;
  } catch (error) {
    console.error("Error:", error);
    return error;
  }
}

async function updateHabit(habitId, habitObject) {
  try {
    const response = await fetch(`http://localhost:3000/api/habit/${habitId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        habitObject /*
        title: 'Evening Walk',
        daysOfWeek: ['TUESDAY', 'THURSDAY']*/,
      }),
    });
    const data = await response.json();
    console.log("Updated Habit:", data);
    return data;
  } catch (error) {
    console.error("Error:", error);
    return error;
  }
}

async function deleteHabit(habitId) {
  try {
    const response = await fetch(`http://localhost:3000/api/habit/${habitId}`, {
      method: "DELETE",
    });
    const data = await response.json();
    console.log("Deleted Habit:", data);
    return data;
  } catch (error) {
    console.error("Error:", error);
    return error;
  }
}

async function logHabitCompletion(habitId) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  try {
    const response = await fetch("http://localhost:3000/api/habitlogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        habitId: parseInt(habitId),
      }),
    });
    const data = await response.json();
    console.log("Logged Habit Completion:", data);
    return data;
  } catch (error) {
    console.error("Error:", error);
    return error;
  }
}

async function getHabitLogs(habitId, start) {
  let endPoint = `http://localhost:3000/api/habitlogs`;
  if (habitId && start)
    endPoint = `http://localhost:3000/api/habitlogs?habitId=${habitId}&start=${start}`;
  else if (habitId)
    endPoint = `http://localhost:3000/api/habitlogs?habitId=${habitId}`;
  else if (start)
    endPoint = `http://localhost:3000/api/habitlogs?start=${start}`;

  console.log(endPoint);
  try {
    const response = await fetch(endPoint);
    const data = await response.json();
    console.log("Habit Logs:", data);
    return data;
  } catch (error) {
    console.error("Error:", error);
    return error;
  }
}

async function deleteHabitLog(habitId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/habitlogs/${habitId}`,
      {
        method: "DELETE",
      }
    );
    const data = await response.json();
    console.log("Deleted Habit Log:", data);
    return data;
  } catch (error) {
    console.error("Error:", error);
    return error;
  }
}
