<script lang="ts">
	import { displaySelectedCampaigns } from '../../../routes/big-map/bm-campaign-utils'
	import { campaignKey, selectedCampaigns, campaignMarkers } from '../../../routes/big-map/bm-cm-stores'
	import DropdownHeader from './DropdownHeader.svelte'
	import LabelledCheckbox from './LabelledCheckbox.svelte'
	import MenuButton from './MenuButton.svelte'

	let shown: boolean = false

	function handleCheck(index: number) {
		const campaign = $campaignKey[index]
		if ($selectedCampaigns.includes(campaign)) {
			$selectedCampaigns.splice($selectedCampaigns.indexOf(campaign), 1)
		} else {
			$selectedCampaigns.push(campaign)
		}
	}

	function handleClearCampaigns() {
		for (let marker of $campaignMarkers) {
			marker.setMap(null)
		}
		$campaignMarkers.length = 0
		for (let campaign of $campaignKey) {
			let el = document.getElementsByClassName("checkbox-" + campaign.name.charAt(0).toUpperCase() + campaign.name.replaceAll('-', ' ').slice(1))
			for (let box of el) {
				box.checked = false
			}
		}
	}
</script>

<DropdownHeader header="Campaigns" bind:droppedDown={shown} />
{#if shown}
	<div class="cm-menus">
		<p>Don't try and display them all at once!</p>
		{#each $campaignKey as campaign, index}
			<LabelledCheckbox
				label={campaign.name.charAt(0).toUpperCase() + campaign.name.replaceAll('-', ' ').slice(1)}
				on:change={() => handleCheck(index)}
			/>
		{/each}
		<MenuButton title="Show Selected Campaigns" on:click={displaySelectedCampaigns} />
		<MenuButton title="Clear Campaigns" on:click={handleClearCampaigns} />
	</div>
{/if}

<style>
	.cm-menus {
		display: flex;
		flex-direction: column;
		padding-left: 24px;
	}
</style>
