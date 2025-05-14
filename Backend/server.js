
const db_url = `mysql://root:pDEbQwPBxPtjiFLpuEVTeRrjVmWMjkwM@mysql.railway.internal:3306/railway`

const express = require(`express`)
const mysql = require(`mysql2`)
const cors = require(`cors`)

const app = express()
app.use(express.json())
//app.use(cors())

const db = mysql.createConnection(db_url)

// const db = mysql.createConnection({
//     host: process.env.DB_HOST,//'localhost',
//     user: process.env.USER,//'root',
//     password:process.env.DB_PASSWORD, // ""
//     database: process.env.DB_DATABASE//'test'
// })

app.post('/login', (req, res) => {
    const sql = "SELECT * FROM login WHERE username = 'jose' AND password = '123456789'";
   
    db.query(sql, ['jose', '123456789'], (err, data) => {
        if(err)  return res.json(err)
        console.log("START3")
        console.log(err)
        console.log("END3")
        console.log("START4")
        console.log(data)
        console.log(data.length)
        console.log(res)
        console.log(res.json)
        console.log("END4")
        if(data.length > 0){
            console.log(data)
            return res.json("Login successful!")
        }
        else{
            return res.json("Login failed. Please check your credentials.")
        }    
        
    })
})

app.get('/', (re, res) => {
    return res.json("From Backend Side")
})

app.get('/users', (req, res) => {
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, data) =>{
        if(err) return res.json(err);
            return res.json(data);
    })
})

app.listen(8081, () => {
    console.log("listening");
})