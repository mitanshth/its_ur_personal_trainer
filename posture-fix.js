function forgeFitMovementPattern(move) {
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

function forgeFitPoseSvg(move, accent) {
  const pattern = forgeFitMovementPattern(move);
  const markerId = `pose-arrow-${pattern.replace(/[^a-z0-9]/gi, "")}`;
  const arrow = `url(#${markerId})`;
  const commonDefs = `
    <defs>
      <marker id="${markerId}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${accent}"></path>
      </marker>
    </defs>
  `;
  const poses = {
    "Push-up / Chest Press": `
      <text x="24" y="28" class="pose-title">Push-up / chest press</text>
      <line x1="46" y1="142" x2="218" y2="112" class="guide-line"></line>
      <circle cx="218" cy="106" r="14" class="body-dark"></circle>
      <path d="M204 112 L148 122 L88 132" class="body-line thick"></path>
      <path d="M158 121 L132 158" class="body-line"></path>
      <path d="M146 123 L126 86" class="body-line"></path>
      <path d="M89 132 L58 162" class="body-line"></path>
      <path d="M86 132 L48 104" class="body-line"></path>
      <ellipse cx="156" cy="122" rx="24" ry="15" fill="${accent}" opacity="0.92"></ellipse>
      <path d="M152 88 C136 98 132 112 134 130" class="action-arrow" marker-end="${arrow}"></path>
      <text x="30" y="194" class="pose-note">Head, hips, heels stay in one line</text>
    `,
    "Row / Back Pull": `
      <text x="24" y="28" class="pose-title">Row / back pull</text>
      <circle cx="74" cy="70" r="14" class="body-dark"></circle>
      <path d="M88 80 L134 104 L176 126" class="body-line thick"></path>
      <path d="M124 100 L100 148" class="body-line"></path>
      <path d="M142 108 L126 158" class="body-line"></path>
      <path d="M126 100 L174 76" class="body-line"></path>
      <path d="M136 108 L190 94" class="body-line"></path>
      <path d="M106 82 C124 74 150 80 170 98" fill="${accent}" opacity="0.9"></path>
      <path d="M205 96 C184 96 170 94 150 86" class="action-arrow" marker-end="${arrow}"></path>
      <text x="28" y="194" class="pose-note">Pull elbows back, keep chest proud</text>
    `,
    Squat: `
      <text x="24" y="28" class="pose-title">Squat posture</text>
      <circle cx="128" cy="54" r="14" class="body-dark"></circle>
      <path d="M128 70 L134 112" class="body-line thick"></path>
      <path d="M134 112 L98 150 L56 150" class="body-line"></path>
      <path d="M134 112 L174 150 L216 150" class="body-line"></path>
      <path d="M118 84 L82 106" class="body-line"></path>
      <path d="M138 84 L174 106" class="body-line"></path>
      <path d="M96 142 L56 150" stroke="${accent}" stroke-width="18" stroke-linecap="round"></path>
      <path d="M172 142 L216 150" stroke="${accent}" stroke-width="18" stroke-linecap="round"></path>
      <line x1="98" y1="40" x2="98" y2="160" class="guide-line"></line>
      <path d="M62 118 C82 138 104 148 130 150" class="action-arrow" marker-end="${arrow}"></path>
      <text x="32" y="194" class="pose-note">Knees track toes, heels stay down</text>
    `,
    "Lunge / Step-up": `
      <text x="24" y="28" class="pose-title">Lunge / step-up</text>
      <circle cx="118" cy="52" r="14" class="body-dark"></circle>
      <path d="M118 68 L128 116" class="body-line thick"></path>
      <path d="M128 116 L92 152 L52 152" class="body-line"></path>
      <path d="M128 116 L170 154 L220 154" class="body-line"></path>
      <path d="M112 82 L78 106" class="body-line"></path>
      <path d="M132 84 L166 106" class="body-line"></path>
      <circle cx="94" cy="150" r="14" fill="${accent}" opacity="0.9"></circle>
      <circle cx="170" cy="154" r="14" fill="${accent}" opacity="0.9"></circle>
      <line x1="92" y1="84" x2="92" y2="164" class="guide-line"></line>
      <text x="32" y="194" class="pose-note">Front knee stays over toes, torso tall</text>
    `,
    "Hip Hinge / Glutes": `
      <text x="24" y="28" class="pose-title">Hip hinge / glutes</text>
      <circle cx="74" cy="78" r="14" class="body-dark"></circle>
      <path d="M88 86 L140 112 L204 116" class="body-line thick"></path>
      <path d="M138 112 L112 158" class="body-line"></path>
      <path d="M158 114 L184 160" class="body-line"></path>
      <path d="M124 104 L152 88" class="body-line"></path>
      <ellipse cx="152" cy="112" rx="28" ry="18" fill="${accent}" opacity="0.9"></ellipse>
      <path d="M174 92 C152 100 138 116 128 140" class="action-arrow" marker-end="${arrow}"></path>
      <text x="30" y="194" class="pose-note">Hips move back, back stays flat</text>
    `,
    "Overhead / Shoulder": `
      <text x="24" y="28" class="pose-title">Overhead / shoulder</text>
      <circle cx="132" cy="58" r="14" class="body-dark"></circle>
      <path d="M132 74 L132 132" class="body-line thick"></path>
      <path d="M132 88 L92 46" class="body-line"></path>
      <path d="M132 88 L172 46" class="body-line"></path>
      <path d="M132 132 L104 176" class="body-line"></path>
      <path d="M132 132 L160 176" class="body-line"></path>
      <circle cx="108" cy="70" r="16" fill="${accent}" opacity="0.95"></circle>
      <circle cx="156" cy="70" r="16" fill="${accent}" opacity="0.95"></circle>
      <path d="M92 92 C94 70 96 58 104 42" class="action-arrow" marker-end="${arrow}"></path>
      <path d="M172 92 C170 70 168 58 160 42" class="action-arrow" marker-end="${arrow}"></path>
      <text x="36" y="194" class="pose-note">Ribs down, press straight overhead</text>
    `,
    Arms: `
      <text x="24" y="28" class="pose-title">Arm isolation</text>
      <circle cx="132" cy="54" r="14" class="body-dark"></circle>
      <path d="M132 70 L132 134" class="body-line thick"></path>
      <path d="M126 84 L92 118 L96 150" class="body-line"></path>
      <path d="M138 84 L172 118 L168 150" class="body-line"></path>
      <path d="M92 118 L96 150" stroke="${accent}" stroke-width="16" stroke-linecap="round"></path>
      <path d="M172 118 L168 150" stroke="${accent}" stroke-width="16" stroke-linecap="round"></path>
      <path d="M80 154 C76 132 84 114 102 102" class="action-arrow" marker-end="${arrow}"></path>
      <text x="38" y="194" class="pose-note">Elbows stay fixed, move slowly</text>
    `,
    "Core Brace": `
      <text x="24" y="28" class="pose-title">Core brace / plank</text>
      <line x1="52" y1="122" x2="218" y2="96" class="guide-line"></line>
      <circle cx="218" cy="90" r="13" class="body-dark"></circle>
      <path d="M206 96 L146 108 L84 120" class="body-line thick"></path>
      <path d="M150 108 L126 146" class="body-line"></path>
      <path d="M86 120 L50 150" class="body-line"></path>
      <rect x="126" y="98" width="46" height="24" rx="10" fill="${accent}" opacity="0.95" transform="rotate(-10 149 110)"></rect>
      <path d="M134 78 C126 96 126 116 134 136" class="action-arrow" marker-end="${arrow}"></path>
      <text x="28" y="194" class="pose-note">Brace abs, keep hips level</text>
    `,
    Cardio: `
      <text x="24" y="28" class="pose-title">Cardio stance</text>
      <circle cx="112" cy="48" r="13" class="body-dark"></circle>
      <path d="M112 64 L130 112" class="body-line thick"></path>
      <path d="M124 78 L82 94" class="body-line"></path>
      <path d="M128 80 L174 58" class="body-line"></path>
      <path d="M130 112 L92 160" class="body-line"></path>
      <path d="M132 112 L184 150" class="body-line"></path>
      <path d="M66 170 C104 188 158 188 206 164" class="action-arrow" marker-end="${arrow}"></path>
      <circle cx="132" cy="112" r="22" fill="${accent}" opacity="0.8"></circle>
      <text x="32" y="194" class="pose-note">Soft knees, quick feet, steady breathing</text>
    `,
    Mobility: `
      <text x="24" y="28" class="pose-title">Mobility stretch</text>
      <circle cx="92" cy="62" r="13" class="body-dark"></circle>
      <path d="M102 72 C128 92 150 116 174 146" class="body-line thick"></path>
      <path d="M126 96 L82 146 L48 146" class="body-line"></path>
      <path d="M148 120 L198 150 L230 150" class="body-line"></path>
      <path d="M112 84 L72 104" class="body-line"></path>
      <path d="M134 102 L178 78" class="body-line"></path>
      <path d="M76 132 C104 104 140 92 178 78" class="action-arrow" marker-end="${arrow}"></path>
      <ellipse cx="148" cy="118" rx="38" ry="18" fill="${accent}" opacity="0.55"></ellipse>
      <text x="34" y="194" class="pose-note">Move slow, breathe, stop before pain</text>
    `
  };

  return `
    <svg class="pose-svg" viewBox="0 0 264 220" role="img" aria-label="${pattern} posture picture">
      ${commonDefs}
      <rect x="0" y="0" width="264" height="220" rx="14" fill="#f8faf8"></rect>
      <rect x="18" y="168" width="228" height="12" rx="6" fill="#d8e2dd"></rect>
      ${poses[pattern] || poses["Core Brace"]}
    </svg>
  `;
}

function exerciseVisual(move) {
  const focus = focusMuscles(move.part);
  const cues = postureCues[move.part] || postureCues.Core;
  const accent = move.part === "Legs" ? "#f2c14e" : move.part === "Back" ? "#0d7c72" : move.part === "Core" ? "#6f63ff" : "#ff5a3d";
  return `
    <div class="exercise-visual" aria-label="Posture guide for ${move.name}">
      ${forgeFitPoseSvg(move, accent)}
      <div class="focus-row">${focus.map((item) => `<span>${item}</span>`).join("")}</div>
      <ul>${cues.map((cue) => `<li>${cue}</li>`).join("")}</ul>
    </div>
  `;
}

if (typeof renderAll === "function") {
  renderAll();
}
