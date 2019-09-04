// 1 - get a reference to Mongodb module
let mongodb = require ('mongodb');
let morgan = require ('morgan');

// 2 - from ref, get the client
let mongoDBClient = mongodb.MongoClient;
let bodyParser=require('body-parser'); //needed as the middleware for the post request

// 3 - from the client get the db
let express = require ('express');
let app = express();

app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(__dirname+"/views"));
app.use(express.static(__dirname+"/img"));

let db={};
let col=null;
let url = "mongodb://localhost:27017";
mongoDBClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client){

    db = client.db("week5lab"); //name for db
    col = db.collection("tasks"); // Name for the collection(table)


});

//GET INDEX PAGE
app.get('/',function(req,res){
    res.sendFile(__dirname + "/views/index.html");
    
    
}); 

//POST INSERT
app.post('/addnewtask', function (req, res) {
    let taskDetails = req.body;
    
    
    db.collection('tasks').insertOne({
        id: ""+Math.floor(100000 + Math.random() * 900000), 
        name:taskDetails.tname, 
        assigned:taskDetails.tassign, 
        due:taskDetails.tdate,  
        status:taskDetails.tstatus,
        description:taskDetails.tdesc
    });
    res.redirect("/gettasks"); 
});

// GET ALL TASKS PAGE
app.get('/gettasks',function(req,res){
    db.collection('tasks').find({}).sort({name:1, status:-1}).toArray(function (err, data) {
        res.render(__dirname + "/views/gettasks.html", { tasksDb: data });
    });
    
}); 

// GET DELETE TASK
app.get('/deletetask', function (req, res) {
    res.sendFile(__dirname + '/views/deletetask.html');
});

// POST DELETE TASK
app.post('/deletetaskdata', function (req, res) {
    let taskDetails = req.body;
    let filter = { id: taskDetails.tid };
    //console.log(filter);
    db.collection('tasks').deleteOne(filter);
    res.redirect('/gettasks');// redirect the client to list users page
});

// GET DELETE COMPLETED TASK
app.get('/deletecomplete', function (req, res) {
    res.sendFile(__dirname + '/views/deletecomplete.html');
});

// POST DELETE COMPLETED TASK
app.post('/deletecompletedata', function (req, res) {
    let taskDetails = req.body;
    let filter = { status: "C" };
    db.collection('tasks').deleteMany(filter);
    res.redirect('/gettasks');// redirect the client to list users page
});

// GET DELETE OLD COMPLETED TASK
app.get('/deleteOldComplete', function (req, res) {
    res.sendFile(__dirname + '/views/deleteoldcomplete.html');
});

// POST DELETE OLD COMPLETED TASK
app.post('/deleteoldcompletedata', function (req, res) {
    console.log(Date());
    
    let taskDetails = req.body;
    // let filter = { $and [{due: { $lte: Date}]};
    db.collection('tasks').deleteMany( { $and: [ { due: { $lte: Date() } }, {status: "C"} ] } );
    res.redirect('/gettasks');// redirect the client to list users page
    // status: "C" ,
});

// GET UPDATE TASK
app.get('/updatetask', function (req, res) {
    res.sendFile(__dirname + '/views/updatetask.html');
});

// POST UPDATE DATA
app.post('/updatetaskdata', function (req, res) {
    let taskDetails = req.body;
    let filter = { id: taskDetails.tid };
    let theUpdate = { $set: { status:taskDetails.tstatus} };
    db.collection('tasks').updateOne(filter, theUpdate);
    res.redirect('/gettasks');// redirect the client to list users page
});



app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.listen(8000);