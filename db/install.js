import sqlite3 from "sqlite3"

export const execute = async (db, sql) => {
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
        if (err) reject(err)
            resolve()
        })
    })
}


const onDBError = err => {
    console.error (err)
}
const onTableCreated = name => {
    console.error ("table %s created", name)
}

const reqCreateTable = (name,content) => `DROP TABLE IF EXISTS ${name};CREATE TABLE ${name} (${content});`

const REQ_TABLE_IMAGES = (name) => reqCreateTable(
    name,
    `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(256) NOT NULL,
    path VARCHAR(256) NOT NULL,
    request VARCHAR(2048) NOT NULL,
    generator VARCHAR(128) NOT NULL,
    generator_version VARCHAR(16) NOT NULL
`)


const main = async () => {

    const dbImages = new sqlite3.Database("./generated/images/database.db")

    const request = REQ_TABLE_IMAGES("images")

    await execute(dbImages, request)
    .then(()=>onTableCreated("images"))
    .catch(onDBError)
    .finally(() => dbImages.close() )

}


main()