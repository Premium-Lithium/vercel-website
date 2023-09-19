import { json } from "@sveltejs/kit";
import { Client } from "langsmith";

const client = new Client();

export async function POST({request}) {
    try {
        const body = await request.json();
        const runId = body.run_id;
        const score = body.score;
        if (!runId) {
          return json(
            { error: "You must provide a run id." },
            { status: 400 },
          );
        }
        if (isNaN(score)){
          return json(
            {error: "You must provide a valid score"},
            {status: 400},
            );
        }
        const feedback = await client.createFeedback(runId, "user_score", {
          score,
        });
        return json({ feedback }, { status: 200 });
    } catch (e: any) {
      return json({ error: e.message }, { status: 500 });
    }
}


export async function PUT({ request }) {
    try {
        const body = await request.json();
        const feedbackId = body.id;
        const score = body.score;
        if (!feedbackId) {
          return json(
            { error: "You must provide a feedback id" },
            { status: 400 },
          );
        }
        let correction;
        let comment;
        if (score === 1) {
          comment = body.comment;
        } else {
          correction = { desired: body.comment };
        }
        const feedback = await client.updateFeedback(feedbackId, {
          score,
          comment,
          correction,
        });
        return json({ feedback }, { status: 200 });
    } catch (e: any) {
      return json({ error: e.message }, { status: 500 });
    }
}   