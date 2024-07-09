import { derived, writable } from 'svelte/store';
import { defaultOptions, type ReaderLayoutOptions } from '../service/ReaderLayoutService';
export interface IReaderStyleOptions {
  color: string;
  bgColor: string;
  nextPageArea: number;
}

export enum Fonts {
  Noto = 'Noto Sans'
}

export const defaultReaderStyleOptions = {
  color: '#000000',
  bgColor: '#ffffff',
  nextPageArea: 50
};
const settingsStore = writable<ReaderLayoutOptions>(
  localStorage.getItem('settings') ? JSON.parse(localStorage.getItem('settings')!) : defaultOptions
);

settingsStore.subscribe((val) => {
  localStorage.setItem('settings', JSON.stringify(val));
});

const styleSettingsStore = writable<IReaderStyleOptions>(
  localStorage.getItem('style-settings')
    ? JSON.parse(localStorage.getItem('style-settings')!)
    : defaultReaderStyleOptions
);

styleSettingsStore.subscribe((val) => {
  localStorage.setItem('style-settings', JSON.stringify(val));
  document.body.style.backgroundColor = val.bgColor;
});

const nightModeStore = derived(styleSettingsStore, (val) => {
  return val.color === '#ffffff' && val.bgColor === '#000000';
});

export { settingsStore, nightModeStore, styleSettingsStore };
