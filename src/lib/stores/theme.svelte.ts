// ===========================================
// BalancaEu — Theme store (client-only, persist em localStorage)
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

	function apply(value: 'light' | 'dark') {
		if (!browser) return;
		document.documentElement.classList.toggle('dark', value === 'dark');
		localStorage.setItem(STORAGE_KEY, value);
	}

	return {
		get value() {
			return theme;
		},
		toggle() {
			theme = theme === 'dark' ? 'light' : 'dark';
			apply(theme);
		},
		set(value: 'light' | 'dark') {
			theme = value;
			apply(value);
		}
	};
}

export const themeStore = createThemeStore();
