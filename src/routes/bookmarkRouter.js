const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const { bookmarks } = require("../store")
const bookmarkRouter = express.Router()
const bodyParser = express.json()
const BookmarksService = require('../bookmarks-service')

bookmarkRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks)
            })
            .catch(next)
    })
    .post(bodyParser, (req, res) => {
        const { title, url, desc, rating } = req.body
        if (!title) {
            logger.error(`Title is required`);
            return res
                .status(400)
                .send(`Title is required`)
        }
        if (!url) {
            logger.error(`URL is required`)
            return res
            .status(400)
            .send('URL is required')
        }
        if (url.length < 5) {
            logger.error(`URL is not longer than 5 characters`)
            return res
            .status(400)
            .send('URL must be at least 5 characters')
        }
        if (rating < 1 || rating > 5) {
            logger.error(`Rating not between 1 and 5`)
            return res
            .status(400)
            .send('Rating must be between 1 and 5')
        }
        const id = uuid()

        const bookmark = {
            id,
            title,
            url,
            desc,
            rating
        }

        bookmarks.push(bookmark)

        logger.info(`Card with id ${id} created`)

        res
            .status(201)
            .location(`http://localhost:8000/card/${id}`)
            .json(bookmark)
  })

bookmarkRouter
    .route('/bookmarks/:bookmarkId')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getById(knexInstance, req.params.bookmarkId)
            .then(bookmark => {
                res.json(bookmark)
            })
            .catch(next)
    })
    .delete((req, res) => {
        const { bookmarkId } = req.params
        const bookmarkIndex = bookmarks.findIndex(mark => mark.id == bookmarkId)
        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${bookmarkId} not found.`)
            return res
            .status(404)
            .send('Not found')
        }
        bookmarks.splice(bookmarkIndex, 1)
        logger.info(`Card with id ${bookmarkId} deleted.`)
        res
            .status(204)
            .end()
    })

module.exports = bookmarkRouter