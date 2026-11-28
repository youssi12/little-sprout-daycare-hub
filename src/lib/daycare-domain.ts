import type { Child, DaycareState, Installment, Payment } from './daycare-types';
export const money = (n: number) => `${Math.round(n).toLocaleString('fr-FR').replace(/[\u202f\u00a0]/g, ' ')} DZD`;
export function formatDate(value: string) { const [year, month, day] = value.slice(0, 10).split('-'); return day && month && year ? `${day}/${month}/${year}` : value; }
export const collected = (p: Payment) => p.installments.reduce((s, i) => s + i.amount, 0);
export const remaining = (p: Payment) => Math.max(0, p.amount - collected(p));
export const paymentStatus = (p: Payment) => remaining(p) === 0 ? 'paid' : collected(p) > 0 ? 'partial' : 'unpaid';
export function addInstallment(p: Payment, i: Installment): Payment {
  if (!Number.isInteger(i.amount) || i.amount <= 0 || i.amount > remaining(p)) throw new Error('Payment exceeds remaining balance');
  return { ...p, installments: [...p.installments, i] };
}
export function ensureMonth(state: DaycareState, month: string): DaycareState {
  const missing = state.children.filter(c => !state.payments.some(p => p.childId === c.id && p.month === month));
  if (!missing.length) return state;
  return { ...state, payments: [...state.payments, ...missing.map(c => ({ id: `p-${c.id}-${month}`, childId: c.id, month, amount: c.monthlyFee, installments: [] }))] };
}
export const childKey = (c: Pick<Child, 'firstName' | 'lastName' | 'birthDate'>) => [c.firstName.trim().toLocaleLowerCase(), c.lastName.trim().toLocaleLowerCase(), c.birthDate].join('|');
export function deleteClassroom(state: DaycareState, id: string): DaycareState {
  if (state.children.some(c => c.classroomId === id)) throw new Error('Move children first');
  return { ...state, classrooms: state.classrooms.filter(r => r.id !== id), staff: state.staff.map(s => s.classroomId === id ? { ...s, classroomId: '' } : s) };
}
