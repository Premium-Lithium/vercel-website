<script>
    export let monthlyValues = [];
    const months = [
    "J", "F", "M", "A", "M", "J",
    "J", "A", "S", "O", "N", "D"
    ];
    $: maxVal = Math.max(...monthlyValues);
    const svgHeight = 200;
    $: scaleFactor = svgHeight / maxVal;
    
</script>

<style>
    .chart-container {
        max-width: 100%;
        height: 250px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        margin-left: 10px;
        margin-right: 10px;
    }
    .column {
        width: calc((100%/ 12) - 20px);
        min-width: 10px;
        text-align: center;
        margin: 1px 0px 1px 10px;
    }
    rect {
        animation: grow 1s ease-in-out forwards;
    }

    @keyframes grow {
    from {
      height: 0;
      y: 200;
    }
    to {
      height: calc(value * scaleFactor);
      y: calc(svgHeight - value * scaleFactor);
    }
  }

    .column-label {
        font-size: 12px;
    }
  </style>
  
  <div class="chart-container">
        {#each monthlyValues as value, index}
            <div class="column">
                <svg height=200 width="100%">
                <rect x=0 y={svgHeight - value * scaleFactor } rx=5 ry=5 width=100% height={value * scaleFactor} fill="var(--plblue)" />
                </svg>
                <div class="column-label">{months[index]}</div>
            </div>
        {/each}
  </div>