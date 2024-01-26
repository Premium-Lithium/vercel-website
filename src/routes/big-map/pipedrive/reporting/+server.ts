import { CRM } from "$lib/crm/crm-utils"

export async function POST({ request }) {
    let req = await request.json()
    let crm = new CRM()
    let data = [['Installer', 'Address', 'Email', 'Phone Number']]
    let panels = req.panels
    for (let panel in panels) {
        for (let marker in panels[panel].markers)
            if (panels[panel].markers[marker].visible) {
                console.log(panels[panel].markers[marker])
                data.push([
                    panels[panel].markers[marker].deal.title,
                    panels[panel].markers[marker].address,
                    await crm.getEmailFromPersonID(panels[panel].markers[marker].deal.person_id),
                    await crm.getPhoneNumberFromPersonID(panels[panel].markers[marker].deal.person_id)
                ])
            }
    }

    return new Response(JSON.stringify(data))
}