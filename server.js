const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {BlogPosts} = require('./models');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

app.get('/posts', (req, res) => {
  BlogPosts
  .find()
  .limit(10)
  .exec()
  .then(posts => {
    res.json(posts.map(post => post.apiRepresentation()));
  })
  .catch(
    err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

app.get('/posts/:id', (req, res) => {
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

app.put('/posts/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (`Request path id (${req.params.id}) and request body id (${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({message: message});
  }

  const toUpdate = {};
  const updateableFields = ['title', 'content', 'author'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field]; // need this explained on how it's working
    }
  });

  BlogPosts
  .findByIdAndUpdate(req.params.id, {$set: toUpdate})
  .exec()
  .then(post => res.status(201).json(post))
  .catch(
    err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

app.delete('/posts/:id', (req, res) => {
  if (!(req.params.id)) {
    const message = ('DELETE request requires an id parameter');
    console.error(message);
    res.status(400).json({message: message});
  }

  BlogPosts
  .remove({_id: req.params.id})
  .exec()
  .then(() => res.status(204))
  .catch(
    err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

let server;

function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect()
  .then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};
