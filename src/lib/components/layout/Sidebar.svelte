<script lang="ts">
  import { BriefcaseBusiness, DatabaseZap, LayoutDashboard, ListChecks, Settings, X } from 'lucide-svelte';
  import type { PageId } from '../../types';
  let { current, mobileOpen, navigate, close }: { current: PageId; mobileOpen: boolean; navigate: (page: PageId) => void; close: () => void } = $props();
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'jobs', label: 'Jobs', icon: BriefcaseBusiness }, { id: 'applications', label: 'Applications', icon: ListChecks }, { id: 'sources', label: 'Sources', icon: DatabaseZap }, { id: 'settings', label: 'Settings', icon: Settings }
  ] as const;
</script>
{#if mobileOpen}<button class="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden" aria-label="Close navigation" onclick={close}></button>{/if}
<aside class:translate-x-0={mobileOpen} class="fixed inset-y-0 left-0 z-50 flex w-64 -translate-x-full flex-col border-r border-[var(--border)] bg-[var(--sidebar)] transition-transform duration-200 lg:translate-x-0">
  <div class="flex h-16 items-center justify-between px-5"><button class="flex items-center gap-2.5" aria-label="Go to dashboard" onclick={() => navigate('dashboard')}><span class="grid size-8 place-items-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20"><BriefcaseBusiness class="size-4.5" strokeWidth={2.2} /></span><span class="text-[15px] font-semibold tracking-tight text-[var(--text)]">JobHunter</span></button><button class="icon-button lg-hide" aria-label="Close navigation" onclick={close}><X class="size-4" /></button></div>
  <nav class="flex-1 px-3 py-4" aria-label="Primary navigation"><p class="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--faint)]">Workspace</p><div class="space-y-1">{#each links as link}<button class="nav-item" class:active={current === link.id} aria-current={current === link.id ? 'page' : undefined} onclick={() => navigate(link.id)}><link.icon class="size-4" strokeWidth={1.8} /><span>{link.label}</span>{#if link.id === 'applications'}<span class="ml-auto rounded bg-[var(--chip)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--faint)]">Soon</span>{/if}</button>{/each}</div></nav>
  <div class="m-3 rounded-xl border border-[var(--border)] bg-[var(--panel-subtle)] p-3.5"><div class="flex items-center gap-2 text-xs font-medium text-[var(--text)]"><span class="size-1.5 rounded-full bg-emerald-500"></span> Personal workspace</div><p class="mt-1.5 text-[11px] leading-4 text-[var(--faint)]">Your private job search command center.</p></div>
</aside>
