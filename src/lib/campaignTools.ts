import type { UUID } from 'crypto'
import { supabase } from './supabase'

export async function updateStatus(
	campaignId: string,
	customerId: UUID,
	name: string,
	description: string
) {
	const { data: fetchStatusData, error: fetchStatusError } = await supabase
		.from('campaign_customers')
		.select('*')
		.eq('campaign_id', campaignId)
		.eq('customer_id', customerId)
	let statusLog: Array<any> = fetchStatusData[0]['status_log']
	if (!statusLog) {
		statusLog = []
	}
	statusLog.push(fetchStatusData[0]['current_status'])
	const { data: updateStatusLogData, error: updateStatusLogError } = await supabase
		.from('campaign_customers')
		.update({
			'status_log': statusLog,
			'current_status': {
				'name': name,
				'description': description,
				'date_started': new Date(Date.now()).toISOString()
			}
		})
		.eq('campaign_id', campaignId)
		.eq('customer_id', customerId)
}
