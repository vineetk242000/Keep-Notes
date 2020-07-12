const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notesSchema = new mongoose.Schema({
      title:{
        type:String,
        required:true
       },
       content:{
           type:String,
           required:true
        },
        date: {
            type: Date,
            default: Date.now
        },
        user: {
            type: String,
             ref: 'User',
             required: true
            }
});
  
const Note = mongoose.model('Note', notesSchema);
  
module.exports = Note;