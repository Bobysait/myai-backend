import Router from "express";
import fs from "fs";
import { requestDavinci } from "../lib/openai.js";
import sqlite3 from "sqlite3";
import { execute, insertInto, request } from "../lib/sqlite.js";
import http from "http"; // or 'https' for https:// URLs
import https from "https";

// const dbImages = new sqlite3.Database('./generated/images.db')

const images_dir = "./public/generated/images";

const router = Router();

/*
router.get("/", (req, res) => {
    console.log("GET DALL-E request received")
    const db = new sqlite3.Database('./generated/images.db')
    execute(db, "SELECT * FROM images")
    db.close()
    requestDavinci("Write a haiku about recursion in programming.", res.status(200).json({message:"get dall-e done!"}))    
})
*/

router.put("/", (req, res) => {
    console.log("PUT DALL-E request received");
    res.status(100).json({ message: "put dall-e done!" });
});
router.delete("/", (req, res) => {
    console.log("DELETE DALL-E request received");
    res.status(400).json({ message: "delete dall-e done!" });
});

router.post("/onceOnly", (req, res) => {
    console.log("POST DALL-E request ONCEONLY");
    const key = [
        // "Create an image of a cosy, diminutive living room with a low ceiling. There are no windows and the back walls are adorned with wooden planks. To the left, there's a comfortable sofa, and to the right, a display screen is mounted. The room is beautifully lit with colour LED lights. The centrepiece is a pool table in the middle, sitting on a plush carpet. On the foreground to the left, hosts a large computer desk. The room has tiled flooring, and the walls and ceiling are coloured white."",
        "photo, taken from the door, small deep cosy Living room, small height, NO WINDOWS",
        "back right contains a screen, back left a sofa, back walls are wooden, illuminated with color leds",
        "middle is pooltable, carpet under the pooltable",
        "foreground left large computer desktop",
        "tiles on the floor, white ceiling, white walls",
    ].join(",");

    const regImgs = [
        "1732168695876",
        "1732168831822",
        "1732169010839",
        "1732169216932",
        "1732169292550",
        "1732169578965",
        "1732170577231",
        "1732170667091",
        "1732170681684",
        "1732170717726",
        "1732170740360",
        "1732170792531",
        "1732171192129",
        "1732181252274",
        "1732197805218",
        "1732197831269",
        "1732197999202",
        "1732198162042",
        "1732199351648",
        "1732264735113",
        "1732265067568",
        "1732281689639",
    ];
    // write image to database
    regImgs.forEach((id) => {
        const db = new sqlite3.Database("./generated/images/database.db");
        try {
            insertInto(
                db,
                "images",
                ["name", "path", "request", "generator", "generator_version"],
                [id + ".jpg", id + ".jpg", key, "dall-e", "3"]
            );
        } catch (err) {
            console.log(err);
        } finally {
            db.close();
        }
    });
});

const download = async (url, dest, cb) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on("finish", () => {
                console.log("file finished");
                return file.close(resolve);
            });
        });
    });
};

const cacheImages = async (prompt, completion) => {
    // output directory
    if (!fs.existsSync(images_dir))
        fs.mkdirSync(images_dir, { recursive: true });

    // if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    // const db = new sqlite3.Database('./generated/images.db')
    // db.exec("SELECT image FROM images WHERE request = ?", [key], (err, rows) => {
    //     console.log("image:", rows)
    // })
    console.log("images:", completion);
    const results = [];
    if (completion) {
        for (const imgValue of Object.values(completion)) {
            console.log("write image to database", imgValue.url);
            // output filename
            const fileName = [Date.now(), "jpg"].join(".");
            console.log("fileName: ", fileName);
            const key =
                typeof prompt !== "string" ? JSON.stringify(prompt) : prompt;
            const dir = [images_dir, fileName].join("/");
            console.log("dir: ", dir);
            // download image
            await download(imgValue.url, dir)
                .then(async () => {
                    const localUrl = "http://localhost:3456/images/" + fileName;
                    results.push({
                        type: "image",
                        url: localUrl,
                        origin_url: imgValue.url,
                        request: key,
                        generator: "dall-e",
                        generator_version: "3",
                    });
                    // write image to database
                    const db = new sqlite3.Database(
                        "./generated/images/database.db"
                    );
                    try {
                        insertInto(
                            db,
                            "images",
                            [
                                "name",
                                "path",
                                "request",
                                "generator",
                                "generator_version",
                            ],
                            [fileName, imgValue.url, key, "dall-e", "3"]
                        );
                    } catch (err) {
                        console.log(err);
                    } finally {
                        db.close();
                    }
                    console.log("image downloaded and cached", localUrl);
                    console.log(
                        "%cimage downloaded and cached",
                        "color:orange",
                        localUrl
                    );
                })
                .catch((err) => console.log(err));
        }
    }
    // db.close()
    return results;
};

router.get("/", async (req, res) => {
    /* {
        type: "image",
        url: localUrl,
        origin_url: imgValue.url,
        request: key,
        generator: "dall-e",
        generator_version: "3"
    } */
    const db = new sqlite3.Database("./generated/images/database.db");
    try {
        const rows = await request(db, "SELECT * FROM images");
        res.status(200).json({
            type: "image",
            images: rows.map((row) => {
                console.log("row:", row);
                return {
                    ...row,
                    url: "http://localhost:3456/images/" + row.name,
                };
            }),
            message: "get generated images",
        });
    } catch (err) {
        console.log(err);
        res.status(401).json({
            type: "image",
            message: "get generated images failed",
            error: err,
        });
    } finally {
        db.close();
    }
});

router.post("/", (req, res) => {
    if (!req.body || !req.body.request) {
        return res.status(400).json({
            message: "post dall-e failed!",
            error: "request is required",
        });
    }
    console.log("POST DALL-E request received", req.body.request);
    requestDavinci(
        req.body.request,
        async (choices) => {
            const results = await cacheImages(req.body.request, choices);
            res.status(300).json({
                message: "post dall-e done!",
                type: "image",
                images: results,
            });
        },
        (err) =>
            res.status(400).json({ message: "post dall-e failed!", error: err })
    );
});

export default router;
