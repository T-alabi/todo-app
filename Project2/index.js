//this allows the server to start and restart the server per change
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");

//models
const TodoTask = require("./models/TodoTask");

dotenv.config();

app.use("/static", express.static("public"));

app.use(express.urlencoded({ extended: true })); 

//connection to db
mongoose.connect(process.env.DB_CONNECT, {
    useNewUrlParser: true, 
    useUnifiedTopology: true // added option to avoid deprecation warning
  }).then(() => {
    console.log("Connected to db!"); 
    app.listen(3000, () => console.log("Server Up and running"));
  }).catch((error) => { 
    console.error("Error connecting to database:", error);
  });

//embedd javascript so we can use them as a template
app.set("view engine", "ejs")

//get method to print hello world in local host browser
/*app.get('/', (req, res) => {
    res.render('todo.ejs');
    });

//post method -- extracts datafrom the form by adding to body of the request

app.post('/', (req, res) => {
    console.log(req.body);
}); 
*/

// GET METHOD
app.get('/', async (req, res) => {
  const searchQuery = req.query.searchQuery;
  const searchRegex = new RegExp(searchQuery, 'i'); // Create regex for case-insensitive search

  try {
      const todoTasks = await TodoTask.find({ content: searchRegex }).sort({ date: 'desc' });
      res.render('todo.ejs', { todoTasks });
  } catch (err) {
      console.error(err);
      res.redirect('/');
  }
});
  

//POST METHOD
app.post('/',async (req, res) => {
    const todoTask = new TodoTask({
    content: req.body.content
    });
    try {
    await todoTask.save();
    res.redirect("/");
    } catch (err) {
    res.redirect("/");
    }
    });

//UPDATE
app.route("/edit/:id")
  .get((req, res) => {
    const id = req.params.id;
    TodoTask.find({})
      .exec()
      .then(tasks => {
        res.render("todoEdit.ejs", { todoTasks: tasks, idTask: id });
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Internal Server Error");
      });
  })
  .post((req, res) => {
    const id = req.params.id;
    TodoTask.findByIdAndUpdate(id, { content: req.body.content })
      .exec()
      .then(() => {
        res.redirect("/");
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Internal Server Error");
      });
  });

  //DELETE
  app.route("/remove/:id").get(async (req, res) => {
    const id = req.params.id;
    try {
      await TodoTask.findByIdAndRemove(id);
      res.redirect("/");
    } catch (err) {
      res.status(500).send(err);
    }
  });