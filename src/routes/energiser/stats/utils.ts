import { supabase } from '$lib/supabase'

export async function getAllHomeowners() {
	const { data: getHomeownerData, error: getHomeownerError } = await supabase
		.from('platform_homeowners')
		.select('*')
		.eq('internal', false)
	if (getHomeownerError) {
		console.error('Error getting Homeowners')
	} else {
		return getHomeownerData
	}
}

export async function getAllInstallers() {
	const { data: getInstallerData, error: getInstallerError } = await supabase
		.from('platform_installers')
		.select('*')
		.eq('internal', false)
	if (getInstallerError) {
		console.error('Error getting Installers')
	} else {
		return getInstallerData
	}
}
