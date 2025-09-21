# MongoDB

## Manip

### 1. Connect
```
import mongoose from 'mongoose';

mongoose.connect("<connection string>")
```
### 2. Schéma/model
```
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const blogSchema = new Schema({
  title: String,
  slug: String,
  published: Boolean,
  author: String,
  content: String,
  tags: [String],
  comments: [{
    user: String,
    content: String,
    votes: Number
  }]
}, {
  timestamps: true
});

const Blog = model('Blog', blogSchema);
export default Blog;
```
### 3. CRUD operations → create
```
import Blog from './model/Blog.js';

// Creates a new blog post and inserts it into database
const article = await Blog.create({
  title: 'Awesome Post!',
  slug: 'awesome-post',
  published: true,
  content: 'This is the best post ever',
  tags: ['featured', 'announcement'],
});

console.log('Created article:', article);
```
### 4. Update data → save
```
// Updates the title of the article
article.title = "The Most Awesomest Post!!";
await article.save();
console.log('Updated Article:', article);
```
### 5. find data → findById
```
// Finds the article by its ID. Replace <object id> with the objectId of the article.
const articleFound = await Blog.findById("<object id>").exec();
console.log('Found Article by ID:', articleFound);
```
__Output :__
```
Projected Article: {
   _id: new ObjectId('...'),
   title: 'The Most Awesomest Post!!',
   slug: 'awesome-post',
   content: 'This is the best post ever'
}
```
### 6. Delete data → deleteOne || → deleteMany
```
// Deletes one article with the slug "awesome-post".
const blogOne = await Blog.deleteOne({ slug: "awesome-post" });
console.log('Deleted One Blog:', blogOne);
```
```
// Deletes all articles with the slug "awesome-post".
const blogMany = await Blog.deleteMany({ slug: "awesome-post" });
console.log('Deleted Many Blogs:', blogMany);
```