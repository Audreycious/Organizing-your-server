CREATE TYPE bookmark_category AS ENUM (
    'Searches',
    'How-to',
    'News',
    'Funny',
    'Social'
);

ALTER TABLE bookmarks
  ADD COLUMN
    style bookmark_category;