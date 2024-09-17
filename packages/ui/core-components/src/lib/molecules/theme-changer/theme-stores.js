import { getContext, setContext } from 'svelte';
import { derived, writable, readable } from 'svelte/store';
import { browser } from '$app/environment';
/** @template T @typedef {import("svelte/store").Readable<T>} Readable */
/** @template T @typedef {import("svelte/store").Writable<T>} Writable */

/** @returns {Readable<'light' | 'dark'>} */
const createSystemThemeStore = () => {
	const store = readable('light', (set) => {
		if (browser && window.matchMedia) {
			/** @param {MediaQueryList} e */
			const onPrefersDarkColorSchemeChange = (e) => {
				set(e.matches ? 'dark' : 'light');
			};

			// Initialize the store with the current value
			onPrefersDarkColorSchemeChange(window.matchMedia('(prefers-color-scheme: dark)'));

			// Listen for changes to the system color scheme and update the store
			window
				.matchMedia('(prefers-color-scheme: dark)')
				.addEventListener('change', onPrefersDarkColorSchemeChange);

			// Cleanup
			return () => {
				window
					.matchMedia('(prefers-color-scheme: dark)')
					.removeEventListener('change', onPrefersDarkColorSchemeChange);
			};
		}
	});

	return store;
};

/**
 * @typedef ThemeStores
 * @prop {Readable<'light' | 'dark'>} systemTheme
 * @prop {Writable<'system' | 'light' | 'dark'>} selectedTheme
 * @prop {Readable<'light' | 'dark'>} theme
 */

/** @returns {ThemeStores} */
const createThemeStores = () => {
	const systemTheme = createSystemThemeStore();

	/** @type {Writable<'system' | 'light' | 'dark'>} */
	const selectedTheme = writable('system');

	const theme = derived([systemTheme, selectedTheme], ([$systemTheme, $selectedTheme]) => {
		return $selectedTheme === 'system' ? $systemTheme : $selectedTheme;
	});

	return {
		systemTheme,
		selectedTheme,
		theme
	};
};

const THEME_STORES_CONTEXT_KEY = Symbol('__EvidenceThemeStores__');

/** @returns {ThemeStores} */
export const ensureThemeStores = () => {
	let stores = getContext(THEME_STORES_CONTEXT_KEY);
	if (!stores) {
		stores = createThemeStores();
		setContext(THEME_STORES_CONTEXT_KEY, stores);
	}
	return stores;
};
