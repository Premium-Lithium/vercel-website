import pkg from 'really-relaxed-json';
const { toJson } = pkg;

export class SurveyDataSource {
    accessToken: string;
    constructor() {
        // TO DO - update environment variable
        this.accessToken = 'f5a8b512b90d4ea239858d63f768cdbcdb8cd83c6bd2216001ceb5f20a35632c'
    }

    async getTemplateIdFor(templateName: string) {
        const response = await fetch('https://api.safetyculture.io/templates/search?order=desc&archived=false&owner=all', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
        const responseData = await response.json()
        let template = responseData.templates.find(template => template.name == templateName)
        return template.template_id
    }
    // Process
    // search all inspections with the template
    // go through each inspections and find which has the PL reference === PL Number
    // return its customerName of that inspection
    async searchInspectionFrom(PLNumber: string, templateName: string) {
        const templateId = await this.getTemplateIdFor(templateName)
        const response = await fetch(`https://api.safetyculture.io/audits/search?template=${templateId}&archived=false&completed=both`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
        const responseData = await response.json()
        const auditList = responseData.audits
        // Loop through each audits_data, and find first matches
        // Iterate from latest inspection to oldest
        for (const i in auditList.reverse()) {
            const audit_id = auditList[i].audit_id
            const response = await fetch(`https://api.safetyculture.io/audits/${audit_id}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                }
            })
            const responseData = await response.json()
            const surveyTitle = responseData.audit_data.name
            if (surveyTitle != "") {
                //Matches
                const match = surveyTitle.match(/PL\d+/i);
                if (match) {
                    if (match[0].toLowerCase() === PLNumber.toLowerCase()) {
                        return audit_id
                    }
                }
            }
        }
        return null
    }

    findObjectWithLabel(arr, targetLabel: string) {
        for (const obj of arr) {
            if (obj.label === targetLabel) {
                return obj;
            } else if (obj.children && obj.children.length > 0) {
                const result = this.findObjectWithLabel(obj.children, targetLabel);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }

    async getIdFromFieldName(fieldName: string, templateName: string) {
        const templateId = await this.getTemplateIdFor(templateName)
        const response = await fetch(`https://api.safetyculture.io/templates/v1/templates/${templateId}`, {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`,
            }
        })
        const responseData = await response.json()
        const surveySections = responseData.template.items
        // Field ID might be in a children, or children of children, etc
        // So needs recursive search
        const result = this.findObjectWithLabel(surveySections, fieldName)
        if (result) return result.id
    }

    async fetchAnswersFrom(PLNumber: string, fieldName: string, templateName: string) {
        const foundId = await this.searchInspectionFrom(PLNumber, templateName)
        const fieldId = await this.getIdFromFieldName(fieldName, templateName)

        const response = await fetch(`https://api.safetyculture.io/inspections/v1/answers/${foundId}`, {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`,
            }
        })
        const responseData = await response.text()
        //Parsing to array of JSONs
        let parsedResponse = "[" + responseData + "]"
        let responseObject = JSON.parse(toJson(parsedResponse))
        const foundResult = responseObject.find(item => item.result.question_id === fieldId)

        if ('list_answer' in foundResult.result) {
            return foundResult.result.list_answer.responses;
        } else if ('question_answer' in foundResult.result) {
            return foundResult.result.question_answer.responses;
        } else if (foundResult.result.text_answer.answer === "") {
            return undefined;
        } else {
            return foundResult.result.text_answer.answer;
        }
    }

    async updateAnswersFor(PLNumber: string, fieldName:string, templateName: string, value:string) {
        const foundId = await this.searchInspectionFrom(PLNumber, templateName)
        const fieldId = await this.getIdFromFieldName(fieldName, templateName)

        const options = {
            method: 'PUT',
            headers: {
              'accept': 'application/json',
              'content-type': 'application/json',
              'Authorization': `Bearer ${this.accessToken}`
            },
            body: JSON.stringify({
              items: [
                {
                  type: 'text',
                  responses: {text: value}, //currently only for text answers
                  item_id: fieldId
                }
              ]
            })
          };
        const response = await fetch(`https://api.safetyculture.io/audits/${foundId}`, options)
        return response
    }

    async setMpanFor(PLNumber: string, templateName: string, value:string) {
        return this.updateAnswersFor(PLNumber, 'MPAN', templateName, value)
    }

    async getMpanFor(PLNumber: string, templateName: string) {
        return this.fetchAnswersFrom(PLNumber, 'MPAN', templateName)
    }

    async setExistingInverterFor(PLNumber: string, templateName: string, value:string) {
        return this.updateAnswersFor(PLNumber, 'Make and model of existing inverter ', templateName, value)
    }

    async getExistingInverterFor(PLNumber: string, templateName: string) {
        return this.fetchAnswersFrom(PLNumber, 'Make and model of existing inverter ', templateName)
    }

    async setPitchFor(PLNumber: string, templateName: string, value:string) {
        return this.updateAnswersFor(PLNumber, 'Roof Pitch', templateName, value)
    }

    async getPitchFor(PLNumber: string, templateName: string) {
        return this.fetchAnswersFrom(PLNumber, 'Roof Pitch', templateName)
    }

    async getAzimuthFor(PLNumber: string, templateName: string) {
        return this.fetchAnswersFrom(PLNumber, 'Roof Orientation from South ', templateName)
    }

    async getScaffoldingRequiredFor(PLNumber: string, templateName: string) {
        return this.fetchAnswersFrom(PLNumber, 'How many side of scaffolding are required?', templateName)
    }

    async getRoofStructureTypeFor(PLNumber: string, templateName: string) {
        return this.fetchAnswersFrom(PLNumber, 'Roof Structure Type ', templateName)
    }

    async getRoofTileTypeFor(PLNumber: string, templateName: string) {
        return this.fetchAnswersFrom(PLNumber, 'Roof Type ', templateName)
    }
}