<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	export let label: string
	export let buttonClass: 'primary' | 'secondary' | 'tertiary' = 'primary'
	export let dropShadow: boolean = false

	const dispatch = createEventDispatcher()

	function dispatchClick(event) {
		dispatch('click', event.detail)
	}
</script>

<div class="big-map-button">
	<button
		class="large-button typography-label-medium"
		class:large-button__secondary={buttonClass == 'secondary'}
		class:large-button__tertiary={buttonClass == 'tertiary'}
		class:large-button__dropshadow={dropShadow}
		on:click={dispatchClick}
	>
		<span>
			{label}
		</span>
	</button>
</div>

<style>
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

		&.large-button__aloneIcon {
			padding: 6px 6px;
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

		&.large-button__dropshadow {
			box-shadow: 2.8px 2.8px 2.2px rgba(0, 0, 0, 0.056), 6.7px 6.7px 5.3px rgba(0, 0, 0, 0.081),
				12.5px 12.5px 10px rgba(0, 0, 0, 0.1), 22.3px 22.3px 17.9px rgba(0, 0, 0, 0.119),
				41.8px 41.8px 33.4px rgba(0, 0, 0, 0.144), 100px 100px 80px rgba(0, 0, 0, 0.2);
			transition: box-shadow 200ms ease;

			&:hover,
			:active,
			:focus {
				box-shadow: 2.8px 2.8px 2.2px rgba(0, 0, 0, 0.084), 6.7px 6.7px 5.3px rgba(0, 0, 0, 0.122),
					12.5px 12.5px 10px rgba(0, 0, 0, 0.15), 22.3px 22.3px 17.9px rgba(0, 0, 0, 0.179),
					41.8px 41.8px 33.4px rgba(0, 0, 0, 0.216), 100px 100px 80px rgba(0, 0, 0, 0.3);
			}
		}
	}
</style>
