<script>
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import ConfigPage from "./Config.svelte";
  import { encryptData, hexToBytes } from "./encrypt.js";
  import { configStore, showConfig } from "./store.svelte.js";
  import { toast } from "./toast.js";

  let isLoaded = $state(false);

  onMount(() => {
    configStore.init();
    isLoaded = true;
  });

  let shouldShowConfig = $derived(
    $configStore.mac && $configStore.key && $showConfig
  );

  let timer = null;

  function handleClick() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      showConfig.set(false);
    } else {
      timer = setTimeout(() => {
        unlock($configStore.mac, $configStore.key, $configStore.name);
        timer = null;
      }, 250);
    }
  }

  async function unlock(mac, keyStr, name) {
    const bt = navigator.bluetooth;
    try {
      if (!bt) throw "Bluetooth API unavailable";
      if (!/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i.test(mac)) throw "Invalid MAC";

      const device = await bt.requestDevice(
        name ? { filters: [{ namePrefix: name }] } : { acceptAllDevices: true }
      );

      const server = await Promise.race([
        device.gatt.connect(),
        new Promise((_, r) => setTimeout(() => r(new Error("Timeout")), 10000)),
      ]);

      const svc = await server.getPrimaryService(
        "14839ac4-7d7e-415c-9a42-167340cf2339"
      );
      const chars = await svc.getCharacteristics();
      const rChar = chars.find((c) => c.properties.read);
      const wChar = chars.find((c) => c.properties.write);
      if (!rChar || !wChar) throw "Missing Read/Write characteristic";

      await Promise.all(
        chars.map((c) =>
          c.properties.notify || c.properties.indicate
            ? c.startNotifications().catch(() => {})
            : null
        )
      );

      const val = await rChar.readValue();
      const macBytes = hexToBytes(mac);

      const payload = encryptData(new Uint8Array(val.buffer), macBytes, keyStr);
      await wChar.writeValue(payload);

      configStore.save({ mac: mac, key: keyStr, name: device.name });
    } catch (err) {
      toast.push(err, "error");
    }
  }
</script>

<main>
  {#if !isLoaded}
    <div class="loading">Page loading...</div>
  {:else if shouldShowConfig}
    <button class="open-btn" onclick={handleClick}
      ><span id="connectSpinner"></span><span>TEST</span></button
    >
  {:else}
    <ConfigPage />
  {/if}
</main>

<div class="toast-container">
  {#each $toast as t (t.id)}
    <div class="toast-item {t.type}" in:fly={{ y: 20, duration: 300 }} out:fade>
      {t.msg}
    </div>
  {/each}
</div>
