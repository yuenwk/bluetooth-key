import { writable, get } from 'svelte/store';

const defaultParams = {
    mac: '',
    key: '',
    name: ''
};

function createConfigStore() {
    const { subscribe, set, update } = writable(defaultParams);

    return {
        subscribe,
        set,
        update,
        init: () => {
            if (typeof window === 'undefined') return;

            const localData = localStorage.getItem('app_config');
            let currentData = localData ? JSON.parse(localData) : { ...defaultParams };

            const urlParams = new URLSearchParams(window.location.search);
            let hasUrlUpdate = false;

            ['mac', 'key', 'name'].forEach(field => {
                const val = urlParams.get(field);
                if (val) {
                    currentData[field] = val;
                    hasUrlUpdate = true;
                }
            });

            set(currentData);

            if (hasUrlUpdate) {
                localStorage.setItem('app_config', JSON.stringify(currentData));

                window.history.replaceState({}, '', window.location.pathname);
            }
        },
        save: (newData) => {
            set(newData);
            if (typeof window !== 'undefined') {
                localStorage.setItem('app_config', JSON.stringify(newData));
            }
        },
        clear: () => {
            set({ ...defaultParams });
            if (typeof window !== 'undefined') {
                localStorage.removeItem('app_config');
            }
        }
    };
}

export const configStore = createConfigStore();


export const showConfig = writable(true);