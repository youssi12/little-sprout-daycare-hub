import type { AttendanceStatus, DaycareState } from "./daycare-types";

export const todayISO = () => new Date().toISOString().slice(0, 10);
export const currentMonth = () => new Date().toISOString().slice(0, 7);

const classrooms = [
  { id: "c1", name: "Seedlings", ageRange: "0–2 yrs", capacity: 10 },
  { id: "c2", name: "Sprouts", ageRange: "2–3 yrs", capacity: 14 },
  { id: "c3", name: "Little Oaks", ageRange: "3–5 yrs", capacity: 16 },
];

const kids = [
  ["Leo", "Miller", "2022-06-14", "c2", ["Peanuts"], "Carries EpiPen in green bag.", "Maria Miller", "555-0142", "maria.miller@mail.com", "Tom Miller", "555-0188", ["Maria Miller", "Tom Miller", "Nan Miller"], 450],
  ["Maya", "Chen", "2023-02-02", "c1", ["Dairy"], "Lactose intolerant — soy milk provided by parents.", "Wei Chen", "555-0173", "wei.chen@mail.com", "Lian Chen", "555-0199", ["Wei Chen", "Lian Chen"], 495],
  ["Oliver", "Bennett", "2021-09-30", "c3", [], "", "Sarah Bennett", "555-0110", "s.bennett@mail.com", "Paul Bennett", "555-0111", ["Sarah Bennett", "Paul Bennett"], 420],
  ["Amara", "Okafor", "2021-04-18", "c3", ["Eggs"], "Mild eczema — cream after outdoor play.", "Ngozi Okafor", "555-0125", "ngozi@mail.com", "Emeka Okafor", "555-0126", ["Ngozi Okafor", "Emeka Okafor"], 420],
  ["Felix", "Aris", "2022-11-05", "c2", [], "Wears glasses, spare pair in cubby.", "Elena Aris", "555-0134", "elena.aris@mail.com", "Dimi Aris", "555-0135", ["Elena Aris", "Dimi Aris"], 450],
  ["Mila", "Vance", "2023-05-21", "c1", [], "", "Kate Vance", "555-0150", "kate.vance@mail.com", "Joe Vance", "555-0151", ["Kate Vance", "Joe Vance"], 495],
  ["Noah", "Silva", "2021-12-12", "c3", ["Shellfish"], "", "Ana Silva", "555-0160", "ana.silva@mail.com", "Rui Silva", "555-0161", ["Ana Silva", "Rui Silva"], 420],
  ["Sophie", "Tan", "2022-08-09", "c2", [], "Asthma — inhaler at 10:30am daily.", "Grace Tan", "555-0170", "grace.tan@mail.com", "Ben Tan", "555-0171", ["Grace Tan", "Ben Tan"], 450],
  ["Ivy", "Novak", "2023-01-16", "c1", [], "", "Petra Novak", "555-0180", "petra@mail.com", "Jan Novak", "555-0181", ["Petra Novak", "Jan Novak"], 495],
  ["Jonah", "Reyes", "2021-07-07", "c3", [], "", "Cruz Reyes", "555-0190", "cruz.reyes@mail.com", "Lia Reyes", "555-0191", ["Cruz Reyes", "Lia Reyes"], 420],
] as const;

function plusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function seedState(): DaycareState {
  const day = todayISO();
  const month = currentMonth();

  const children = kids.map((k, i) => ({
    id: `k${i + 1}`,
    firstName: k[0],
    lastName: k[1],
    birthDate: k[2],
    classroomId: k[3],
    allergies: [...k[4]],
    medicalNotes: k[5],
    parentName: k[6],
    parentPhone: k[7],
    parentEmail: k[8],
    emergencyName: k[9],
    emergencyPhone: k[10],
    authorizedPickups: [...k[11]],
    monthlyFee: k[12],
    vaccinations: [
      { name: "DTaP booster", dueDate: plusDays((i % 5) * 9 - 4) },
      { name: "MMR", dueDate: plusDays(120 + i * 3) },
    ],
  }));

  const presentIdx = [0, 1, 2, 3, 5, 7, 8];
  const checkedOut = [9];

  const attendance = children.map((c, i) => {
    const status = presentIdx.includes(i)
      ? "present"
      : checkedOut.includes(i)
        ? "checked-out"
        : i === 4
          ? "absent"
          : "expected";
    return {
      id: `a-${c.id}-${day}`,
      childId: c.id,
      date: day,
      status: status as AttendanceStatus,
      checkInAt: status === "present" || status === "checked-out" ? `0${7 + (i % 2)}:${(15 + i * 4) % 60}`.replace(/:(\d)$/, ":0$1") : undefined,
      checkOutAt: status === "checked-out" ? "15:40" : undefined,
      droppedOffBy: status === "present" || status === "checked-out" ? c.parentName : undefined,
      pickedUpBy: status === "checked-out" ? c.emergencyName : undefined,
    };
  });

  const payments = children.map((c, i) => ({
    id: `p-${c.id}-${month}`,
    childId: c.id,
    month,
    amount: c.monthlyFee,
    paid: i % 4 !== 1,
    paidAt: i % 4 !== 1 ? `${month}-03` : undefined,
    method: i % 4 !== 1 ? (i % 2 ? "Bank transfer" : "Card") : undefined,
  }));

  const staff = [
    { id: "s1", name: "Sarah Jenkins", role: "Director", phone: "555-0201", classroomId: "c3", shift: "07:00 – 16:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    { id: "s2", name: "Clara Nwosu", role: "Lead Teacher", phone: "555-0202", classroomId: "c1", shift: "07:30 – 15:30", days: ["Mon", "Tue", "Wed", "Thu"] },
    { id: "s3", name: "Diego Marín", role: "Teacher", phone: "555-0203", classroomId: "c2", shift: "08:00 – 17:00", days: ["Mon", "Wed", "Thu", "Fri"] },
    { id: "s4", name: "Hanna Berg", role: "Teacher", phone: "555-0204", classroomId: "c3", shift: "09:00 – 18:00", days: ["Tue", "Wed", "Thu", "Fri"] },
    { id: "s5", name: "Rosa Kim", role: "Assistant", phone: "555-0205", classroomId: "c1", shift: "10:00 – 18:00", days: ["Mon", "Tue", "Fri"] },
  ];

  const reports = [
    { id: "r1", childId: "k1", date: day, meals: "Turkey wrap, grapes", mealAmount: "most" as const, napMinutes: 55, mood: "happy" as const, activities: "Sandpit, story circle", notes: "Shared toys nicely." },
    { id: "r2", childId: "k6", date: day, meals: "Oat porridge, pear", mealAmount: "all" as const, napMinutes: 80, mood: "calm" as const, activities: "Music time", notes: "" },
  ];

  const inventory = [
    { id: "i1", name: "Diapers size 3", category: "Supplies" as const, quantity: 8, threshold: 20, unit: "packs" },
    { id: "i2", name: "Wet wipes", category: "Supplies" as const, quantity: 34, threshold: 15, unit: "packs" },
    { id: "i3", name: "Oat milk", category: "Food" as const, quantity: 6, threshold: 10, unit: "litres" },
    { id: "i4", name: "Apples", category: "Food" as const, quantity: 42, threshold: 20, unit: "pieces" },
    { id: "i5", name: "Building blocks", category: "Toys" as const, quantity: 12, threshold: 6, unit: "sets" },
    { id: "i6", name: "Craft paper", category: "Supplies" as const, quantity: 3, threshold: 8, unit: "reams" },
    { id: "i7", name: "Puzzles", category: "Toys" as const, quantity: 18, threshold: 8, unit: "boxes" },
  ];

  return { children, classrooms, staff, attendance, payments, reports, inventory };
}
