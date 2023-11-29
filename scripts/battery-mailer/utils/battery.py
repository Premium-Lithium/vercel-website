# import requests
# import json
# import webbrowser

# reqUrl = "http://localhost:3000/generate-postcard"

# headersList = {
#  "Accept": "*/*",
#  "User-Agent": "Thunder Client (https://www.thunderclient.com)",
#  "Content-Type": "application/json"
# }

# payload = json.dumps({
#   "customerId": "df69cb86-a11d-4604-bda2-803f5594e1f3",
#   "proposalType": "battery"
# })

# response = requests.request("POST", reqUrl, data=payload,  headers=headersList)

# if response.status_code == 200:
#     data = response.json()
#     if data.get('success'):
#         pdf_url = data['data']['pdf']
#         webbrowser.get('google-chrome').open(pdf_url)
#     else:
#         print("Request was not successful.")
# else:
#     print("Error making request:", response.status_code)



import requests
import json

reqUrl = "http://localhost:3000/generate-postcard"

headersList = {
 "Accept": "*/*",
 "User-Agent": "Thunder Client (https://www.thunderclient.com)",
 "Content-Type": "application/json"
}

payload = json.dumps({
  "customerId": "df69cb86-a11d-4604-bda2-803f5594e1f3",
  "proposalType": "battery"
})

response = requests.request("POST", reqUrl, data=payload,  headers=headersList)

print(response.text)