CREATE TABLE bookmarks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    rating numeric(2, 1) NOT NULL
);