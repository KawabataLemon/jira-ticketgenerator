const SubTask = require('./SubTask.js')

class Story {

  constructor(title, description, subtaskArray) {
    this.title = title
    this.description = description
    this.subtaskArray = subtaskArray
  }
}

module.exports = Story;
