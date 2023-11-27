<script>
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import MagicLink from '$lib/components/MagicLink.svelte'
	import { supabase } from '$lib/supabase'
	import { onMount } from 'svelte'

	const batteryProposalsTableName = 'existing-solar-properties'

	let allUnauditedHouses = []
	let currentHouseToAudit = undefined
	let currentHousePointer = 0
	let loading = false
	let currentHouseM2 = 0

	currentHousePointer = +($page.url.searchParams.get('startIndex') ?? '0')

	$: if (currentHouseToAudit)
		currentHouseM2 = currentHouseToAudit['solar_array_info'].reduce((p, v, i, a) => {
			return p + v['area_m2']
		}, 0)

	$: currentHouseToAudit = currentHouseToAudit = allUnauditedHouses[currentHousePointer]

	let isAuthenticated = false
	let auditOption1, auditOption2, auditOption3, auditOption4, auditOption5, nextButton, auditForm
	$: auditOptions = [
		{ name: 'CLEAR_IMAGE', value: auditOption1 },
		{ name: 'ADDRESS_CORRECT', value: auditOption2 },
		{ name: 'CORRECT_PANEL_ESTIMATE', value: auditOption3 },
		{ name: 'CLEAR_AND_SENSIBLE', value: auditOption4 },
		{ name: 'SHADE_FREE', value: auditOption5 }
	].map((x, i) => {
		if (x.value) return { name: x.name, value: x.value.checked, index: i }
	})

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession()
		if (data.session == null) isAuthenticated = false
		else isAuthenticated = true
		loading = false
		allUnauditedHouses = await loadAllUnauditedHousesFromSupabase(false)

		if (browser) {
			document.addEventListener('keydown', (event) => {
				switch (event.code) {
					case 'Space':
					case 'Enter':
						nextButton.click()
						break
					case 'Digit1':
						auditOption1.checked = !auditOption1.checked
						break
					case 'Digit2':
						auditOption2.checked = !auditOption2.checked
						break
					case 'Digit3':
						auditOption3.checked = !auditOption3.checked
						break
					case 'Digit4':
						auditOption4.checked = !auditOption4.checked
						break
					case 'Digit5':
						auditOption5.checked = !auditOption5.checked
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
				if (!x.value && !newFlags.includes(20 + x.index)) newFlags.push(20 + x.index)
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
		auditOption1.checked = true
		auditOption2.checked = true
		auditOption3.checked = true
		auditOption4.checked = true
		auditOption5.checked = true
	}

	async function loadAllUnauditedHousesFromSupabase(randomiseOrder = true) {
		let { data, error } = await supabase.from(batteryProposalsTableName).select('*')

		if (error) {
			console.log(`Error fetching from ${batteryProposalsTableName}`)
			return []
		} else {
			data = data.filter((x) => {
				if (!x['audit_flags']) return true
				return !(
					x['audit_flags'].includes(99) ||
					x['audit_flags'].includes(0) ||
					x['audit_flags'].includes(2)
				)
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
</script>

{#if !isAuthenticated}
	<MagicLink
		bind:isAuthenticated
		redirectUrl={`battery-proposals/audit?startIndex=` +
			($page.url.searchParams.get('startIndex') ?? '0')}
	/>
{:else}
	<div class="container">
		{#key currentHouseToAudit}
			<div class="header">
				<h1>{currentHousePointer + 1} / {allUnauditedHouses.length}</h1>
			</div>
			<div class="images">
				<img
					src={currentHouseToAudit ? currentHouseToAudit['screenshot_url'] : ''}
					alt=""
					class="image"
				/>
				<div class="house-details">
					<p class="saving-text">
						£{Math.round(
							currentHouseToAudit ? currentHouseToAudit['potential_savings_with_battery_gbp'] : ''
						)} saving
					</p>
					<p class="array-text">
						{currentHouseToAudit ? currentHouseToAudit['solar_array_info'].length : ''} array{currentHouseToAudit
							? currentHouseToAudit['solar_array_info'].length == 1
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
				<li class="audit-legend-entry">Does the image show the roof and panels clearly?</li>
				<li class="audit-legend-entry">Is the address likely to be correct?</li>
				<li class="audit-legend-entry">Does the area estimate / number of panels seem correct?</li>
				<li class="audit-legend-entry">Is it clear and sensible for us to send to customers?</li>
				<li class="audit-legend-entry">Is the roof mostly shade free?</li>
			</ul>
		</div>

		<form action="" class="audit-options" bind:this={auditForm} on:submit={onSubmit}>
			<div class="input-wrapper">
				<label for="audit-option-1">1</label>
				<input
					type="checkbox"
					name="audit-option-1"
					id="audit-option-1"
					class="audit-option"
					checked={true}
					bind:this={auditOption1}
				/>
			</div>
			<div class="input-wrapper">
				<label for="audit-option-2">2</label>
				<input
					type="checkbox"
					name="audit-option-2"
					id="audit-option-2"
					class="audit-option"
					checked={true}
					bind:this={auditOption2}
				/>
			</div>
			<div class="input-wrapper">
				<label for="audit-option-3">3</label>
				<input
					type="checkbox"
					name="audit-option-3"
					id="audit-option-3"
					class="audit-option"
					checked={true}
					bind:this={auditOption3}
				/>
			</div>
			<div class="input-wrapper">
				<label for="audit-option-4">4</label>
				<input
					type="checkbox"
					name="audit-option-4"
					id="audit-option-4"
					class="audit-option"
					checked={true}
					bind:this={auditOption4}
				/>
			</div>
			<div class="input-wrapper">
				<label for="audit-option-5">5</label>
				<input
					type="checkbox"
					name="audit-option-5"
					id="audit-option-5"
					class="audit-option"
					checked={true}
					bind:this={auditOption5}
				/>
			</div>
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
		grid-template-columns: 1fr 1fr 1fr;
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
</style>
