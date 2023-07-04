import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';


export default async function (request: VercelRequest, response: VercelResponse) {
  const likes = 100;
 
  try {
    const result = await sql`
        select * from information_schema.tables where table_schema = 'public'
    `;
    console.log(result.rows);
    response.send(result.rows);
  } catch (error) {
    return response.status(500).json({ error });
  }

}

