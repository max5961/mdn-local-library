const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const validator = require("express-validator");

// Display list of all Genre.
exports.list = asyncHandler(async (req, res, next) => {
    const allGenres = await Genre.find({}).sort({ name: 1 });

    res.render("genre_list", {
        title: "Genre List",
        genre_list: allGenres,
    });
});

// Display detail page for a specific Genre.
exports.detail = asyncHandler(async (req, res, next) => {
    const [genre, booksInGenre] = await Promise.all([
        Genre.findById(req.params.id).exec(),
        Book.find({ genre: req.params.id }, "title summary").exec(),
    ]);

    if (genre === null) {
        const err = new Error("Genre not found");
        err.status = 404;
        return next(404);
    }

    res.render("genre_detail", {
        title: "Genre Detail",
        genre: genre,
        genre_books: booksInGenre,
    });
});

// Display Genre create form on GET.
// We don't need the asyncHandler for this route, because it doesn't contain
// any code that can throw an exception
exports.createGet = asyncHandler(async (req, res, next) => {
    res.render("genre_form", { title: "Create Genre" });
});

// Handle Genre create on POST.
exports.createPost = [
    /*
     * Validate and sanitize the name field in the Request body.  This will
     * modify the Request body is such a way that the validationResult method
     * in the next middleware will be able to generate an errors object
     * */

    validator
        .body("name", "Genre name must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 })
        .escape(),

    /*
     * Write the Request handler based on if the errors object is empty
     * */

    asyncHandler(async (req, res, next) => {
        const errors = validator.validationResult(req);
        const genre = new Genre({ name: req.body.name });

        if (!errors.isEmpty()) {
            return res.render("genre_form", {
                title: "Create Genre",
                genre: genre,
                errors: errors.array(),
            });
        } else {
            const genreExists = await Genre.findOne({ name: req.body.name })
                .collation({ locale: "en", strength: 2 })
                .exec();

            if (genreExists) {
                res.redirect(genreExists.url);
            } else {
                await genre.save();
                res.redirect(genre.url);
            }
        }
    }),
];

// Display Genre delete form on GET.
exports.deleteGet = asyncHandler(async (req, res, next) => {
    const [genre, books] = await Promise.all([
        Genre.findById(req.params.id).exec(),
        Book.find({ genre: req.params.id }).sort({ title: 1 }).exec(),
    ]);

    res.render("genre_delete", {
        genre,
        books,
    });
});

// Handle Genre delete on POST.
exports.deletePost = asyncHandler(async (req, res, next) => {
    const genre = await Genre.findById(req.params.id).exec();

    if (genre === null) {
        const err = new Error("Could not find genre to delete");
        err.status = 404;
        return next(err);
    }

    await Genre.findByIdAndDelete(req.params.id).exec();

    res.redirect("/catalog/genres");
});

// Display Genre update form on GET.
exports.updateGet = asyncHandler(async (req, res, next) => {
    const genre = await Genre.findById(req.params.id).exec();

    res.render("genre_form", {
        title: `Update Genre Name (old name: ${genre.name})`,
        genre,
    });
});

// Handle Genre update on POST.
exports.updatePost = [
    validator
        .body("name", "Genre name must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 })
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validator.validationResult(req);
        const genre = new Genre({ name: req.body.name, _id: req.params.id });

        if (!errors.isEmpty()) {
            return res.render("genre_form", {
                title: "Create Genre",
                genre: genre,
                errors: errors.array(),
            });
        } else {
            const genreExists = await Genre.findOne({ name: req.body.name })
                .collation({ locale: "en", strength: 2 })
                .exec();

            if (genreExists) {
                res.redirect(genreExists.url);
            } else {
                await Genre.findByIdAndUpdate(req.params.id, genre, {});
                res.redirect(genre.url);
            }
        }
    }),
];
