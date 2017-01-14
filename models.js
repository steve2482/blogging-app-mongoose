const mongoose = require('mongoose');

// schema to represent a blog post
const blogPostSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true}
  }
});

// creating virtuals
blogPostSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostSchema.methods.apiRepresentation = function() {
  return {
    id: this.id,
    title: this.title,
    content: this.content,
    author: this.authorName
  };
};

const Post = mongoose.model('Post', blogPostSchema);

module.exports = {Post};
