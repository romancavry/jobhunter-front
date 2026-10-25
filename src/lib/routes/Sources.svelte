<script lang="ts">
  import { AlertTriangle, Check, DatabaseZap, Edit3, ExternalLink, LoaderCircle, MoreHorizontal, Plus, RefreshCw, Trash2, X, Zap } from 'lucide-svelte';
  import { sourcesApi } from '../api/sources';
  import { toasts } from '../stores/toasts.svelte';
  import type { JobSource, SourceInput, SourceType, SyncResult } from '../types';

  let sources = $state<JobSource[]>([]);
  let loading = $state(true);
  let error = $state('');
  let saving = $state(false);
  let syncing = $state<string | null>(null);
  let syncResults = $state<Record<string, SyncResult>>({});
  let editorOpen = $state(false);
  let editing = $state<JobSource | null>(null);
  let deleting = $state<JobSource | null>(null);
  let formError = $state('');
  let form = $state({ name: '', type: 'XING' as SourceType, url: '', enabled: true, keywords: '', location: '', maxPages: '' });

  $effect(() => {
    void load();
  });

  async function load() {
    loading = true;
    error = '';
    try {
      sources = await sourcesApi.list();
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Could not load sources.';
    } finally {
      loading = false;
    }
  }

  function openCreate() {
    editing = null;
    form = { name: '', type: 'XING', url: '', enabled: true, keywords: '', location: '', maxPages: '' };
    formError = '';
    editorOpen = true;
  }

  function openEdit(source: JobSource) {
    editing = source;
    form = {
      name: source.name,
      type: source.type,
      url: source.url,
      enabled: source.enabled,
      keywords: source.settings.keywords?.join(', ') || '',
      location: typeof source.settings.location === 'string' ? source.settings.location : '',
      maxPages: source.settings.maxPages ? String(source.settings.maxPages) : '',
    };
    formError = '';
    editorOpen = true;
  }

  function payload(): SourceInput {
    const settings: SourceInput['settings'] = {};
    const keywords = form.keywords.split(',').map((value) => value.trim()).filter(Boolean);
    if (keywords.length) settings.keywords = keywords;
    if (form.location.trim()) settings.location = form.location.trim();
    if (form.maxPages) settings.maxPages = Number(form.maxPages);
    return { name: form.name.trim(), type: form.type, url: form.url.trim(), enabled: form.enabled, settings };
  }

  async function save(event: SubmitEvent) {
    event.preventDefault();
    formError = '';
    if (!form.name.trim()) return (formError = 'Give this source a name.');
    try { new URL(form.url); } catch { return (formError = 'Enter a valid source URL.'); }
    if (form.maxPages && (!Number.isInteger(Number(form.maxPages)) || Number(form.maxPages) < 1)) return (formError = 'Max pages must be a positive whole number.');
    saving = true;
    try {
      const saved = editing ? await sourcesApi.update(editing.id, payload()) : await sourcesApi.create(payload());
      if (editing) sources = sources.map((item) => (item.id === saved.id ? saved : item));
      else sources = [saved, ...sources];
      editorOpen = false;
      toasts.show('success', editing ? 'Source updated' : 'Source added', `${saved.name} is ready.`);
    } catch (cause) {
      formError = cause instanceof Error ? cause.message : 'Could not save this source.';
    } finally {
      saving = false;
    }
  }

  async function toggle(source: JobSource) {
    const next = !source.enabled;
    sources = sources.map((item) => (item.id === source.id ? { ...item, enabled: next } : item));
    try {
      const updated = await sourcesApi.update(source.id, { enabled: next });
      sources = sources.map((item) => (item.id === updated.id ? updated : item));
      toasts.show('success', next ? 'Source enabled' : 'Source paused', source.name);
    } catch (cause) {
      sources = sources.map((item) => (item.id === source.id ? source : item));
      toasts.show('error', 'Update failed', cause instanceof Error ? cause.message : undefined);
    }
  }

  async function sync(source: JobSource) {
    syncing = source.id;
    try {
      const result = await sourcesApi.sync(source.id);
      syncResults = { ...syncResults, [source.id]: result };
      toasts.show('success', 'Sync complete', `${result.fetched} fetched · ${result.saved} processed`);
    } catch (cause) {
      toasts.show('error', 'Sync failed', cause instanceof Error ? cause.message : undefined);
    } finally {
      syncing = null;
    }
  }

  async function remove() {
    if (!deleting) return;
    const source = deleting;
    try {
      await sourcesApi.remove(source.id);
      sources = sources.filter((item) => item.id !== source.id);
      deleting = null;
      toasts.show('success', 'Source deleted', source.name);
    } catch (cause) {
      toasts.show('error', 'Delete failed', cause instanceof Error ? cause.message : undefined);
    }
  }

  function date(value: string) {
    return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
  }
</script>

<div class="page-wrap">
  <section class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div><p class="eyebrow">Collection</p><h2 class="page-heading">Sources</h2><p class="page-description">Manage where JobHunter looks for opportunities.</p></div>
    <button class="button primary self-start" onclick={openCreate}><Plus class="size-3.5" /> Add source</button>
  </section>

  {#if loading}
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{#each Array(6) as _}<div class="panel p-5"><div class="flex gap-3"><div class="skeleton size-10"></div><div class="flex-1 space-y-2"><div class="skeleton h-3 w-1/2"></div><div class="skeleton h-2.5 w-1/3"></div></div></div><div class="skeleton mt-5 h-9 w-full"></div></div>{/each}</div>
  {:else if error}
    <div class="panel empty-state"><div class="empty-icon error"><DatabaseZap class="size-5" /></div><h3>Sources could not be loaded</h3><p>{error}</p><button class="button secondary" onclick={load}>Try again</button></div>
  {:else if sources.length === 0}
    <div class="panel empty-state min-h-[420px]"><div class="empty-icon"><DatabaseZap class="size-5" /></div><h3>Connect your first source</h3><p>Add a XING or Indeed search URL. XING synchronization is available now; Indeed is ready for a future adapter.</p><button class="button primary" onclick={openCreate}><Plus class="size-3.5" /> Add source</button></div>
  {:else}
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {#each sources as source (source.id)}
        <article class="panel group overflow-hidden p-5">
          <div class="flex items-start gap-3">
            <span class="grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--panel-subtle)] text-xs font-bold text-[var(--muted)]">{source.type.slice(0, 2)}</span>
            <div class="min-w-0 flex-1"><h3 class="truncate text-sm font-semibold text-[var(--text)]">{source.name}</h3><p class="mt-1 flex items-center gap-1.5 text-[10px] text-[var(--faint)]"><span class:enabled={source.enabled} class="tiny-light"></span>{source.enabled ? 'Active' : 'Paused'} · {source.type}</p></div>
            <button class="icon-button" aria-label={`Edit ${source.name}`} onclick={() => openEdit(source)}><Edit3 class="size-3.5" /></button>
          </div>
          <a class="mt-4 flex min-w-0 items-center gap-2 truncate rounded-lg border border-[var(--border)] bg-[var(--panel-subtle)] px-3 py-2 text-[10px] text-[var(--faint)] hover:text-[var(--text)]" href={source.url} target="_blank" rel="noreferrer"><span class="truncate">{source.url}</span><ExternalLink class="ml-auto size-3 shrink-0" /></a>
          <div class="mt-4 flex flex-wrap gap-1.5">
            {#if source.settings.location}<span class="source-pill">{source.settings.location}</span>{/if}
            {#each source.settings.keywords?.slice(0, 3) || [] as keyword}<span class="source-pill">{keyword}</span>{/each}
            {#if !source.settings.location && !source.settings.keywords?.length}<span class="text-[10px] text-[var(--faint)]">No search metadata</span>{/if}
          </div>
          {#if syncResults[source.id]}
            <div class="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2.5 text-[10px] text-emerald-600 dark:text-emerald-400"><Check class="size-3.5" /><strong>{syncResults[source.id].fetched}</strong> fetched · <strong>{syncResults[source.id].saved}</strong> processed</div>
          {/if}
          <div class="mt-5 flex items-center gap-2 border-t border-[var(--border)] pt-4">
            <button class="toggle" class:on={source.enabled} role="switch" aria-checked={source.enabled} aria-label={`${source.enabled ? 'Disable' : 'Enable'} ${source.name}`} onclick={() => toggle(source)}><span></span></button>
            <span class="text-[10px] text-[var(--faint)]">Added {date(source.created_at)}</span>
            <button class="button secondary ml-auto px-2.5" onclick={() => sync(source)} disabled={!source.enabled || source.type !== 'XING' || syncing === source.id} title={source.type !== 'XING' ? 'The backend does not have an Indeed adapter yet' : !source.enabled ? 'Enable the source before syncing' : 'Synchronize now'}>
              {#if syncing === source.id}<LoaderCircle class="size-3.5 animate-spin" />{:else}<Zap class="size-3.5" />{/if} Sync
            </button>
            <button class="icon-button danger" aria-label={`Delete ${source.name}`} onclick={() => (deleting = source)}><Trash2 class="size-3.5" /></button>
          </div>
        </article>
      {/each}
    </div>
  {/if}
</div>

{#if editorOpen}
  <button class="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" aria-label="Close source editor" onclick={() => (editorOpen = false)}></button>
  <div class="modal-shell" role="dialog" aria-modal="true" aria-labelledby="source-editor-title">
    <form onsubmit={save}>
      <div class="modal-header"><div><h2 id="source-editor-title" class="text-sm font-semibold text-[var(--text)]">{editing ? 'Edit source' : 'Add a source'}</h2><p class="mt-1 text-[11px] text-[var(--faint)]">Configure a vacancy collection channel.</p></div><button type="button" class="icon-button" aria-label="Close" onclick={() => (editorOpen = false)}><X class="size-4" /></button></div>
      <div class="space-y-4 p-5 sm:p-6">
        <label class="field"><span>Name</span><input bind:value={form.name} placeholder="e.g. Berlin frontend roles" /></label>
        <div class="grid gap-4 sm:grid-cols-2"><label class="field"><span>Provider</span><select bind:value={form.type}><option value="XING">XING</option><option value="INDEED">Indeed</option></select><small>{form.type === 'INDEED' ? 'Can be saved, but sync needs a backend adapter.' : 'Sync is supported by the current backend.'}</small></label><label class="field"><span>Max pages</span><input bind:value={form.maxPages} inputmode="numeric" placeholder="Optional" /></label></div>
        <label class="field"><span>Search URL</span><input bind:value={form.url} type="url" placeholder="https://www.xing.com/jobs/search/…" /></label>
        <label class="field"><span>Keywords <em>comma separated</em></span><input bind:value={form.keywords} placeholder="Svelte, TypeScript, frontend" /></label>
        <label class="field"><span>Location</span><input bind:value={form.location} placeholder="Berlin, Germany" /></label>
        <label class="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--panel-subtle)] p-3.5"><span><strong class="block text-xs font-medium text-[var(--text)]">Enable source</strong><small class="mt-1 block text-[10px] text-[var(--faint)]">Enabled XING sources can be synchronized.</small></span><input class="size-4 accent-blue-600" bind:checked={form.enabled} type="checkbox" /></label>
        {#if formError}<div class="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2.5 text-xs text-rose-500">{formError}</div>{/if}
      </div>
      <div class="modal-footer"><button type="button" class="button secondary" onclick={() => (editorOpen = false)}>Cancel</button><button type="submit" class="button primary" disabled={saving}>{#if saving}<LoaderCircle class="size-3.5 animate-spin" />{/if}{editing ? 'Save changes' : 'Add source'}</button></div>
    </form>
  </div>
{/if}

{#if deleting}
  <button class="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm" aria-label="Cancel deletion" onclick={() => (deleting = null)}></button>
  <div class="confirm-shell" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
    <div class="empty-icon error"><AlertTriangle class="size-5" /></div><h2 id="delete-title" class="mt-4 text-sm font-semibold text-[var(--text)]">Delete {deleting.name}?</h2><p class="mt-2 text-xs leading-5 text-[var(--muted)]">This removes the source configuration. Existing collected jobs are not deleted by this endpoint.</p><div class="mt-5 flex justify-end gap-2"><button class="button secondary" onclick={() => (deleting = null)}>Cancel</button><button class="button danger-solid" onclick={remove}><Trash2 class="size-3.5" /> Delete source</button></div>
  </div>
{/if}
