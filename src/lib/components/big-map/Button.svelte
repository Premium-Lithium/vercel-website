<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	export let label: string
	export let buttonClass: 'primary' | 'secondary' | 'tertiary' = 'primary'

	const dispatch = createEventDispatcher()

	function dispatchClick(event) {
		dispatch('click', event.detail)
	}
</script>

<div>
	<button
		class="big-map-button typography-label-medium"
		class:large-button__secondary={buttonClass == 'secondary'}
		class:large-button__tertiary={buttonClass == 'tertiary'}
		on:click={dispatchClick}
	>
		<div class="big-map-button-content">
			<span>
				{label}
			</span>
		</div>
	</button>
</div>

<style lang="scss">
	.big-map-button {
		display: flex;
		padding: 6px 14px;
		justify-content: center;
		align-items: center;
		border-radius: 999px;
		background: #35bbed;
		box-sizing: border-box;
		border: 2px solid #35bbed;
		cursor: pointer;
		width: 100%;
		margin: 0;

		&:hover {
			background: #86d6f4;
			border: 2px solid #86d6f4;
		}
		&:active {
			background: #20708e;
			border: 2px solid #35bbed;
		}
		&:focus {
			outline: 2px solid #c9fc50;
			outline-offset: 2px;
		}

		&.large-button__secondary {
			background: #c9fc50;
			border: 2px solid #c9fc50;

			&:hover {
				background: #dffd96;
				border: 2px solid #dffd96;
			}
			&:active {
				background: #799730;
				border: 2px solid #c9fc50;
			}
			&:focus {
				outline: 2px solid #c9fc50;
				outline-offset: 2px;
			}
		}
		&.large-button__tertiary {
			background: #d0d1d2;
			border: 2px solid #d0d1d2;

			&:hover {
				background: #eff0f0;
				border: 2px solid #eff0f0;
			}
			&:active {
				background: #b0b2b4;
				border: 2px solid #eff0f0;
			}
			&:focus {
				outline: 2px solid #c9fc50;
				outline-offset: 2px;
			}
		}
		&:disabled {
			border-radius: 999px;
			border: 2px solid transparent;
			background: #464748;
			color: #232424;
			cursor: not-allowed;
		}
	}

	.big-map-button-content {
        display: flex;
        align-items: center;
        gap: 8px;

        & span {
            color: #000000;
        }
		
    }
</style>
