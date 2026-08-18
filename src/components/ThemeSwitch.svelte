<script lang="ts">
	import Icon from "@iconify/svelte";
	import { onMount } from "svelte";

	let isDark = $state(false);

	// 注册 view-transition 主题切换（Mizuki 同款）
	function setTheme(preference: string) {
		if (preference === "light") {
			document.documentElement.classList.remove("dark");
			isDark = false;
		} else {
			document.documentElement.classList.add("dark");
			isDark = true;
		}
		try {
			localStorage.setItem("theme", preference);
		} catch (e) {
			/* ignore */
		}
	}

	async function toggleTheme() {
		const target = isDark ? "light" : "dark";
		const enableViewTransition =
			"startViewTransition" in document &&
			!window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		if (enableViewTransition) {
			// @ts-ignore
			const transition = document.startViewTransition(() => {
				setTheme(target);
			});
			await transition.finished;
		} else {
			setTheme(target);
		}
	}

	onMount(() => {
		isDark = document.documentElement.classList.contains("dark");
	});
</script>

<button
	aria-label="Toggle Theme"
	class="btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90"
	onclick={toggleTheme}
>
	<div class="relative h-[1.25rem] w-[1.25rem]">
		<Icon
			icon="material-symbols:light-mode-outline-rounded"
			class="absolute inset-0 transition-all duration-300"
			style={`opacity: ${isDark ? 0 : 1}; transform: rotate(${isDark ? 90 : 0}deg) scale(${isDark ? 0.5 : 1});`}
		/>
		<Icon
			icon="material-symbols:dark-mode-outline-rounded"
			class="absolute inset-0 transition-all duration-300"
			style={`opacity: ${isDark ? 1 : 0}; transform: rotate(${isDark ? 0 : -90}deg) scale(${isDark ? 1 : 0.5});`}
		/>
	</div>
</button>
