import Router from "express"

import dalle from "./routes/dalle.js"
import chatgpt from "./routes/chatgpt.js"

const router = Router()

// Dall-E routes
router.use("/dall-e", dalle)
router.use("/chatgpt", chatgpt)

// Default routes
router.get("/", (req, res) => {
    console.log("GET request received")
    res.status(200).json({message:"get done!"})
})
router.put("/", (req, res) => {
    console.log("PUT request received")
    res.status(100).json({message:"put done!"})
})
router.delete("/", (req, res) => {
    console.log("DELETE request received")
    res.status(400).json({message:"delete done!"})
})
router.post("/", (req, res) => {
    console.log("POST request received")
    res.status(300).json({message:"post done!"})
})

export default router