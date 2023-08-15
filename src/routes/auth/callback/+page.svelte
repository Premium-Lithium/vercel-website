<script>
    import { supabase } from '$lib/supabase.ts'
  
    // Handle the callback
    supabase.auth
      .parseHash(window.location.hash)
      .then((response) => {
        // Redirect the user to the home page
        window.location.href = '/'
      })
      .catch((error) => {
        console.error(error)
      })
  </script>
  
  <p>Logging in...</p>