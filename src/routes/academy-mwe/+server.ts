import { json } from '@sveltejs/kit';
import pipedrive from 'pipedrive';
import { pd } from '$lib/pipedrive-utils.js'


export async function POST({ request }) {
    const { deal } = await request.json();
    console.log("deal :", deal);

    const personsApi = new pipedrive.PersonsApi(pd);

    // add a new person
    let personData = {
        name: "TEST Lewis Bowes (academy testing)"
    };

    console.log("Adding new person");
    const newPerson = await personsApi.addPerson(personData);
    console.log("newPerson: ", newPerson);

    // const dealsApi = new pipedrive.DealsApi(pd);

    // const data = {
    //     title: "test company name",
    //     user_id: 15215441, // Lewis
    //     person_id: personId,
    //     stage_id: 159,
    //     visible_to: 3,
    //     add_time: new Date().toLocaleString(),
    // }

    // const newDeal = await dealsApi.addDeal();

    const response = new Response(
        JSON.stringify({ message: "the return message" }),
        { status: 500 }
    );

    return response;
}