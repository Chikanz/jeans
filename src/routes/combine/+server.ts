import { KV_REST_API_TOKEN, KV_REST_API_URL, KV_URL, OPENAI_API_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import OpenAI from 'openai';

import { createClient } from '@vercel/kv';

const kv = createClient({
  url: KV_REST_API_URL,
  token: KV_REST_API_TOKEN,
});

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY, // This is the default and can be omitted
});

export const POST: RequestHandler = async ({ request }) => {
    let { item1, item2 } = await request.json();

    //sort item names by alphabetical order
    if (item1.name > item2.name) {
        [item1, item2] = [item2, item1];
    }

    const cacheKey = `${item1.name}+${item2.name}`;
    let res;

    // Check if the result exists in the cache
    const cachedResult = await kv.get(cacheKey);
    console.log(cachedResult);

    if (cachedResult) {
        res = cachedResult;
    } else {
        const chatCompletion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: `You are an animal cross breeder who breeds different animals in strange but funny combinations. Given two animals or things your role is to output a funny name and an emoji to represent them. 
        e.g dog + cat = 
        {
          "name": "catdog",
          "emoji": "🐱🐶"
        }
        e.g cat + duck = 
        {
          "name": "cuck",
          "emoji": "🐣"
        }
        e.g chicken + duck = 
        {
          "name": "dicken",
          "emoji": "🍆"
        }
        e.g cuck + butterfly = 
        {
          "name": "Buttcuck",
          "emoji": "🍑"
        }
        e.g butterfly + chicken = 
        {
          "name": "Butterchicken",
          "emoji": "🍛"
        }

        
        Output your answer in a json format like so:
        {
        name: ...
        emoji: ...
        }` },
                { role: 'user', content: `${item1.name} + ${item2.name}` }
            ],
            model: 'gpt-3.5-turbo',
        });

        try {
            res = JSON.parse(chatCompletion.choices[0].message.content || "{}");
        } catch (e) {
            res = { error: "Failed to parse response" };
        }

        // Push the result to the cache
        await kv.set(cacheKey, JSON.stringify(res));
    }

    console.log(res);

    return json(res);
};