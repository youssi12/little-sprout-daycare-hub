export type Language = 'en' | 'fr' | 'ar';
export type AttendanceStatus = 'expected' | 'present' | 'checked-out' | 'absent';
export type Mood = 'happy' | 'calm' | 'sleepy' | 'fussy';
export interface Settings { name: string; phone: string; email: string; language: Language }
export interface Child {
  id: string; firstName: string; lastName: string; birthDate: string; classroomId: string;
  allergies: string[]; medicalNotes: string; parentName: string; parentPhone: string;
  parentEmail: string; emergencyName: string; emergencyPhone: string;
  authorizedPickups: string[]; monthlyFee: number; vaccinations: { name: string; dueDate: string }[];
}
export interface AttendanceRecord {
  id: string; childId: string; date: string; status: AttendanceStatus;
  checkInAt?: string | undefined; checkOutAt?: string | undefined;
  droppedOffBy?: string | undefined; pickedUpBy?: string | undefined;
}
export interface Installment { id: string; amount: number; date: string; method: 'cash' | 'transfer'; note: string }
export interface Payment { id: string; childId: string; month: string; amount: number; installments: Installment[] }
export interface Staff { id: string; name: string; role: string; phone: string; classroomId: string; shift: string; days: string[] }
export interface Classroom { id: string; name: string; ageRange: string; capacity: number }
export interface DailyReport {
  id: string; childId: string; date: string; meals: string; mealAmount: 'all' | 'most' | 'some' | 'none';
  napMinutes: number; mood: Mood; activities: string; notes: string;
}
export interface InventoryItem { id: string; name: string; category: 'toys' | 'food' | 'supplies'; quantity: number; threshold: number; unit: string }
export interface DaycareState { settings: Settings; children: Child[]; classrooms: Classroom[]; staff: Staff[]; attendance: AttendanceRecord[]; payments: Payment[]; reports: DailyReport[]; inventory: InventoryItem[] }
