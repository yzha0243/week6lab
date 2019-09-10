let express = require('express');
let bodyParser = require('body-parser');
let mongodb = require("mongodb");
let morgan = require('morgan');
let app = express();

var db = null;

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//Setup the static assets directories
app.use(morgan('common'));
app.use(express.static('images'));
app.use(express.static('stylesheets'));


app.use(bodyParser.urlencoded({
    extended: false
}))

//Configure MongoDB
const MongoClient = mongodb.MongoClient;
// Connection URL
const url = "mongodb://localhost:27017/";
MongoClient.connect(url, { useNewUrlParser: true },
    function (err, client) {
        if (err) {
            console.log("Err  ", err);
        } else {
            console.log("Connected successfully to server");
            db = client.db("fit2095db");
        }
    });



app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/addtask', function (req, res) {
    
    res.sendFile(__dirname + '/views/addtask.html');
    
});

app.post('/data', function (req, res) {
    let data = req.body;
    db.collection('tasks').insertOne({ Id: data.userid, Name: data.username, Due: data.due, Assigned: data.people, Status: data.status , Desc: data.desc});
    
    res.redirect('/gettask');
});
app.get('/addmany', function (req, res) {
    
    res.sendFile(__dirname + '/views/addtaskmany.html');
    
});

app.post('/manydata', function (req, res) {
    let data = req.body;
    console.log(data.userid);
    let times = data.count;
    while(times>0){
        db.collection('tasks').insertOne({ Id: data.userid+times, Name: data.username, Due: data.due, Assigned: data.people, Status: data.status , Desc: data.desc});    
        times--;
}
    res.redirect('/gettask');
});

app.get('/gettask', function (req, res) {
    db.collection('tasks').find({}).toArray(function (err, data) {
        
        res.render('listtask', { udb: data });
        
    });
    
});
app.get('/deletetask', function (req, res) {
    res.sendFile(__dirname + '/views/deletetask.html');
});
app.post('/deletedata', function (req, res) {
    let taskid = req.body;
    console.log(taskid.deleteedid);
    let filter = { Id: taskid.deleteedid };
    db.collection('tasks').deleteMany(filter);
    res.redirect('/gettask');
});



app.get('/deletealldata', function (req, res) {
    let query = { Status: /^C/ };

    
    db.collection('tasks').deleteMany(query, function (err, obj) {
        res.redirect('/gettask');  
    })
});


app.get('/updatetask',function(req,res){
    res.sendFile(__dirname + '/views/update.html');
});

app.post('/updatedata', function (req, res) {
    let taskDetails = req.body;
    let filter = { Id: taskDetails.updatedid };
    let theUpdate = { $set: {Status : taskDetails.updatedstatus } };
    db.collection('tasks').updateOne(filter, theUpdate);
    res.redirect('/gettask');
});


app.listen(8080);