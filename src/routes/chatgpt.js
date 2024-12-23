import Router from "express"

import { requestChatGpt } from "../lib/openai.js"
const router = Router()

router.get("/", (req, res) => {
    console.log("GET CHATGPT request received")
    requestChatGpt("Write a haiku about recursion in programming.", res.status(200).json({message:"get CHATGPT done!"}))    
})

router.put("/", (req, res) => {
    console.log("PUT CHATGPT request received")
    res.status(100).json({message:"put chatgpt done!"})
})
router.delete("/", (req, res) => {
    console.log("DELETE CHATGPT request received")
    res.status(400).json({message:"delete chatgpt done!"})
})
router.post("/", (req, res) => {
    if (! req.body || !req.body.request) {
        return res.status(400).json({message:"post chatgpt failed!", error: "request is required"})
    }
    console.log("POST CHATGPT request received", req.body.request)
    requestChatGpt(req.body.request,
        (choices) => res.status(300).json({message:"post chatgpt done!", type: "text", choices}),
        (err) => res.status(400).json({message:"post chatgpt failed!", error: err})
    )
})

export default router