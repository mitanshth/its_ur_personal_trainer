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
    chest: ["Tempo push-ups", "Incline push-ups", "Wide push-ups", "Decline push-ups", "Push-up hold"],
    back: ["Prone swimmers", "Reverse snow angels", "Superman pulls", "Table rows", "Towel rows"],
    legs: ["Box squats", "Reverse lunges", "Split squats", "Glute bridges", "Wall sit"],
    shoulders: ["Pike push-ups", "Plank shoulder taps", "Wall handstand hold", "Arm circles", "Bear crawl hold"],
    arms: ["Close-grip push-ups", "Bench dips", "Towel curls", "Diamond push-ups", "Isometric curl hold"],
    core: ["Dead bugs", "Side plank", "Hollow hold", "Reverse crunches", "Plank reaches"],
    conditioning: ["High knees", "Mountain climbers", "Skater steps", "Squat thrusts", "Fast step-ups"],
    mobility: ["World's greatest stretch", "Hip flexor stretch", "Thoracic rotations", "Deep squat hold"]
  },
  dumbbells: {
    chest: ["Dumbbell floor press", "Dumbbell squeeze press", "Incline dumbbell press", "Dumbbell fly", "Push-up to dumbbell tap"],
    back: ["One-arm row", "Chest-supported row", "Dumbbell pullover", "Rear delt row", "Renegade row"],
    legs: ["Goblet squat", "Romanian deadlift", "Walking lunges", "Step-ups", "Calf raises"],
    shoulders: ["Half-kneeling press", "Lateral raises", "Arnold press", "Rear delt raises", "Front raises"],
    arms: ["Hammer curls", "Overhead triceps extension", "Zottman curls", "Close-grip floor press", "Kickbacks"],
    core: ["Suitcase carry", "Weighted dead bugs", "Russian twists", "Dumbbell plank pull-through", "Weighted sit-ups"],
    conditioning: ["Dumbbell swings", "Farmer carry march", "Reverse lunge to curl", "Dumbbell step-up", "Low-impact thruster"],
    mobility: ["Loaded calf stretch", "90/90 hip switches", "Pullover breathing", "Open-book rotations"]
  },
  gym: {
    chest: ["Bench press", "Incline dumbbell press", "Cable fly", "Chest press machine", "Push-ups"],
    back: ["Lat pulldown", "Cable row", "Assisted pull-ups", "Seated row", "Face pulls"],
    legs: ["Leg press", "Trap-bar deadlift", "Leg curl", "Walking lunges", "Calf raises"],
    shoulders: ["Machine shoulder press", "Cable lateral raises", "Rear delt fly", "Dumbbell press", "Upright row"],
    arms: ["Cable curls", "Rope pressdowns", "Preacher curls", "Triceps dips", "Hammer curls"],
    core: ["Cable crunches", "Hanging knee raises", "Pallof press", "Back extension", "Weighted plank"],
    conditioning: ["Incline treadmill intervals", "Row erg", "Bike intervals", "Sled push", "Stair climber"],
    mobility: ["Couch stretch", "Band shoulder opener", "Ankle rocks", "Hamstring floss"]
  },
  bands: {
    chest: ["Band chest press", "Band fly", "Incline push-ups", "Single-arm band press", "Close-grip band press"],
    back: ["Band row", "Band lat pulldown", "Band pull-aparts", "Single-arm band row", "Face pulls"],
    legs: ["Band squat", "Band good morning", "Band glute bridge", "Lateral band walks", "Band split squat"],
    shoulders: ["Band overhead press", "Band lateral raise", "Band front raise", "Band rear delt pull", "Band Y raise"],
    arms: ["Band curls", "Band triceps pressdown", "Hammer band curls", "Overhead band extension", "Reverse curls"],
    core: ["Pallof press", "Band wood chops", "Band dead bugs", "Standing anti-rotation hold", "Band plank row"],
    conditioning: ["Band thrusters", "Lateral shuffle", "Band-resisted march", "Squat to press", "Fast band rows"],
    mobility: ["Band shoulder opener", "Hip flexor stretch", "Lat stretch", "Cat cow"]
  }
};

const splitTemplates = {
  2: ["Upper Body", "Lower Body"],
  3: ["Chest + Triceps", "Back + Biceps", "Legs + Core"],
  4: ["Chest + Triceps", "Back + Biceps", "Legs", "Shoulders + Core"],
  5: ["Chest", "Back", "Legs", "Shoulders", "Arms + Core"],
  6: ["Chest + Triceps", "Back + Biceps", "Legs", "Shoulders", "Core + Conditioning", "Mobility + Recovery"]
};

const splitParts = {
  "Upper Body": ["chest", "back", "shoulders", "arms"],
  "Lower Body": ["legs", "core"],
  "Chest + Triceps": ["chest", "arms"],
  "Back + Biceps": ["back", "arms"],
  "Legs + Core": ["legs", "core"],
  Legs: ["legs"],
  "Shoulders + Core": ["shoulders", "core"],
  Chest: ["chest"],
  Back: ["back"],
  Shoulders: ["shoulders"],
  "Arms + Core": ["arms", "core"],
  "Core + Conditioning": ["core", "conditioning"],
  "Mobility + Recovery": ["mobility", "core"]
};

const cultureRecipes = {
  indian: [
    ["Paneer or tofu tikka plate", "Paneer or tofu, capsicum, onion, mint chutney, salad", "Indian-style high-protein dinner that can fit fat loss or muscle gain."],
    ["Dal rice training bowl", "Dal, rice, curd or soy curd, cucumber, pickle", "Simple recovery meal with carbs, protein, and familiar flavors."],
    ["Chana spinach roti wrap", "Chickpeas, spinach, roti, onion, lemon, spices", "Fiber-rich vegetarian meal for discipline and fullness."]
  ],
  mediterranean: [
    ["Greek protein bowl", "Chicken or falafel, hummus, cucumber, tomato, rice, yogurt sauce", "Balanced bowl with protein, fiber, and healthy fats."],
    ["Tuna or chickpea salad pita", "Tuna or chickpeas, pita, olives, greens, lemon", "Quick meal with steady energy and easy prep."],
    ["Lentil feta plate", "Lentils, feta or tofu, roasted vegetables, olive oil", "Good for recovery without feeling heavy."]
  ],
  "east-asian": [
    ["Teriyaki tofu rice bowl", "Tofu or chicken, rice, broccoli, sesame, light teriyaki", "Training-friendly carbs with lean protein."],
    ["Egg fried rice upgrade", "Egg or tofu, rice, peas, carrot, spring onion", "Easy high-protein version of a comfort meal."],
    ["Miso noodle soup", "Noodles, tofu, mushrooms, greens, miso broth", "Warm, filling, and easy to adjust for calories."]
  ],
  mexican: [
    ["Burrito power bowl", "Beans, rice, chicken or tofu, salsa, lettuce, avocado", "Strong meal prep option with flexible calories."],
    ["Egg taco breakfast", "Eggs or tofu, corn tortillas, salsa, peppers", "Fast breakfast with protein and flavor."],
    ["Black bean fajita plate", "Black beans, peppers, onion, rice, lime", "Budget-friendly and high in fiber."]
  ],
  "middle-eastern": [
    ["Shawarma protein plate", "Chicken or tofu, rice, cucumber, tahini, salad", "High-protein plate with satisfying spices."],
    ["Mujadara recovery bowl", "Lentils, rice, onion, yogurt or tahini, salad", "Good plant-protein meal for consistent weeks."],
    ["Falafel salad box", "Falafel, hummus, greens, tomato, pita", "Portable meal with fiber and carbs."]
  ],
  western: [
    ["Chicken potato plate", "Chicken, potato, green beans, yogurt sauce", "Simple lean protein and carbs for training."],
    ["Turkey or tofu burger bowl", "Turkey or tofu patty, rice, lettuce, tomato, pickles", "Burger flavor without losing structure."],
    ["Protein oats", "Oats, milk or soy milk, protein powder, berries", "Easy breakfast for busy mornings."]
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
  Chest: ["Straight body line", "Wrists under shoulders", "Lower with control"],
  Back: ["Tall chest", "Pull elbows back", "Do not shrug"],
  Legs: ["Knees track toes", "Brace core", "Full foot on floor"],
  Shoulders: ["Ribs down", "Press smoothly", "Neck relaxed"],
  Arms: ["Elbows steady", "Control the lowering", "Wrists neutral"],
  Core: ["Brace belly", "Keep hips level", "Breathe slowly"],
  Conditioning: ["Soft knees", "Land quietly", "Steady rhythm"],
  Mobility: ["Move slowly", "No sharp pain", "Long exhales"]
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
        prep: meal === "snack" ? "5 min" : meal === "breakfast" ? "10-15 min" : "20 min"
      };
    })
  }));
}

function focusMuscles(part) {
  const map = {
    Chest: ["Chest", "Triceps", "Front shoulders"],
    Back: ["Lats", "Upper back", "Biceps"],
    Legs: ["Quads", "Glutes", "Hamstrings"],
    Shoulders: ["Shoulders", "Upper back", "Core"],
    Arms: ["Biceps", "Triceps", "Forearms"],
    Core: ["Abs", "Obliques", "Lower back"],
    Conditioning: ["Heart", "Legs", "Core"],
    Mobility: ["Hips", "Spine", "Shoulders"]
  };
  return map[part] || ["Full body", "Core", "Control"];
}

function exerciseVisual(move) {
  const focus = focusMuscles(move.part);
  const cues = postureCues[move.part] || postureCues.Core;
  const accent = move.part === "Legs" ? "#f2c14e" : move.part === "Back" ? "#0d7c72" : move.part === "Core" ? "#6f63ff" : "#ff5a3d";
  return `
    <div class="exercise-visual" aria-label="Posture guide for ${move.name}">
      <svg viewBox="0 0 220 140" role="img" aria-label="${move.part} posture picture">
        <rect x="0" y="0" width="220" height="140" rx="8" fill="#f8faf8"></rect>
        <circle cx="110" cy="28" r="14" fill="#101814"></circle>
        <path d="M110 44 L110 78" stroke="#101814" stroke-width="8" stroke-linecap="round"></path>
        <path d="M110 54 L72 70" stroke="#101814" stroke-width="8" stroke-linecap="round"></path>
        <path d="M110 54 L148 70" stroke="#101814" stroke-width="8" stroke-linecap="round"></path>
        <path d="M110 78 L82 116" stroke="#101814" stroke-width="8" stroke-linecap="round"></path>
        <path d="M110 78 L142 116" stroke="#101814" stroke-width="8" stroke-linecap="round"></path>
        <path d="M72 70 C90 58, 130 58, 148 70" fill="none" stroke="${accent}" stroke-width="9" stroke-linecap="round"></path>
        <path d="M82 116 C100 102, 124 102, 142 116" fill="none" stroke="${accent}" stroke-width="9" stroke-linecap="round" opacity="0.82"></path>
        <text x="110" y="132" text-anchor="middle" font-size="12" font-weight="800" fill="#607067">${focus.join(" / ")}</text>
      </svg>
      <div class="focus-row">${focus.map((item) => `<span>${item}</span>`).join("")}</div>
      <ul>${cues.map((cue) => `<li>${cue}</li>`).join("")}</ul>
    </div>
  `;
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
  const intensity = experience === "advanced" ? "5 rounds" : experience === "intermediate" ? "4 rounds" : "3 rounds";
  const reps = goals.includes("strength") ? "5-8 reps" : goals.includes("endurance") ? "45 sec" : "8-12 reps";
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
          name = name
            .replace("Burpees", "Incline squat thrusts")
            .replace("Skater hops", "Skater steps")
            .replace("Back squat", "Leg press")
            .replace("Decline push-ups", "Incline push-ups")
            .replace("Walking lunges", "Step-ups");
        }
        const dose = part === "mobility" ? "60 sec" : part === "conditioning" ? (limited ? "30 sec steady / 30 sec easy" : "35 sec on / 25 sec off") : reps;
        moves.push({ name, dose, part: titleCase(part), equipment: titleCase(equipmentKey) });
      });
    });
    const trimmedMoves = moves.slice(0, theme.includes("Mobility") ? 4 : 6);
    trimmedMoves.forEach((move) => {
      if (limited) {
        move.name = move.name.replace("Deep squat hold", "Supported squat hold");
      }
    });
    return {
      day: `Day ${index + 1}`,
      title: theme,
      duration: `${sessionLength} min`,
      intensity: limited ? `${intensity}, joint-friendly` : intensity,
      focus: goals.join(", "),
      bodyParts: parts.map(titleCase).join(", "),
      moves: trimmedMoves,
      finisher: theme.includes("Mobility") ? "5 minutes nasal breathing" : limited ? "8 minute incline walk" : goals.includes("fat-loss") ? "8 minute calorie finisher" : "6 minute controlled finisher"
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
  $("#profileCaption").textContent = state.user.name ? `${state.user.name} - ${listLabels(state.profile.goals)}` : "AI discipline coach";
}

function renderDashboard() {
  const metrics = calculateMetrics();
  const plan = buildWorkoutPlan();
  const todayWorkout = plan[activeWorkoutOffset % plan.length];
  const now = new Date();
  const today = getTodayLog();

  $("#todayLabel").textContent = now.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  $("#dailyHeadline").textContent = getMotivation();
  $("#coachMessage").textContent = `${listLabels(state.profile.goals)} plan for ${state.user.name || "you"}`;
  $("#coachDetail").textContent = `${state.profile.age} yrs, ${state.profile.height} cm, ${state.profile.currentWeight} kg now, ${state.profile.targetWeight} kg target. Uses ${listLabels(state.profile.equipment)}, ${state.profile.daysPerWeek} days/week, ${titleCase(state.profile.foodCulture)} ${titleCase(state.profile.diet)} diet.`;
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
        <span class="tag">${workout.bodyParts}</span>
      </div>
    </div>
    <ul class="exercise-list">
      ${workout.moves.map((move) => `
        <li>
          <strong>${move.name}</strong><br><span>${move.part} - ${move.equipment} - ${move.dose}</span>
          ${exerciseVisual(move)}
        </li>
      `).join("")}
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
        <span class="tag">${workout.bodyParts}</span>
      </div>
      <ul class="exercise-list">
        ${workout.moves.map((move) => `
          <li>
            <strong>${move.name}</strong><br><span>${move.part} - ${move.equipment} - ${move.dose}</span>
            ${exerciseVisual(move)}
          </li>
        `).join("")}
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
  const goals = state.profile.goals || ["fat-loss"];
  const tips = [
    `Food culture: ${titleCase(state.profile.foodCulture)}. Targets use ${state.profile.currentWeight} kg, ${state.profile.height} cm, ${state.profile.age} yrs, and ${titleCase(state.profile.activityLevel)} activity.`,
    goals.includes("fat-loss") ? "Keep the deficit moderate so discipline survives the week." : "Add calories slowly if strength, energy, or weight is not moving.",
    avoid ? `Avoid or swap these foods: ${avoid}.` : "No avoided foods listed. Add allergies or dislikes in profile for cleaner recipes.",
    `For ${listLabels(goals)}, keep protein first, vegetables or fiber second, then place carbs around training.`
  ];
  $("#nutritionTips").innerHTML = tips.map((tip) => `<li>${tip}</li>`).join("");

  const avoidWords = (avoid || "").toLowerCase().split(",").map((item) => item.trim()).filter(Boolean);
  const recipes = (cultureRecipes[state.profile.foodCulture] || cultureRecipes.indian).map((recipe) => {
    const ingredients = recipe[1].split(", ");
    const filtered = ingredients.map((item) => {
      let adjusted = item;
      if (state.profile.diet === "vegan") adjusted = adjusted.replace("Chicken", "Tofu").replace("chicken", "tofu").replace("Eggs", "Tofu").replace("egg", "tofu").replace("yogurt", "soy yogurt").replace("curd", "soy curd").replace("feta", "tofu");
      if (state.profile.diet === "vegetarian") adjusted = adjusted.replace("Chicken", "Paneer or tofu").replace("chicken", "paneer or tofu").replace("Tuna", "Chickpeas").replace("tuna", "chickpeas");
      if (state.profile.diet === "low-carb") adjusted = adjusted.replace("rice", "cauliflower rice").replace("Rice", "Cauliflower rice").replace("pita", "lettuce cups").replace("roti", "low-carb roti");
      return avoidWords.some((avoidItem) => adjusted.toLowerCase().includes(avoidItem)) ? `Swap ${adjusted}` : adjusted;
    });
    return [recipe[0], filtered.join(", "), recipe[2]];
  });

  $("#recipeGrid").innerHTML = recipes.map(([name, ingredients, why]) => `
    <article class="recipe-card">
      <div>
        <p class="eyebrow">${titleCase(state.profile.foodCulture)} - ${titleCase(state.profile.diet)}</p>
        <h3>${name}</h3>
      </div>
      <p>${why}</p>
      <ul>${ingredients.split(", ").map((item) => `<li>${item}</li>`).join("")}</ul>
    </article>
  `).join("");

  $("#mealPlanTarget").textContent = `${targets.protein}g protein/day`;
  $("#mealPlanGrid").innerHTML = buildMealPlan().map((day) => `
    <article class="meal-day">
      <div class="meal-day-head">
        <strong>${day.day}</strong>
        <span>${day.totalProtein}g target</span>
      </div>
      <div class="meal-list">
        ${day.meals.map((meal) => `
          <div class="meal-item">
            <span class="label">${meal.meal}</span>
            <strong>${meal.dish}</strong>
            <small>${meal.protein}g protein - ${meal.prep}</small>
          </div>
        `).join("")}
      </div>
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
  setCheckboxValues("goals", state.profile.goals || ["fat-loss"]);
  setCheckboxValues("setupGoals", state.profile.goals || ["fat-loss"]);
  setCheckboxValues("equipment", state.profile.equipment || ["bodyweight"]);
  setCheckboxValues("setupEquipment", state.profile.equipment || ["bodyweight"]);
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
    goals: selectedCheckboxValues(prefix ? "setupGoals" : "goals"),
    experience: $(`#${prefix}Experience`)?.value || $("#experience")?.value || state.profile.experience,
    daysPerWeek: Number($(`#${prefix}DaysPerWeek`)?.value || $("#daysPerWeek")?.value || state.profile.daysPerWeek),
    sessionLength: Number($("#sessionLength")?.value || state.profile.sessionLength),
    equipment: selectedCheckboxValues(prefix ? "setupEquipment" : "equipment"),
    diet: $(`#${prefix}Diet`)?.value || $("#diet")?.value || state.profile.diet,
    foodCulture: $(`#${prefix}FoodCulture`)?.value || $("#foodCulture")?.value || state.profile.foodCulture,
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
    const recipes = cultureRecipes[state.profile.foodCulture] || cultureRecipes.indian;
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
