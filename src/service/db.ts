import mysql from "mysql"

class DB {
  pool: mysql.Pool | undefined
  initDB(pool: mysql.Pool) {
    this.pool = pool
  }
  async query(query: string, values: any) {
    return new Promise((resolve, reject) => {
      this.pool?.query(query, values, (error, results, fields) => {
        if (error) {
          reject(error)
        }
        resolve(results)
      })
    })
  }
}

const db = new DB()

export default db
export const query = db.query.bind(db)
