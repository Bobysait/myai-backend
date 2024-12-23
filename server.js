import app from "./src/app.js"

const server_port = 3456

app.listen(server_port, () => {
    console.log("Server is running on port 3456")
})