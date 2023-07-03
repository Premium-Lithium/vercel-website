import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';


export default async function (request: VercelRequest, response: VercelResponse) {
  const likes = 100;
 
  try {
    const result = await sql`create table jobs (
        id int,
        customer_name varchar(64),
        postcode varchar(16),
        latitude real,
        longitude real,
        number_of_quotes_requested int,
    )`;
    console.log(result.rows);
  } catch (error) {
    return response.status(500).json({ error });
  }

  response.send(`Hello world!`);
}

