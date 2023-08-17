<script>
  let files;
  let transcribing = false;
  let transcribedText = "";

  async function handleUpload() {
    transcribedText = "";
    if (!files || files.length === 0) return;
    const formData = new FormData();
    formData.append('audio', files[0]);
    transcribing = true;
    const result = await fetch('/transcribe', {
      method: "POST",
      body: formData,
    });
    transcribedText = (await result.json()).message;
    transcribing = false;
  }
</script>

<style>
  body {
    background-color: #f7f7f9;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 90%;
    max-height: 90%;
    max-width: 600px;
    background-color: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.15);
  }

  input[type="file"] {
    display: block;
    width: 95%;
    margin-bottom: 15px;
    padding: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 1rem;
  }

  button {
    display: block;
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 4px;
    background-color: var(--plblue);
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease-in-out;
  }

  button:hover {
    background-color: #0056b3;
  }

  .result {

    margin-top: 20px;
    padding: 10px;
    border-top: 1px solid #e0e0e0;
    overflow-y: auto;
    word-wrap: break-word;
  }

  .spinner {
    display: inline-block;
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 3px solid var(--plblue);
    animation: spin 1s linear infinite;
  }
  .transcribing-text {
    margin-top: 15px;
    font-style: italic;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>

<body>
  <div class="container">
    <input type="file" bind:files={files} />
    {#if !transcribing}
      <button on:click={handleUpload}>{transcribedText == "" ? "Transcribe" : "Transcribe another file"}</button>
    {:else}
      <div class="spinner"></div>
      <div class="transcribing-text">Transcribing...</div>
    {/if}
    {#if transcribedText != ""}
      <div class="result">
        {transcribedText}
      </div>
    {/if}
  </div>
</body>