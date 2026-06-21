const STORAGE_KEY = "shadowsystem-ai-state-v2";
const OLD_STORAGE_KEY = "forgefit-ai-state-v1";
const VAULT_DB = "shadowsystem-data-vault";
const VAULT_STORE = "snapshots";
const VAULT_STATE_KEY = "latest-state";

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
    goals: ["fat-loss"],
    experience: "beginner",
    daysPerWeek: 4,
    sessionLength: 45,
    equipment: ["bodyweight"],
    diet: "balanced",
    foodCulture: "indian",
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
    chest: ["Incline Push-Up", "Incline Push-Up Medium", "Incline Push-Up Wide", "Decline Push-Up", "Push Up to Side Plank"],
    back: ["Superman", "Inverted Row", "Hyperextensions (Back Extensions)", "Band Pull Apart", "Face Pull"],
    legs: ["Bodyweight Squat", "Box Squat", "Bodyweight Walking Lunge", "Split Squats", "Single Leg Glute Bridge"],
    shoulders: ["Handstand Push-Ups", "Push Up to Side Plank", "Arm Circles", "Bear Crawl Sled Drags", "Back Flyes - With Bands"],
    arms: ["Incline Push-Up Close-Grip", "Bench Dips", "Standing Biceps Cable Curl", "Preacher Curl", "Triceps Pushdown"],
    core: ["Dead Bug", "Plank", "Push Up to Side Plank", "Cable Reverse Crunch", "Sit-Up"],
    conditioning: ["Mountain Climbers", "Alternate Leg Diagonal Bound", "Step-up with Knee Raise", "Walking, Treadmill", "Power Stairs"],
    mobility: ["World's Greatest Stretch", "Kneeling Hip Flexor", "Chair Upper Body Stretch", "90/90 Hamstring", "Cat Stretch"]
  },
  dumbbells: {
    chest: ["Dumbbell Floor Press", "Incline Dumbbell Press", "Dumbbell Flyes", "One-Arm Flat Bench Dumbbell Flye", "Close-Grip Push-Up off of a Dumbbell"],
    back: ["One-Arm Dumbbell Row", "Straight-Arm Dumbbell Pullover", "Dumbbell Lying Rear Lateral Raise", "Alternating Renegade Row", "Inverted Row"],
    legs: ["Goblet Squat", "Romanian Deadlift", "Dumbbell Lunges", "Step-up with Knee Raise", "Rocking Standing Calf Raise"],
    shoulders: ["Dumbbell Shoulder Press", "Arnold Dumbbell Press", "Dumbbell One-Arm Shoulder Press", "Dumbbell Lying Rear Lateral Raise", "Alternating Deltoid Raise"],
    arms: ["Hammer Curls", "Dumbbell One-Arm Triceps Extension", "Zottman Preacher Curl", "Dumbbell Floor Press", "Tricep Dumbbell Kickback"],
    core: ["Farmers Walk", "Dead Bug", "Russian Twist", "Alternating Renegade Row", "Weighted Sit-Ups - With Bands"],
    conditioning: ["One-Arm Kettlebell Swings", "Farmers Walk", "Dumbbell Lunges", "Step-up with Knee Raise", "Kettlebell Thruster"],
    mobility: ["Calf Stretch Hands Against Wall", "90/90 Hamstring", "Straight-Arm Dumbbell Pullover", "Chair Upper Body Stretch"]
  },
  gym: {
    chest: ["Barbell Bench Press - Medium Grip", "Incline Dumbbell Press", "Flat Bench Cable Flyes", "Leverage Chest Press", "Cable Chest Press"],
    back: ["Wide-Grip Lat Pulldown", "Seated Cable Rows", "Band Assisted Pull-Up", "Elevated Cable Rows", "Face Pull"],
    legs: ["Leg Press", "Romanian Deadlift", "Lying Leg Curls", "Dumbbell Lunges", "Smith Machine Calf Raise"],
    shoulders: ["Dumbbell Shoulder Press", "Cable Seated Lateral Raise", "Dumbbell Lying Rear Lateral Raise", "Leverage Shoulder Press", "Upright Cable Row"],
    arms: ["Standing Biceps Cable Curl", "Triceps Pushdown - Rope Attachment", "Preacher Curl", "Dips - Triceps Version", "Hammer Curls"],
    core: ["Cable Crunch", "Hanging Leg Raise", "Pallof Press", "Hyperextensions (Back Extensions)", "Plank"],
    conditioning: ["Walking, Treadmill", "Rowing, Stationary", "Recumbent Bike", "Sled Push", "Stairmaster"],
    mobility: ["Kneeling Hip Flexor", "Band Pull Apart", "Ankle Circles", "Hamstring Stretch"]
  },
  bands: {
    chest: ["Bench Press - With Bands", "Cross Over - With Bands", "Reverse Band Bench Press", "Back Flyes - With Bands", "Band Pull Apart"],
    back: ["Band Assisted Pull-Up", "Band Pull Apart", "Back Flyes - With Bands", "Upright Row - With Bands", "Rack Pull with Bands"],
    legs: ["Squat with Bands", "Box Squat with Bands", "Band Good Morning", "Deadlift with Bands", "Band Hip Adductions"],
    shoulders: ["Shoulder Press - With Bands", "Lateral Raise - With Bands", "External Rotation with Band", "Internal Rotation with Band", "Upright Row - With Bands"],
    arms: ["Close-Grip EZ-Bar Curl with Band", "Band Skull Crusher", "Speed Band Overhead Triceps", "Reverse Cable Curl", "Band Pull Apart"],
    core: ["Weighted Sit-Ups - With Bands", "Pallof Press", "Pallof Press With Rotation", "Band Pull Apart", "Standing Cable Wood Chop"],
    conditioning: ["Squats - With Bands", "Band Good Morning (Pull Through)", "Hip Extension with Bands", "Calf Raises - With Bands", "Band Pull Apart"],
    mobility: ["Band Pull Apart", "External Rotation with Band", "IT Band and Glute Stretch", "Hip Flexion with Band", "Cat Stretch"]
  }
};

const splitTemplates = {
  2: ["Upper Body Matrix", "Lower Body Matrix"],
  3: ["Chest Burst + Triceps", "Shadow Row + Biceps", "Monarch Stance + Core"],
  4: ["Chest Burst + Triceps", "Shadow Row + Biceps", "Leg Overdrive", "Shoulder Catalyst + Core"],
  5: ["Chest Obliteration", "Shadow Guild Back", "Titan Legs", "Monarch Shoulders", "Absolute Arms + Core"],
  6: ["Chest Burst", "Shadow Row", "Titan Legs", "Shoulder Catalyst", "Cardio Overdrive", "System Recovery Protocols"]
};

const splitParts = {
  "Upper Body Matrix": ["chest", "back", "shoulders", "arms"],
  "Lower Body Matrix": ["legs", "core"],
  "Chest Burst + Triceps": ["chest", "arms"],
  "Shadow Row + Biceps": ["back", "arms"],
  "Monarch Stance + Core": ["legs", "core"],
  "Leg Overdrive": ["legs"],
  "Shoulder Catalyst + Core": ["shoulders", "core"],
  "Chest Obliteration": ["chest"],
  "Shadow Guild Back": ["back"],
  "Monarch Shoulders": ["shoulders"],
  "Absolute Arms + Core": ["arms", "core"],
  "Cardio Overdrive": ["core", "conditioning"],
  "System Recovery Protocols": ["mobility", "core"]
};

const cultureRecipes = {
  indian: [
    ["Paneer/Tofu Tikka Catalyst Plate", "Paneer or tofu, capsicum, onion, mint chutney, salad", "High-protein recovery fuel designed for fast status adjustments."],
    ["Dal Rice Reinvigoration Bowl", "Dal, rice, curd or soy curd, cucumber, pickle", "Re-synthesizes core carbohydrate indices post dungeon clears."],
    ["Chana Spinach Roti Wrap Bundle", "Chickpeas, spinach, roti, onion, lemon, spices", "High-fiber micro-nutrient buffer to maintain absolute discipline."]
  ],
  mediterranean: [
    ["Greek Hunter Protein Bowl", "Chicken or falafel, hummus, cucumber, tomato, rice, yogurt sauce", "Perfect macros split for long instances."],
    ["Tuna/Chickpea Ethereal Pita Pocket", "Tuna or chickpeas, pita, olives, greens, lemon", "Fast-absorbing fats and lean parameters."],
    ["Lentil Feta Fortification Plate", "Lentils, feta or tofu, roasted vegetables, olive oil", "Restores compromised muscle vitality profiles."]
  ],
  "east-asian": [
    ["Teriyaki Tofu Core Energy Bowl", "Tofu or chicken, rice, broccoli, sesame, light teriyaki", "Clean clean starches to replenish dynamic stamina matrices."],
    ["Egg Fried Rice Status Upgrade", "Egg or tofu, rice, peas, carrot, spring onion", "Rapid synthesis macro plate for immediate consumption."],
    ["Miso Noodle Elixir Soup", "Noodles, tofu, mushrooms, greens, miso broth", "Hydrating recovery fluid rich in trace elements."]
  ]
};

const easyMealBank = {
  indian: {
    breakfast: ["Paneer bhurji toast", "Moong dal chilla", "Greek curd fruit bowl", "Tofu bhurji roti"],
    lunch: ["Dal rice bowl", "Chana roti plate", "Chicken tikka rice bowl", "Rajma quinoa bowl"],
    snack: ["Roasted chana", "Protein lassi", "Sprouts chaat", "Peanut banana curd"],
    dinner: ["Paneer tikka salad", "Egg curry bowl", "Soy chunk pulao", "Fish curry plate"]
  },
  mediterranean: {
    breakfast: ["Greek yogurt oats", "Egg pita pocket", "Hummus toast", "Tofu scramble pita"],
    lunch: ["Chicken hummus bowl", "Falafel rice bowl", "Tuna chickpea salad", "Lentil feta plate"],
    snack: ["Cottage cheese fruit", "Hummus veggie sticks", "Protein yogurt", "Roasted chickpeas"],
    dinner: ["Shawarma salad plate", "Turkey rice bowl", "Lentil soup bowl", "Tofu kebab plate"]
  },
  "east-asian": {
    breakfast: ["Egg fried rice cup", "Tofu rice bowl", "Soy milk oats", "Miso egg soup"],
    lunch: ["Teriyaki tofu bowl", "Chicken broccoli rice", "Soba protein bowl", "Edamame rice plate"],
    snack: ["Edamame cup", "Soy yogurt", "Tuna rice cakes", "Tofu cubes"],
    dinner: ["Miso noodle soup", "Stir-fry tofu rice", "Chicken lettuce bowl", "Mushroom tofu bowl"]
  },
  mexican: {
    breakfast: ["Egg taco plate", "Bean breakfast bowl", "Tofu salsa scramble", "Greek yogurt berries"],
    lunch: ["Burrito power bowl", "Black bean rice bowl", "Chicken fajita plate", "Tofu taco bowl"],
    snack: ["Bean dip cups", "Protein yogurt", "Roasted corn chaat", "Cottage cheese salsa"],
    dinner: ["Fajita salad plate", "Turkey taco rice", "Bean quinoa bowl", "Tofu lettuce tacos"]
  },
  "middle-eastern": {
    breakfast: ["Labneh toast", "Egg shakshuka bowl", "Hummus pita plate", "Tofu shakshuka"],
    lunch: ["Shawarma rice plate", "Falafel hummus bowl", "Mujadara bowl", "Chicken tabbouleh plate"],
    snack: ["Hummus carrots", "Roasted chickpeas", "Yogurt cucumber bowl", "Tahini protein toast"],
    dinner: ["Kebab salad bowl", "Lentil rice plate", "Tofu shawarma wrap", "Chickpea stew"]
  },
  western: {
    breakfast: ["Protein oats", "Egg avocado toast", "Cottage cheese bowl", "Tofu scramble toast"],
    lunch: ["Chicken potato plate", "Turkey burger bowl", "Tuna pasta salad", "Tofu quinoa bowl"],
    snack: ["Protein shake", "Greek yogurt berries", "Boiled eggs", "Peanut apple slices"],
    dinner: ["Chicken rice dinner", "Salmon potato plate", "Bean chili bowl", "Tofu veggie skillet"]
  }
};

const postureCues = {
  Chest: ["Maintain absolute rigid posture", "Stack hands right beneath shoulders", "Lower into the dungeon with control"],
  Back: ["Keep standard shoulder proud configuration", "Force your elbows behind your back plane", "Prevent dynamic shrugging faults"],
  Legs: ["Enforce knees tracking outward line", "Brace your abdominal energy sphere", "Press explicitly from your heels"],
  Shoulders: ["Suppress ribs expansion", "Press upward without jerking", "Decompress neck column completely"],
  Arms: ["Anchor upper arm coordinates firmly", "Retain continuous eccentric loading parameters", "Keep wrist axis fully neutral"],
  Core: ["Compress core layers outwards", "Retain horizontal hip orientation", "Enforce slow rhythmic exhalation"],
  Conditioning: ["Buffer deceleration impact with soft knees", "Muffle surface contact noises", "Retain static pacing control"],
  Mobility: ["Progress into deep arrays without deceleration", "Cease alignment instantly upon pain metrics", "Expand breath duration length"]
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
    const profile = { ...structuredClone(defaultState.profile), ...(parsed.profile || {}) };
    if (!Array.isArray(profile.goals)) profile.goals = [profile.goal || "fat-loss"];
    if (!Array.isArray(profile.equipment)) profile.equipment = [profile.equipment || "bodyweight"];
    delete profile.goal;
    return {
      ...structuredClone(defaultState),
      ...parsed,
      user: { ...structuredClone(defaultState.user), ...(parsed.user || {}) },
      profile
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  saveStateToVault(state);
}

function normalizeState(rawState) {
  const parsed = rawState || {};
  const profile = { ...structuredClone(defaultState.profile), ...(parsed.profile || {}) };
  if (!Array.isArray(profile.goals)) profile.goals = [profile.goal || "fat-loss"];
  if (!Array.isArray(profile.equipment)) profile.equipment = [profile.equipment || "bodyweight"];
  delete profile.goal;
  return {
    ...structuredClone(defaultState),
    ...parsed,
    user: { ...structuredClone(defaultState.user), ...(parsed.user || {}) },
    profile,
    logs: Array.isArray(parsed.logs) ? parsed.logs : []
  };
}

function openVault() {
  if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB is not available"));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(VAULT_DB, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(VAULT_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveStateToVault(snapshot) {
  try {
    const db = await openVault();
    const tx = db.transaction(VAULT_STORE, "readwrite");
    tx.objectStore(VAULT_STORE).put({
      savedAt: new Date().toISOString(),
      state: snapshot
    }, VAULT_STATE_KEY);
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  } catch {
    // Local fallback
  }
}

async function loadStateFromVault() {
  const db = await openVault();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(VAULT_STORE, "readonly");
    const request = tx.objectStore(VAULT_STORE).get(VAULT_STATE_KEY);
    request.onsuccess = () => {
      db.close();
      resolve(request.result || null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

async function restoreVaultIfNeeded() {
  if (localStorage.getItem(STORAGE_KEY)) return;
  try {
    const backup = await loadStateFromVault();
    if (!backup?.state) return;
    state = normalizeState(backup.state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderAll();
    showToast("Status matrix restored from systemic vault archives.");
  } catch {
    // Vault silent bypass
  }
}

function updateVaultStatus(message) {
  const status = $("#vaultStatus");
  if (status) status.textContent = message;
}

function downloadDataBackup() {
  const payload = {
    app: "ShadowSystem",
    version: 2,
    exportedAt: new Date().toISOString(),
    state
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `shadowsystem-snapshot-${todayKey()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  updateVaultStatus(`Node successfully extracted ${new Date().toLocaleTimeString()}.`);
  showToast("Cryptographic system node exported successfully.");
}

function restoreDataBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      state = normalizeState(parsed.state || parsed);
      saveState();
      renderAll();
      updateVaultStatus("Cryptographic backup injected correctly.");
      showToast("Hunter profile records overwritten successfully.");
    } catch {
      updateVaultStatus("Injection failure. File corrupted.");
      showToast("Corrupted node file structure.");
    }
  };
  reader.readAsText(file);
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

function listLabels(values = []) {
  return values.map(titleCase).join(", ");
}

function primaryGoal() {
  return state.profile.goals?.[0] || "fat-loss";
}

function selectedCheckboxValues(name) {
  const values = $$(`input[name="${name}"]:checked`).map((input) => input.value);
  return values.length ? values : name.toLowerCase().includes("equipment") ? ["bodyweight"] : ["fat-loss"];
}

function setCheckboxValues(name, values = []) {
  $$(`input[name="${name}"]`).forEach((input) => {
    input.checked = values.includes(input.value);
  });
}

function initials(name) {
  return (name || "Shadow").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
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
  const goals = state.profile.goals || ["fat-loss"];
  const goalAdjust = goals.includes("fat-loss") ? -400 : goals.includes("muscle") ? 300 : goals.includes("strength") ? 180 : goals.includes("endurance") ? 140 : 0;
  const calories = Math.round((bmr() * activity + goalAdjust) / 25) * 25;
  const proteinMultiplier = goals.includes("muscle") || goals.includes("strength") ? 2 : 1.65;
  const protein = Math.round(Number(state.profile.currentWeight) * proteinMultiplier);
  const fats = Math.round(Number(state.profile.currentWeight) * (state.profile.diet === "low-carb" ? 1 : 0.75));
  const carbCalories = Math.max(350, calories - protein * 4 - fats * 9);
  const carbs = state.profile.diet === "low-carb" ? "80-130g" : `${Math.round(carbCalories / 4)}g`;
  return { calories, protein, fats, carbs };
}

function mealProteinSplit(totalProtein) {
  return {
    breakfast: Math.round(totalProtein * 0.25),
    lunch: Math.round(totalProtein * 0.35),
    snack: Math.round(totalProtein * 0.15),
    dinner: Math.round(totalProtein * 0.25)
  };
}

function adaptDishName(dish) {
  let adjusted = dish;
  if (state.profile.diet === "vegan") {
    adjusted = adjusted
      .replace("Chicken", "Tofu")
      .replace("Turkey", "Tofu")
      .replace("Tuna", "Chickpea")
      .replace("Fish", "Tofu")
      .replace("Salmon", "Tofu")
      .replace("Egg", "Tofu")
      .replace("Greek curd", "Soy curd")
      .replace("Greek yogurt", "Soy yogurt")
      .replace("Cottage cheese", "Tofu");
  }
  if (state.profile.diet === "vegetarian") {
    adjusted = adjusted
      .replace("Chicken", "Paneer")
      .replace("Turkey", "Paneer")
      .replace("Tuna", "Chickpea")
      .replace("Fish", "Paneer")
      .replace("Salmon", "Paneer");
  }
  if (state.profile.diet === "low-carb") {
    adjusted = adjusted
      .replace("rice", "salad")
      .replace("Rice", "Salad")
      .replace("pasta", "zoodles")
      .replace("Pasta", "Zoodles")
      .replace("roti", "low-carb roti")
      .replace("Roti", "Low-carb roti");
  }
  return adjusted;
}

function buildMealPlan() {
  const targets = nutritionTargets();
  const split = mealProteinSplit(targets.protein);
  const culture = easyMealBank[state.profile.foodCulture] || easyMealBank.indian;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const meals = ["breakfast", "lunch", "snack", "dinner"];
  return days.map((day, dayIndex) => ({
    day,
    totalProtein: targets.protein,
    meals: meals.map((meal, mealIndex) => {
      const dishes = culture[meal];
      const dish = adaptDishName(dishes[(dayIndex + mealIndex + state.planSeed) % dishes.length]);
      return {
        meal: titleCase(meal),
        dish,
        protein: split[meal],
        type: meal,
        prep: meal === "snack" ? "5 min" : meal === "breakfast" ? "10-15 min" : "20 min"
      };
    })
  }));
}

function focusMuscles(part) {
  const map = {
    Chest: ["Pectorals", "Triceps Orb", "Front Shoulder Axis"],
    Back: ["Latissimus", "Rhomboids", "Biceps Core"],
    Legs: ["Quadriceps", "Gluteal Ring", "Hamstrings"],
    Shoulders: ["Deltoids Shield", "Trapezius Nodes", "Abdominal Shield"],
    Arms: ["Biceps Catalyst", "Triceps Extension", "Forearm Grips"],
    Core: ["Rectus Core", "Oblique Stabilizers", "Spinal Guard"],
    Conditioning: ["Cardiac Rhythm", "Leg Drive", "Core Lock"],
    Mobility: ["Pelvic Ring", "Spinal Flow", "Shoulder Axis"]
  };
  return map[part] || ["Full System Alignment", "Core Lock", "Kinetic Sync"];
}

function movementPattern(move) {
  const name = move.name.toLowerCase();
  if (/push|press|fly|chest/.test(name) && !/overhead|shoulder|leg|pallof/.test(name)) return "Push-up / Chest Press";
  if (/row|pulldown|pull-up|pull.apart|face pull|swimmer|snow angel|superman/.test(name)) return "Row / Back Pull";
  if (/squat|leg press|wall sit/.test(name)) return "Squat";
  if (/lunge|split|step-up/.test(name)) return "Lunge / Step-up";
  if (/deadlift|good morning|glute bridge|hip/.test(name)) return "Hip Hinge / Glutes";
  if (/shoulder|overhead|arnold|lateral|front raise|pike|handstand|y raise/.test(name)) return "Overhead / Shoulder";
  if (/curl|triceps|dip|kickback|extension/.test(name)) return "Arms";
  if (/plank|dead bug|crunch|twist|sit-up|hollow|pallof|wood chop|carry/.test(name)) return "Core Brace";
  if (/stretch|mobility|rotation|90\/90|cat cow|opener|floss|hold/.test(name)) return "Mobility";
  if (/knee|climber|skater|thrust|bike|row erg|treadmill|sled|stair|shuffle|march|swing/.test(name)) return "Cardio";
  return move.part;
}

function postureSvg(move, accent) {
  const pattern = movementPattern(move);
  const commonDefs = `
    <defs>
      <marker id="arrow-${pattern.replaceAll(" ", "-").replaceAll("/", "")}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${accent}"></path>
      </marker>
    </defs>
  `;
  const arrow = `url(#arrow-${pattern.replaceAll(" ", "-").replaceAll("/", "")})`;
  const poses = {
    "Push-up / Chest Press": `
      <text x="24" y="28" class="pose-title">Push-up Alignment</text>
      <line x1="46" y1="142" x2="218" y2="112" class="guide-line"></line>
      <circle cx="218" cy="106" r="14" class="body-dark"></circle>
      <path d="M204 112 L148 122 L88 132" class="body-line thick"></path>
      <path d="M158 121 L132 158" class="body-line"></path>
      <path d="M146 123 L126 86" class="body-line"></path>
      <path d="M89 132 L58 162" class="body-line"></path>
      <path d="M86 132 L48 104" class="body-line"></path>
      <ellipse cx="156" cy="122" rx="22" ry="14" fill="${accent}" opacity="0.92"></ellipse>
      <path d="M152 88 C136 98 132 112 134 130" class="action-arrow" marker-end="${arrow}"></path>
      <text x="30" y="194" class="pose-note">Lock vector: Head, spine, heels</text>
    `,
    "Core Brace": `
      <text x="24" y="28" class="pose-title">Plank Energy Matrix</text>
      <line x1="52" y1="122" x2="218" y2="96" class="guide-line"></line>
      <circle cx="218" cy="90" r="13" class="body-dark"></circle>
      <path d="M206 96 L146 108 L84 120" class="body-line thick"></path>
      <path d="M150 108 L126 146" class="body-line"></path>
      <path d="M86 120 L50 150" class="body-line"></path>
      <rect x="126" y="98" width="46" height="24" rx="10" fill="${accent}" opacity="0.95" transform="rotate(-10 149 110)"></rect>
      <path d="M134 78 C126 96 126 116 134 136" class="action-arrow" marker-end="${arrow}"></path>
      <text x="28" y="194" class="pose-note">Stabilize core ring; restrict hip deflection</text>
    `
  };

  return `
    <svg class="pose-svg" viewBox="0 0 264 220" role="img" aria-label="${move.part} alignment layout">
      ${commonDefs}
      <rect x="0" y="0" width="264" height="220" rx="14" fill="#060914"></rect>
      <rect x="18" y="168" width="228" height="12" rx="6" fill="#1b233e"></rect>
      ${poses[pattern] || poses["Core Brace"]}
    </svg>
  `;
}

function exerciseVisual(move) {
  const focus = focusMuscles(move.part);
  const cues = postureCues[move.part] || postureCues.Core;
  const accent = move.part === "Legs" ? "#f0c15f" : move.part === "Back" ? "#00d4ff" : move.part === "Core" ? "#7b4dff" : "#ff4f7d";
  return `
    <div class="exercise-visual" aria-label="System optimization vectors for ${move.name}">
      ${postureSvg(move, accent)}
      <div class="focus-row">${focus.map((item) => `<span>${item}</span>`).join("")}</div>
      <ul>${cues.map((cue) => `<li>${cue}</li>`).join("")}</ul>
    </div>
  `;
}

function mealPicture(meal) {
  const photo = foodPhotoFor(meal.dish, meal.type);
  return `
    <div class="meal-picture" aria-label="${meal.dish} formula snapshot">
      <img src="${photo}" alt="${meal.dish}" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('.meal-picture').classList.add('image-failed'); this.remove();" />
    </div>
  `;
}

function foodPhotoFor(name = "", type = "meal") {
  const dish = name.toLowerCase();
  const matches = [
    [/paneer|tikka|shawarma|kebab|chicken|fish|salmon/, "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80"],
    [/dal|rajma|curry|chana|chickpea|mujadara|lentil|stew/, "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80"],
    [/rice|fried rice|teriyaki|soba|miso|noodle|tofu/, "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80"]
  ];
  const found = matches.find(([pattern]) => pattern.test(dish));
  if (found) return found[1];
  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80";
}

function recipePhoto(name) {
  return foodPhotoFor(name, "lunch");
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
  const { daysPerWeek, sessionLength, experience } = state.profile;
  const goals = state.profile.goals || ["fat-loss"];
  const equipmentList = state.profile.equipment || ["bodyweight"];
  const limited = hasJointLimit();
  const intensity = experience === "advanced" ? "5 loops" : experience === "intermediate" ? "4 loops" : "3 loops";
  const reps = goals.includes("strength") ? "5-8 dynamic reps" : goals.includes("endurance") ? "45 sec static hold" : "8-12 standardized reps";
  const split = splitTemplates[Number(daysPerWeek)] || splitTemplates[4];

  return Array.from({ length: Number(daysPerWeek) }, (_, index) => {
    const theme = split[index];
    const parts = splitParts[theme] || ["chest", "back", "legs"];
    const moves = [];
    parts.forEach((part, partIndex) => {
      const equipmentKey = equipmentList[(index + partIndex + state.planSeed) % equipmentList.length] || "bodyweight";
      const pool = exerciseLibrary[equipmentKey] || exerciseLibrary.bodyweight;
      const source = pool[part] || pool.conditioning;
      const moveCount = parts.length > 2 ? 2 : part === "mobility" ? 4 : 3;
      Array.from({ length: moveCount }, (_, moveIndex) => {
        let name = source[(moveIndex + index + partIndex + state.planSeed) % source.length];
        if (limited) {
          name = name.replace("Decline Push-Up", "Incline Push-Up").replace("Dumbbell Lunges", "Step-up with Knee Raise");
        }
        const dose = part === "mobility" ? "60 sec activation" : part === "conditioning" ? "35 sec burst / 25 sec static rest" : reps;
        moves.push({ name, dose, part: titleCase(part), equipment: titleCase(equipmentKey) });
      });
    });
    const trimmedMoves = moves.slice(0, theme.includes("Recovery") ? 4 : 6);
    return {
      day: `Gate ${index + 1}`,
      title: theme,
      duration: `${sessionLength} min`,
      intensity: limited ? `${intensity}, structural shield engaged` : intensity,
      focus: goals.join(", "),
      bodyParts: parts.map(titleCase).join(", "),
      moves: trimmedMoves,
      finisher: theme.includes("Recovery") ? "5 min spatial breathing control" : "8 min absolute metabolic dump"
    };
  });
}

function getMotivation() {
  const streak = getStreak();
  const name = state.user.name ? state.user.name.split(" ")[0] : "Hunter";
  return streak > 1 ? `Directive active, ${name}. Your streak stands at ${streak} days. Advance forward.` : `Quest notice dispatched. Complete your routine or face immediate System penalty cascades.`;
}

function questNotificationMessage() {
  return "System Alert: Gates have manifested. Engage your structural routines, input protein arrays, and defend your level configuration.";
}

function renderProfile() {
  const photo = $("#profilePhoto");
  photo.textContent = initials(state.user.name);
  photo.style.backgroundImage = state.user.photo ? `url("${state.user.photo}")` : "";
  photo.classList.toggle("has-image", Boolean(state.user.photo));
  $("#profileCaption").textContent = state.user.name ? `${state.user.name} - Rank Builder` : "Architect AI Interface";
}

function renderDashboard() {
  const metrics = calculateMetrics();
  const plan = buildWorkoutPlan();
  const todayWorkout = plan[activeWorkoutOffset % plan.length];
  const now = new Date();
  const today = getTodayLog();

  $("#todayLabel").textContent = now.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  $("#dailyHeadline").textContent = getMotivation();
  $("#coachMessage").textContent = `Directives Mapping for ${state.user.name || "Identified Subject"}`;
  $("#coachDetail").textContent = `Subject Configuration: ${state.profile.age} yrs, ${state.profile.height} cm, Mass: ${state.profile.currentWeight} kg -> Target Node: ${state.profile.targetWeight} kg. Strategy arrays: ${listLabels(state.profile.equipment)}.`;
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
  $(".score-ring").style.background = `conic-gradient(var(--accent-2) ${metrics.readiness}%, rgba(255,255,255,0.08) 0)`;
  $("#readinessText").textContent = metrics.readiness > 80 ? "Monarch matrix fully stabilized. Increase intensity." : "Standard operation parameters clear.";
  $("#checkinStatus").textContent = today?.sleep || today?.water || today?.soreness ? "Array Saved" : "Awaiting Data Vitals";

  const streak = getStreak();
  $("#streakDays").textContent = `${streak} Gate${streak === 1 ? "" : "s"}`;

  renderWorkoutBlock($("#todayWorkout"), todayWorkout);
  renderCoachNotes(metrics);
}

function renderWorkoutBlock(container, workout) {
  if(!workout) return;
  container.innerHTML = `
    <div>
      <p class="eyebrow">${workout.day}</p>
      <h3>${workout.title}</h3>
      <div class="workout-meta">
        <span class="tag">${workout.duration}</span>
        <span class="tag">${workout.intensity}</span>
        <span class="tag">${workout.bodyParts}</span>
      </div>
    </div>
    <ul class="exercise-list">
      ${workout.moves.map((move) => `
        <li>
          <strong>${move.name}</strong><br><span>${move.part} Axis - Armed with ${move.equipment} - Matrix: ${move.dose}</span>
          ${exerciseVisual(move)}
        </li>
      `).join("")}
      <li><strong>Final Surge Phase</strong><br><span>${workout.finisher}</span></li>
    </ul>
  `;
}

function renderCoachNotes(metrics) {
  const notes = [
    `${state.profile.daysPerWeek - metrics.weeklyDone} gate structures left to stabilize this cycle.`,
    metrics.discipline >= 75 ? "Synergy parameters high. Level scale ready." : "Inertia warning. Bypassing gates invokes stat deterioration.",
    `Synthesis requirements: ${metrics.targets.calories} Kcal fuel / ${metrics.targets.protein}g protein catalysts.`
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
        <span class="tag">${workout.bodyParts}</span>
      </div>
      <ul class="exercise-list">
        ${workout.moves.map((move) => `
          <li>
            <strong>${move.name}</strong><br><span>${move.part} - Array: ${move.dose}</span>
          </li>
        `).join("")}
      </ul>
    </article>
  `).join("");
}

function renderNutrition() {
  const targets = nutritionTargets();
  $("#nutritionTargets").innerHTML = [
    ["Energy Buffer", `${targets.calories} Kcal`],
    ["Protein Base", `${targets.protein}g`],
    ["Carb Split", targets.carbs],
    ["Lipid Layer", `${targets.fats}g`]
  ].map(([label, value]) => `<div class="target-box"><span class="label">${label}</span><strong>${value}</strong></div>`).join("");

  $("#nutritionTips").innerHTML = `<li>Enforce absolute macro profiles to maintain status updates.</li><li>Hydrate systematically to remove muscle fatigue matrix accumulation.</li>`;
  
  // Minimal placeholder implementation for recipes grids
  $("#recipeGrid").innerHTML = `<div class="recipe-card"><h3>Alchemical Protein Wrap</h3><p>Optimized for rapid amino delivery post dungeon gates.</p></div>`;
  $("#mealPlanGrid").innerHTML = `<div class="meal-day"><strong>Macro Alignment Day</strong><p>Targeting ${targets.protein}g split sequentially.</p></div>`;
}

function renderLogs() {
  const logs = [...state.logs].reverse().slice(0, 8);
  $("#logList").innerHTML = logs.length
    ? logs.map((log) => `<div class="log-item"><strong>${log.date}</strong> - Clearance: ${log.workoutDone ? "Success" : "Checkin Only"} | Catalyst: ${log.protein}g</div>`).join("")
    : `<div class="log-item">No tracking records saved inside the localized core yet.</div>`;
  drawWeightChart();
}

function drawWeightChart() {
  const canvas = $("#weightChart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#070b18";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "var(--muted)";
  ctx.font = "14px monospace";
  ctx.fillText("System Graph Engine Active. Logging coordinates sequentially.", 30, 100);
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
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3000);
}

function setupPwaInstall() {
  // Retained for framework consistency
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

function switchView(viewName) {
  $$(".tab, .mobile-tab").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
  $$(".view").forEach((view) => view.classList.toggle("active-view", view.id === viewName));
}

async function applySetup(prefix) {
  state.user = {
    name: $(`#${prefix}Name`)?.value || $("#name")?.value || state.user.name,
    email: $(`#${prefix}Email`)?.value || $("#email")?.value || state.user.email,
    photo: ""
  };
  state.profile = {
    ...state.profile,
    age: Number($(`#${prefix}Age`)?.value || $("#age")?.value || state.profile.age),
    gender: $(`#${prefix}Gender`)?.value || $("#gender")?.value || state.profile.gender,
    height: Number($(`#${prefix}Height`)?.value || $("#height")?.value || state.profile.height),
    goals: selectedCheckboxValues(prefix ? "setupGoals" : "goals"),
    experience: $(`#${prefix}Experience`)?.value || $("#experience")?.value || state.profile.experience,
    daysPerWeek: Number($(`#${prefix}DaysPerWeek`)?.value || $("#daysPerWeek")?.value || state.profile.daysPerWeek),
    equipment: selectedCheckboxValues(prefix ? "setupEquipment" : "equipment"),
    diet: $(`#${prefix}Diet`)?.value || $("#diet")?.value || state.profile.diet,
    foodCulture: $(`#${prefix}FoodCulture`)?.value || $("#foodCulture")?.value || state.profile.foodCulture,
    currentWeight: Number($(`#${prefix}CurrentWeight`)?.value || $("#currentWeight")?.value || state.profile.currentWeight),
    targetWeight: Number($(`#${prefix}TargetWeight`)?.value || $("#targetWeight")?.value || state.profile.targetWeight),
    injuries: $(`#${prefix}Injuries`)?.value || $("#injuries")?.value || state.profile.injuries,
    avoidFoods: $(`#${prefix}AvoidFoods`)?.value || $("#avoidFoods")?.value || state.profile.avoidFoods
  };
  state.onboarded = true;
  state.planSeed += 1;
  saveState();
  renderAll();
}

// ===================================================
// DYNAMIC rule-based SOLO LEVELING INTERACTIVE FITNESS AI ENGINE
// ===================================================
function initSystemAiEngine() {
  const aiForm = document.getElementById("systemAiChatForm");
  const aiInput = document.getElementById("systemAiChatInput");
  const aiBox = document.getElementById("systemAiChatBox");

  if (!aiForm || !aiInput || !aiBox) return;

  aiForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const message = aiInput.value.trim();
    if (!message) return;

    // Append Hunter Message
    appendLog("HUNTER", message, "#fff");
    aiInput.value = "";

    // Parse and respond via System Interface Core
    setTimeout(() => {
      const response = processSystemQuery(message.toLowerCase());
      appendLog("SYSTEM", response, "var(--accent-2)");
    }, 350);
  });

  function appendLog(sender, txt, color) {
    const log = document.createElement("div");
    log.style.marginBottom = "6px";
    log.innerHTML = `<span style="color: ${color}; font-weight: bold;">[${sender}]:</span> <span style="color: #cdd8f4;">${txt}</span>`;
    aiBox.appendChild(log);
    aiBox.scrollTop = aiBox.scrollHeight;
  }

  function processSystemQuery(query) {
    const targets = nutritionTargets();
    if (query.includes("chest") || query.includes("pushup") || query.includes("press")) {
      return "QUEST PARAMS OPTIMIZED: For target Pectorals, maximize time under tension during push-up variants. Control deceleration loop (3s) to rupture E-Rank constraints safely.";
    }
    if (query.includes("sore") || query.includes("pain") || query.includes("hurt") || query.includes("injury")) {
      return "🚨 CRITICAL WARNING (DEBUFF INTERCEPTED): Structural fatigue nodes detected. Do not override physical bounds. Swap your next deployment to 'System Recovery Protocols' and absorb 3L water fluid.";
    }
    if (query.includes("diet") || query.includes("protein") || query.includes("eat") || query.includes("food")) {
      return `ALCHEMICAL ASSIGNMENT: To stabilize current mass vector, target **${targets.protein}g Protein Catalyst** alongside an envelope of **${targets.calories} Kcal** daily matching preferred food profile: ${state.profile.foodCulture.toUpperCase()}.`;
    }
    if (query.includes("home") || query.includes("no gym")) {
      return "INSTANCE ROOM DIRECTIVE: Gym armor unneeded. Calibrate armaments to 'Pure Bodyweight'. Execute standard Squats, Plank structural locks, and Superman extensions within your instance boundary.";
    }
    if (query.includes("weight") || query.includes("fat") || query.includes("lose")) {
      return `STAT REGISTERED: Currently clocked at **${state.profile.currentWeight}kg** with target horizon set at **${state.profile.targetWeight}kg**. Consistency across requested ${state.profile.daysPerWeek} raids per week is mandatory to trigger conversion layers.`;
    }
    return `QUERY RESOLVED: To accelerate parameter amplification, prioritize your active Daily Quest gate structures, maintain form integrity, and record logs daily into the Status window.`;
  }
}

function bindEvents() {
  $$(".tab, .mobile-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });

  $("#onboardingForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await applySetup("setup");
    showToast("System setup complete. Status variables active.");
  });

  $("#settingsForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await applySetup("");
    showToast("Status calibration committed cleanly.");
  });

  $("#completeWorkoutButton").addEventListener("click", () => {
    saveTodayLog({ workoutDone: true });
    showToast("Daily Quest Conquered. Level coordinates expanding.");
  });

  $("#swapWorkoutButton").addEventListener("click", () => {
    activeWorkoutOffset += 1;
    renderDashboard();
    showToast("Dungeon coordinate matrix updated.");
  });

  $("#generatePlanButton").addEventListener("click", () => {
    state.planSeed += 1;
    saveState();
    renderAll();
    showToast("Fresh Instanced Gate parameters materialized.");
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
    showToast("Vitals locked to local system array block.");
  });
  
  if ($("#logEffort")) {
    $("#logEffort").addEventListener("input", () => {
      $("#effortValue").textContent = `${$("#logEffort").value} / 10`;
    });
  }

  initSystemAiEngine();
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  renderAll();
});

// Fallback execute instantly if already loaded
if (document.readyState === "interactive" || document.readyState === "complete") {
  bindEvents();
  renderAll();
}
