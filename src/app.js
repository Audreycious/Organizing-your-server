require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const winston = require('winston')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')

const app = express()

let bookmarks = [
    {
      "id": "8sdfbvbs65sd",
      "title": "Google",
      "url": "http://google.com",
      "desc": "An indie search engine startup",
      "rating": 4
    },
    {
      "id": "87fn36vd9djd",
      "title": "Fluffiest Cats in the World",
      "url": "http://medium.com/bloggerx/fluffiest-cats-334",
      "desc": "The only list of fluffy cats online",
      "rating": 5
    }
  ];

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

// set up winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'info.log' })
    ]
  });
  
  if (NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
}

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
  
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        logger.error(`Unauthorized request to path: ${req.path}`);
        return res.status(401).json({ error: 'Unauthorized request' })
    }
    // move to the next middleware
    next()
  })

app.get('/bookmarks', (req, res) => {
    res.json(bookmarks);
})

app.get("/bookmarks/:id", (req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(mark => mark.id == id);
    if (!bookmark) {
        logger.error(`Bookmark with id ${id} not found.`);
        return res
            .status(404)
            .send('Bookmark not found');
    }

    res.json(bookmark);
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app