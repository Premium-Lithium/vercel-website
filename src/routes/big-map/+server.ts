interface Response {
    ok: boolean,
    message: string,
    statusCode: number,
    body?: any  
}

interface Request {
    option: number,
    address: string,
    latLong: Array<number>,

}

/**
 * Parses body, sends to request handler, returns response from request handler
 * @param request Request object
 * @returns Response from 
 */
export async function POST({ request }) {
    const req: Request = await request.json()
    const res: Response = await requestHandler(req)

    return new Response(JSON.stringify(res))
}

/**
 * Reads the request option and directs it to the correct function with relevant data, returns message from that function
 * @param req Body of the post request
 * @returns Response message
 */
async function requestHandler(req: Request): Promise<Response> {
    switch (req.option) {
        case 0:
            return ({ok: true, message: '', statusCode: 200})
        default:
            return ({ok: true, message: 'Default', statusCode: 201})
    }
}