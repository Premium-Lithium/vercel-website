<slot />

<style>
    :root {
		--plblue: #28AAE2;
		font-family: 'Roboto', sans-serif;

        --expand-bg-color: #6d6c6c;
        --infobox-highlight-color: var(--plblue);
        --expand-active-shadow: #6d6c6c;
        --divider-shadow-color: rgba(40, 170, 226, 0.4);
        --text-color: white;
	}

	:global(.pl-button) {
        background-color: var(--plblue);
        color: white;
        font-size: 20px;
        padding: 1rem; 
        border-radius:10px;
        transition-duration: 0.1s;
        box-shadow: 0 0 0px 0px white inset,  0 12px 16px 0 rgba(0,0,0,0.24);
    }
    :global(.pl-button:hover) {
        box-shadow:  0 0 4px 0px white inset, 0 0 10px var(--plblue), 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
    }
</style>
