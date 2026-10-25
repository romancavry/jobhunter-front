<script lang="ts">
  import { ArrowUpDown, BriefcaseBusiness, CalendarDays, Check, ExternalLink, Filter, MapPin, RefreshCw, Search, SlidersHorizontal, X } from 'lucide-svelte';
  import { jobsApi } from '../api/jobs';
  import { sourcesApi } from '../api/sources';
  import type { Job, JobSource } from '../types';

  let jobs = $state<Job[]>([]);
  let sources = $state<JobSource[]>([]);
  let loading = $state(true);
  let error = $state('');
  let query = $state('');
  let debouncedQuery = $state('');
  let sourceFilter = $state('all');
  let locationFilter = $state('all');
  let sort = $state<'newest' | 'oldest' | 'company' | 'title'>('newest');
  let selected = $state<Job | null>(null);

  $effect(() => {
    void load();
  });

  $effect(() => {
    const value = query;
    const timer = window.setTimeout(() => (debouncedQuery = value), 250);
    return () => window.clearTimeout(timer);
  });

  const sourceName = $derived(new Map(sources.map((source) => [source.id, source.name])));
  const locations = $derived([...new Set(jobs.map((job) => job.location).filter((value): value is string => Boolean(value)))].sort());
  const filtered = $derived.by(() => {
    const needle = debouncedQuery.trim().toLocaleLowerCase();
    return jobs
      .filter((job) => !needle || `${job.title} ${job.company}`.toLocaleLowerCase().includes(needle))
      .filter((job) => sourceFilter === 'all' || job.source === sourceFilter)
      .filter((job) => locationFilter === 'all' || job.location === locationFilter)
      .toSorted((a, b) => {
        if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sort === 'company') return a.company.localeCompare(b.company);
        if (sort === 'title') return a.title.localeCompare(b.title);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  });
  const hasFilters = $derived(Boolean(query || sourceFilter !== 'all' || locationFilter !== 'all'));

  async function load() {
    loading = true;
    error = '';
    const [jobResult, sourceResult] = await Promise.allSettled([jobsApi.list(), sourcesApi.list()]);
    if (jobResult.status === 'fulfilled') jobs = jobResult.value;
    else error = jobResult.reason instanceof Error ? jobResult.reason.message : 'Could not load jobs.';
    if (sourceResult.status === 'fulfilled') sources = sourceResult.value;
    loading = false;
  }

  function clearFilters() {
    query = '';
    sourceFilter = 'all';
    locationFilter = 'all';
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
  }
</script>

<div class="page-wrap">
  <section class="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
    <div><p class="eyebrow">Opportunity feed</p><h2 class="page-heading">Jobs</h2><p class="page-description">Search and review every collected vacancy.</p></div>
    <button class="button secondary self-start" onclick={load} disabled={loading}><RefreshCw class={`${loading ? 'animate-spin' : ''} size-3.5`} /> Refresh</button>
  </section>

  <div class="panel overflow-hidden">
    <div class="flex flex-col gap-3 border-b border-[var(--border)] p-3 lg:flex-row lg:items-center">
      <label class="search-field min-w-0 lg:max-w-sm lg:flex-1"><Search class="size-3.5" /><span class="sr-only">Search jobs</span><input bind:value={query} placeholder="Search title or company…" /></label>
      <div class="grid grid-cols-2 gap-2 sm:flex">
        <label class="select-field"><Filter class="size-3.5" /><span class="sr-only">Filter by source</span><select bind:value={sourceFilter}><option value="all">All sources</option>{#each sources as source}<option value={source.id}>{source.name}</option>{/each}</select></label>
        <label class="select-field"><MapPin class="size-3.5" /><span class="sr-only">Filter by location</span><select bind:value={locationFilter}><option value="all">All locations</option>{#each locations as location}<option value={location}>{location}</option>{/each}</select></label>
        <label class="select-field col-span-2"><ArrowUpDown class="size-3.5" /><span class="sr-only">Sort jobs</span><select bind:value={sort}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="company">Company A–Z</option><option value="title">Title A–Z</option></select></label>
      </div>
    </div>

    <div class="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5 text-[11px] text-[var(--faint)] sm:px-5">
      <span>{loading ? 'Loading jobs…' : `${filtered.length} ${filtered.length === 1 ? 'vacancy' : 'vacancies'}`}</span>
      {#if hasFilters}<button class="text-button" onclick={clearFilters}>Clear filters <X class="size-3" /></button>{/if}
    </div>

    {#if loading}
      <div class="space-y-px p-2">{#each Array(7) as _}<div class="flex gap-4 p-3"><div class="skeleton size-10"></div><div class="flex-1 space-y-2"><div class="skeleton h-3 w-2/5"></div><div class="skeleton h-2.5 w-1/4"></div></div><div class="skeleton hidden h-3 w-20 sm:block"></div></div>{/each}</div>
    {:else if error}
      <div class="empty-state"><div class="empty-icon error"><BriefcaseBusiness class="size-5" /></div><h3>Jobs could not be loaded</h3><p>{error}</p><button class="button secondary" onclick={load}>Try again</button></div>
    {:else if filtered.length === 0}
      <div class="empty-state"><div class="empty-icon"><SlidersHorizontal class="size-5" /></div><h3>{jobs.length ? 'No matching jobs' : 'No jobs collected yet'}</h3><p>{jobs.length ? 'Try adjusting your filters or search terms.' : 'Sync an enabled source to start building your vacancy feed.'}</p>{#if hasFilters}<button class="button secondary" onclick={clearFilters}>Clear filters</button>{/if}</div>
    {:else}
      <div class="hidden overflow-x-auto md:block">
        <table class="data-table">
          <thead><tr><th>Role</th><th>Location</th><th>Source</th><th>Collected</th><th><span class="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {#each filtered as job}
              <tr class="cursor-pointer" onclick={() => (selected = job)}>
                <td><div class="flex items-center gap-3"><span class="company-mark">{job.company.slice(0, 1).toUpperCase()}</span><div class="min-w-0"><p class="max-w-md truncate text-xs font-medium text-[var(--text)]">{job.title}</p><p class="mt-1 truncate text-[10px] text-[var(--faint)]">{job.company}</p></div></div></td>
                <td><span class="table-muted"><MapPin class="size-3" />{job.location || 'Remote / unspecified'}</span></td>
                <td><span class="source-pill">{sourceName.get(job.source) || job.source.slice(0, 8)}</span></td>
                <td><span class="table-muted"><CalendarDays class="size-3" />{formatDate(job.created_at)}</span></td>
                <td><a class="icon-button" href={job.url} target="_blank" rel="noreferrer" aria-label={`Open ${job.title} externally`} onclick={(event) => event.stopPropagation()}><ExternalLink class="size-3.5" /></a></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="divide-y divide-[var(--border)] md:hidden">
        {#each filtered as job}
          <button class="w-full p-4 text-left hover:bg-[var(--hover)]" onclick={() => (selected = job)}>
            <div class="flex gap-3"><span class="company-mark">{job.company.slice(0, 1).toUpperCase()}</span><span class="min-w-0 flex-1"><span class="block text-sm font-medium text-[var(--text)]">{job.title}</span><span class="mt-1 block text-xs text-[var(--muted)]">{job.company}</span><span class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[var(--faint)]"><span class="inline-flex items-center gap-1"><MapPin class="size-3" />{job.location || 'Unspecified'}</span><span>{formatDate(job.created_at)}</span></span></span></div>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

{#if selected}
  <button class="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]" aria-label="Close job details" onclick={() => (selected = null)}></button>
  <aside class="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-[var(--border-strong)] bg-[var(--panel)] shadow-2xl shadow-black/30">
    <div class="flex items-center justify-between border-b border-[var(--border)] px-5 py-4"><span class="text-xs font-medium text-[var(--muted)]">Job details</span><button class="icon-button" aria-label="Close job details" onclick={() => (selected = null)}><X class="size-4" /></button></div>
    <div class="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8">
      <div class="flex items-start gap-4"><span class="company-mark size-11 text-sm">{selected.company.slice(0, 1).toUpperCase()}</span><div><h2 class="text-xl font-semibold leading-7 tracking-tight text-[var(--text)]">{selected.title}</h2><p class="mt-1 text-sm text-[var(--muted)]">{selected.company}</p></div></div>
      <div class="mt-6 flex flex-wrap gap-2"><span class="detail-chip"><MapPin class="size-3" />{selected.location || 'Location unspecified'}</span><span class="detail-chip"><CalendarDays class="size-3" />{formatDate(selected.created_at)}</span><span class="detail-chip">{sourceName.get(selected.source) || 'Source'}</span>{#if selected.match_score !== null}<span class="detail-chip accent">{Math.round(selected.match_score)}% match</span>{/if}</div>
      <div class="mt-8"><h3 class="text-xs font-semibold text-[var(--text)]">About the role</h3>{#if selected.description}<div class="description mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]">{selected.description}</div>{:else}<div class="mt-3 rounded-xl border border-dashed border-[var(--border-strong)] p-5 text-sm text-[var(--faint)]">No description was provided by this source.</div>{/if}</div>
    </div>
    <div class="border-t border-[var(--border)] bg-[var(--panel-subtle)] p-4 sm:px-6">
      <div class="flex gap-2"><a class="button primary flex-1" href={selected.url} target="_blank" rel="noreferrer">Apply on source <ExternalLink class="size-3.5" /></a><button class="button secondary flex-1" disabled title="Application persistence is not available in the backend"><Check class="size-3.5" /> Mark as applied</button></div>
      <p class="mt-2.5 text-center text-[10px] text-[var(--faint)]">Application tracking requires a backend endpoint.</p>
    </div>
  </aside>
{/if}
