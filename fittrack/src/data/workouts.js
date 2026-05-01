export const YT = (q) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(q + " proper form tutorial")}`;

// type: "compound" | "isolation" | "core" | "bodyweight"
// rest: seconds between sets
// progression: kg increment when ready to bump weight (null = bodyweight, progress reps only)
// repTarget: numeric top of the rep range used for progression rules (null for time-based)
export const WORKOUT_PLAN = {
  A: {
    label: "Day A — Push",
    day: "Monday",
    color: "#FF6B35",
    exercises: [
      { id: "a1", name: "DB Floor Press",            equipment: "2x DB",         sets: 4, reps: 12,    repTarget: 12, type: "compound",  rest: 150, progression: 2.5, yt: YT("dumbbell floor press") },
      { id: "a2", name: "Overhead Press",            equipment: "Full barbell",  sets: 4, reps: 10,    repTarget: 10, type: "compound",  rest: 180, progression: 2.5, yt: YT("barbell overhead press") },
      { id: "a3", name: "Lateral Raise",             equipment: "2x DB light",   sets: 3, reps: 15,    repTarget: 15, type: "isolation", rest: 75,  progression: 1,   yt: YT("dumbbell lateral raise") },
      { id: "a4", name: "Tricep Overhead Extension", equipment: "1x DB",         sets: 3, reps: 12,    repTarget: 12, type: "isolation", rest: 75,  progression: 1,   yt: YT("dumbbell tricep overhead extension") },
      { id: "a5", name: "Plank Hold",                equipment: "Bodyweight",    sets: 3, reps: "40s", repTarget: null, type: "core",    rest: 45,  progression: null, yt: YT("plank hold form") },
    ],
  },
  B: {
    label: "Day B — Pull",
    day: "Wednesday",
    color: "#4ECDC4",
    exercises: [
      { id: "b1", name: "Barbell Bent-Over Row", equipment: "Full barbell", sets: 4, reps: 10,        repTarget: 10, type: "compound",  rest: 150, progression: 2.5, yt: YT("barbell bent over row") },
      { id: "b2", name: "Single-Arm DB Row",     equipment: "1x DB",        sets: 3, reps: "12 each", repTarget: 12, type: "compound",  rest: 105, progression: 2.5, yt: YT("single arm dumbbell row") },
      { id: "b3", name: "Hammer Curl",           equipment: "2x DB",        sets: 3, reps: 12,        repTarget: 12, type: "isolation", rest: 75,  progression: 1,   yt: YT("hammer curl dumbbell") },
      { id: "b4", name: "DB Reverse Curl",       equipment: "2x DB",        sets: 3, reps: 12,        repTarget: 12, type: "isolation", rest: 75,  progression: 1,   yt: YT("dumbbell reverse curl") },
      { id: "b5", name: "Dead Bug",              equipment: "Bodyweight",   sets: 3, reps: "10 each", repTarget: null, type: "core",    rest: 45,  progression: null, yt: YT("dead bug exercise core") },
    ],
  },
  C: {
    label: "Day C — Legs",
    day: "Friday",
    color: "#A855F7",
    exercises: [
      { id: "c1", name: "Barbell RDL",       equipment: "Full barbell",   sets: 4, reps: 12,        repTarget: 12, type: "compound",  rest: 180, progression: 2.5, yt: YT("Romanian deadlift barbell") },
      { id: "c2", name: "Goblet Squat",      equipment: "1x DB at chest", sets: 4, reps: 12,        repTarget: 12, type: "compound",  rest: 150, progression: 2.5, yt: YT("goblet squat dumbbell") },
      { id: "c3", name: "DB Reverse Lunge",  equipment: "2x DB",          sets: 3, reps: "10 each", repTarget: 10, type: "compound",  rest: 105, progression: 2.5, yt: YT("dumbbell reverse lunge") },
      { id: "c4", name: "Glute Bridge",      equipment: "Bodyweight",     sets: 3, reps: 15,        repTarget: 15, type: "bodyweight", rest: 60, progression: null, yt: YT("glute bridge exercise") },
      { id: "c5", name: "Hollow Body Hold",  equipment: "Bodyweight",     sets: 3, reps: "30s",     repTarget: null, type: "core",    rest: 45,  progression: null, yt: YT("hollow body hold core") },
    ],
  },
  D: {
    label: "Day D — Full Body",
    day: "Saturday",
    color: "#F59E0B",
    exercises: [
      { id: "d1", name: "Barbell Overhead Press", equipment: "Full barbell", sets: 3, reps: 10,    repTarget: 10, type: "compound",  rest: 150, progression: 2.5, yt: YT("barbell overhead press") },
      { id: "d2", name: "DB Sumo Squat",          equipment: "1x DB",        sets: 3, reps: 12,    repTarget: 12, type: "compound",  rest: 150, progression: 2.5, yt: YT("dumbbell sumo squat") },
      { id: "d3", name: "Barbell Row",            equipment: "Full barbell", sets: 3, reps: 10,    repTarget: 10, type: "compound",  rest: 150, progression: 2.5, yt: YT("barbell bent over row") },
      { id: "d4", name: "Arnold Press",           equipment: "2x DB",        sets: 3, reps: 10,    repTarget: 10, type: "compound",  rest: 120, progression: 2.5, yt: YT("arnold press dumbbell") },
      { id: "d5", name: "DB Curl to Press",       equipment: "2x DB",        sets: 3, reps: 10,    repTarget: 10, type: "compound",  rest: 120, progression: 2.5, yt: YT("dumbbell curl to press") },
      { id: "d6", name: "Plank",                  equipment: "Bodyweight",   sets: 3, reps: "45s", repTarget: null, type: "core",    rest: 45,  progression: null, yt: YT("plank hold form") },
    ],
  },
};

export const CARDIO_PLAN = [
  { id: "cardio1", day: "Tuesday",  type: "LISS", duration: "30–40 min", speed: "5–6 km/h", incline: "8–12%", notes: "Fat burn zone. Incline walk, not running." },
  { id: "cardio2", day: "Thursday", type: "HIIT", duration: "20 min",    protocol: "1 min @ 14–16 km/h + 2 min walk recovery, repeat", incline: "0%", notes: "English class day — keep it short and intense." },
];
