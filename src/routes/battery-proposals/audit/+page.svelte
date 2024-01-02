<script lang="ts">
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import MagicLink from '$lib/components/MagicLink.svelte'
	import { supabase } from '$lib/supabase'
	import { onMount } from 'svelte'

	const batteryProposalsTableName = 'campaign_customers'

	let allUnauditedHouses = []
	let currentHouseToAudit = undefined
	let auditCriteria = []
	let currentHousePointer = 0
	let loading = false
	let currentHouseM2 = 0

	currentHousePointer = +($page.url.searchParams.get('startIndex') ?? '0')
	let campaign: string = ''
	const urlParams = $page.url.searchParams
	campaign = urlParams.get('campaignId') || ''

	$: if (currentHouseToAudit) {
		console.log(currentHouseToAudit)
		try {
			currentHouseM2 = currentHouseToAudit['campaign_specific_data']['solar_array_info'].reduce(
				(p, v, i, a) => {
					return p + v['area_m2']
				},
				0
			)
		} catch (e) {
			currentHouseM2 =
				currentHouseToAudit['campaign_specific_data']['roof_details']['wholeRoofStats'][
					'areaMeters2'
				]
		}
	}

	$: currentHouseToAudit = allUnauditedHouses[currentHousePointer]

	let isAuthenticated = false
	let nextButton, auditForm
	let loadedAuditOptions = []
	let auditCheckboxes = []
	$: auditOptions = loadedAuditOptions.map((x, i) => {
		return { name: x.name, value: x.value, index: i, description: x.description }
	})

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession()
		if (data.session == null) isAuthenticated = false
		else isAuthenticated = true
		loadedAuditOptions = await loadAuditCriteria(campaign)
		loadedAuditOptions = loadedAuditOptions.map((x) => {
			return { ...x, 'value': true }
		})

		allUnauditedHouses = await loadAllUnauditedHousesFromSupabase(false)
		loading = false

		if (browser) {
			document.addEventListener('keydown', (event) => {
				switch (event.code) {
					case 'Space':
					case 'Enter':
						nextButton.click()
						break
					case 'Digit1':
						auditCheckboxes[0].checked = !auditCheckboxes[0].checked
						break
					case 'Digit2':
						auditCheckboxes[1].checked = !auditCheckboxes[1].checked
						break
					case 'Digit3':
						auditCheckboxes[2].checked = !auditCheckboxes[2].checked
						break
					case 'Digit4':
						auditCheckboxes[3].checked = !auditCheckboxes[3].checked
						break
					case 'Digit5':
						auditCheckboxes[4].checked = !auditCheckboxes[4].checked
						break
				}
			})
		}
	})

	async function onSubmit(e) {
		let anyFlags = !auditOptions.reduce((p, v, i, a) => {
			return p && v.value
		}, true)
		if (anyFlags) {
			let existingFlags = currentHouseToAudit['audit_flags']
			let newFlags = [...(existingFlags ?? [])]
			auditOptions.forEach((x) => {
				if (!x.value && !newFlags.includes(x.index)) newFlags.push(x.index)
			})
			const { data, error } = await supabase
				.from(batteryProposalsTableName)
				.update({ 'audit_flags': newFlags })
				.eq('id', currentHouseToAudit.id)
			if (error) {
				console.log(error)
				return
			}
		} else {
			if (currentHouseToAudit && currentHouseM2 > 6 && currentHouseM2 < 40) {
				const { data, error } = await supabase
					.from(batteryProposalsTableName)
					.update({ 'audit_flags': [99] })
					.eq('id', currentHouseToAudit.id)
				if (error) {
					console.log(error)
					return
				}
			}
		}
		currentHousePointer += 1
		auditCheckboxes.forEach((x) => (x.checked = true))
	}

	async function loadAllUnauditedHousesFromSupabase(randomiseOrder = true) {
		let { data, error } = await supabase
			.from(batteryProposalsTableName)
			.select('*')
			.eq('campaign_id', campaign)

		if (error) {
			console.log(`Error fetching from ${batteryProposalsTableName}`)
			return []
		} else {
			data = data.filter((x) => {
				if (!x['audit_flags']) return true
				let flagsToExclude = [0, 2, 20, 21, 22, 23, 24, 99]
				let flagged = false
				flagsToExclude.forEach((i) => {
					if (x['audit_flags'].includes(i)) {
						flagged = true
					}
				})
				return !flagged
			})
			if (randomiseOrder) {
				return data.sort(() => {
					return Math.random() > 0.5 ? 1 : -1
				})
			} else {
				return data
			}
		}
	}

	async function loadAuditCriteria(campaignId: string) {
		const { data: loadAuditData, error: loadAuditError } = await supabase
			.from('campaign_master')
			.select('audit_criteria')
			.eq('campaign_id', campaignId)
		if (loadAuditError) {
			console.log(loadAuditError.message)
			return
		}
		console.log(loadAuditData)

		let auditCodes = loadAuditData[0]['audit_criteria']

		let promises = auditCodes.map(async (x) => {
			return supabase.from('campaign_audit_criteria').select('*').eq('id', x)
		})

		let results = (await Promise.all(promises)).map((x) => {
			return x.data[0]
		})

		results = results.filter((x) => {
			return x['human_required']
		})

		auditCheckboxes = results.map((x) => {
			null
		})
		return results
	}
</script>

{#if !isAuthenticated}
	<MagicLink
		bind:isAuthenticated
		redirectUrl={`battery-proposals/audit?startIndex=${currentHousePointer}&campaignId=${campaign}`}
	/>
{:else}
	<div class="container">
		{#if allUnauditedHouses.length != 0}
			<div class="error-message">
				<p>No houses to audit</p>
			</div>
		{:else}
			{#key currentHouseToAudit}
				<div class="header">
					<h1>{currentHousePointer + 1} / {allUnauditedHouses.length}</h1>
				</div>
				<div class="images">
					<img
						src={currentHouseToAudit
							? currentHouseToAudit['campaign_specific_data']['screenshot_url']
							: ''}
						alt=""
						class="image"
					/>
					<div class="house-details">
						<p class="array-text">
							{currentHouseToAudit
								? currentHouseToAudit['campaign_specific_data']['solar_array_info'].length
								: ''} array{currentHouseToAudit
								? currentHouseToAudit['campaign_specific_data']['solar_array_info'].length == 1
									? ''
									: 's'
								: ''}
						</p>
						<p class="meter-squared">
							{currentHouseToAudit ? Math.round(currentHouseM2) : ''}m² array size
						</p>
					</div>
				</div>
			{/key}
			<div class="legend">
				<ul class="audit-legend">
					{#each auditOptions as audit}
						<li class="audit-legend-entry">{audit.description}</li>
					{/each}
				</ul>
			</div>

			<form action="" class="audit-options" bind:this={auditForm} on:submit={onSubmit}>
				{#each auditOptions as audit, i}
					<div class="input-wrapper">
						<label for={`audit-option-${i}`}>{i + 1}</label>
						<input
							type="checkbox"
							name={`audit-option-${i}`}
							id={`audit-option-${i}`}
							class="audit-option"
							checked={true}
							on:click={() => (audit.value = !audit.value)}
							bind:this={auditCheckboxes[i]}
						/>
					</div>
				{/each}
			</form>

			<input
				type="button"
				value="Next"
				class="next-button"
				bind:this={nextButton}
				on:click={() => {
					auditForm.requestSubmit()
				}}
			/>
		{/if}
	</div>
{/if}

<style>
	.container {
		width: 100%;
		height: 100%;
		position: absolute;
		display: grid;
		grid-template-rows: 0.2fr 2.5fr 1fr 0.3fr;
		grid-auto-columns: 1fr;
		gap: 0px 0px;
		grid-auto-flow: row;
		top: 0;
		left: 0;
		background: #0b252f;
	}

	.house-details {
		font-size: 24px;
		position: relative;
		top: 0;
		left: 0;
		width: calc(100%-4px);
		height: fit-content;
		background: #091408;
		border-width: 0px 2px 2px 2px;
		border-color: #35bbed;
		border-style: solid;
		color: white;
		text-align: center;
		border-radius: 0px 0px 16px 16px;
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.images {
		position: relative;
		height: fit-content;
		left: 50%;
		top: 50%;
		transform: translate(calc(-50% - 24px), -50%);
		display: flex;
		flex-direction: column;
		width: fit-content;
		box-shadow: 0px 4px 24px 6px rgba(0, 0, 0, 0.8);
		border-radius: 0px 0px 16px 16px;
		margin: 24px;
	}

	.image {
		width: 100%;
		max-height: 60vh;
	}

	.audit-legend {
		position: relative;
		top: 50%;
		right: 0;
		margin: 0px 24px;
		transform: translate(0, -50%);
		background: #091408;
		border-width: 2px;
		border-color: #35bbed;
		border-style: solid;
		color: white;
		border-radius: 16px;
		font-size: 24px;
		box-shadow: 0px 4px 24px 6px rgba(0, 0, 0, 0.8);
	}

	.audit-legend-entry {
		list-style: decimal;
	}

	.audit-options {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translate(-50%, 0);
		display: flex;
		gap: 12px;
		margin: 12px 0px;
	}

	.audit-options > * > input {
		width: 30px;
		height: 30px;
		/* make checkbox red when not checked*/
		filter: invert(50%) sepia(100%) saturate(10000%) hue-rotate(-20deg);
	}

	.audit-options > * > input:checked {
		/* make checkbox green when checked*/
		filter: hue-rotate(-80deg);
	}

	.audit-options > * > label {
		color: white;
	}

	.input-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.next-button {
		position: absolute;
		bottom: 0;
		right: 0;
		margin: 16px;
		font-size: 24px;
	}

	.header {
		color: white;
		width: 100%;
		text-align: center;
	}

	.house-details > p {
		margin: 16px;
	}

	.error-message {
		width: 100%;
		text-align: center;
		color: white;
		font-size: 24px;
	}
</style>
