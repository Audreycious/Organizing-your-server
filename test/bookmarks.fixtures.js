function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'First test post!',
            style: 'How-to',
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            url: 'www.yahoo.com',
            rating: "7.0"
        },
        {
            id: 2,
            title: 'Second test post!',
            style: 'News',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, exercitationem cupiditate dignissimos est perspiciatis, nobis commodi alias saepe atque facilis labore sequi deleniti. Sint, adipisci facere! Velit temporibus debitis rerum.',
            url: 'www.yahoo.com',
            rating: "6.0"
        },
    ];
}

module.exports = {
    makeBookmarksArray,
}