const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const config = require('./config');

const app = express();

// Connect to MongoDB
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true });

// Create a Todo schema
const todoSchema = new mongoose.Schema({
  task: String,
  completed: Boolean,
});

// Create a Todo model
const Todo = mongoose.model('Todo', todoSchema);

app.engine('.hbs', exphbs.engine({ extname: '.hbs'}));
app.set('view engine', '.hbs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

// Routes
app.get('/', async (req, res) => {
  const todos = await Todo.find().sort('id');
  res.render('index', { todos, layout:false });
});

app.post('/add', async (req, res) => {
  const task = req.body.task;

  if (task) {
    const newTodo = new Todo({
      task,
      completed: false,
    });

    await newTodo.save();
  }

  res.redirect('/');
});

app.post('/complete/:id', async (req, res) => {
  const id = req.params.id;

  if (id) {
    const todo = await Todo.findById(id);
    todo.completed = true;
    await todo.save();
  }

  res.redirect('/');
});

app.get('/edit/:id', async (req, res) => {
  const id = req.params.id;

  if (id) {
    const todo = await Todo.findById(id);
    res.render('edit', { todo, layout:false });
  } else {
    res.redirect('/');
  }
});

app.post('/update/:id', async (req, res) => {
  const id = req.params.id;
  const task = req.body.task;

  if (id && task) {
    const todo = await Todo.findById(id);
    todo.task = task;
    await todo.save();
  }

  res.redirect('/');
});

app.post('/delete/:id', async (req, res) => {
  const id = req.params.id;

  if (id) {
    await Todo.findByIdAndDelete(id);
  }

  res.redirect('/');
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});