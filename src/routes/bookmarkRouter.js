const express = require('express')
const xss = require('xss')
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
    .post(bodyParser, (req, res, next) => {
        const { title, style, url, description, rating } = req.body
        const validStyles = ['Searches', 'How-to', 'News', 'Funny', 'Social']
        if (!title) {
            logger.error(`Title is required`);
            return res
                .status(400)
                .json({
                    error: { message: `Title is required` }
                })
        }
        if (!url) {
            logger.error(`URL is required`)
            return res
            .status(400)
            .json({
                error: { message: `URL is required` }
            })
        }
        if (url.length < 5) {
            logger.error(`URL is not longer than 5 characters`)
            return res
            .status(400)
            .json({
                error: { message: `URL must be at least 5 characters`}
            })
        }
        if (rating < 1 || rating > 5) {
            logger.error(`Rating not between 1 and 5`)
            return res
            .status(400)
            .json({
                error: { message: `Rating must be between 1 and 5` }
            })
        }
        if (!validStyles.includes(style)) {
            logger.error(`Style must be one of: Searches, How-to, News, Funny, Social`)
            return res
                .status(400)
                .json({
                    error: { message: `Style must be one of: Searches, How-to, News, Funny, Social` }
                })
        }
        const id = uuid()
        const newBookmark = {
            id,
            title,
            style,
            url,
            description,
            rating
        }
        logger.info(`Bookmark with id ${id} created`)
        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )
        .then(bookmark => {
            res
                .status(201)
                .location(`/bookmarks/${newBookmark.id}`)
                .json({
                    id: bookmark.id,
                    title: xss(bookmark.title),
                    description: xss(bookmark.description),
                    style: bookmark.style,
                    rating: bookmark.rating,
                    url: bookmark.url
                })
        })
        .catch(next)
  })

bookmarkRouter
    .route('/bookmarks/:bookmarkId')
    .all((req, res, next) => {
        BookmarksService.getById(
            req.app.get('db'),
            req.params.bookmarkId
        )
            .then(bookmark => {
                if (!bookmark) {
                    return res.status(404).json({
                        error: { message: `Bookmark does not exist`}
                    })
                }
                res.bookmark = bookmark
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.bookmark.id,
            title: xss(res.bookmark.title),
            description: xss(res.bookmark.description),
            style: res.bookmark.style,
            rating: res.bookmark.rating,
            url: res.bookmark.url
        })
    })
    .delete((req, res, next) => {
        BookmarksService.deleteBookmark(
            req.app.get('db'),
            req.params.bookmarkId
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = bookmarkRouter