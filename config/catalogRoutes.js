const Catalog = {
    root: "/",
};

Catalog.books = {
    root: `/books`,
    create: `/book/create`,
};

Catalog.authors = {
    root: `/authors`,
    create: `/author/create`,
};

Catalog.genres = {
    root: `/genres`,
    create: `/genre/create`,
};

Catalog.bookinstances = {
    root: `/bookinstances`,
    create: `/bookinstance/create`,
};

module.exports = Catalog;
