<script>
    let name = "";
    let email = "";
    let phoneNumber = "";
    let academyName = "";
    let companyName = "";
    let companyAddress = "";

    function handleSubmit(event) {
        event.preventDefault();
        addNewInstaller(name, email, phoneNumber, academyName, companyName, companyAddress);
    }

    function addNewInstaller(name, email, phoneNumber, academyName, companyName, companyAddress) {
        console.log(`Adding new installer: ${name}, ${email}, ${phoneNumber}, ${academyName}, ${companyName}, ${companyAddress}`);
        // TODO: add new deal to pipedrive here
    }
</script>

<div class="body">
	<img
		class="logo"
		src="https://premiumlithium.com/cdn/shop/files/Website_Logo_PNG_8c3726b3-6ebd-489e-9a38-06885f16236b.png?v=1653833196&width=500"
	/>
	<h1>Become an Installation Partner today</h1>
	<h2>
		Please complete the form below and one of the team will be in touch to discuss this great
		opportunity:
	</h2>

	<div class="sc-kdBSHD iYHVXt">
		<div class="sc-koXPp gZGbcL">
			<div class="sc-eeDRCY dTIjiu">
				<form action="#" name="Academy Registration" on:submit={handleSubmit}>
					<div class="sc-jlZhew dHgxMY">
						<label
							for="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMS0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM"
							id="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMS0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM_label"
							class="sc-dAlyuH dWziHy"><span>Name</span></label
						>
						<div>
							<input
								name="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMS0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM"
								type="text"
								id="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMS0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM"
								aria-invalid="false"
								aria-required="true"
								aria-describedby="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMS0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM_error V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMS0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM_helpText"
								class="sc-aXZVg jXABNp"
                                autocomplete="one-time-code"
                                bind:value={name}
                                required
							/>
						</div>
					</div>
					<div class="sc-jlZhew dHgxMY">
						<label
							for="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMi0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM"
							id="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMi0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM_label"
							class="sc-dAlyuH dWziHy"><span>Email</span></label
						>
						<div>
							<input
								name="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMi0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM"
								type="email"
								id="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMi0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM"
								aria-invalid="false"
								aria-required="true"
								aria-describedby="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMi0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM_error V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMi0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM_helpText"
								class="sc-aXZVg jXABNp"
								bind:value={email}
                                autocomplete="one-time-code"
                                required
							/>
						</div>
					</div>
					<div class="sc-jlZhew dHgxMY">
						<label
							for="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMy0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM"
							id="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMy0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM_label"
							class="sc-dAlyuH dWziHy"><span>Phone</span></label
						>
						<div>
							<input
								name="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMy0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM"
								type="tel"
								id="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMy0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM"
								aria-invalid="false"
								aria-required="true"
								aria-describedby="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMy0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM_error V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjMy0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM_helpText"
								class="sc-aXZVg jXABNp"
								bind:value={phoneNumber}
                                autocomplete="one-time-code"
                                required
							/>
						</div>
					</div>
					<div class="sc-jlZhew dHgxMY">
						<label
							for="V2ViRm9ybUNhcHR1cmVCbG9jazo1YTFiNDhlMC0zYWEwLTExZWUtODUwZC05NTE1ZWRlMDQ4N2I"
							id="V2ViRm9ybUNhcHR1cmVCbG9jazo1YTFiNDhlMC0zYWEwLTExZWUtODUwZC05NTE1ZWRlMDQ4N2I_label"
							class="sc-dAlyuH dWziHy"><span>Academy Name <br /></span></label
						>
						<div>
							<input
								name="V2ViRm9ybUNhcHR1cmVCbG9jazo1YTFiNDhlMC0zYWEwLTExZWUtODUwZC05NTE1ZWRlMDQ4N2I"
								type="text"
								id="V2ViRm9ybUNhcHR1cmVCbG9jazo1YTFiNDhlMC0zYWEwLTExZWUtODUwZC05NTE1ZWRlMDQ4N2I"
								aria-invalid="false"
								aria-required="true"
								aria-describedby="V2ViRm9ybUNhcHR1cmVCbG9jazo1YTFiNDhlMC0zYWEwLTExZWUtODUwZC05NTE1ZWRlMDQ4N2I_error V2ViRm9ybUNhcHR1cmVCbG9jazo1YTFiNDhlMC0zYWEwLTExZWUtODUwZC05NTE1ZWRlMDQ4N2I_helpText"
								class="sc-aXZVg jXABNp"
								bind:value={academyName}
                                autocomplete="one-time-code"
                                required
							/>
						</div>
					</div>
					<div class="sc-jlZhew dHgxMY">
						<label
							for="V2ViRm9ybUNhcHR1cmVCbG9jazoxYTEzNWFjMC0zMTFlLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM"
							id="V2ViRm9ybUNhcHR1cmVCbG9jazoxYTEzNWFjMC0zMTFlLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM_label"
							class="sc-dAlyuH dWziHy"><span>Company Name<br /></span></label
						>
						<div>
							<input
								name="V2ViRm9ybUNhcHR1cmVCbG9jazoxYTEzNWFjMC0zMTFlLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM"
								type="text"
								id="V2ViRm9ybUNhcHR1cmVCbG9jazoxYTEzNWFjMC0zMTFlLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM"
								aria-invalid="false"
								aria-required="true"
								aria-describedby="V2ViRm9ybUNhcHR1cmVCbG9jazoxYTEzNWFjMC0zMTFlLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM_error V2ViRm9ybUNhcHR1cmVCbG9jazoxYTEzNWFjMC0zMTFlLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM_helpText"
								class="sc-aXZVg jXABNp"
								bind:value={companyName}
                                autocomplete="one-time-code"
                                required
							/>
						</div>
					</div>
					<div class="sc-jlZhew dHgxMY">
						<label
							for="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjNC0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM"
							id="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjNC0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM_label"
							class="sc-dAlyuH dWziHy"><span>Company Address<br /></span></label
						>
						<div>
                            <input
                                name="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjNC0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM"
                                id="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjNC0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM"
                                aria-invalid="false"
                                aria-required="true"
                                aria-describedby="V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjNC0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM_error V2ViRm9ybUNhcHR1cmVCbG9jazpiMDE2ZTVjNC0zMTFjLTExZWUtODAxNC0xNzlmNDMzYmQ5MTM_helpText"
                                aria-haspopup="listbox"
                                aria-expanded="false"
								class="sc-aXZVg jXABNp"
                                bind:value={companyAddress}
                                autocomplete="one-time-code"
                                required
                            />
						</div>
					</div>
					<button type="submit" class="sc-cwHptR gTJoxE">Submit</button>
				</form>
				<div class="sc-fhzFiK bwjaEz">
					Never share sensitive information (credit card numbers, social security numbers,
					passwords) through this form.
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.body {
		background-color: black;
		color: white;
		margin: auto;
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

    div {
        display: block;
    }

	.pipedriveWebForms {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: left;
	}

	.jXABNp {
		box-sizing: border-box;
		font-family: inherit;
		font-size: inherit;
		font-style: normal;
		font-weight: normal;
		line-height: inherit;
		width: 100%;
		max-width: 100%;
		border: 1px solid rgb(209, 209, 209);
		color: rgb(31, 31, 31);
		background-color: rgb(255, 255, 255);
		box-shadow: rgba(0, 0, 0, 0.04) 1px 1px 3px;
		transition: border-radius 200ms ease 0s;
		height: 36px;
		padding: 8px 10px;
		border-radius: 4px;
	}

    .dTIjiu {
        max-width: 480px;
        margin: 0px auto;
        transition: all 400ms ease 0s;
        color: rgb(31, 31, 31);
        background-color: transparent;
        border-color: purple;
        padding: 0px;
        border-radius: 4px;
    }

    .dHgxMY {
        margin-bottom: 16px;
    }

    .dWziHy {
        margin-bottom: 4px;
        color: rgb(255, 255, 255);
        font-weight: 400;
        font-size: 14px;
        line-height: 18px;
        display: inline-block;
        font-style: normal;
        word-break: break-word;
    }

    .gTJoxE {
        box-shadow: rgba(0, 0, 0, 0.04) 1px 1px 3px;
        transition: border-radius 200ms ease 0s;
        height: unset;
        padding: 8px 10px;
        margin-top: 24px;
        min-height: 48px;
        border-radius: 4px;
        line-height: 20px;
        font-weight: 600;
        font-size: 16px;
        background-color: rgb(255, 255, 255);
        border: 0px;
        color: rgb(0, 0, 0);
        cursor: pointer;
        display: flex;
        -webkit-box-align: center;
        align-items: center;
        font-family: inherit;
        font-style: normal;
        -webkit-box-pack: center;
        justify-content: center;
        width: 100%;
        outline: none;
    }

    button {
        appearance: auto;
        text-rendering: auto;
        color: buttontext;
        letter-spacing: normal;
        word-spacing: normal;
        line-height: normal;
        text-transform: none;
        text-indent: 0px;
        text-shadow: none;
        display: inline-block;
        text-align: center;
        align-items: flex-start;
        cursor: default;
        box-sizing: border-box;
        background-color: buttonface;
        margin: 0em;
        padding: 1px 6px;
        border-width: 2px;
        border-style: outset;
        border-color: buttonborder;
        border-image: initial;
    }

    .bwjaEz {
        line-height: 16px;
        margin-bottom: 16px;
        margin-top: 16px;
        font-weight: 400;
        font-size: 12px;
        color: rgb(128, 128, 128);
    }

    .gZGbcL {
        text-align: left;
        padding: 0px;
        margin: 0px auto;
        width: 100%;
    }

    .bnzPIg {
        position: relative;
    }

    *, ::before, ::after {
        box-sizing: inherit;
    }
</style>
