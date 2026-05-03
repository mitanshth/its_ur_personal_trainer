const STORAGE_KEY = "forgefit-ai-state-v2";
const OLD_STORAGE_KEY = "forgefit-ai-state-v1";

const defaultState = {
  onboarded: false,
  user: {
    name: "",
    email: "",
    photo: ""
  },
  profile: {
    age: 25,
    gender: "male",
    height: 170,
    goal: "fat-loss",
    experience: "beginner",
    daysPerWeek: 4,
    sessionLength: 45,
    equipment: "bodyweight",
    diet: "balanced",
    activityLevel: "moderate",
    currentWeight: 75,
    targetWeight: 70,
    injuries: "",
    avoidFoods: "",
    notificationTime: "07:00",
    motivationStyle: "direct"
  },
  logs: [],
  planSeed: 1,
  notifications: false
};

const exerciseLibrary = {
  bodyweight: {
    strength: ["Tempo push-ups", "Box squats", "Reverse lunges", "Glute bridges", "Dead bugs", "Side plank"],
    conditioning: ["High knees", "Mountain climbers", "Skater steps", "Squat thrusts", "Fast step-ups"],
    mobility: ["World's greatest stretch", "Hip flexor stretch", "Thoracic rotations", "Deep squat hold"]
  },
  dumbbells: {
    strength: ["Goblet squat", "Dumbbell floor press", "One-arm row", "Romanian deadlift", "Half-kneeling press", "Suitcase carry"],
    conditioning: ["Dumbbell swings", "Farmer carry march", "Reverse lunge to curl", "Dumbbell step-up", "Low-impact thruster"],
    mobility: ["Loaded calf stretch", "90/90 hip switches", "Pullover breathing", "Open-book rotations"]
  },
  gym: {
    strength: ["Leg press", "Bench press", "Lat pulldown", "Trap-bar deadlift", "Cable row", "Machine shoulder press"],
    conditioning: ["Incline treadmill intervals", "Row erg", "Bike intervals", "Sled push", "Stair climber"],
    mobility: ["Couch stretch", "Band shoulder opener", "Ankle rocks", "Hamstring floss"]
  },
  bands: {
    strength: ["Band squat", "Band chest press", "Band row", "Band good morning", "Pallof press", "Band pull-aparts"],
    conditioning: ["Band thrusters", "Lateral shuffle", "Band-resisted march", "Squat to press", "Fast band rows"],
    mobility: ["Band shoulder opener", "Hip flexor stretch", "Lat stretch", "Cat cow"]
  }
};

const recipeBank = {
  balanced: [
    ["Chicken rice power bowl", "Chicken, rice, cucumber, curd, herbs", "Training fuel with lean protein and steady carbs."],
    ["Egg veggie wraps", "Eggs, roti, peppers, spinach, chutney", "A quick breakfast that supports recovery."],
    ["Dal fish plate", "Fish, dal, rice, salad", "Protein plus fiber for a clean dinner."]
  ],
  vegetarian: [
    ["Paneer quinoa bowl", "Paneer, quinoa, peppers, mint yogurt", "High-protein vegetarian recovery meal."],
    ["Chickpea chaat salad", "Chickpeas, potato, onion, tomato, lemon", "Filling, cheap, and meal-prep friendly."],
    ["Tofu bhurji toast", "Tofu, spices, whole-grain toast", "A lighter high-protein breakfast."]
  ],
  vegan: [
    ["Lentil peanut stew", "Lentils, peanuts, tomato, spinach", "Dense plant protein for hard training days."],
    ["Soy chunk pulao", "Soy chunks, rice, peas, spices", "Strong post-workout vegan meal."],
    ["Overnight oats", "Oats, soy milk, chia, banana", "Easy breakfast with fiber and energy."]
  ],
  "high-protein": [
    ["Greek yogurt crunch", "Greek yogurt, whey, fruit, nuts", "Low-effort protein target booster."],
    ["Turkey bean skillet", "Turkey, beans, peppers, salsa", "Batch cooks well for disciplined weeks."],
    ["Protein dosa plate", "Dosa, eggs or tofu, sambar", "Training-friendly and satisfying."]
  ],
  "low-carb": [
    ["Chicken salad crunch", "Chicken, lettuce, avocado, seeds", "Keeps calories controlled without feeling tiny."],
    ["Paneer tikka tray", "Paneer, capsicum, onion, salad", "Simple dinner with strong protein."],
    ["Egg curry bowl", "Eggs, cauliflower rice, greens", "Comfort food with lighter carbs."]
  ]
};

let state = loadState();
let activeWorkoutOffset = 0;
let notificationTimer = null;
let installPromptEvent = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const legacy = localStorage.getItem(OLD_STORAGE_KEY);
  const raw = saved || legacy;
  if (!raw) return structuredClone(defaultState);
  try {
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      user: { ...structuredClone(defaultState.user), ...(parsed.user || {}) },
      profile: { ...structuredClone(defaultState.profile), ...(parsed.profile || {}) }
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function titleCase(value = "") {
  return value.split("-").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");
}

function initials(name) {
  return (name || "ForgeFit").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function readPhoto(fileInput) {
  const file = fileInput.files?.[0];
  if (!file) return Promise.resolve(state.user.photo || "");
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function getTodayLog() {
  return state.logs.find((log) => log.date === todayKey());
}

function getRecentLogs(days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return state.logs.filter((log) => new Date(log.date) >= cutoff);
}

function getStreak() {
  const dates = new Set(state.logs.filter((log) => log.workoutDone).map((log) => log.date));
  let streak = 0;
  const cursor = new Date();
  while (dates.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function hasJointLimit() {
  return /knee|back|shoulder|ankle|pain|injur|limit/i.test(state.profile.injuries || "");
}

function bmr() {
  const { gender, currentWeight, height, age } = state.profile;
  const base = 10 * Number(currentWeight) + 6.25 * Number(height) - 5 * Number(age);
  if (gender === "female") return base - 161;
  if (gender === "male") return base + 5;
  return base - 78;
}

function nutritionTargets() {
  const activity = { low: 1.35, moderate: 1.55, high: 1.75 }[state.profile.activityLevel] || 1.55;
  const goalAdjust = { "fat-loss": -450, muscle: 300, strength: 180, endurance: 120, discipline: 0 }[state.profile.goal] || 0;
  const calories = Math.round((bmr() * activity + goalAdjust) / 25) * 25;
  const proteinMultiplier = state.profile.goal === "muscle" || state.profile.goal === "strength" ? 2 : 1.65;
  const protein = Math.round(Number(state.profile.currentWeight) * proteinMultiplier);
  const fats = Math.round(Number(state.profile.currentWeight) * (state.profile.diet === "low-carb" ? 1 : 0.75));
  const carbCalories = Math.max(350, calories - protein * 4 - fats * 9);
  const carbs = state.profile.diet === "low-carb" ? "80-130g" : `${Math.round(carbCalories / 4)}g`;
  return { calories, protein, fats, carbs };
}

function calculateMetrics() {
  const recent = getRecentLogs(7);
  const weeklyDone = recent.filter((log) => log.workoutDone).length;
  const targets = nutritionTargets();
  const proteinAvg = recent.length ? recent.reduce((sum, log) => sum + Number(log.protein || 0), 0) / recent.length : 0;
  const checkinCount = recent.filter((log) => log.sleep || log.water || log.soreness || log.steps).length;
  const discipline = clamp(Math.round((weeklyDone / Number(state.profile.daysPerWeek)) * 55 + (proteinAvg / targets.protein) * 25 + (checkinCount / 7) * 20), 0, 100);
  const start = Number(state.logs.find((log) => log.weight)?.weight || state.profile.currentWeight);
  const latest = Number([...state.logs].reverse().find((log) => log.weight)?.weight || state.profile.currentWeight);
  const target = Number(state.profile.targetWeight);
  const totalNeeded = Math.abs(start - target) || 1;
  const goalProgress = clamp(Math.round((Math.abs(start - latest) / totalNeeded) * 100), 0, 100);
  const today = getTodayLog() || {};
  const avgEffort = recent.length ? recent.reduce((sum, log) => sum + Number(log.effort || 7), 0) / recent.length : 7;
  const sleep = Number(today.sleep || 7);
  const soreness = Number(today.soreness || 4);
  const readiness = clamp(Math.round(86 + (sleep - 7) * 4 - Math.max(0, soreness - 5) * 6 - Math.max(0, avgEffort - 8) * 5 + Math.min(getStreak(), 5) * 2), 35, 96);
  return { weeklyDone, discipline, goalProgress, readiness, targets };
}

function buildWorkoutPlan() {
  const { goal, daysPerWeek, sessionLength, equipment, experience } = state.profile;
  const pool = exerciseLibrary[equipment] || exerciseLibrary.bodyweight;
  const limited = hasJointLimit();
  const intensity = experience === "advanced" ? "5 rounds" : experience === "intermediate" ? "4 rounds" : "3 rounds";
  const reps = goal === "strength" ? "5-8 reps" : goal === "endurance" ? "45 sec" : "8-12 reps";
  const themes = goal === "endurance"
    ? ["Low-impact intervals", "Strength endurance", "Mobility reset", "Cardio base", "Core control", "Long sweat"]
    : goal === "muscle"
      ? ["Upper body", "Lower body", "Push pull", "Hypertrophy", "Core", "Pump day"]
      : ["Full body", "Conditioning", "Lower body", "Upper body", "Mobility", "Metabolic"];

  return Array.from({ length: Number(daysPerWeek) }, (_, index) => {
    const theme = themes[(index + state.planSeed) % themes.length];
    const isConditioning = /conditioning|interval|sweat|metabolic|cardio/i.test(theme);
    const isMobility = /mobility/i.test(theme);
    const source = isMobility ? pool.mobility : isConditioning ? pool.conditioning : pool.strength;
    const moves = Array.from({ length: isMobility ? 4 : 5 }, (_, moveIndex) => {
      let name = source[(moveIndex + index + state.planSeed) % source.length];
      if (limited) {
        name = name.replace("Burpees", "Incline squat thrusts").replace("Skater hops", "Skater steps").replace("Back squat", "Leg press");
      }
      const dose = isMobility ? "60 sec" : isConditioning ? (limited ? "30 sec steady / 30 sec easy" : "35 sec on / 25 sec off") : reps;
      return { name, dose };
    });
    return {
      day: `Day ${index + 1}`,
      title: theme,
      duration: `${sessionLength} min`,
      intensity: limited ? `${intensity}, joint-friendly` : intensity,
      focus: goal,
      moves,
      finisher: isMobility ? "5 minutes nasal breathing" : limited ? "8 minute incline walk" : "6 minute controlled finisher"
    };
  });
}

function getMotivation() {
  const streak = getStreak();
  const name = state.user.name ? state.user.name.split(" ")[0] : "you";
  const style = state.profile.motivationStyle;
  if (style === "calm") return streak > 1 ? `${name}, keep it simple today. Show up and finish clean.` : "Start gently, but start. Ten honest minutes counts.";
  if (style === "competitive") return streak > 1 ? `${name}, protect the streak. The plan is waiting.` : "Win the first rep. The rest follows.";
  return streak > 1 ? `${name}, you have proof now. Stack one more clean day.` : "No drama. Train today and make discipline visible.";
}

function renderProfile() {
  const photo = $("#profilePhoto");
  photo.textContent = initials(state.user.name);
  photo.style.backgroundImage = state.user.photo ? `url("${state.user.photo}")` : "";
  photo.classList.toggle("has-image", Boolean(state.user.photo));
  $("#profileCaption").textContent = state.user.name ? `${state.user.name} - ${titleCase(state.profile.goal)}` : "AI discipline coach";
}

function renderDashboard() {
  const metrics = calculateMetrics();
  const plan = buildWorkoutPlan();
  const todayWorkout = plan[activeWorkoutOffset % plan.length];
  const now = new Date();
  const today = getTodayLog();

  $("#todayLabel").textContent = now.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  $("#dailyHeadline").textContent = getMotivation();
  $("#coachMessage").textContent = `${titleCase(state.profile.goal)} plan for ${state.user.name || "you"}`;
  $("#coachDetail").textContent = `${state.profile.age} yrs, ${state.profile.height} cm, ${state.profile.currentWeight} kg now, ${state.profile.targetWeight} kg target. Built around ${state.profile.equipment}, ${state.profile.daysPerWeek} days/week, ${titleCase(state.profile.diet)} diet.`;
  $("#weeklyWorkouts").textContent = `${metrics.weeklyDone} / ${state.profile.daysPerWeek}`;
  $("#weeklyMeter").max = state.profile.daysPerWeek;
  $("#weeklyMeter").value = metrics.weeklyDone;
  $("#disciplineScore").textContent = `${metrics.discipline}%`;
  $("#disciplineMeter").value = metrics.discipline;
  $("#goalProgress").textContent = `${metrics.goalProgress}%`;
  $("#goalMeter").value = metrics.goalProgress;
  $("#proteinTarget").textContent = `${metrics.targets.protein}g`;
  $("#proteinMeter").max = Math.max(200, metrics.targets.protein);
  $("#proteinMeter").value = metrics.targets.protein;
  $("#readinessScore").textContent = metrics.readiness;
  $(".score-ring").style.background = `conic-gradient(var(--accent-3) ${metrics.readiness}%, rgba(255,255,255,0.28) 0)`;
  $("#readinessText").textContent = metrics.readiness > 80 ? "Push intensity today." : metrics.readiness > 62 ? "Balanced intensity today." : "Recovery-aware plan today.";
  $("#checkinStatus").textContent = today?.sleep || today?.water || today?.soreness ? "Logged today" : "Not logged";

  const streak = getStreak();
  $("#streakDays").textContent = `${streak} day${streak === 1 ? "" : "s"}`;
  $("#streakHint").textContent = streak ? "Momentum compounds quietly." : "Log today to start momentum.";

  renderWorkoutBlock($("#todayWorkout"), todayWorkout);
  renderCoachNotes(metrics);
}

function renderWorkoutBlock(container, workout) {
  container.innerHTML = `
    <div>
      <p class="eyebrow">${workout.day}</p>
      <h3>${workout.title}</h3>
      <div class="workout-meta">
        <span class="tag">${workout.duration}</span>
        <span class="tag">${workout.intensity}</span>
        <span class="tag">${titleCase(workout.focus)}</span>
      </div>
    </div>
    <ul class="exercise-list">
      ${workout.moves.map((move) => `<li><strong>${move.name}</strong><br><span>${move.dose}</span></li>`).join("")}
      <li><strong>Finisher</strong><br><span>${workout.finisher}</span></li>
    </ul>
  `;
}

function renderCoachNotes(metrics) {
  const injuryNote = hasJointLimit() ? `I adjusted impact because you listed: ${state.profile.injuries}.` : "No movement limits listed, so the plan can progress normally.";
  const notes = [
    metrics.weeklyDone >= state.profile.daysPerWeek ? "Training target hit. Use extra energy for mobility or walking." : `${state.profile.daysPerWeek - metrics.weeklyDone} workout(s) left this week.`,
    metrics.discipline >= 75 ? "Consistency is strong. Add a little load, reps, or control next week." : "The next action is small: open the plan, do the warm-up, then decide.",
    `Nutrition target: ${metrics.targets.calories} kcal and ${metrics.targets.protein}g protein today.`,
    injuryNote
  ];
  $("#coachNotes").innerHTML = notes.map((note) => `<li>${note}</li>`).join("");
}

function renderPlan() {
  $("#weeklyPlan").innerHTML = buildWorkoutPlan().map((workout) => `
    <article class="plan-card">
      <div>
        <p class="eyebrow">${workout.day}</p>
        <h3>${workout.title}</h3>
      </div>
      <div class="workout-meta">
        <span class="tag">${workout.duration}</span>
        <span class="tag">${workout.intensity}</span>
      </div>
      <ul class="exercise-list">
        ${workout.moves.map((move) => `<li><strong>${move.name}</strong><br><span>${move.dose}</span></li>`).join("")}
      </ul>
    </article>
  `).join("");
}

function renderNutrition() {
  const targets = nutritionTargets();
  $("#nutritionTargets").innerHTML = [
    ["Calories", `${targets.calories} kcal`],
    ["Protein", `${targets.protein}g`],
    ["Carbs", targets.carbs],
    ["Fats", `${targets.fats}g`]
  ].map(([label, value]) => `<div class="target-box"><span class="label">${label}</span><strong>${value}</strong></div>`).join("");

  const avoid = state.profile.avoidFoods?.trim();
  const tips = [
    `Plan is based on ${state.profile.currentWeight} kg, ${state.profile.height} cm, ${state.profile.age} yrs, and ${titleCase(state.profile.activityLevel)} activity.`,
    state.profile.goal === "fat-loss" ? "Keep the deficit moderate so discipline survives the week." : "Add calories slowly if strength, energy, or weight is not moving.",
    avoid ? `Avoid or swap these foods: ${avoid}.` : "No avoided foods listed. Add allergies or dislikes in profile for cleaner recipes.",
    "Each meal should have protein first, then fiber, then carbs around training."
  ];
  $("#nutritionTips").innerHTML = tips.map((tip) => `<li>${tip}</li>`).join("");

  const avoidWords = (avoid || "").toLowerCase().split(",").map((item) => item.trim()).filter(Boolean);
  const recipes = (recipeBank[state.profile.diet] || recipeBank.balanced).map((recipe) => {
    const ingredients = recipe[1].split(", ");
    const filtered = ingredients.map((item) => avoidWords.some((avoidItem) => item.toLowerCase().includes(avoidItem)) ? `Swap ${item}` : item);
    return [recipe[0], filtered.join(", "), recipe[2]];
  });

  $("#recipeGrid").innerHTML = recipes.map(([name, ingredients, why]) => `
    <article class="recipe-card">
      <div>
        <p class="eyebrow">${titleCase(state.profile.diet)}</p>
        <h3>${name}</h3>
      </div>
      <p>${why}</p>
      <ul>${ingredients.split(", ").map((item) => `<li>${item}</li>`).join("")}</ul>
    </article>
  `).join("");
}

function renderLogs() {
  const logs = [...state.logs].reverse().slice(0, 8);
  $("#logList").innerHTML = logs.length
    ? logs.map((log) => `
      <div class="log-item">
        <strong>${new Date(log.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</strong>
        <span>${log.workoutDone ? "Workout logged" : "Check-in"} - ${log.effort || 7}/10 effort - ${log.protein || 0}g protein - ${log.sleep || 0}h sleep - ${log.water || 0}L water</span>
      </div>
    `).join("")
    : `<div class="log-item">No logs yet. Save today and the chart wakes up.</div>`;
  drawWeightChart();
}

function drawWeightChart() {
  const canvas = $("#weightChart");
  const ctx = canvas.getContext("2d");
  const logs = state.logs.filter((log) => log.weight).slice(-12);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fbfcfa";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#dbe2d6";
  ctx.lineWidth = 1;
  for (let y = 40; y < canvas.height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(canvas.width - 24, y);
    ctx.stroke();
  }
  ctx.fillStyle = "#69746a";
  ctx.font = "16px system-ui";
  if (logs.length < 2) {
    ctx.fillText("Add at least two weight logs to see a trend.", 42, 140);
    return;
  }
  const weights = logs.map((log) => Number(log.weight));
  const min = Math.min(...weights) - 1;
  const max = Math.max(...weights) + 1;
  const xStep = (canvas.width - 80) / (logs.length - 1);
  const yFor = (weight) => canvas.height - 40 - ((weight - min) / (max - min)) * (canvas.height - 80);
  ctx.strokeStyle = "#146b63";
  ctx.lineWidth = 4;
  ctx.beginPath();
  logs.forEach((log, index) => {
    const x = 40 + xStep * index;
    const y = yFor(Number(log.weight));
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  logs.forEach((log, index) => {
    const x = 40 + xStep * index;
    const y = yFor(Number(log.weight));
    ctx.fillStyle = "#e75f3f";
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#17201a";
    ctx.fillText(`${log.weight}kg`, x - 18, y - 12);
  });
}

function renderSettings() {
  Object.entries({ ...state.user, ...state.profile }).forEach(([key, value]) => {
    const field = $(`#${key}`);
    if (field && field.type !== "file") field.value = value;
  });
}

function renderOnboarding() {
  $("#onboarding").classList.toggle("hidden", Boolean(state.onboarded));
}

function renderAll() {
  renderOnboarding();
  renderProfile();
  renderDashboard();
  renderPlan();
  renderNutrition();
  renderLogs();
  renderSettings();
  scheduleNotification();
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3000);
}

function setupPwaInstall() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      showToast("Offline app setup could not start from this page.");
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPromptEvent = event;
    $("#installButton").hidden = false;
    $("#installTip").hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    installPromptEvent = null;
    $("#installButton").hidden = true;
    $("#installTip").hidden = true;
    showToast("ForgeFit installed.");
  });

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isStandalone && isMobile) {
    window.setTimeout(() => {
      if (!installPromptEvent) $("#installTip").hidden = false;
    }, 1800);
  }
}

function saveTodayLog(extra = {}) {
  const date = todayKey();
  const existing = state.logs.find((log) => log.date === date);
  const entry = {
    date,
    workoutDone: Boolean(extra.workoutDone ?? existing?.workoutDone),
    weight: extra.weight ?? existing?.weight ?? "",
    effort: extra.effort ?? existing?.effort ?? 7,
    protein: extra.protein ?? existing?.protein ?? 0,
    mood: extra.mood ?? existing?.mood ?? "Focused",
    sleep: extra.sleep ?? existing?.sleep ?? "",
    water: extra.water ?? existing?.water ?? "",
    soreness: extra.soreness ?? existing?.soreness ?? "",
    steps: extra.steps ?? existing?.steps ?? ""
  };
  if (existing) Object.assign(existing, entry);
  else state.logs.push(entry);
  saveState();
  renderAll();
}

async function enableNotifications() {
  if (!("Notification" in window)) {
    showToast("This browser does not support notifications.");
    return;
  }
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    state.notifications = true;
    saveState();
    scheduleNotification();
    new Notification("ForgeFit is ready", { body: "Daily check-ins and discipline reminders are enabled." });
    showToast("Daily notifications enabled.");
  } else {
    showToast("Notifications were not enabled.");
  }
}

function scheduleNotification() {
  if (notificationTimer) window.clearTimeout(notificationTimer);
  if (!state.notifications || !("Notification" in window) || Notification.permission !== "granted") return;
  const [hours, minutes] = state.profile.notificationTime.split(":").map(Number);
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  if (target <= new Date()) target.setDate(target.getDate() + 1);
  notificationTimer = window.setTimeout(() => {
    new Notification("ForgeFit check-in", { body: `${getMotivation()} Log sleep, water, soreness, and today's weight.` });
    scheduleNotification();
  }, target - new Date());
}

function switchView(viewName) {
  $$(".tab, .mobile-tab").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
  $$(".view").forEach((view) => view.classList.toggle("active-view", view.id === viewName));
}

async function applySetup(prefix) {
  const photoInput = $(`#${prefix}Photo`) || $("#photoInput");
  state.user = {
    name: $(`#${prefix}Name`)?.value || $("#name")?.value || state.user.name,
    email: $(`#${prefix}Email`)?.value || $("#email")?.value || state.user.email,
    photo: await readPhoto(photoInput)
  };
  state.profile = {
    ...state.profile,
    age: Number($(`#${prefix}Age`)?.value || $("#age")?.value || state.profile.age),
    gender: $(`#${prefix}Gender`)?.value || $("#gender")?.value || state.profile.gender,
    height: Number($(`#${prefix}Height`)?.value || $("#height")?.value || state.profile.height),
    goal: $(`#${prefix}Goal`)?.value || $("#goal")?.value || state.profile.goal,
    experience: $(`#${prefix}Experience`)?.value || $("#experience")?.value || state.profile.experience,
    daysPerWeek: Number($(`#${prefix}DaysPerWeek`)?.value || $("#daysPerWeek")?.value || state.profile.daysPerWeek),
    sessionLength: Number($("#sessionLength")?.value || state.profile.sessionLength),
    equipment: $(`#${prefix}Equipment`)?.value || $("#equipment")?.value || state.profile.equipment,
    diet: $(`#${prefix}Diet`)?.value || $("#diet")?.value || state.profile.diet,
    activityLevel: $(`#${prefix}ActivityLevel`)?.value || $("#activityLevel")?.value || state.profile.activityLevel,
    currentWeight: Number($(`#${prefix}CurrentWeight`)?.value || $("#currentWeight")?.value || state.profile.currentWeight),
    targetWeight: Number($(`#${prefix}TargetWeight`)?.value || $("#targetWeight")?.value || state.profile.targetWeight),
    injuries: $(`#${prefix}Injuries`)?.value || $("#injuries")?.value || state.profile.injuries,
    avoidFoods: $(`#${prefix}AvoidFoods`)?.value || $("#avoidFoods")?.value || state.profile.avoidFoods,
    notificationTime: $("#notificationTime")?.value || state.profile.notificationTime,
    motivationStyle: $("#motivationStyle")?.value || state.profile.motivationStyle
  };
  state.onboarded = true;
  state.planSeed += 1;
  saveState();
  renderAll();
}

function bindEvents() {
  $$(".tab, .mobile-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });

  $$("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.jump));
  });

  $("#onboardingForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await applySetup("setup");
    showToast("Profile created. Your plan is personalized now.");
  });

  $("#generatePlanButton").addEventListener("click", () => {
    state.planSeed += 1;
    saveState();
    renderAll();
    showToast("Fresh personalized plan generated.");
  });
  $("#refreshPlanButton").addEventListener("click", () => $("#generatePlanButton").click());
  $("#newRecipeButton").addEventListener("click", () => {
    state.planSeed += 1;
    const recipes = recipeBank[state.profile.diet];
    recipes.push(recipes.shift());
    renderNutrition();
    showToast("Recipes rotated.");
  });
  $("#swapWorkoutButton").addEventListener("click", () => {
    activeWorkoutOffset += 1;
    renderDashboard();
  });
  $("#completeWorkoutButton").addEventListener("click", () => {
    saveTodayLog({ workoutDone: true });
    showToast("Workout logged. That counts.");
  });
  $("#notifyButton").addEventListener("click", enableNotifications);
  $("#installButton").addEventListener("click", async () => {
    if (!installPromptEvent) {
      $("#installTip").hidden = false;
      showToast("Use your browser menu to add ForgeFit to your home screen.");
      return;
    }
    installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    installPromptEvent = null;
    $("#installButton").hidden = true;
  });

  $("#settingsForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await applySetup("");
    showToast("Profile saved. Diet and exercise plans updated.");
  });

  $("#logEffort").addEventListener("input", () => {
    $("#effortValue").textContent = `${$("#logEffort").value} / 10`;
  });

  $("#progressForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveTodayLog({
      weight: $("#logWeight").value,
      effort: Number($("#logEffort").value),
      protein: Number($("#logProtein").value || 0),
      mood: $("#logMood").value,
      sleep: $("#logSleep").value,
      water: $("#logWater").value
    });
    showToast("Progress saved. Coach adjusted.");
  });

  $("#quickCheckinForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveTodayLog({
      sleep: $("#quickSleep").value,
      water: $("#quickWater").value,
      soreness: $("#quickSoreness").value,
      steps: $("#quickSteps").value
    });
    showToast("Daily details saved. Readiness updated.");
  });
}

bindEvents();
setupPwaInstall();
renderAll();
