<script>
  let files;

  async function handleUpload() {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    formData.append('audio', files[0]);
    const result = await fetch('/transcribe', {
      method: "POST",
      body: formData,
    });
    console.log(result.text);
  }
</script>

<input type="file" bind:files={files} />
<button on:click={handleUpload}>Upload</button>
