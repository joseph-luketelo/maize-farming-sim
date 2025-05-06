const express = require(`express`)
const mysql = require(`mysql`)
const cors = require(`cors`)

const app = express()
app.use(express.json())
app.use(cors())

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'',
    database:'test'
})

app.post('/login', (req, res) => {
    const sql = "SELECT * FROM login WHERE username = ? AND password = ?";
   
    db.query(sql, [req.body.username, req.body.password], (err, data) => {
        if(err)  return res.json(err)
            
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