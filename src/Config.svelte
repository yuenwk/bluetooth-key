<script>
  import { configStore, showConfig } from "./store.svelte.js";
  import { toast } from "./toast.js";

  let formData = { ...$configStore };

  function handleSave() {
    if (!formData.mac || !formData.key) {
      toast.push("MAC and Key cannot be empty!", "error");
      return;
    }
    configStore.save(formData);
    showConfig.set(true);
  }

  async function handleShare() {
    if (!formData.mac || !formData.key) {
      toast.push("Please enter MAC and Key first.", "error");
      return;
    }

    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("mac", formData.mac);
    url.searchParams.set("key", formData.key);
    if (formData.name) {
      url.searchParams.set("name", formData.name);
    }

    try {
      await navigator.clipboard.writeText(url.toString());
      toast.push("copied");
    } catch (err) {
      toast.push("Copy failed", "error");
    }
    showConfig.set(true);
  }
</script>

<div class="container">
  <h3
    style="font-size: 1.5rem; font-weight: 700; color: #2d3748; margin-bottom: 2rem; text-align: center;"
  >
    config
  </h3>

  <div class="input-group">
    <input type="text" id="mac" bind:value={formData.mac} placeholder="MAC" />
  </div>

  <div class="input-group">
    <input
      type="password"
      id="key"
      bind:value={formData.key}
      placeholder="Key"
    />
  </div>

  <div class="input-group">
    <input
      type="text"
      id="name"
      bind:value={formData.name}
      placeholder="Device Name"
    />
  </div>

  <div class="button-group">
    <button class="btn btn-save" onclick={handleSave}>save</button>
    <button class="btn btn-share" onclick={handleShare}>share</button>
  </div>
</div>

<style>
  .container {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 2.5rem;
    border-radius: 1.5rem;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    width: 380px;
    transition: transform 0.3s ease;
  }

  .container .input-group {
    margin-bottom: 1.5rem;
  }

  .container input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    outline: none;
    transition: all 0.2s ease;
    font-size: 1rem;
  }

  .button-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 2rem;
  }

  .btn-save {
    background-color: #667eea;
    color: white;
  }

  .btn-save:hover {
    background-color: #5a67d8;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .btn-share {
    background-color: #edf2f7;
    color: #4a5568;
  }

  .btn-share:hover {
    background-color: #e2e8f0;
  }

  .btn:active {
    transform: scale(0.98);
  }

  @media screen and (max-width: 768px) {
    .container {
      padding: 1rem;
    }
  }
</style>
