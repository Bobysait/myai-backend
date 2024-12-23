export const execute = async (db, sql, params = []) => {
    if (params && params.length > 0) {
        return new Promise((resolve, reject) => {
            db.run(sql, params, (err) => {
                if (err) reject(err)
                resolve()
            })
        })
    }
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) reject(err)
            resolve()
        })
    })
}

export const request = async (db, sql, params = []) => {
    return new Promise((resolve, reject) => {
        console.log("request", sql, params)
        db.all(sql, params, (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const insertInto = async (db, table, rows, values = []) => {
    const sql = "INSERT INTO '" + table + "' (" + rows.join(",") + ") VALUES (" + rows.map(() => "?").join(",") + ")"
    return new Promise((resolve, reject) => {
        db.run(sql, values, (err) => {
            if (err) reject(err)
            resolve()
        })
    })
}
