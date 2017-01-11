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
