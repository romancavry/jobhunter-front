import type { ToastKind, ToastMessage } from '../types';
class ToastStore {
  messages = $state<ToastMessage[]>([]);
  show(kind: ToastKind, title: string, message?: string) { const id = Date.now() + Math.random(); this.messages.push({ id, kind, title, message }); window.setTimeout(() => this.dismiss(id), 4500); }
  dismiss(id: number) { this.messages = this.messages.filter((toast) => toast.id !== id); }
}
export const toasts = new ToastStore();
