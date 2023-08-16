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
    console.log();
  }
</script>

<input type="file" bind:files={files} />
{#if !transcribing}
<button on:click={handleUpload}>Upload</button>
{/if}
{#if transcribedText != ""}
<div>
  {transcribedText}
</div>
{/if}


<style>
  body {
    font-family: 'Arial', sans-serif;
    background-color: #f7f7f9;
    padding: 40px;
  }

  input[type="file"] {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    cursor: pointer;
    display: block;
    margin-bottom: 20px;
    background-color: #fff;
    width: 100%;
    box-sizing: border-box;
  }

  button {
    background-color: #007BFF;
    color: #ffffff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  button:hover {
    background-color: #0056b3;
  }

  div {
    margin-top: 20px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #fff;
  }
</style>
