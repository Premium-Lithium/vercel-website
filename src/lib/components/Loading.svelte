<div class="lds-ring"><div></div><div></div><div></div><div></div></div>

<style>
    .lds-ring {
    display: inline-block;
    position: relative;
    width: 40px;
    height: 40px;
    }
    .lds-ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 0;
    height: 24px;
    margin: 8px;
    border: 4px solid #000;
    border-radius: 50%;
    border-color: transparent transparent #000 transparent;
    animation: lds-ring 3s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }
    .lds-ring div:nth-child(1) {
    animation-delay: -0.4s;
    }
    .lds-ring div:nth-child(2) {
    animation-delay: -0.3s;
    }
    .lds-ring div:nth-child(3) {
    animation-delay: -0.2s;
    }
    .lds-ring div:nth-child(4) {
    animation-delay: -0.1s;
    }
    @keyframes lds-ring {
    0% {
        transform: rotate(0deg);
        border-color: var(--plblue) transparent var(--plblue) transparent;
    }
    25% {
        border-color: var(--plblue) transparent transparent transparent;
    }
    50%{
        transform: rotate(360deg);
        border-color: transparent transparent transparent transparent;
    }
    75% {
        border-color: var(--plblue)  transparent transparent transparent;
    }
    100% {
        transform: rotate(720deg);
        border-color: var(--plblue) transparent var(--plblue) transparent;
    }
    }

</style>