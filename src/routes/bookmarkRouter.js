const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { bookmarks } = require("../store")
const bookmarkRouter = express.Router()
const bodyParser = express.json()

bookmarkRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks)
    })
    .post(bodyParser, (req, res) => {
        const { title, url, desc, rating } = req.body;
        if (!title) {
            logger.error(`Title is required`);
            return res
                .status(400)
                .send(`Invalid data`)
        }
        if (!url) {
            logger.error(`URL is required`);
            return res
            .status(400)
            .send('Invalid data');
        }
        if (url.length < 5) {
            logger.error(`URL is not longer than 5 characters`);
            return res
            .status(400)
            .send('Invalid data');
        }
        if (rating < 1 || rating > 5) {
            logger.error(`Rating not between 1 and 5`);
            return res
            .status(400)
            .send('Invalid data');
        }
        const id = uuid();

        const bookmark = {
            id,
            title,
            url,
            desc,
            rating
        };

        bookmarks.push(bookmark);

        logger.info(`Card with id ${id} created`);

        res
            .status(201)
            .location(`http://localhost:8000/card/${id}`)
            .json(bookmark);
  })

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
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
    .delete((req, res) => {
        const { id } = req.params;
        const bookmarkIndex = bookmarks.findIndex(mark => mark.id == id);

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
            .status(404)
            .send('Not found');
        }

        bookmarks.splice(bookmarkIndex, 1);

        logger.info(`Card with id ${id} deleted.`);

        res
            .status(204)
            .end();
    })

module.exports = bookmarkRouter