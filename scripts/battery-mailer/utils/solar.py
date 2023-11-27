import requests
import json
import webbrowser

reqUrl = "http://localhost:3000/generate-postcard"

headersList = {
 "Accept": "*/*",
 "User-Agent": "Thunder Client (https://www.thunderclient.com)",
 "Content-Type": "application/json"
}

payload = json.dumps({
  "customerId": "32b379a2-1255-4032-acf9-9c8791b26b38",
  "proposalType": "solar"
})

response = requests.request("POST", reqUrl, data=payload,  headers=headersList)

if response.status_code == 200:
    data = response.json()
    if data.get('success'):
        pdf_url = data['data']['pdf']
        webbrowser.get('google-chrome').open(pdf_url)
    else:
        print("Request was not successful.")
else:
    print("Error making request:", response.status_code)