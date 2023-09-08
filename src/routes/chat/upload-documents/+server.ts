import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {json} from '@sveltejs/kit';

async function uploadDocument(text) {
    const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

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
            tableName: "documents",
            queryName: "match_documents",
        },
    );
}

   
const allowedFileTypes = ['txt'];

export async function POST({request}) {
    if(!request.body)
        return json({ message: "No request body found" }, { status: 400 });
    let form: FormData;
    try{
        form = await request.formData()
    } catch (error) {
        return json({message: error}, {status: 400})
    }
    let content = form.entries().next().value;
    console.log(content);
    return json({message: "test"}, {status: 200});
    
}
