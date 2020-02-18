/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const dotenv = require("dotenv").config();
const MONGODB_CONNECTION_STRING = process.env.DB;
const mongoose = require("mongoose");
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  mongoose.connect(MONGODB_CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology: true});

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    console.log("Connection to mongoDB Successful!");
  });
  const bookSchema = new mongoose.Schema({
    _id: ObjectId,
    title: String,
    commentcount: Number,
    comments: [String]
  });
  const BOOK = mongoose.model("BOOKS", bookSchema);

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      BOOK.find({}, (err, docs) => {
        if (err) return console.log(err);
        res.json(docs);
      })
    })
    
    .post(function (req, res){
      //response will contain new book object including at least _id and title
      if (!req.body.hasOwnProperty("title")) return res.send("No book to add");
      const toAdd = new BOOK({
        _id: req.body.hasOwnProperty("_id") ? req.body._id : new ObjectId(),
        title: req.body.title,
        commentcount: 0,
        comments: []
      });
      toAdd.save((err, doc) => {
        if (err) return console.log(err);
        res.json(doc);
      })
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      BOOK.deleteMany({}, (err, docs) => {
        if (err) return console.log(err);
        res.send("complete delete successful");
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      BOOK.findOne({_id: bookid}, (err, doc) => {
        if (err) return console.log(err);
        if (doc) {
          res.json(doc);
        } else {
          res.send("no book exists");
        }
      })
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      BOOK.findById({_id: bookid}, (err, doc) => {
        doc.comments.push(comment);
        doc.save((err, doc) => {
          if (err) return console.log(err);
          if (doc) {
            res.json(doc);
          }
        });
      });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      BOOK.findByIdAndDelete({bookid}, (err, doc) => {
        if (err) return console.log(err);
        res.send("delete successful");
      });
    });
      
};
