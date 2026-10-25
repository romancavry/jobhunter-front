<script lang="ts">
  import { ArrowRight, BriefcaseBusiness, Clock3, DatabaseZap, FileCheck2, MapPin, RefreshCw } from 'lucide-svelte';
  import { jobsApi } from '../api/jobs';
  import { sourcesApi } from '../api/sources';
  import type { Job, JobSource, PageId } from '../types';
  let { navigate }: { navigate: (page: PageId) => void } = $props();
  let jobs = $state<Job[]>([]); let sources = $state<JobSource[]>([]); let loading = $state(true); let error = $state('');
  const recentJobs = $derived(jobs.slice(0, 5)); const enabledSources = $derived(sources.filter((source) => source.enabled).length);
  $effect(() => { void load(); });
  async function load() { loading = true; error = ''; const [jr, sr] = await Promise.allSettled([jobsApi.list(), sourcesApi.list()]); if (jr.status === 'fulfilled') jobs = jr.value; if (sr.status === 'fulfilled') sources = sr.value; if (jr.status === 'rejected' && sr.status === 'rejected') error = 'The dashboard could not connect to the API.'; loading = false; }
  function age(date: string) { const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000); return days <= 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days}d ago`; }
</script>
<div class="page-wrap">
  <section class="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p class="eyebrow">Overview</p><h2 class="page-heading">Your job search, at a glance.</h2><p class="page-description">Real-time data from your JobHunter API.</p></div><button class="button secondary self-start sm:self-auto" onclick={load} disabled={loading}><RefreshCw class={`${loading ? 'animate-spin' : ''} size-3.5`} /> Refresh</button></section>
  {#if error}<div class="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-500">{error} <button class="ml-2 underline" onclick={load}>Try again</button></div>{/if}
  <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {#each [{ label: 'Collected jobs', value: jobs.length, icon: BriefcaseBusiness, help: 'Available in your database' }, { label: 'New jobs', value: '—', icon: Clock3, help: 'No read-status endpoint' }, { label: 'Applications', value: '—', icon: FileCheck2, help: 'Tracking not yet available' }, { label: 'Active sources', value: enabledSources, icon: DatabaseZap, help: `${sources.length} configured` }] as metric}
      <article class="metric-card"><div class="flex items-start justify-between"><p class="text-xs font-medium text-[var(--muted)]">{metric.label}</p><span class="icon-well"><metric.icon class="size-3.5" /></span></div>{#if loading}<div class="skeleton mt-5 h-8 w-16"></div>{:else}<p class="mt-4 text-2xl font-semibold tracking-tight text-[var(--text)]">{metric.value}</p>{/if}<p class="mt-1 text-[11px] text-[var(--faint)]">{metric.help}</p></article>
    {/each}
  </section>
  <section class="mt-6 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
    <article class="panel overflow-hidden"><div class="panel-header"><div><h3 class="section-title">Recently collected</h3><p class="section-subtitle">Latest vacancies in your feed</p></div><button class="text-button" onclick={() => navigate('jobs')}>View all <ArrowRight class="size-3" /></button></div>
      {#if loading}<div class="space-y-1 p-2">{#each Array(5) as _}<div class="flex gap-3 p-3"><div class="skeleton size-9"></div><div class="flex-1 space-y-2"><div class="skeleton h-3 w-2/3"></div><div class="skeleton h-2.5 w-1/3"></div></div></div>{/each}</div>
      {:else if recentJobs.length}<div class="divide-y divide-[var(--border)]">{#each recentJobs as job}<button class="group flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-[var(--hover)]" onclick={() => navigate('jobs')}><span class="company-mark">{job.company.slice(0, 1).toUpperCase()}</span><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium text-[var(--text)]">{job.title}</span><span class="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-[var(--faint)]">{job.company}{#if job.location}<span>·</span><MapPin class="size-2.5" /> {job.location}{/if}</span></span><span class="shrink-0 text-[10px] text-[var(--faint)]">{age(job.created_at)}</span></button>{/each}</div>
      {:else}<div class="empty-compact"><BriefcaseBusiness class="size-5" /><p>No jobs collected yet.</p><button class="text-button" onclick={() => navigate('sources')}>Configure a source</button></div>{/if}
    </article>
    <article class="panel overflow-hidden"><div class="panel-header"><div><h3 class="section-title">Source status</h3><p class="section-subtitle">Configured collection channels</p></div></div>
      {#if loading}<div class="space-y-3 p-5">{#each Array(3) as _}<div class="skeleton h-12 w-full"></div>{/each}</div>
      {:else if sources.length}<div class="divide-y divide-[var(--border)]">{#each sources.slice(0, 5) as source}<div class="flex items-center gap-3 px-5 py-4"><span class="grid size-8 place-items-center rounded-lg bg-[var(--chip)] text-[10px] font-bold text-[var(--muted)]">{source.type.slice(0, 2)}</span><div class="min-w-0 flex-1"><p class="truncate text-xs font-medium text-[var(--text)]">{source.name}</p><p class="mt-0.5 truncate text-[10px] text-[var(--faint)]">{source.type}</p></div><span class:enabled={source.enabled} class="status-dot"><span></span>{source.enabled ? 'Active' : 'Paused'}</span></div>{/each}</div>
      {:else}<div class="empty-compact"><DatabaseZap class="size-5" /><p>No sources configured.</p><button class="text-button" onclick={() => navigate('sources')}>Add your first source</button></div>{/if}
    </article>
  </section>
</div>
