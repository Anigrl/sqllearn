const express = require('express')
const app = express()
const mysql = require('mysql')
const path = require('path')
const multer = require('multer')

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: false }))

app.get('/', function (req, res) {
    res.render('home')
})

// console.log(path.join(__dirname + '/public/static'))

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "seconddb"
})

connection.connect()

let filename = ''

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, path.join(__dirname, 'public'));
    },
    filename: function (req, file, cb) {
        filename = file.originalname
        return cb(null, file.originalname)
    },
})

const maxsize = 1 * 1000 * 1000

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        let filetypes = /jpeg|jpg|png/;
        let mimetype = filetypes.test(file.mimetype);

        let extname = filetypes.test(
            path.extname(file.originalname).toLowerCase()
        );
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(
            "Error: file upload only supports the" +
            "following filetypes -" +
            filetypes
        )
    }

}).single('file');


app.get('/getdata', (req, res) => {


    connection.query(`select * from students`, (err, result) => {
        res.render('data', { data: result })
        console.log('connect : ' + JSON.stringify(result))
    })
})

app.post('/uploadProfilePicture', (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {

            //error occured (here it can be occured due)
            //to uploading image of size greater than 
            res.send(err);

        } else {
            //success image successfully uplaoded
            let name = req.body.name
            let cla = req.body.class

            connection.query(`insert into students(name,class,image) values('${name}','${cla}','${filename}')`, (err, result) => {
                if (!err) {
                    res.redirect('/getdata')
                } else {
                    res.send("could not insert " + err)
                }
            })
        }
    })
})


app.get('/add', (req, res) => {
    if (req.query.submit) {

        let name = req.query.name
        let cla = req.query.class
        console.log(name, cla)

        connection.query(`insert into students(name , class) values('${name}' , '${cla}')`, (err, result) => {
            if (!err) {
                console.log("inserted success")
                res.redirect('/getdata')
            } else {
                console.log("error : ", err)
                res.status(500).send("an error occureed while inserting data")
            }
        })
    } else {
        res.render('add', { msg: 'helo edit page' })

    }
})
 
// Route handler for fetching student record by ID and rendering edit form
app.get('/update', (req, res) => {
    if (req.query.uid) {
        let uid = req.query.uid;
        connection.query(`SELECT * FROM students WHERE id = ?`, [uid], (err, result) => {
            if (!err) {
                res.render('edit', { data: result });
                // console.log(result)
            } else {
                res.send("Could not fetch record: " + err);
            }
        });
    } else {
        res.send("No UID provided");
    }
});

// Route handler for updating student record
app.post('/update', (req, res) => {
    let id = req.query.uid;
    let name = req.body.name;
    let cla = req.body.class;
    connection.query(`UPDATE students SET name ='${name}', class ='${cla}' WHERE id='${id}'`, (err, result) => {
        if (!err) {
            // console.log(id)
            res.redirect('/getdata');
        } else {
            res.send("Could not update record: " + err);
        }
    });
});

   

app.get('/delete', (req, res) => {
    let id = req.query.id
    connection.query(`delete from students where id=${id}`, (err, result) => {
        if (!err) {

            console.log('student record deleted success')
            res.redirect('/getdata')

        } else {
            console.log(err)
            res.status(500).send('an error occurred while deleting data')
        }
    })

})

app.get('/login',(req,res)=>{
        if(req.query.submit){
            let user = req.query.user
            let pass = req.query.password
            connection.query(`select * from userinfo`,(err,result)=>{
                if(!err){
                    // console.log(result[0])
                   let filtered =  result.find(item => item.name ===user && item.password === pass)
                   console.log(filtered)
                   if(filtered){
                    
                    res.redirect('/getdata')

                   }else{
                    res.render('login',{msg:"user not found",status :true})
                    
                   }

                }else{
                    res.status(500).send('error occured in fetching data :' ,err)
                }
            })

        }else{
            res.render('login',{msg:"nothing entered",status :false})
        }
})

app.get('/register',(req,res)=>{
    
    if(req.query.submit){
        let user = req.query.user
        let pass = req.query.password
        let email = req.query.email
        connection.query(`select * from userinfo`,(err,result)=>{
            if(!err){
                let find = result.find(item => item.email === email)
                if(!find){
                    connection.query(`insert into userinfo(name , password , email ) values('${user}' , '${pass}','${email}')`,(err ,result)=>{
                        if(!err){
                            console.log("register successfully")
                            res.redirect('/login')
            
                        }else{
                            res.status(500).send("error occurered during insertin : " ,err)
                        }
                    })
                    
                }else{
                    res.status(500).send({msg:"this email is in used, please add another"})

                }

            }else{
                res.status(500).send({msg:"some error occured in finding users"})
            }
        })     
        
    }else{
        res.render('register',{msg:"hih"})

    }
})

const uinfo = [
    { "id": 101, "uname": "vinay", "pass": 1234 },
    { "id": 102, "uname": "rohan", "pass": 1234 },
    { "id": 103, "uname": "gaurav", "pass": 1234 },
    { "id": 104, "uname": "nikhil", "pass": 1234 }
]


app.get('/about', function (req, res) {
    var name = "Dream Tech PVT LTD"
    console.log("name is = " + name)
    var ar = ["PHP", "java", "pythnon", "angular", "react", "node"]
    res.render('at', { name: name, email: "dream@gamil.com", phone: "9349394349", array: ar })
})


app.get('/contact', function (req, res) {
    res.render('ct')
})


app.get('/course', function (req, res) {
    res.render('cr')
})

app.get('/opr', function (req, res) {
    if (req.query.submit) {
        let a = parseInt(req.query.num1)
        let b = parseInt(req.query.num2)
        let c = a + b
        let d = a - b
        let e = a * b
        let f = a / b
        res.render('opr', { fn: a, sn: b, ad: c, su: d, mu: e, div: f })
    } else {

        res.render('opr', { fn: "", sn: "", ad: "", su: "", mu: "", div: "" })
    }
})

app.get('/student', (req, res) => {
    if (req.query.submit) {
        let math = parseInt(req.query.math)
        let phy = parseInt(req.query.phy)
        let eng = parseInt(req.query.eng)
        let chem = parseInt(req.query.chem)
        let hin = parseInt(req.query.hin)
        let total = math + phy + eng + chem + hin
        let percent = (total / 500) * 100


        res.render('student', { math, phy, eng, chem, hin, total, percent })
    } else {
        res.render('student', { math: "", eng: "", phy: "", hin: "", chem: "", total: "", percent: "" })

    }
})
 

app.get('/data', function (req, res) {
    var dt = [
        { "id": 101, "name": "A", "course": "mCA" },
        { "id": 102, "name": "B", "course": "mCA" },
        { "id": 103, "name": "C", "course": "mCA" },
        { "id": 104, "name": "D", "course": "mCA" },
        { "id": 105, "name": "E", "course": "mCA" }

    ]
    res.render('data', { data: dt })
})
    .listen(5000)


 