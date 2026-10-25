<script lang="ts">
  import { AlertCircle, CheckCircle2, Info, X } from 'lucide-svelte';
  import { toasts } from '../../stores/toasts.svelte';
</script>
<div class="pointer-events-none fixed right-4 top-4 z-[80] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
  {#each toasts.messages as toast (toast.id)}
    <div class="animate-in pointer-events-auto flex gap-3 rounded-xl border border-[var(--border-strong)] bg-[var(--panel)] p-3.5 shadow-2xl shadow-black/20">
      {#if toast.kind === 'success'}<CheckCircle2 class="mt-0.5 size-4 shrink-0 text-emerald-500" />{:else if toast.kind === 'error'}<AlertCircle class="mt-0.5 size-4 shrink-0 text-rose-500" />{:else}<Info class="mt-0.5 size-4 shrink-0 text-blue-500" />{/if}
      <div class="min-w-0 flex-1"><p class="text-sm font-medium text-[var(--text)]">{toast.title}</p>{#if toast.message}<p class="mt-0.5 text-xs leading-5 text-[var(--muted)]">{toast.message}</p>{/if}</div>
      <button class="icon-button -mr-1 -mt-1" aria-label="Dismiss notification" onclick={() => toasts.dismiss(toast.id)}><X class="size-3.5" /></button>
    </div>
  {/each}
</div>
