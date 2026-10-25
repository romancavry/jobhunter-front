export type Theme = 'dark' | 'light';
function initialTheme(): Theme { if (typeof localStorage === 'undefined') return 'dark'; return localStorage.getItem('jobhunter-theme') === 'light' ? 'light' : 'dark'; }
class ThemeStore {
  value = $state<Theme>(initialTheme());
  constructor() { if (typeof document !== 'undefined') $effect.root(() => { $effect(() => { document.documentElement.dataset.theme = this.value; document.documentElement.classList.toggle('dark', this.value === 'dark'); localStorage.setItem('jobhunter-theme', this.value); }); }); }
  toggle() { this.value = this.value === 'dark' ? 'light' : 'dark'; }
}
export const theme = new ThemeStore();
