
export class openSolarAPI {
    token;
    organisationId;
    constructor() {
        this.token = 's_OZATKMZINPGPGYTS2XFB42LT2KQSKZM6' // My token (Peter) as the machine user
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
            country: addressObject.country,
            zip: addressObject.zip,
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
        const projectList = await response.json()
        for (const i in projectList) {
            const projectId = projectList[i].id
            const response = await fetch(`https://api.opensolar.com/api/orgs/${this.organisationId}/projects/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                }
            })
            const projectDetail = await response.json()
            if (projectDetail.identifier && (projectDetail.identifier).includes(PLNumber) && (projectDetail.systems).length != 0) {
                return projectDetail.id

            }
        }
        return null
    }
    async searchForProjectFromAddress(address: string) {
        const response = await fetch(`https://api.opensolar.com/api/orgs/${this.organisationId}/projects/`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
            }
        })
        const projectList = await response.json()
        for (const i in projectList) {
            const projectAddress = projectList[i].address
            if (projectAddress && projectAddress.includes(address)) {
                return projectList[i].id
            }
        }
        return null
    }

    async searchForDesignFrom(projectId: string) {
        if (!projectId) {
            return null
        }
        const response = await fetch(`https://api.opensolar.com/api/orgs/${this.organisationId}/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
            }
        })
        const projectDetail = await response.json()
        if ((projectDetail.systems).length != 0) {
            return projectDetail.systems[0].uuid
        } else {
            return null
        }
    }

    async getCountryData(countryName: string) {
        const response = await fetch(`https://api.opensolar.com/api/countries/`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
            }
        })
        const countryList = await response.json()
        for(const i in countryList) {
            if((countryList[i].name).includes(countryName)) {
                return countryList[i]
            }
        }
        return null
    }
}