<script lang="ts">
  import { Menu, Moon, Sun } from 'lucide-svelte';
  import { theme } from '../../stores/theme.svelte';
  let { title, subtitle, openMenu }: { title: string; subtitle: string; openMenu: () => void } = $props();
</script>
<header class="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] px-4 backdrop-blur-xl sm:px-6 lg:px-8"><button class="icon-button lg-hide" aria-label="Open navigation" onclick={openMenu}><Menu class="size-4.5" /></button><div class="min-w-0 flex-1"><h1 class="truncate text-sm font-semibold text-[var(--text)] sm:text-[15px]">{title}</h1><p class="hidden truncate text-[11px] text-[var(--faint)] sm:block">{subtitle}</p></div><button class="icon-button" aria-label={`Switch to ${theme.value === 'dark' ? 'light' : 'dark'} mode`} onclick={() => theme.toggle()}>{#if theme.value === 'dark'}<Sun class="size-4" />{:else}<Moon class="size-4" />{/if}</button></header>
