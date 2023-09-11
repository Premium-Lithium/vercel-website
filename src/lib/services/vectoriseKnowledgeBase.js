import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

const text = `
SAVE UP TO 55% WITH A PRE-ORDER ON ALL PRODUCTS
5% DISCOUNT PER MONTH FROM NOW, CAPPED AT 55% WHEN INSTALLING IN 12 MONTHS TIME.
---
FAQs
Q: What is included in the price?
A: The price is not just for the battery but for a complete turnkey solution that includes everything you need to manage and reduce your energy costs. This solution includes full case management and application to the National Grid, your chosen Premium Lithium Smart Home Battery, a grade-A inverter, all wiring and mounting equipment, free delivery and installation by our team of experts as well as onboarding and off-site management. All hardware also comes with 10 years’ warranty for full peace of mind.

Q: Is VAT included in your prices?
A: Prices on our website are all ex-VAT as many of our customers are able to claim the VAT back. While the current VAT rate for Smart Home Batteries is the standard 20%, if they are combined with renewable energy generation systems such as wind turbines or solar panels, then the VAT rate is reduced to 0%.

Q: How do pre-orders work?
A: Premium Lithium offer generous discounts of up to 55% based on when you would like your Smart Home Battery installed / delivered. By pre-ordering, we are able to benefit from economies of scaling in production and labour which means we can pass on these savings to customers.

Q: Do I need to have solar panels to use a Smart Home Battery with?
A: Whilst many customers may already have solar panels, significant savings can be made with just a Smart Home Battery on its own. If you are considering solar panels for your home, then a Premium Lithium Smart Home Battery solution will allow you to store any excess solar energy for use after the sun sets.

Q: Does it come with free delivery and installation?
A: Yes, all Smart Home Battery solutions that are purchased include free delivery and installation.

Q: What is the warranty period?
A: All our hardware and equipment come with a fully comprehensive 10-year warranty for your complete peace of mind.

Q: Can I take my battery with me if I move home?
A: If you are looking to move house, many customers decide to sell the battery as part of the property. However, if you would like to take the smart battery with you, then for a nominal fee, we can send our team to uninstall the battery and assist in moving it to your new home.
---
Why choose our systems?
Save up to 90% on your energy costs
By storing the energy from solar panels during the day and/or accessing cheaper rates of electricity from the grid at off-peak times, you can save up to 90% on your energy bills.
Benefit from increased energy security
By taking advantage of our Emergency Power Source (EPS) functionality, your home battery can act like a back-up generator, giving you increased peace of mind during blackouts and power cuts.
Store solar energy and reduce your carbon emissions
Our home batteries are compatible with all common solar PV arrays. By storing and using energy from the sun you'll reduce your reliance on polluting fossil fuels.
Help to balance the strain on the national grid
Using a home battery can reduce your reliance on energy from the grid at peak times when demand for electricity is high. This can help to reduce the burden on the grid and on less clean energy sources.
Expand your capacity over time with modular design
As your energy needs change and evolve, your home battery system can too. Our clever modular system can be expanded upon over time to ensure that your capacity always matches your needs.
---
Powerpod 5kWh Smart Home Battery
Regular price £5,995 (ex. VAT)
The 5kWh Powerpod is our small but powerful entry-level home battery. Don’t be fooled by its compact size - it offers a complete all-in-one solution to the home and solar energy storage needs of smaller properties and allows you to save on energy costs by charging off-peak. Inverter and installation are included in the price for complete peace of mind. 
Product power: 5kWh
Nominal voltage: 51.2V
Nominal capacity: 100Ah
---
Powerpod 10kWh Smart Home Battery
The 10kWh Powerpod is a small but powerful home battery designed for small to medium homes. Don’t be fooled by its compact size - it offers a complete all-in-one solution to the home and solar energy storage needs and allows you to save on energy costs by charging off-peak. Inverter and installation are included in the price for complete peace of mind.
Regular price £9,995 (ex. VAT)
Product power: 10kWh
Nominal voltage: 51.2V
Nominal capacity: 200Ah
---
Powerpanel 9.5kWh Smart Home Battery
The 9.5kWh Powerpanel is a small but powerful home battery designed for small to medium homes. Don’t be fooled by its compact size - it offers a complete all-in-one solution to the home and solar energy storage needs and allows you to save on energy costs by charging off-peak. Inverter and installation are included in the price for complete peace of mind.
Regular price £9,995 (ex. VAT)
Product power: 9.5kWh
Nominal voltage: 51.2V
Nominal capacity: 185Ah
---
Powerpod 15kWh Smart Home Battery
The 15kWh Powerpod is a powerful wall-mounted LiFePO4 home battery with smart BMS. With installation and inverter included in the price, it offers a complete all-in-one solution to your home and solar energy storage needs.
Regular price £13,990 (ex. VAT)
Product power: 15kWh
Nominal voltage: 51.2V
Nominal capacity: 300Ah
---
Powerplant 20kWh Smart Home Battery
The 20kWh Powerplant is a powerful floor-standing LiFePO4 home battery with smart BMS. With installation and inverter included in the price, it offers a complete all-in-one solution to your home and solar energy storage needs.
Regular price £17,985 (ex. VAT)
Product power: 20kWh
Nominal voltage: 51.2V
Nominal capacity: 400Ah
---
Powerplant 30kWh Smart Home Battery
The 30kWh Powerplant is a powerful floor-standing LiFePO4 home battery with smart BMS. With installation and inverter included in the price, it offers a complete all-in-one solution to your home and solar energy storage needs.
Regular price £25,975 (ex. VAT)
Product power: 30kWh
Nominal voltage: 51.2V
Nominal capacity: 600Ah
---
Powerplant 40kWh Smart Home Battery
The 40kWh Powerplant is a powerful floor-standing LiFePO4 home battery with smart BMS. With installation and inverter included in the price, it offers a complete all-in-one solution to your home and solar energy storage needs.
Regular price £32,970 (ex. VAT)
Product power: 40kWh
Nominal voltage: 51.2V
Nominal capacity: 800Ah
---
Powerplant 50kWh Smart Home Battery
The 50kWh Powerplant is a powerful floor-standing LiFePO4 home battery with smart BMS. With installation and inverter included in the price, it offers a complete all-in-one solution to your home and solar energy storage needs.
Regular price £39,965 (ex. VAT)
Product power: 50kWh
Nominal voltage: 51.2V
Nominal capacity: 1000Ah
`
const textSplitter = new RecursiveCharacterTextSplitter( {
    chunkSize: 500,
    chunkOverlap: 0,
})

const docs = await textSplitter.createDocuments([text]);

const splitDocs = await textSplitter.splitDocuments(docs);

await SupabaseVectorStore.fromDocuments(
    splitDocs,
    new OpenAIEmbeddings(),
    {
        client: supabase,
        tableName: "documents",
        queryName: "match_documents",
    },
);
   