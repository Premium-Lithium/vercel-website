
export class openSolarAPI {
    token;
    organisationId;
    constructor() {
        this.token = 's_SVCFQ5RYUJMFJ46AVCCD2C4SOJ2K5YLN' // My token (Nicholas) as the machine user
        this.organisationId = 52668 // Premium Lithium's ORG ID
    }

    async authenticate(username: string, password: string) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'username': username,
                'password': password
            })
        }
        const response = await fetch('https://api.opensolar.com/api-token-auth/', options)
        const responseData = await response.json()
        console.log(responseData)
        return responseData
    }
    // projectId, uuid, dimension: [width, height]
    async getBufferImageFrom(projectId: string, uuid: string, dimension: [number, number]) {
        const width = dimension[0];
        const height = dimension[1];
        const response = await fetch(`https://api.opensolar.com/api/orgs/${this.organisationId}/projects/${projectId}/systems/${uuid}/image/?width=${width}&height=${height}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
            }
        })
        const imageBuffer = await response.arrayBuffer()
        const buff = Buffer.from(imageBuffer)
        return buff
    }

    async startProjectFrom(PLNumber: string, addressObject: Object) {
        const bodyData = {
            identifier: PLNumber,
            address: addressObject.address,
            lat: addressObject.longLat[1],
            lon: addressObject.longLat[0]
        }
        const options = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(bodyData)
        }
        const response = await fetch(`https://api.opensolar.com/api/orgs/${this.organisationId}/projects/`, options)
        const responseData = await response.json()
        console.log('Project created.')
        return responseData
    }

    async getProjectDetailsFrom(projectId: string) {
        const response = await fetch(`https://api.opensolar.com/api/orgs/${this.organisationId}/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
            }
        })
        const responseData = await response.json()
        return responseData
    }

    async searchForProjectFromRef(PLNumber: string) {
        const response = await fetch(`https://api.opensolar.com/api/orgs/${this.organisationId}/projects/`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
            }
        })
        const responseData = await response.json()
        for (const i in responseData) {
            const projectId = responseData[i].id
            const response = await fetch(`https://api.opensolar.com/api/orgs/${this.organisationId}/projects/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                }
            })
            const responseData = await response.json()
            if(responseData.identifier && (responseData.identifier).includes(PLNumber)){
                console.log("Found with PL", responseData)
            }
        }
    }
    async searchForProjectFromAddress(address: string) {
        const response = await fetch(`https://api.opensolar.com/api/orgs/${this.organisationId}/projects/`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
            }
        })
        let found = false
        const responseData = await response.json()
        // Iteratively saerch for the identifier


        // Checks from address
        for (const i in responseData) {
            const projectAddress = responseData[i].address
            if (projectAddress && projectAddress.includes(address)) {
                console.log(projectAddress)
                console.log("found: ", responseData[i].id)
                found = true
            }
        }
    }
}