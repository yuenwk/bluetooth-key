import { writable } from 'svelte/store';

function createToast() {
  const { subscribe, update } = writable([]);

  return {
    subscribe,
    push: (msg, type = 'info', duration = 3000) => {
      const id = Date.now();
      update(all => [...all, { id, msg, type }]);
      
      setTimeout(() => {
        update(all => all.filter(t => t.id !== id));
      }, duration);
    }
  };
}

export const toast = createToast();