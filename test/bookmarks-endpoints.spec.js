const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')

describe('Bookmarks Endpoints', function() {
    let db

    before('make knex instance', () => {
        db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('bookmarks').truncate())

    afterEach('cleanup', () => db('bookmarks').truncate())

    describe(`GET /api/bookmarks`, () => {
        context(`Given no articles`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/bookmarks')
                    .expect(200, [])
            })
        })

        context('Given there are articles in the database', () => {
            const testBookmarks = makeBookmarksArray()
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })

            it('GET /api/bookmarks responds with 200 and all of the bookmarks', () => {
                return supertest(app)
                    .get('/api/bookmarks')
                    .expect(200, testBookmarks)
            })
        })
    })
    describe('GET /api/bookmarks/:bookmarkId', () => {
        context(`Given no articles`, () => {
            it(`responds with 404`, () => {
                const bookmarkId = 123456
                return supertest(app)
                    .get(`/api/bookmarks/${bookmarkId}`)
                    .expect(404, { error: { message: `Bookmark does not exist`}})
            })
        })

        context('Given there are articles in the database', () => {
            const testBookmarks = makeBookmarksArray()
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })
            it('GET /api/bookmarks/:bookmarkId responds with 200 and the specified bookmark', () => {
                const bookmarkId = 2
                const expectedBookmark = testBookmarks[`${bookmarkId - 1}`]
                return supertest(app)
                    .get(`/api/bookmarks/${bookmarkId}`)
                    .expect(200, expectedBookmark)
            })
        })
    })

    describe('POST /api/bookmarks', () => {
        it(`creates a bookmark, responding with 201 and the new bookmark`, () => {
            const newBookmark = {
                    title: 'Test new bookmark',
                    style: 'News',
                    description: 'Lorem something',
                    url: 'www.Yahoo.com',
                    rating: '4.0'
                }
            return supertest(app)
                .post('/api/bookmarks')
                .send(newBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newBookmark.title)
                    expect(res.body.style).to.eql(newBookmark.style)
                    expect(res.body.url).to.eql(newBookmark.url)
                    expect(res.body.rating).to.eql(newBookmark.rating)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/bookmarks/${postRes.body.id}`)
                        .expect(postRes.body)
                )
        })

        it(`responds with 400 and an error message when the 'title' is missing`, () => {
            return supertest(app)
                .post('/api/bookmarks')
                .send({
                    style: 'News',
                    description: 'Lorem something',
                    url: 'www.Yahoo.com',
                    rating: '4.0'
                })
                .expect(400, { error: { message: `Title is required`}})
        })

        it(`responds with 400 and an error message when the 'URL' is missing`, () => {
            return supertest(app)
                .post('/api/bookmarks')
                .send({
                    title: 'Test new bookmark',
                    style: 'News',
                    description: 'Lorem something',
                    rating: '4.0'
                })
                .expect(400, { error: { message: `URL is required` }})
        })

        it(`responds with 400 and an error message when the 'URL' is less than 5 characters`, () => {
            return supertest(app)
                .post('/api/bookmarks')
                .send({
                    title: 'Test new bookmark',
                    style: 'News',
                    description: 'Lorem something',
                    url: 'www.',
                    rating: '4.0'
                })
                .expect(400, { error: { message: `URL must be at least 5 characters`}})
        })

        it(`responds with 400 and an error message when the 'rating' is not between 1 and 5`, () => {
            return supertest(app)
                .post('/api/bookmarks')
                .send({
                    title: 'Test new bookmark',
                    style: 'News',
                    description: 'Lorem something',
                    url: 'www.Yahoo.com',
                    rating: '6.0'
                })
                .expect(400, { error: { message: `Rating must be between 1 and 5` }})
        })

        it(`responds with 400 and an error message when the 'style' is not a valid type`, () => {
            return supertest(app)
                .post('/api/bookmarks')
                .send({
                    title: 'Test new bookmark',
                    style: 'Invalid',
                    description: 'Lorem something',
                    url: 'www.Yahoo.com',
                    rating: '4.0'
                })
                .expect(400, { error: { message: `Style must be one of: Searches, How-to, News, Funny, Social` }})
        })
    })

    describe(`DELETE /api/bookmarks/:bookmark_id`, () => {
        context(`Given no bookmarks`, () => {
            it(`responds with 404`, () => {
                const bookmarkId = 123456
                return supertest(app)
                    .delete(`/api/bookmarks/${bookmarkId}`)
                    .expect(404, { error: { message: `Bookmark does not exist` } })
            })
        })

        context('Given there are bookmarks in the database', () => {
        const testBookmarks = makeBookmarksArray()
        
        beforeEach('insert bookmarks', () => {
            return db
                .into('bookmarks')
                .insert(testBookmarks)
        })
        
        it('responds with 204 and removes the bookmark', () => {
            const idToRemove = "2"
            const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
            return supertest(app)
                .delete(`/api/bookmarks/${idToRemove}`)
                .expect(204)
                .then(res =>
                    supertest(app)
                        .get(`/api/bookmarks`)
                        .expect(expectedBookmarks)
                )
            })
        })
    })

    describe.only(`PATCH /api/bookmarks/:bookmarkId`, () => {
        context(`Given no bookmarks`, () => {
            it(`responds with 404`, () => {
                const bookmarkId = 123456
                return supertest(app)
                    .patch(`/api/bookmarks/${bookmarkId}`)
                    .expect(404, { error: { message: `Bookmark does not exist`}})
            })
        })

        context(`Given there are bookmarks in the database`, () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })

            it('responds with 204 and updates the bookmark', () => {
                const idToUpdate = "2"
                const updateBookmark = {
                    title: 'Test new bookmark with updates!',
                    style: 'News',
                    description: 'Lorem something something',
                    url: 'www.Google.com',
                    rating: '2.0'
                }
                const expectedBookmark = {
                    ...testBookmarks[idToUpdate - 1],
                    ...updateBookmark
                }
                return supertest(app)
                    .patch(`/api/bookmarks/${idToUpdate}`)
                    .send(updateBookmark)
                    .expect(204)
                    .then(response => {
                        supertest(app)
                            .get(`/api/bookmarks/${idToUpdate}`)
                            .expect(expectedBookmark)
                    })
            })
        })
    })
})
