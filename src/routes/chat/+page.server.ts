import { completion } from "$lib/chat/chat.js";

export const actions = {
    default: async ({ cookies, request }) => {
        const data = await request.formData();
        completion(data).then(x => console.log(x));
    }
}

