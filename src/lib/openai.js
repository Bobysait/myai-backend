import OpenAI from "openai";

// import { Configuration, OpenAIApi } from "openai"

const config = {
    apiKey: process.env.API_DALLE_KEY,
};

const openai = { _id: null };

const getOpenAI = () => {
    if (!openai._id) {
        openai._id = new OpenAI(config);
    }
    return openai._id;
};

export const requestText = async (req) => {
    const completion = await getOpenAI().chat.create(req);
    console.log(completion.choices[0].message);
};
export const requestImage = async (req) => {
    const completion = await getOpenAI().createCompletion(req);
    console.log(completion.choices[0].message);
};

export const requestChatGpt = async (req, onSuccess, onError) => {
    const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: req }],
    });
    onSuccess?.(completion.choices);
};

export const requestDavinci = async (req, onSuccess, onError) => {
    const completion = await getOpenAI().images.generate({
        model: "dall-e-3",
        prompt: req,
        n: 1,
        size: "1024x1024",
    });
    onSuccess?.(completion.data);
};

/*
var fs = require('fs');
var dir = './tmp/but/then/nested';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}
*/
