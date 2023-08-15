<script>
	import { supabase } from '$lib/supabase.ts';

    let username = "";
    let password = "";
    let loggedIn = false;
    let passwordCorrect = true;
    let name = "";
    let privateData = "NOT AUTHORISED TO VIEW THIS";
  
    async function handleLogin(){
        const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
        })
        if (error){
          passwordCorrect = false;
     } else{
        loggedIn = true;
        getUserData();
     }
     }

     async function getUserData(){
        const { data, error } = await supabase
        .from('user_info')
        .select()
        name = data[0].name;
        privateData = data[0].private;
     }
  </script>
  
  <main>
    <img class="logo" src="https://premiumlithium.com/cdn/shop/files/Website_Logo_PNG_8c3726b3-6ebd-489e-9a38-06885f16236b.png?v=1653833196&width=500">
    {#if loggedIn}
      <h1>Welcome, {name}!</h1>
      <h2> Your private information: {privateData}</h2>
    {:else}
      <h1>Login</h1>
      <form on:submit|preventDefault={handleLogin}>
        <label for="username">Username:</label>
        <input type="text" id="username" bind:value={username} />
  
        <label for="password">Password:</label>
        <input type="password" id="password" bind:value={password} />
  
    <button type="submit" on:click={handleLogin}>                   Log In</button>
      </form>
      {#if passwordCorrect == false}
        <h2> incorrect username or password!</h2>
      {/if}
    {/if}
  </main>
  
  <style>
    main {
      text-align: center;
      padding: 2rem;
    }
  
    form {
      display: inline-block;
      text-align: left;
      border: 1px solid #ccc;
      padding: 1rem;
      border-radius: 5px;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    }
  
    label, input {
      display: block;
      margin-bottom: 0.5rem;
    }
  
    button {
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      padding: 0.5rem 1rem;
      cursor: pointer;
    }
  </style>
  