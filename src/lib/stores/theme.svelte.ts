// ===========================================
// BalancaEu — Theme store (persist em localStorage + DB)
// ===========================================

import { browser } from '$app/environment';

const STORAGE_KEY = 'balancaeu-theme';

function readInitial(): 'light' | 'dark' {
	if (!browser) return 'dark';
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark') return stored;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function createThemeStore() {
	let theme = $state<'light' | 'dark'>(readInitial());
	let serverSyncing = $state(false);

	function apply(value: 'light' | 'dark') {
		if (!browser) return;
		document.documentElement.setAttribute('data-theme', value);
		document.documentElement.classList.toggle('dark', value === 'dark');
		localStorage.setItem(STORAGE_KEY, value);
		// Sincroniza com o backend (best-effort)
		serverSyncing = true;
		fetch('/api/preferences/theme', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ theme: value })
		})
			.catch(() => {})
			.finally(() => {
				serverSyncing = false;
			});
	}

	return {
		get value() {
			return theme;
		},
		get syncing() {
			return serverSyncing;
		},
		toggle() {
			theme = theme === 'dark' ? 'light' : 'dark';
			apply(theme);
		},
		set(value: 'light' | 'dark') {
			theme = value;
			apply(value);
		},
		// Ajusta o estado local sem chamar o backend (usado quando preferência vem do server load)
		hydrate(value: 'light' | 'dark') {
			theme = value;
			if (browser) {
				document.documentElement.setAttribute('data-theme', value);
				document.documentElement.classList.toggle('dark', value === 'dark');
				localStorage.setItem(STORAGE_KEY, value);
			}
		}
	};
}

export const themeStore = createThemeStore();
