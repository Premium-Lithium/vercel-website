<script>
    import { onMount } from 'svelte';
  
    let file;
  
    async function uploadFile() {
      if (!file) return;
  
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const response = await fetch('/upload-documents', {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          const result = await response.json();
          console.log('File uploaded:', result);
        } else {
          console.log('Upload failed:', await response.text());
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  </script>
  
  <h1>File Upload</h1>
  <input type="file" accept=".txt" bind:files={file} />
  <button on:click={uploadFile}>Upload</button>
  