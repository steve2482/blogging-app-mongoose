const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {BlogPosts} = require('./models');

const app = express();
app.use(bodyParser.json());

app.get('/posts', (req, res) => {
  BlogPosts
  .find()
  .limit(10)
  .exec()
  .then(posts => {
    res.json({
      posts: posts.map(
        post => post.apiRepresentation())
    });
  })
  .catch(
    err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

app.get('/posts:id', (req, res) => {
  BlogPosts
  .findById(req.params.id)
  .exec()
  .then(post => res.json(post.apiRepresentation()))
  .catch(
    err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

app.post('/posts', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  requiredFields.forEach(field => {
    if (!(field in req.body && req.body[field])) {
      return res.status(400).json({message: `Must specify a value for ${field}`});
    }
  });
  BlogPosts
  .create({
    title: req.body.title,
    content: req.body.title,
    author: {
      firstName: req.body.author.firstName,
      lastName: req.body.author.lastName
    }
  })
  .then(post => res.json(post.apiRepresentation()))
  .catch(
    err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});
