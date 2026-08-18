<script lang="ts">
	import { onMount } from "svelte";

	interface Heading {
		depth: number;
		slug: string;
		text: string;
	}

	let { headings = [] }: { headings: Heading[] } = $props();

	let root: HTMLElement;
	let activeSlug = $state("");
	let ready = $state(false);

	// 生成 TOC 树（Mizuki CardTOC 风格：按 depth 分 badge/dot）
	function buildTree(items: Heading[]) {
		return items;
	}

	const tocItems = $derived(buildTree(headings.filter((h) => h.depth >= 2 && h.depth <= 3)));

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeSlug = entry.target.id;
					}
				}
			},
			{ rootMargin: "0px 0px -70% 0px", threshold: 0.1 },
		);

		const ids = tocItems.map((h) => h.slug);
		let found = 0;
		for (const id of ids) {
			const el = document.getElementById(id);
			if (el) {
				observer.observe(el);
				found++;
			}
		}
		if (found > 0) ready = true;

		return () => observer.disconnect();
	});

	function onClick(e: MouseEvent, slug: string) {
		e.preventDefault();
		const el = document.getElementById(slug);
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "start" });
			activeSlug = slug;
			history.replaceState(null, "", `#${slug}`);
		}
	}
</script>

{#if ready && tocItems.length > 0}
	<div class="toc-header flex items-center gap-2 px-2 py-2 mb-2 text-[var(--deep-text)] font-semibold">
		<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
			<path d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z" />
		</svg>
		<span>目录</span>
	</div>
	<nav class="toc-nav flex flex-col">
		{#each tocItems as item (item.slug)}
			{@const level = item.depth - 2}
			<a
				href={`#${item.slug}`}
				class="floating-toc-item"
				class:active={activeSlug === item.slug}
				class:toc-not-ready={!ready}
				data-level={level}
				style={`padding-left: ${0.5 + level * 1.1}rem;`}
				onclick={(e) => onClick(e, item.slug)}
			>
				{#if level === 0}
					<span class="floating-toc-badge">{tocItems.indexOf(item) + 1}</span>
				{:else}
					<span class="floating-toc-dot" class:floating-toc-dot-small={level > 1}></span>
				{/if}
				<span class="floating-toc-text">{item.text}</span>
			</a>
		{/each}
	</nav>
{/if}

<style>
	.toc-header {
		position: sticky;
		top: 0;
	}
	.floating-toc-item.active {
		background: var(--toc-btn-active);
		color: var(--toc-item-active);
	}
	.floating-toc-item.active .floating-toc-badge {
		background: var(--primary);
		color: #fff;
	}
</style>
