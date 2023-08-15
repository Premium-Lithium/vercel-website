<script>
    import { createAuth } from '$lib/supabase.ts'
  
    const supabaseUrl = 'https://your-supabase-url.com'
    const supabaseAnonKey = 'your-supabase-anon-key'
  
    const supabase = createAuth({
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
    })
  
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