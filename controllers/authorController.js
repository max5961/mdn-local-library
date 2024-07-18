const Author = require("../models/author");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const validator = require("express-validator");
const bookinstance = require("../models/bookinstance");
const debug = require("debug")("author");

// Display list of all Authors
exports.list = asyncHandler(async (req, res, next) => {
    const allAuthors = await Author.find({}).sort({ family_name: 1 }).exec();

    res.render("author_list", {
        title: "Author List",
        author_list: allAuthors,
    });
});

// Display detail page for a specific Author
exports.detail = asyncHandler(async (req, res, next) => {
    debug(`Ayoooooooooo this is from debug author!`);

    const [author, allBooksByAuthor] = await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({ author: req.params.id }, "title summary").exec(),
    ]);

    if (author === null) {
        const err = new Error("Author not found");
        err.status = 404;
        return next(err);
    }

    res.render("author_detail", {
        title: "Author Detail",
        author: author,
        author_books: allBooksByAuthor,
    });
});

// Display Author create form on GET
exports.createGet = asyncHandler(async (req, res, next) => {
    res.render("author_form", { title: "Create Author" });
});

function validateForm() {
    return [
        validator
            .body("first_name")
            .trim()
            .isLength({ min: 1 })
            .escape()
            .withMessage("First name must be specified.")
            .isAlphanumeric()
            .withMessage("First name has non-alphanumeric characters."),

        // NOTE: NEVER validate names with isAlphanumeric().  This is done to
        // demonstrate how the validator is used to daisy chain messages with
        // the withMessage() method, but the usage of isAlphanumeric() is bad
        // practice
        validator
            .body("family_name")
            .trim()
            .isLength({ min: 1 })
            .escape()
            .withMessage("Family name must be specified.")
            .isAlphanumeric()
            .withMessage("Family name has non-alphanumeric characters."),

        validator
            .body("date_of_birth", "Invalid date of birth")
            .isISO8601()
            .toDate(),

        validator
            .body("date_of_death", "Invalid date of death")
            .optional({ values: "falsy" })
            .isISO8601()
            .toDate(),
    ];
}

// Handle Author create on POST.
exports.createPost = [
    ...validateForm(),

    asyncHandler(async (req, res, next) => {
        const errors = validator.validationResult(req);

        const author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
        });

        if (!errors.isEmpty()) {
            return res.render("author_form", {
                title: "Create Author",
                author: author,
                errors: errors.array(),
            });
        } else {
            await author.save();
            res.redirect(author.url);
        }
    }),
];

// Display Author delete form on GET.
exports.deleteGet = asyncHandler(async (req, res, next) => {
    const [author, allBooksByAuthor] = await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({ author: req.params.id }, "title summary").exec(),
    ]);

    if (author === null) {
        res.redirect("/catalog/authors");
    }

    res.render("author_delete", {
        title: "Delete Author",
        author: author,
        author_books: allBooksByAuthor,
    });
});

// Handle Author delete on POST.
exports.deletePost = asyncHandler(async (req, res, next) => {
    const [author, allBooksByAuthor] = await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({ author: req.params.id }, "title summary").exec(),
    ]);

    if (allBooksByAuthor.length > 0) {
        // Author has books, need to delete books first before deleting author
        return res.render("author_delete", {
            title: "Delete Author",
            author: author,
            author_books: allBooksByAuthor,
        });
    } else {
        await Author.findByIdAndDelete(req.body.authorid);
        res.redirect("/catalog/authors");
    }
});

// Display Author update form on GET.
exports.updateGet = asyncHandler(async (req, res, next) => {
    const author = await Author.findById(req.params.id).exec();

    res.render("author_form", {
        title: "Update Author",
        author: author,
    });
});

// Handle Author update on POST.
exports.updatePost = [
    ...validateForm(),
    asyncHandler(async (req, res, next) => {
        const errors = validator.validationResult(req);

        const author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
            _id: req.params.id,
        });

        console.log(author);

        if (!errors.isEmpty()) {
            return res.render("author_form", {
                title: "Create Author",
                author: author,
                errors: errors.array(),
            });
        } else {
            await Author.findByIdAndUpdate(req.params.id, author, {});
            res.redirect(author.url);
        }
    }),
];
