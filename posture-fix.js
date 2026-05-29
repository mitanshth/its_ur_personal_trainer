const EXERCISE_IMAGE_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
const EXERCISE_DATA_SOURCE = "https://github.com/yuhonas/free-exercise-db";

function forgeFitSlug(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function forgeFitImage(path, label, frame = 0) {
  return {
    src: `${EXERCISE_IMAGE_BASE}${path}/${frame}.jpg`,
    credit: label,
    url: EXERCISE_DATA_SOURCE
  };
}

const forgeFitExerciseImages = [
  [/incline push/i, "Incline_Push-Up", "Incline push-up", 0],
  [/wide push/i, "Incline_Push-Up_Wide", "Wide push-up", 1],
  [/decline push/i, "Decline_Push-Up", "Decline push-up", 0],
  [/close-grip push|diamond push/i, "Incline_Push-Up_Close-Grip", "Close-grip push-up", 1],
  [/push-up hold|tempo push|push-ups$|push up/i, "Push_Up_to_Side_Plank", "Push-up body line", 0],
  [/dumbbell floor press|close-grip floor press/i, "Dumbbell_Floor_Press", "Dumbbell floor press", 0],
  [/squeeze press|chest press machine/i, "Leverage_Chest_Press", "Chest press", 1],
  [/incline dumbbell press/i, "Incline_Dumbbell_Press", "Incline dumbbell press", 0],
  [/dumbbell fly/i, "Dumbbell_Flyes", "Dumbbell fly", 1],
  [/cable fly|band fly/i, "Flat_Bench_Cable_Flyes", "Cable fly", 0],
  [/bench press/i, "Barbell_Bench_Press_-_Medium_Grip", "Bench press", 0],
  [/band chest press|single-arm band press|close-grip band press/i, "Bench_Press_-_With_Bands", "Band chest press", 1],

  [/table row|towel row|band row/i, "Inverted_Row", "Inverted row", 0],
  [/one-arm row|single-arm band row/i, "One-Arm_Dumbbell_Row", "One-arm row", 0],
  [/chest-supported row|seated row|cable row/i, "Seated_Cable_Rows", "Seated row", 1],
  [/dumbbell pullover|pullover breathing/i, "Straight-Arm_Dumbbell_Pullover", "Dumbbell pullover", 0],
  [/rear delt row|rear delt fly|rear delt raises/i, "Dumbbell_Lying_Rear_Lateral_Raise", "Rear delt raise", 1],
  [/renegade row|band plank row/i, "Alternating_Renegade_Row", "Renegade row", 0],
  [/lat pulldown|band lat pulldown/i, "Wide-Grip_Lat_Pulldown", "Lat pulldown", 0],
  [/assisted pull|pull-apart|face pull|band rear delt pull/i, "Band_Pull_Apart", "Upper-back pull", 1],
  [/prone swimmer|reverse snow angel|superman/i, "Superman", "Superman back extension", 0],

  [/box squat/i, "Box_Squat", "Box squat", 0],
  [/goblet squat/i, "Goblet_Squat", "Goblet squat", 0],
  [/band squat|bodyweight squat|deep squat|squat to press/i, "Bodyweight_Squat", "Bodyweight squat", 1],
  [/leg press/i, "Leg_Press", "Leg press", 0],
  [/romanian deadlift|trap-bar deadlift/i, "Romanian_Deadlift", "Romanian deadlift", 0],
  [/good morning/i, "Good_Morning", "Good morning hinge", 1],
  [/walking lunge|dumbbell lunges|reverse lunges|reverse lunge/i, "Dumbbell_Lunges", "Lunge", 0],
  [/split squat|band split squat/i, "Split_Squats", "Split squat", 0],
  [/step-up|fast step-ups|dumbbell step-up/i, "Step-up_with_Knee_Raise", "Step-up", 1],
  [/glute bridge|band glute bridge/i, "Single_Leg_Glute_Bridge", "Glute bridge", 0],
  [/leg curl/i, "Lying_Leg_Curls", "Leg curl", 1],
  [/calf raise|calf stretch/i, "Rocking_Standing_Calf_Raise", "Calf raise", 0],
  [/wall sit/i, "Bodyweight_Squat", "Wall-sit leg position", 0],
  [/lateral band walks/i, "Band_Hip_Adductions", "Band hip walk", 1],

  [/wall handstand|handstand/i, "Handstand_Push-Ups", "Handstand hold", 0],
  [/pike push/i, "Handstand_Push-Ups", "Pike push-up pattern", 1],
  [/plank shoulder taps/i, "Push_Up_to_Side_Plank", "Shoulder tap plank", 1],
  [/half-kneeling press|dumbbell press/i, "Dumbbell_One-Arm_Shoulder_Press", "Dumbbell shoulder press", 0],
  [/arnold press/i, "Arnold_Dumbbell_Press", "Arnold press", 1],
  [/machine shoulder press|shoulder press|band overhead press/i, "Shoulder_Press_-_With_Bands", "Shoulder press", 0],
  [/lateral raise|band lateral raise|cable lateral raises/i, "Lateral_Raise_-_With_Bands", "Lateral raise", 1],
  [/front raise|band front raise/i, "Alternating_Deltoid_Raise", "Front raise", 0],
  [/upright row/i, "Upright_Cable_Row", "Upright row", 1],
  [/arm circles/i, "Arm_Circles", "Arm circles", 0],
  [/bear crawl/i, "Bear_Crawl_Sled_Drags", "Bear crawl hold", 0],
  [/band y raise/i, "Back_Flyes_-_With_Bands", "Band Y raise", 1],

  [/hammer curls|hammer band curls/i, "Hammer_Curls", "Hammer curl", 0],
  [/zottman/i, "Zottman_Preacher_Curl", "Zottman curl", 1],
  [/towel curls|band curls|cable curls|isometric curl|reverse curls/i, "Standing_Biceps_Cable_Curl", "Curl posture", 0],
  [/preacher curls/i, "Preacher_Curl", "Preacher curl", 1],
  [/overhead triceps extension|overhead band extension/i, "Dumbbell_One-Arm_Triceps_Extension", "Overhead triceps extension", 0],
  [/rope pressdown|band triceps pressdown/i, "Triceps_Pushdown_-_Rope_Attachment", "Rope pressdown", 1],
  [/kickbacks/i, "Tricep_Dumbbell_Kickback", "Triceps kickback", 0],
  [/bench dips|triceps dips/i, "Bench_Dips", "Bench dip", 0],

  [/dead bugs|weighted dead bugs|band dead bugs/i, "Dead_Bug", "Dead bug", 0],
  [/side plank/i, "Push_Up_to_Side_Plank", "Side plank", 1],
  [/hollow hold/i, "Jackknife_Sit-Up", "Hollow-body brace", 0],
  [/reverse crunch/i, "Cable_Reverse_Crunch", "Reverse crunch", 1],
  [/plank reaches|weighted plank/i, "Plank", "Plank", 0],
  [/suitcase carry|farmer carry|farmer/i, "Farmers_Walk", "Loaded carry", 0],
  [/russian twist/i, "Russian_Twist", "Russian twist", 0],
  [/plank pull-through/i, "Alternating_Renegade_Row", "Plank pull-through", 1],
  [/weighted sit-ups|sit-ups/i, "Sit-Up", "Sit-up", 0],
  [/cable crunch/i, "Cable_Crunch", "Cable crunch", 0],
  [/hanging knee/i, "Hanging_Leg_Raise", "Hanging knee raise", 1],
  [/pallof|anti-rotation/i, "Pallof_Press", "Pallof press", 0],
  [/wood chop/i, "Standing_Cable_Wood_Chop", "Wood chop", 1],
  [/back extension/i, "Hyperextensions_Back_Extensions", "Back extension", 0],

  [/high knees|march/i, "Walking_Treadmill", "Marching mechanics", 0],
  [/mountain climbers/i, "Mountain_Climbers", "Mountain climbers", 0],
  [/skater/i, "Alternate_Leg_Diagonal_Bound", "Skater bound", 1],
  [/squat thrust/i, "Mountain_Climbers", "Squat thrust", 1],
  [/dumbbell swings/i, "One-Arm_Kettlebell_Swings", "Swing hinge", 0],
  [/low-impact thruster|band thrusters|thruster/i, "Kettlebell_Thruster", "Thruster", 1],
  [/lateral shuffle/i, "Alternate_Leg_Diagonal_Bound", "Lateral shuffle", 0],
  [/incline treadmill/i, "Walking_Treadmill", "Incline treadmill", 1],
  [/row erg/i, "Rowing_Stationary", "Row erg", 0],
  [/bike intervals/i, "Recumbent_Bike", "Bike intervals", 1],
  [/sled push/i, "Sled_Push", "Sled push", 0],
  [/stair climber/i, "Stairmaster", "Stair climber", 1],
  [/fast band rows/i, "Band_Pull_Apart", "Fast band row", 0],

  [/world's greatest stretch/i, "Worlds_Greatest_Stretch", "World's greatest stretch", 0],
  [/hip flexor|couch stretch/i, "Kneeling_Hip_Flexor", "Hip flexor stretch", 0],
  [/thoracic|open-book/i, "Chair_Upper_Body_Stretch", "Thoracic rotation", 0],
  [/90\/90/i, "90_90_Hamstring", "90/90 mobility", 0],
  [/band shoulder opener/i, "Band_Pull_Apart", "Band shoulder opener", 1],
  [/ankle rocks/i, "Ankle_Circles", "Ankle mobility", 0],
  [/hamstring floss/i, "Hamstring_Stretch", "Hamstring stretch", 1],
  [/lat stretch/i, "Standing_Lateral_Stretch", "Lat stretch", 0],
  [/cat cow/i, "Cat_Stretch", "Cat cow mobility", 0]
];

const forgeFitFallbackImages = {
  Chest: ["Incline_Push-Up", "Dumbbell_Floor_Press", "Barbell_Bench_Press_-_Medium_Grip"],
  Back: ["Inverted_Row", "Wide-Grip_Lat_Pulldown", "Superman"],
  Legs: ["Bodyweight_Squat", "Dumbbell_Lunges", "Romanian_Deadlift"],
  Shoulders: ["Dumbbell_Shoulder_Press", "Lateral_Raise_-_With_Bands", "Arm_Circles"],
  Arms: ["Hammer_Curls", "Bench_Dips", "Triceps_Pushdown_-_Rope_Attachment"],
  Core: ["Dead_Bug", "Plank", "Russian_Twist"],
  Conditioning: ["Mountain_Climbers", "Rowing_Stationary", "Stairmaster"],
  Mobility: ["Kneeling_Hip_Flexor", "Hamstring_Stretch", "Ankle_Circles"]
};

function forgeFitExerciseMedia(move) {
  const match = forgeFitExerciseImages.find(([pattern]) => pattern.test(move.name));
  if (match) return forgeFitImage(match[1], match[2], match[3]);

  const fallbacks = forgeFitFallbackImages[move.part] || forgeFitFallbackImages.Core;
  const index = forgeFitSlug(move.name).length % fallbacks.length;
  return forgeFitImage(fallbacks[index], `${move.name} posture reference`, index % 2);
}

function forgeFitPostureMedia(move) {
  const media = forgeFitExerciseMedia(move);
  return `
    <figure class="posture-photo-wrap">
      <img class="posture-photo" src="${media.src}" alt="${move.name} posture reference" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('.posture-photo-wrap').classList.add('image-failed'); this.remove();" />
      <figcaption>
        <span>${media.credit}</span>
        <a href="${media.url}" target="_blank" rel="noopener noreferrer">Free Exercise DB</a>
      </figcaption>
    </figure>
  `;
}

function exerciseVisual(move) {
  const focus = focusMuscles(move.part);
  const cues = postureCues[move.part] || postureCues.Core;
  return `
    <div class="exercise-visual" aria-label="Posture guide for ${move.name}">
      ${forgeFitPostureMedia(move)}
      <div class="focus-row">${focus.map((item) => `<span>${item}</span>`).join("")}</div>
      <ul>${cues.map((cue) => `<li>${cue}</li>`).join("")}</ul>
    </div>
  `;
}

if (typeof renderAll === "function") {
  renderAll();
}
