<script lang="ts">
  import { onMount } from 'svelte';
  import Sidebar from '#lib/components/layout/Sidebar.svelte';
  import Topbar from '#lib/components/layout/Topbar.svelte';
  import ToastHost from '#lib/components/ui/ToastHost.svelte';
  import Dashboard from '#lib/routes/Dashboard.svelte';
  import Jobs from '#lib/routes/Jobs.svelte';
  import Applications from '#lib/routes/Applications.svelte';
  import Sources from '#lib/routes/Sources.svelte';
  import Settings from '#lib/routes/Settings.svelte';
  import type { PageId } from '../lib/types';

  const pages: Record<PageId, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'A live view of your job search' },
    jobs: { title: 'Jobs', subtitle: 'Collected opportunities from all sources' },
    applications: { title: 'Applications', subtitle: 'Your application pipeline' },
    sources: { title: 'Sources', subtitle: 'Collection channels and synchronization' },
    settings: { title: 'Settings', subtitle: 'Workspace preferences and connection' }
  };
  let current = $state<PageId>('dashboard');
  let mobileOpen = $state(false);

  onMount(() => {
    const readHash = () => { const candidate = location.hash.replace('#/', '') as PageId; if (candidate in pages) current = candidate; };
    readHash(); window.addEventListener('hashchange', readHash); return () => window.removeEventListener('hashchange', readHash);
  });

  function navigate(page: PageId) { current = page; mobileOpen = false; history.pushState(null, '', `#/${page}`); window.scrollTo({ top: 0, behavior: 'smooth' }); }
</script>

<svelte:head><title>{pages[current].title} · JobHunter</title></svelte:head>

<div class="min-h-screen bg-[var(--bg)] text-[var(--text)]">
  <Sidebar {current} {mobileOpen} {navigate} close={() => (mobileOpen = false)} />
  <div class="min-h-screen lg:pl-64">
    <Topbar title={pages[current].title} subtitle={pages[current].subtitle} openMenu={() => (mobileOpen = true)} />
    <main>
      {#if current === 'dashboard'}<Dashboard {navigate} />
      {:else if current === 'jobs'}<Jobs />
      {:else if current === 'applications'}<Applications {navigate} />
      {:else if current === 'sources'}<Sources />
      {:else}<Settings />{/if}
    </main>
  </div>
  <ToastHost />
</div>
