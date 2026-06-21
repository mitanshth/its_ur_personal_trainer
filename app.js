const STORAGE_KEY = "shadowsystem-ai-state-v3";

const defaultState = {
  onboarded: false,
  user: { name: "", email: "", photo: "" },
  profile: {
    age: 24,
    gender: "male",
    height: 175,
    goals: ["fat-loss"],
    experience: "beginner",
    daysPerWeek: 4,
    equipment: ["bodyweight"],
    diet: "balanced",
    foodCulture: "indian",
    activityLevel: "moderate",
    currentWeight: 75,
    targetWeight: 70,
    injuries: "",
    avoidFoods: "",
    motivationStyle: "direct"
  },
  logs: [],
  planSeed: 42
};

const exerciseLibrary = {
  bodyweight: {
    chest: ["Incline Shadow Push-Up", "Standard Gate Push-Up", "Explosive Deflection Push-Up", "Wide Stance Floor Fly"],
    back: ["Monarch Superman Extension", "Inverted Row Gate Capture", "Spinal Guard Raise", "Band Pull-Apart Catalyst"],
    legs: ["Titan Bodyweight Squat", "Shadow Walking Lunge", "Single Leg Glute Bridge Burst", "Pistol Squat Blueprint"],
    shoulders: ["Pike Push-Up Vanguard", "Arm Circle Mana Shield", "Handstand Core Hold"],
    arms: ["Close-Grip Triceps Diamond Lock", "Bench Dip Overdrive", "Isometric Biceps Curl Counter"],
    core: ["Shadow Abs Plank Lock", "Dead Bug Stasis Matrix", "Hollow Body Grid Containment"],
    conditioning: ["Subterranean Mountain Climber", "Diagonal Bound Decoupler", "High Knee Surge Phase"],
    mobility: ["World's Greatest Opener", "Cat Stretch Decompression", "90/90 Hip Flow Blueprint"]
  },
  dumbbells: {
    chest: ["Dumbbell Shadow Floor Press", "Incline Dumbbell Rupture Fly", "Close-Grip Dumbbell Hex Press"],
    back: ["One-Arm Overload Dumbbell Row", "Renegade Row Guild Infiltration", "Straight-Arm Pullover Shield"],
    legs: ["Goblet Squat Overdrive", "Romanian Deadlift Matrix", "Dumbbell Lunge Gateway"],
    shoulders: ["Dumbbell Shoulder Press Singularity", "Arnold Shield Press", "Lateral Deltoid Flare"],
    arms: ["Hammer Curl Catalyst", "Dumbbell Triceps Kickback Shockwave", "Zottman Muscle Upgrade"],
    core: ["Farmer's Heavy Walk Load", "Russian Twist Obliteration", "Weighted Ab Crunch Engine"],
    conditioning: ["Kettlebell / Dumbbell Swing Volley", "Thruster Gate Buster", "Dumbbell Snatch Surge"],
    mobility: ["Wall-Assisted Calf Anchor", "Straight-Arm Dumbbell Decompression"]
  }
};

const splitTemplates = {
  2: ["Upper Body Vanguard Core", "Lower Body Core Matrix"],
  3: ["Chest Burst Raid + Triceps", "Shadow Row Capture + Biceps", "Monarch Stance Drive + Core"],
  4: ["Chest Burst Raid + Triceps", "Shadow Row Capture + Biceps", "Titan Leg Overdrive", "Shoulder Shield Catalyst + Core"],
  5: ["Monarch Chest Obliteration", "Shadow Guild Back Overload", "Titan Legs Overdrive", "Shield Deltoid Singularity", "Absolute Arms Overdrive + Core"],
  6: ["Chest Burst Raid", "Shadow Row Capture", "Titan Legs Overdrive", "Shoulder Shield Catalyst", "Cardio Surge Velocity", "System Decompression Recovery"]
};

const splitParts = {
  "Upper Body Vanguard Core": ["chest", "back", "shoulders", "arms"],
  "Lower Body Core Matrix": ["legs", "core"],
  "Chest Burst Raid + Triceps": ["chest", "arms"],
  "Shadow Row Capture + Biceps": ["back", "arms"],
  "Monarch Stance Drive + Core": ["legs", "core"],
  "Titan Leg Overdrive": ["legs"],
  "Shoulder Shield Catalyst + Core": ["shoulders", "core"],
  "Monarch Chest Obliteration": ["chest"],
  "Shadow Guild Back Overload": ["back"],
  "Shield Deltoid Singularity": ["shoulders"],
  "Absolute Arms Overdrive + Core": ["arms", "core"],
  "Cardio Surge Velocity": ["core", "conditioning"],
  "System Decompression Recovery": ["mobility", "core"]
};

const menuCultureBank = {
  indian: {
    breakfast: ["Paneer Bhurji Shield Toast", "Sprouted Moong Dal Catalyst Chilla"],
    lunch: ["High Protein Rajma Core Rice Bowl", "Chana Spinach Fortification Wrap"],
    snack: ["Roasted Crunchy Chana Mana Boost", "Protein-Enriched Lassi Shake"],
    dinner: ["Tofu/Paneer Tikka Alchemy Salad", "Soy Chunk High Amino Pulao"]
  },
  mediterranean: {
    breakfast: ["Greek Hunter Yogurt Oats", "Egg & Hummus Whole Wheat Pita"],
    lunch: ["Tuna Chickpea Shred Salad", "Lentil Feta Fortification Bowl"],
    snack: ["Cottage Cheese Fruit Medley", "Roasted Crunchy Garlic Chickpeas"],
    dinner: ["Chicken/Tofu Shawarma Skewer Salad", "Baked Salmon/Tofu Grid Plate"]
  },
  western: {
    breakfast: ["Overnight Protein Recovery Oats", "Scrambled Egg Avocado Wave Toast"],
    lunch: ["Lean Chicken Breast Sweet Potato Bowl", "Turkey Breast Quinoa Master Box"],
    snack: ["Whey Shake Amino Boost", "Peanut Butter Rice Cakes Array"],
    dinner: ["Lean Beef/Tofu Stir Fry Matrix", "Grilled White Fish Asparagus Shield"]
  }
};

let state = loadState();
let activeWorkoutOffset = 0;

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultState);
  try {
    return { ...structuredClone(defaultState), ...JSON.parse(saved) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderAll();
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getTodayLog() {
  return state.logs.find(l => l.date === todayKey());
}

function getStreak() {
  const dates = new Set(state.logs.filter(l => l.workoutDone).map(l => l.date));
  let streak = 0;
  const cursor = new Date();
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function calculateHunterRank(streak) {
  if (streak >= 15) return "S-RANK MONARCH";
  if (streak >= 10) return "A-RANK GUILD LEADER";
  if (streak >= 7) return "B-RANK ELITE ELDER";
  if (streak >= 4) return "C-RANK RAID LEADER";
  if (streak >= 2) return "D-RANK DUNGEON EXPLORER";
  return "E-RANK HUNTER";
}

function nutritionTargets() {
  const weight = state.profile.currentWeight || 75;
  const activity = { low: 1.3, moderate: 1.5, high: 1.8 }[state.profile.activityLevel] || 1.5;
  const calories = Math.round((10 * weight + 625 - 5 * state.profile.age) * activity);
  const protein = Math.round(weight * (state.profile.diet === "high-protein" ? 2.2 : 1.8));
  const fats = Math.round(weight * 0.8);
  const carbs = Math.round((calories - (protein * 4 + fats * 9)) / 4);
  return { calories, protein, fats, carbs };
}

function buildWorkoutPlan() {
  const freq = state.profile.daysPerWeek || 4;
  const split = splitTemplates[freq] || splitTemplates[4];
  const equips = state.profile.equipment.includes("dumbbells") ? "dumbbells" : "bodyweight";
  const pool = exerciseLibrary[equips] || exerciseLibrary.bodyweight;

  return Array.from({ length: freq }, (_, index) => {
    const title = split[index] || "Standard Raid Gate";
    const categories = splitParts[title] || ["chest", "back", "core"];
    
    const moves = [];
    categories.forEach(cat => {
      const list = pool[cat] || exerciseLibrary.bodyweight[cat] || exerciseLibrary.bodyweight.core;
      moves.push({
        name: list[(index + state.planSeed) % list.length],
        dose: state.profile.goals.includes("strength") ? "5 sets x 5 reps (Heavy Load)" : "4 sets x 12 tactical loops",
        part: cat.toUpperCase()
      });
    });

    return {
      day: `GATE MODULE 0${index + 1}`,
      title,
      duration: "45-60 Min",
      intensity: state.profile.experience.toUpperCase() + " RANK",
      bodyParts: categories.map(c => c.toUpperCase()).join(", "),
      moves,
      finisher: "8 Min Shadow Step Extraction Sprint Phase"
    };
  });
}

function buildMealPlan() {
  const culture = menuCultureBank[state.profile.foodCulture] || menuCultureBank.indian;
  const meals = ["breakfast", "lunch", "snack", "dinner"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  return days.map((d, dIdx) => {
    return {
      day: d,
      meals: meals.map((m, mIdx) => {
        const list = culture[m];
        let dish = list[(dIdx + mIdx) % list.length];
        if (state.profile.diet === "vegan") dish = "Pure Ethereal Vegan " + dish;
        return { meal: m.toUpperCase(), dish, protein: Math.round(nutritionTargets().protein / 4) };
      })
    };
  });
}

function renderAll() {
  $("#onboarding").classList.toggle("hidden", state.onboarded);
  
  const streak = getStreak();
  const rank = calculateHunterRank(streak);
  $("#hunterRankTitle").textContent = rank;
  $("#streakDays").textContent = `${streak} Gate Clearances`;
  
  const now = new Date();
  $("#todayLabel").textContent = `LIVE PROTOCOL: ${now.toDateString().toUpperCase()}`;
  
  const targets = nutritionTargets();
  $("#proteinTarget").textContent = `${targets.protein}g`;
  $("#proteinMeter").max = 250;
  $("#proteinMeter").value = targets.protein;

  // Render metrics graphs/bars
  const doneLogs = state.logs.filter(l => l.workoutDone).length;
  $("#weeklyWorkouts").textContent = `${doneLogs} Cleared`;
  $("#weeklyMeter").value = doneLogs;
  $("#weeklyMeter").max = state.profile.daysPerWeek;

  const progressDelta = Math.min(100, Math.round(Math.abs((state.profile.currentWeight - state.profile.targetWeight) / 5) * 100));
  $("#goalProgress").textContent = `${progressDelta}%`;
  $("#goalMeter").value = progressDelta;

  const logToday = getTodayLog();
  const resScore = logToday ? Math.min(100, 70 + Number(logToday.sleep || 7) * 4) : 95;
  $("#readinessScore").textContent = resScore;
  $("#disciplineScore").textContent = `${Math.min(100, streak * 20 + 40)}%`;
  $("#disciplineMeter").value = Math.min(100, streak * 20 + 40);

  $("#coachMessage").textContent = `Greetings, Hunter ${state.user.name || "Subject"}. Core matrices operational.`;
  $("#coachDetail").textContent = `Calibrated weight indices: Current ${state.profile.currentWeight}kg heading towards target value of ${state.profile.targetWeight}kg seamlessly. Equipment profile maps cleanly to: ${state.profile.equipment.join(", ").toUpperCase()}.`;

  // Render active workout
  const plan = buildWorkoutPlan();
  const currentWorkout = plan[activeWorkoutOffset % plan.length];
  if (currentWorkout) {
    $("#todayWorkout").innerHTML = `
      <div style="border-bottom: 1px solid var(--line); padding-bottom: 10px; margin-bottom: 10px;">
        <span class="status-pill">${currentWorkout.intensity}</span>
        <h4 style="margin: 6px 0; color: var(--accent-2); font-size: 1.3rem;">${currentWorkout.title}</h4>
        <small style="color: var(--muted);">${currentWorkout.bodyParts} | ${currentWorkout.duration}</small>
      </div>
      <ul style="list-style: none; padding: 0; margin: 0; display: grid; gap: 8px;">
        ${currentWorkout.moves.map(m => `
          <li style="background: var(--surface-2); border: 1px solid var(--line); padding: 10px; border-radius: 4px;">
            <strong style="color: #fff;">${m.name}</strong><br/>
            <span style="font-size: 0.85rem; color: var(--accent-2);">${m.part} Axis | ${m.dose}</span>
          </li>
        `).join("")}
        <li style="background: rgba(123, 77, 255, 0.1); border: 1px dashed var(--accent); padding: 10px; border-radius: 4px;">
          <strong style="color: var(--accent-3);">FINAL SURGE MODULE:</strong> ${currentWorkout.finisher}
        </li>
      </ul>
    `;
  }

  // Render weekly quest overview page
  $("#weeklyPlan").innerHTML = plan.map(w => `
    <div class="plan-card">
      <span class="status-pill">${w.day}</span>
      <h3 style="color: var(--accent-2); margin: 8px 0 4px 0;">${w.title}</h3>
      <p style="font-size:0.85rem; color: var(--muted); margin-bottom:10px;">Vectors: ${w.bodyParts}</p>
      <ul style="padding-left: 16px; font-size:0.9rem; color: #cdd8f4;">
        ${w.moves.map(m => `<li>${m.name}</li>`).join("")}
      </ul>
    </div>
  `).join("");

  // Render nutrition values card
  $("#nutritionTargets").innerHTML = `
    <div class="target-box"><span class="label">ENERGY RADIUS</span><strong>${targets.calories} Kcal</strong></div>
    <div class="target-box"><span class="label">AMINO CORE</span><strong>${targets.protein}g</strong></div>
    <div class="target-box"><span class="label">CARBOHYDRATE MESH</span><strong>${targets.carbs}g</strong></div>
    <div class="target-box"><span class="label">LIPID BOND MATRIX</span><strong>${targets.fats}g</strong></div>
  `;
  $("#nutritionTips").innerHTML = `
    <li>Maintain high hydration matrix to neutralize dynamic lactic debuffs accumulated during Gate iterations.</li>
    <li>Prioritize clean, high-affinity nutrient sources compatible with ${state.profile.foodCulture.toUpperCase()} alignment profiles.</li>
  `;

  // Render Recipe matrix and meal plan sequence cards
  const recipeData = menuCultureBank[state.profile.foodCulture] || menuCultureBank.indian;
  $("#recipeGrid").innerHTML = recipeData.lunch.map(l => `
    <div class="recipe-card">
      <h4 style="color: var(--accent-2); margin:0 0 6px 0;">${l}</h4>
      <p style="font-size:0.85rem; color: var(--muted); margin:0;">High affinity nutrient block optimized for rapid muscle level upgrades post instance battles.</p>
    </div>
  `).join("");

  const mealPlanData = buildMealPlan();
  $("#mealPlanGrid").innerHTML = mealPlanData.map(d => `
    <div style="background: var(--surface); border:1px solid var(--line); padding: 10px; border-radius:4px;">
      <h5 style="color: var(--accent-3); margin:0 0 6px 0; text-transform: uppercase;">${d.day} ALLOCATION</h5>
      <ul style="padding:0; margin:0; list-style:none; font-size:0.85rem; display:grid; gap:4px;">
        ${d.meals.map(m => `<li><span style="color: var(--muted); font-weight:bold;">${m.meal}:</span> <span style="color:#fff;">${m.dish}</span></li>`).join("")}
      </ul>
    </div>
  `).join("");

  // Render stat records listing
  $("#logList").innerHTML = state.logs.length ? state.logs.map(l => `
    <div style="background: var(--surface-2); border: 1px solid var(--line); padding: 8px; border-radius:4px; margin-bottom:6px; font-size:0.85rem;">
      <strong>[DATE TIME STAMP]: ${l.date}</strong> — Clearance: <span style="color: var(--good);">${l.workoutDone ? "SUCCESS" : "VITALS SNAPSHOT ONLY"}</span> | Mass Logged: ${l.weight || "--"}kg | Catalyst Intake: ${l.protein || 0}g
    </div>
  `).join("") : `<p style="font-size:0.9rem; color: var(--muted);">No tracking logs generated within localized IndexedDB stack memories yet.</p>`;

  // Fill config text field values
  Object.entries({ ...state.user, ...state.profile }).forEach(([key, val]) => {
    const el = $(`#${key}`);
    if (el && el.type !== "checkbox" && el.type !== "file") el.value = val;
  });
}

function showToast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

function saveTodayLog(data = {}) {
  const k = todayKey();
  let existing = state.logs.find(l => l.date === k);
  if (!existing) {
    existing = { date: k, workoutDone: false, weight: "", effort: 7, protein: 0, mood: "Focused", sleep: 7.5, water: 2, soreness: 3, steps: 5000 };
    state.logs.push(existing);
  }
  Object.assign(existing, data);
  saveState();
}

function switchView(viewName) {
  $$(".tab, .mobile-tab").forEach(btn => btn.classList.toggle("active", btn.dataset.view === viewName));
  $$(".view").forEach(v => v.classList.toggle("active-view", v.id === viewName));
}

// Interactive Rule-based natural language processing fitness AI simulation core
function initSystemAiConsole() {
  const form = document.getElementById("systemAiChatForm");
  const input = document.getElementById("systemAiChatInput");
  const box = document.getElementById("systemAiChatBox");

  if (!form || !input || !box) return;

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    const txt = input.value.trim();
    if (!txt) return;

    appendMsg("HUNTER", txt, "#fff");
    input.value = "";

    setTimeout(() => {
      const responseText = queryCoreSystemRules(txt.toLowerCase());
      appendMsg("SYSTEM", responseText, "var(--accent-2)");
    }, 300);
  });

  function appendMsg(sender, body, col) {
    const div = document.createElement("div");
    div.style.marginBottom = "8px";
    div.innerHTML = `<span style="color: ${col}; font-weight: bold;">[${sender}]:</span> <span style="color: #cdd8f4;">${body}</span>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function queryCoreSystemRules(q) {
    const targets = nutritionTargets();
    if (q.includes("chest") || q.includes("pushup") || q.includes("press")) {
      return "QUEST PARAMETER DIRECTIVE: To optimize the Pectoralis master coordinates, combine Standard Gate Push-Ups with Close-Grip Diamon Locks. Maintain absolute pelvic line rigidity to avert activation decay metrics.";
    }
    if (q.includes("sore") || q.includes("pain") || q.includes("hurt") || q.includes("injury")) {
      return "🚨 WARNING: Critical high fatigue debuff index intercepted. Do not initialize high impact combat matrices. Swap scheduling vectors to 'System Decompression Recovery' loops immediately and up water ingestion arrays to 3.5 Liters.";
    }
    if (q.includes("diet") || q.includes("protein") || q.includes("eat") || q.includes("food") || q.includes("recipe")) {
      return `ALCHEMICAL DIRECTIVE: Your profile mandates exactly **${targets.protein}g of Amino Catalysts** alongside **${targets.calories} Kcal** daily matching preferred food profile: ${state.profile.foodCulture.toUpperCase()}. Incorporate target paneer, tofu, or lean poultry matrices.`;
    }
    if (q.includes("home") || q.includes("no gym")) {
      return "INSTANCE ROOM MODE ACTIVE: Pure bodyweight armaments are fully sufficient to conquer this segment. Focus on strict depth velocity on squats and perfect form locks on planks.";
    }
    if (q.includes("weight") || q.includes("fat") || q.includes("lose") || q.includes("gain")) {
      return `STAT ARCHIVE LOG: Current battle mass registers at **${state.profile.currentWeight}kg** with target baseline set at **${state.profile.targetWeight}kg**. Consistency across your assigned ${state.profile.daysPerWeek} weekly gates controls execution speed.`;
    }
    return `DIRECTIVE COMPUTED: Maintain active streak parameters, fulfill daily instance modules, and commit vitiated entries to maximize leveling output benchmarks.`;
  }
}

function bindEvents() {
  $$(".tab, .mobile-tab").forEach(tab => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });

  // Jump hooks
  $$("[data-jump]").forEach(btn => {
    btn.addEventListener("click", () => switchView(btn.dataset.jump));
  });

  $("#onboardingForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.user.name = $("#setupName").value;
    state.user.email = $("#setupEmail").value;
    state.profile.age = Number($("#setupAge").value);
    state.profile.gender = $("#setupGender").value;
    state.profile.height = Number($("#setupHeight").value);
    state.profile.currentWeight = Number($("#setupCurrentWeight").value);
    state.profile.targetWeight = Number($("#setupTargetWeight").value);
    state.profile.experience = $("#setupExperience").value;
    state.profile.activityLevel = $("#setupActivityLevel").value;
    state.profile.diet = $("#setupDiet").value;
    state.profile.foodCulture = $("#setupFoodCulture").value;
    state.profile.daysPerWeek = Number($("#setupDaysPerWeek").value);
    
    // Multi checks
    state.profile.goals = [...document.querySelectorAll('input[name="setupGoals"]:checked')].map(i => i.value);
    state.profile.equipment = [...document.querySelectorAll('input[name="setupEquipment"]:checked')].map(i => i.value);
    state.profile.injuries = $("#setupInjuries").value;
    state.profile.avoidFoods = $("#setupAvoidFoods").value;

    state.onboarded = true;
    saveState();
    showToast("Awakening sequence committed. Shadow Console Live.");
  });

  $("#settingsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.user.name = $("#name").value;
    state.user.email = $("#email").value;
    state.profile.currentWeight = Number($("#currentWeight").value);
    state.profile.targetWeight = Number($("#targetWeight").value);
    state.profile.age = Number($("#age").value);
    state.profile.height = Number($("#height").value);
    state.profile.experience = $("#experience").value;
    state.profile.daysPerWeek = Number($("#daysPerWeek").value);
    state.profile.diet = $("#diet").value;
    state.profile.foodCulture = $("#foodCulture").value;
    state.profile.activityLevel = $("#activityLevel").value;
    state.profile.motivationStyle = $("#motivationStyle").value;
    state.profile.injuries = $("#injuries").value;
    state.profile.avoidFoods = $("#avoidFoods").value;

    saveState();
    showToast("System configurations adjusted successfully.");
  });

  $("#completeWorkoutButton").addEventListener("click", () => {
    saveTodayLog({ workoutDone: true });
    showToast("Daily instance quest conquered successfully. Level matrix raised.");
  });

  $("#swapWorkoutButton").addEventListener("click", () => {
    activeWorkoutOffset++;
    renderAll();
    showToast("Gate coordinate indices shifted successfully.");
  });

  $("#generatePlanButton").addEventListener("click", () => {
    state.planSeed += Math.floor(Math.random() * 10) + 1;
    saveState();
    showToast("System materializing alternative dungeon room layouts...");
  });

  $("#quickCheckinForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saveTodayLog({
      sleep: $("#quickSleep").value,
      water: $("#quickWater").value,
      soreness: $("#quickSoreness").value,
      steps: $("#quickSteps").value
    });
    showToast("Parameter snapshot updated.");
  });

  $("#progressForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saveTodayLog({
      weight: $("#logWeight").value,
      protein: Number($("#logProtein").value || 0),
      effort: Number($("#logEffort").value),
      mood: $("#logMood").value
    });
    showToast("Stat increment committed cleanly.");
  });

  // Backup file export archive trigger
  $("#backupDataButton").addEventListener("click", () => {
    const backupStr = JSON.stringify(state, null, 2);
    const blob = new Blob([backupStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shadowsystem-hunter-profile.json";
    a.click();
    showToast("Node backup downloaded.");
  });

  $("#restoreDataButton").addEventListener("click", () => $("#restoreDataInput").click());
  $("#restoreDataInput").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        state = { ...structuredClone(defaultState), ...JSON.parse(r.result) };
        saveState();
        showToast("System configurations overwritten from JSON archive.");
      } catch {
        showToast("Corrupt snapshot schema structure.");
      }
    };
    r.readAsText(file);
  });

  initSystemAiConsole();
}

window.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  renderAll();
});
