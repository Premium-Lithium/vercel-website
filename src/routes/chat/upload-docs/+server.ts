import { supabase } from '$lib/supabase';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { onMount } from 'svelte';
import { json } from '@sveltejs/kit';
var generalKnowledgeBase = `The price is not just for the battery but for a complete turnkey solution that includes everything you need to manage and reduce your energy costs. This solution includes full case management and application to the National Grid, your chosen Premium Lithium Smart Home Battery, a grade-A inverter, all wiring and mounting equipment, free delivery and installation by our team of experts as well as onboarding and off-site management. All hardware also comes with 10 years of warranty for full peace of mind.

If you already have solar panels, significant savings can be made with just a Smart Home Battery on its own. If you are considering solar panels for your home, then a Premium Lithium Smart Home Battery solution will allow you to store any excess solar energy for use after the sun sets.

All Smart Home Battery solutions that are purchased include free delivery and installation.

All our hardware and equipment come with a fully comprehensive 10-year warranty for your complete peace of mind.

If you are looking to move house, many customers decide to sell the battery as part of the property. However, if you would like to take the smart battery with you, then for a nominal fee, we can send our team to uninstall the battery and assist in moving it to your new home.

For our manufacturing, we maintain an exclusive partnership with Delong Energy Company. They might not be widely recognised online, but their reputation in quality production is unparalleled.

The battery’s lifespan extends up to 37 years when cycled roughly 162 times per year (approximately every other day). This is a more realistic usage pattern than fully charging and discharging daily. Under ideal conditions, this battery promises long-term reliability and efficiency.

The pre-ordering model has proved to be an effective approach for both Premium Lithium and our customers. Its success is evident from our customer feedback on Trustpilot which you can see here https://uk.trustpilot.com/review/premiumlithium.com. By pooling payments from multiple pre-orders, we are able to place larger orders with our manufacturing partners. This strategy leads to significant savings on purchasing, shipping, and installation planning.

The payment for pre-orders is not insurance-backed. While insurance-backed payments offer certain security, they introduce additional complexities and costs. These costs would inevitably have to be passed onto our customers, which would offset the benefits of our pre-order savings. For additional security, we provide a complimentary credit card payment service. Utilising this service, you can avail full Section 75 payment protection up to £30,000 through your credit card company. It's an effective way to offer our customers peace of mind without the complexities and costs associated with insurance-backed solutions.

---

You can save up to 90% on your energy costs: by storing the energy from solar panels during the day and/or accessing cheaper rates of electricity from the grid at off-peak times, you can save up to 90% on your energy bills.

You can benefit from increased energy security: By taking advantage of our Emergency Power Source (EPS) functionality, your home battery can act like a back-up generator, giving you increased peace of mind during blackouts and power cuts.

You can store solar energy and reduce your carbon emissions: Our home batteries are compatible with all common solar PV arrays. By storing and using energy from the sun you'll reduce your reliance on polluting fossil fuels.

You can help to balance the strain on the national grid: Using a home battery can reduce your reliance on energy from the grid at peak times when demand for electricity is high. This can help to reduce the burden on the grid and on less clean energy sources.

You can expand your capacity over time with modular design: As your energy needs change and evolve, your home battery system can too. Our clever modular system can be expanded upon over time to ensure that your capacity always matches your needs.

---

Advantages of LiFePO4 Batteries (Lithium Iron Phosphate): Lithium Iron Phosphate (LiFePO4) batteries, often associated with renewable energy solutions, have risen to prominence for a plethora of reasons. Here is a deeper dive into their distinct advantages: Long Cycle Life: One of the standout features of LiFePO4 batteries is their extended cycle life. While most lithium-ion batteries have a decent lifespan, Premium Lithium, using brand new Grade A cells, can achieve 6,000 lifecycles before their capacity drops below 80%. This means that they can serve applications like solar storage for many years without significant degradation.

Safety: When it comes to safety in batteries, LiFePO4 reigns supreme. They are thermally stable and are less prone to overheating or catching fire, even in challenging conditions. This is largely because iron phosphate is an intrinsically safer cathode material compared to other lithium-based cells, reducing the risks of thermal runaway.
Environmental Impact: Lithium Iron Phosphate is a non-toxic material, making these batteries a more environmentally friendly option. Unlike some other types of batteries, they don't contain heavy metals (like cobalt) which can be harmful to the environment.

Stable Discharge Voltage: LiFePO4 batteries maintain a consistent voltage for most of their discharge cycle. This stable output ensures that devices and appliances run effectively without sudden drops in performance.

High Discharge Rates: LiFePO4 batteries can handle very high discharge rates with minimal loss in capacity. This is particularly useful in applications where rapid bursts of power are occasionally needed, such as in certain electric vehicles or backup power systems. Low Self-Discharge: These batteries have a low self-discharge rate, which means they retain their charge for an extended period when not in use. This characteristic is beneficial for applications that require long storage times between uses. Premium Lithium batteries self-discharge at a rate of less than 3% per month.

Tolerant to Wider Temperature Ranges: While all batteries have optimal operating temperatures, LiFePO4 batteries are known to be resilient across a broader range of temperatures, both in terms of charging and discharging.

Weight and Size Efficiency: Compared to traditional lead-acid batteries, LiFePO4 batteries can deliver the same amount of energy with a fraction of the weight and size. This makes them ideal for portable applications or scenarios where space is at a premium.

No Memory Effect: Some batteries lose their maximum energy capacity if they are repeatedly recharged after being only partially discharged. This phenomenon is known as the memory effect. LiFePO4 batteries are immune to this, allowing them to be charged whenever convenient without compromising their capacity.

Given the combination of safety, longevity, and efficiency, it is evident why Premium Lithium, in partnership with its manufacturing associate in Shenzhen, China, opts to produce grade A LiFePO4 batteries. Their applications and benefits in the renewable energy sector are unmatched, offering sustainable solutions for the future.

---

Benefits to our customers from installing battery systems: Bridging Solar Gaps with Battery Storage: Solar panels have variable outputs depending on sunlight availability. The batteries store excess solar energy during peak sunlight, releasing it during low or no solar output periods. This ensures a consistent power supply, reducing dependency on the grid. Cost Implications: Utility companies often charge higher rates during peak demand hours in the evening. Using stored solar energy during these periods can significantly reduce electricity costs. The 'forced charging' feature allows batteries to be charged during off-peak times when electricity rates are typically lower. Controlled via a mobile app, users can preset desired charge levels. Enhanced Energy Autonomy: With the ability to store and manage their own energy, households become less dependent on external energy providers. This can insulate users from grid failures or disruptions in power supply from external sources. Mobile App for Monitoring: Real-time monitoring of the energy storage system is possible through a dedicated mobile app. Users can monitor consumption patterns, receive maintenance alerts, and make predictive decisions about future energy needs.

---

Our battery products fall into 3 ranges. The Powerpod is the most accessible, smallest, and very popular in smaller domestic homes or homes that don’t use a great deal of energy. They are modular, like all our batteries, and their basic unit is the 5kWh Powerpod unit. These can be attached in parallel up to 5 units, which is a maximum of 25kWh. However, most people don’t go beyond 15kWh. This is because you cannot expand past 25kWh, so if you are wanting the flexibility to increase your capacity past this you should look at the Powerpanel or Powerplant range. The Powerpod uses pouch cells, which can charge at 50A per unit. This increases by another 50A each time you add a module.

Our most common inverter for this Powerpod range is a 3.68kW hybrid inverter or a 5.5kW hybrid for larger systems

Powerpod Battery Range: Profile: The Powerpod is designed primarily for smaller domestic homes or homes with moderate energy consumption. Modularity: It is a modular battery system with a base unit capacity of 5kWh. Expandability: Multiple units can be linked in parallel, up to a total capacity of 25kWh. Notably, expansion beyond this limit isn't possible with the Powerpod. For greater capacity requirements, alternatives like the Powerpanel or Powerplant ranges are available. Cell Type: The Powerpod employs pouch cells. Charge Rate: Each unit has a charge rate of 50A, and this rate compounds with the addition of each module. Discharge Rate: A continuous discharge rate of 100A per unit is maintained, and this also compounds with the addition of each module. The discharge capability meets the demands of most low-voltage inverters, ensuring users are not restricted by the battery system's output. Inverter Compatibility: The most common inverters paired with the Powerpod range are the 3.68kW hybrid inverter and the 5.5kW hybrid inverter for larger configurations.

Powerpod Charging Power: 1 unit with 5kWh capacity has 50A charge current, giving it a theoretical charging power of 2.5kW (50A * 50V). 2 units with 10kWh capacity has 100A charge current, giving it a theoretical charging power of 5kW (100A * 50V). 3 units with 15kWh capacity has 150A charge current, giving it a theoretical charging power of 7.5kW (150A * 50V). 4 units with 20kWh capacity has 200A charge current, giving it a theoretical charging power of 10kW (200A * 50V). 5 units with 25kWh capacity has 250A charge current, giving it a theoretical charging power of 12.5kW (250A * 50V). The actual charging power may vary depending on the size and type of inverter used with the battery.

While the maximum capacity for the Powerpod system is 25kWh, it's observed that most configurations do not exceed 15kWh. This is primarily due to the hard limit on expansion for this model. Users anticipating future expansion needs are directed to explore other models in Premium Lithium's lineup.

The Powerpod is a wall mounted battery system, it cannot be free standing. Like all our batteries, they can be installed in any orientation, but look best and the cabling is simplest when they are stack one on top of the other. The brackets are then attached to the wall. The base of the bottom battery can be touching the floor, but it doesn’t have to. The weight of each module is 45kg, so even with these smaller battery products we cannot install them in the loft of our customers houses, where their original solar PV inverter and meter might be, due to the health and safety considerations of lifting such a weight overhead by our engineers. All our batteries are IP55 rated, and preferably should always be installed indoors. This helps keep them in optimal conditions and prevents them from being stolen, but the batteries can be installed outdoors if necessary (no available indoor space) but this must be done via consultation and additional charges may apply.

Powerpod Battery System Installation Guidelines. Mounting and Positioning: Orientation - The Powerpod is a wall-mounted battery system, meaning it is not designed to be free-standing. Although our batteries can be oriented in any manner, stacking them vertically (one above the other) offers the most aesthetic appearance and simplifies cabling, Brackets - Brackets are used to secure the batteries to the wall, Base Positioning - While the base of the bottom battery can rest on the floor, it's not a requirement. Weight and Safety Concerns: Individual Module Weight - Each Powerpod module weighs 45kg, Installation Restrictions - Due to the significant weight of each module, installing them in the loft or attic spaces is not advised, especially if the original solar PV inverter and meter are positioned there. The weight presents a health and safety concern, particularly regarding overhead lifting by our engineers. Protection and Ratings: IP Rating - All our batteries, including the Powerpod, come with an IP55 rating. This means they have protection against dust ingress and water sprays from any direction, Preferred Location - For optimal performance and longevity, indoor installations are recommended. An indoor setup not only ensures the batteries operate in controlled conditions but also safeguards them against theft, Outdoor Installation - In cases where indoor installation isn't feasible due to space constraints, outdoor installations can be considered. However, this should be pursued only after a thorough consultation. Be aware that additional charges might apply for outdoor setups.

The other two batteries, the Powerpanel and the Powerplant, both use prismatic cells, which enough a higher maximum charging current. These are 100A per unit, so at 50V = 5kW per unit, which also doubles each time you add another battery, so for applications where high charge current or high total capacity is required, e.g. in large or energy intensive homes, or commercial and three phase properties, these are the better solutions.

The Powerpanel is also a wall mounted battery system, but it’s capacity per unit is higher at 9.5kWh and as mentioned before has a higher charge current of 100A per unit. You can connect up to 16 Powerpanel units in parallel, forming a unit of 152kWh total maximum with this range. The Powerpanel is an excellent choice for those who want to maximise their capacity of storage but only have wall space available to do so.

The Powerplant is our largest battery, while by module (10kWh) is almost identical in terms of size and weight to the Powerpanel, you can also connect up to 16 units per phase, giving a theoretical limit of 160kWh per phase. These batteries are used extensively in large homes and commercial projects. People who already use a lot of electricity but think that in the future they might use even more and thus will need an ultra expandable solution very often go with the Powerplant. The Powerplant is floor standing, the first unit is attached to a moveable base, and the additional units are added on top. The ‘stacks’ go up to 50kWh, and three stacks plus one can be connected to form a single 160kWh system.

Conventional batteries are master and slave, featuring a single unit containing a Battery Management System (BMS) and then additional slave units which contain battery cells only. Our batteries all contain BMS’s. Having a BMS in every module, rather than just a centralised "master" unit, bolsters the efficiency, reliability, and safety of Premium Lithium batteries. This design choice, combined with the robust protective mechanisms and wide operational range, makes them a prime choice for those seeking advanced battery solutions.

A Battery Management System (BMS) is integral to the health, efficiency, and safety of battery systems. Unlike the common "master and slave" approach where a primary unit manages the overall system and other units merely follow commands, Premium Lithium has integrated a BMS in every individual battery module. Here's an elucidation on the merits of this design and how it augments overall battery performance and longevity: Decentralised Control - Each battery unit's integrated BMS ensures that every module is independently monitored and controlled. This decentralised control means if one BMS fails, the entire system doesn't go offline; only the affected unit does, and since each unit is managed independently, it ensures consistent performance and longevity across all modules. Operational Versatility - The wide operational charging and discharging range of Premium Lithium batteries underpins their flexibility. Discharge temperature range from -20°C to 60°C. Charge temperature range from 0°C to 45°C. Robust Protective Features - An internal BMS, especially when designed for LiFePO4 batteries, offers overcharge Protection, Low Temperature Charge Protection, Overcurrent & Short Circuit Protection, Thermal Monitoring and Cell Balancing. Most indoor installation spaces are apt for Premium Lithium batteries: Heat Emission - The batteries themselves are quite thermally efficient, emitting minimal heat. However, associated inverters, especially when charging from the mains AC, can produce more heat. Heat Dissipation - The design incorporates extensive heat sinks on the inverter system. This allows for the effective dispersion of heat, enabling the safe operation of the system even in ambient temperatures of up to 40-45°C.

---

Batteries we offer: Powerpod 5kwh, Powerpod 10kwh, Powerpanel 9.5kwh, Powerpod 15kwh, Powerplant 20kwh, Powerplant 30kwh, Powerplant 40kwh, Powerplant 50kwh.
---

Time of Use (ToU) Tariffs: As the energy landscape evolves, Time of Use (ToU) tariffs are emerging as a contemporary way of structuring energy bills. Though relatively novel, these tariffs are becoming more commonplace, especially with the surge in Electric Vehicle (EV) use and domestic battery storage. Under ToU tariffs, energy prices fluctuate throughout the day, being higher during peak times and lower off-peak. For homeowners with battery storage, charging batteries during off-peak hours when energy is cheaper and then using stored energy during peak times can lead to significant savings. Given the growing ubiquity of EVs and domestic battery storage, many energy providers are making ToU tariffs available, meaning a vast majority of consumers can now opt for them. While solar PV provides an excellent source for charging batteries, the adaptability of modern battery systems means that even those without solar installations can benefit from ToU tariffs. In fact, a notable fraction of Premium Lithium's clientele opts for battery systems without any solar PV, simply to capitalise on these tariffs.

---

Battery System Charging: While solar PV offers a sustainable source of energy during daylight hours, batteries provide the flexibility to charge overnight, ensuring uninterrupted power supply regardless of weather conditions. When paired with ToU tariffs, homeowners can charge their batteries at cheaper rates overnight, further driving down energy costs. Battery systems allow homeowners to be less reliant on grid energy, especially during peak times, promoting energy independence and reducing grid stress.

---

Hybrid Inverters: A hybrid inverter can manage inputs from both solar panels and battery storage systems. It efficiently converts the DC power from these sources into AC power, which can be used in homes or sent back to the grid. Even if a homeowner has an existing inverter for solar PV, they'll require a hybrid inverter to harness the full potential of a battery storage system. This is because traditional inverters can't manage the charge/discharge dynamics of batteries. Partnering with Sunsynk UK means offering customers an inverter that stands out in terms of high discharge and charge rates, supreme build quality, and an intuitive application for real-time monitoring and control of the integrated system. In essence, as the energy landscape shifts towards more sustainable and efficient solutions, Premium Lithium’s offerings, combined with the advantages of ToU tariffs and advanced inverter technology, pave the way for homeowners to achieve both environmental and economic benefits.

---

Preserving FIT Benefits: Premium Lithium acknowledges the value of the Feed-in Tariff (FIT) for its customers and consistently strives to maintain this benefit while introducing the advantages of battery storage. Premium Lithium systematically follows the official protocol to request permission from the FIT provider before replacing the existing inverter. This is an essential step, as mandated by the FIT agreement between the customer and their provider. In our experience, most FIT solar setups are equipped with inverters nearing the end of their operational lifespan. This has, thankfully, worked in our favour. Historically, we've never faced a rejection when seeking permission to replace these aging inverters. The process, contrary to expectations, is usually swift and hassle-free. In the rare event of a rejection, Premium Lithium still has a viable solution at hand. We can proceed with AC coupling, which ensures that none of the original FIT components — be it the solar panels, inverter, or generation meter — are modified or replaced. In this setup, after the original equipment has functioned as per its usual routine and the solar generation has been recorded by the FIT meter, our battery system and an additional hybrid inverter (functioning as an AC standalone) are integrated on the AC side. This guarantees that the customer continues to receive the full FIT. It's worth noting, however, that while this method preserves the FIT, AC coupling is typically less efficient than DC coupling. Whether through direct integration or alternative methods, Premium Lithium is committed to ensuring its customers benefit from both the FIT and advanced battery storage. Our adaptable solutions are designed to align with the unique needs and constraints of each installation, always with an eye on maximising value for our customers.

---

Premium Lithium Inverter Offerings and G98/G99 Status: Premium Lithium offers a comprehensive range of Sunsynk inverters, optimised for single and three-phase installations.

Single phase inverters: 3.68kW capacity, G98 Notification, recommended pairing with Powerpod 5-15kWh. 5.5kW capacity, G99 Application, recommended pairing with Powerplant 20-30kWh. 7.36kW capacity (2 x 3.68kW), G99 Application, recommended pairing with Powerplant 40-100kWh (subject to G99 outcome). 8.8kW capacity, G99 Application, recommended pairing with Powerplant 40-100kWh (subject to G99 outcome). 11kW capacity (2 x 5.5kW), G99 Application, recommended pairing with Powerplant 40-100kWh (subject to G99 outcome).

Three phase inverters: 8kW capacity, G99 Application. 10kW capacity, G99 Application. 12kW capacity, G99 Application. 16kW capacity (2 x 8), G99 Application. 20kW capacity (2 x 10), G99 Application. 24kW capacity (2 x 12), G99 Application.

---

Understanding Premium Lithium's Compliance with DNO Regulations. At Premium Lithium, we pride ourselves on not only delivering premium products but also ensuring compliance with all regulatory guidelines, specifically those outlined by the National Grid and DNOs. A Distribution Network Operator (DNO) is a company licensed to distribute electricity in the UK. They are responsible for maintaining the infrastructure – the towers, cables, substations, and more – that delivers electricity to your home. DNOs ensure electricity generated from various sources, including solar installations, can safely and efficiently be fed into the grid or used by individual properties. When installing Solar PV and BESS, companies like Premium Lithium must adhere to a specified procedure with the DNO to ensure grid stability and safety. This process differentiates based on the size and capacity of the inverters used in the system: For customers wishing to exceed 3.68kW total inverter capacity on their property, a G99 application is mandatory. Upon securing the installation with a payment, Premium Lithium will request you to sign a letter of authority. This allows us to negotiate with the DNO on your behalf. Although most of our DNO applications for up to 10kW on single-phase systems are successful, in the rare event of a rejection, we offer two routes: Downsize - We can reduce the inverter size and offer the chance to adjust either your solar PV, battery storage, or both, if the reduced capacity might not fulfill your needs. Cancellation - Though never exercised to date, customers do have the option to cancel the order for a complete refund, ensuring they face no losses in the off-chance of a DNO rejection. For installations where the total inverter capacity does not exceed 3.68kW, a simpler process is followed (G98 Notification). Premium Lithium can proceed with the installation and subsequently inform the DNO. Every customer qualifies for this process, ensuring a smooth and hassle-free installation experience.

Commercial Installations: Larger commercial solar installations come with their unique set of challenges and considerations. Given the vast system sizes involved, DNO applications for commercial setups are more tailored and often necessitate extended negotiations. After conducting a site survey, Premium Lithium generally applies for the maximum feasible system size. At this stage, we charge only a deposit. The final balance is then influenced by the DNO’s decisions regarding inverter capacity and any export restrictions. If, after this, a commercial customer decides not to proceed, they might opt for a cancellation and have their deposit refunded, although this outcome is rare.

---

Harnessing Excess Solar PV - Premium Lithium's Multifaceted Solutions: Solar energy is bountiful, and there are occasions when a solar PV system can generate more electricity than a battery can store. Premium Lithium recognises this potential and offers its customers an array of innovative solutions to ensure that no solar energy goes to waste. Integrate Additional Renewable Components: Immersion Heaters - Devices like the MyEnergi Eddi or iBoost serve as a reservoir for any surplus solar PV energy. These heaters absorb the excess energy and utilize it to heat water. Using CT clamps, customers can even adjust the priority order, directing excess solar energy to the immersion heaters either before or after the battery reaches its capacity. EV Chargers with MPPT - Charging electric vehicles (EV) using solar energy is a sustainable and cost-effective solution. Premium Lithium currently offers the MyEnergi Zappi 2, an EV charger designed to harness surplus solar energy. If an EV is connected, and the battery is fully charged and the water is at the desired temperature, the EV will begin charging. Moreover, the charging priority can be easily adjusted based on the user's preferences.

Contributing to the National Grid: Should all local storage and consumption options be maximised, the final destination for your excess solar PV can be the National Grid. Here's how Premium Lithium facilitates this process: SEG Tariff - The Smart Export Guarantee (SEG) is a scheme where energy suppliers pay you for the electricity you export back to the grid. With the requisite MCS and DNO certifications that Premium Lithium provides post-installation, customers can apply for the SEG tariff. While the rate varies among energy suppliers, it typically ranges from 4-6p/kWh. In specific cases, especially for larger arrays or private deals in the commercial sector, this rate can soar to 15p/kWh or even higher. Conclusion - The beauty of solar energy lies not just in its sustainability but also in its versatility. With Premium Lithium by your side, customers can make the most of every ray of sunlight, ensuring that whether it's stored in batteries, heating water, charging vehicles, or benefitting the community by feeding into the National Grid, no solar energy is left unutilised.

---

To book a consultation, you can visit https://premiumlithium.pipedrive.com/scheduler/DpLkGBsQ/telephone-consultation-with-renewables-consultant`

let pricingKnowledgeBase = `
The pre-ordering model has proved to be an effective approach for both Premium Lithium and our customers. Its success is evident from our customer feedback on Trustpilot which you can see here https://uk.trustpilot.com/review/premiumlithium.com. By pooling payments from multiple pre-orders, we are able to place larger orders with our manufacturing partners. This strategy leads to significant savings on purchasing, shipping, and installation planning.

The payment for pre-orders is not insurance-backed. While insurance-backed payments offer certain security, they introduce additional complexities and costs. These costs would inevitably have to be passed onto our customers, which would offset the benefits of our pre-order savings. For additional security, we provide a complimentary credit card payment service. Utilising this service, you can avail full Section 75 payment protection up to £30,000 through your credit card company. It's an effective way to offer our customers peace of mind without the complexities and costs associated with insurance-backed solutions.

Premium Lithium give their customers a choice when it comes to their installation. Most installation companies will charge money upfront (sometimes a deposit, sometimes the whole amount) and install whenever equipment is available, often months behind schedule. Premium Lithium work differently.

Customers can opt for an installation ASAP, this is typically 4 – 10 weeks depending on whether or not a G99 application is necessary and if it is, the wait times in your local area. (DNOs are regional and have their own processes and wait times). In this instance, the customer pays the list price for their installation, but get attractive MCS standard payment terms: 25% deposit, 35% after survey and report completed, and the remaining 40% after the installation is complete.

Premium Lithium, as a manufacturer, is also able to offer what it calls pre-order discounts, which give even more attractive and generous discounts to those customers who are able to pay upfront for the system, and chose to defer their installation.

Currently, we offer two deferment periods, 6 or 12 months. The 6 month deferment period carries a discount of 25%, and the 12 month deferment period carries an extraordinary discount of 50%. Both need to be paid in full to secure the discount.

This works as Premium Lithium works with key manufacturing partners across the world, but especially in China, where we have to pre-purchase all manufacturing costs and supply costs for materials we do not yet produce, such as solar panels and EV chargers. By pre-ordering, the customer allows Premium Lithium more time to acquire more orders and thus place much larger orders to produce, purchase, and ship equipment back to the UK. The longer the deferment period, the larger the order, and thus the lower the price to Premium Lithium. We think it’s only fair that all of this saving should be passed on the customer, and so that’s exactly what we do.

---

Security and Trust in Pre-ordering: Despite our impeccable record and substantial growth, we're cognisant of customers' apprehensions regarding upfront payments. Here's how we ensure peace of mind:

Company Credibility: Our flawless 5-star Trustpilot reviews and an impressive 3000% company growth within a year are testaments to our dedication and integrity.

Financial Protection with Section 75: Recognising the concerns some might have due to negative experiences with other companies, we offer the option of credit card payments. This is not just a payment method but a protective measure. Under Section 75 of the Consumer Credit Act, consumers are protected for credit card purchases valued between £100 and £30,000. This means, in the unlikely event of a breach of contract or misrepresentation, your credit card company is jointly liable with the retailer or trader. So, for those pre-ordering with us, this acts as an additional safeguard, ensuring they are covered for any potential discrepancies up to £30,000.

Conclusion: At Premium Lithium, we believe in passing on the benefits of our efficient business model directly to our customers. With flexible installation schedules, unparalleled discounts, and robust financial protection mechanisms, we're here to make the solar transition smooth, affordable, and worry-free.

---

Powerpod 5kWh Smart Home Battery costs £5,995 (ex. VAT)

Powerpod 10kWh Smart Home Battery costs £9,995 (ex .VAT)

Powerpanel 9.5kWh Smart Home Battery costs £9,995 (ex .VAT)

Powerpod 15kWh Smart Home Battery costs £13,990 (ex .VAT)

Powerplant 20kWh Smart Home Battery costs £17,985 (ex .VAT)

Powerplant 30kWh Smart Home Battery costs £25,975 (ex .VAT)

Powerplant 40kWh Smart Home Battery costs £32,970 (ex .VAT)

Powerplant 50kWh Smart Home Battery costs £39,965 (ex .VAT)

---

The solar panels we offer are 430W Jinko monocrystalline panels. These panels utilise SMBB Technology to provide better light trapping and current collection to improve module power output and reliability. They also have an excellent Anti-PID performance guarantee via optimized mass-production process and materials control. They hare durable and have resistance to high salt mist and ammonia. They are 1.762m wide and 1.134m long, and weigh 22kg.
`
async function uploadDocument(text, tableName) {
    const { error } = await supabase
    .from(tableName)
    .delete()
    .neq("id", 0);
    let sections = text.split('---');
    const textSplitter = new RecursiveCharacterTextSplitter( {
        chunkSize: 500,
        chunkOverlap: 0,
    })

    const docs = await textSplitter.createDocuments(sections);

    const splitDocs = await textSplitter.splitDocuments(docs);

    await SupabaseVectorStore.fromDocuments(
        splitDocs,
        new OpenAIEmbeddings(),
        {
            client: supabase,
            tableName: tableName,
            queryName: `match_documents`,
        },
    );
}

export async function GET({ request }) {
    await uploadDocument(generalKnowledgeBase, "evie_general_knowledge_base");
    await uploadDocument(pricingKnowledgeBase, "evie_pricing_knowledge_base");
    return json("yes");
  }