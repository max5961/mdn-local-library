const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const validator = require("express-validator");

function validateForm() {
    return [
        validator
            .body("book", "Book must be specified")
            .trim()
            .isLength({ min: 1 })
            .escape(),

        validator
            .body("imprint", "Imprint must be specified")
            .trim()
            .isLength({ min: 1 })
            .escape(),

        validator.body("status").escape(),

        validator
            .body("due_back", "Invalid date")
            .optional({ values: "falsy" })
            .isISO8601()
            .toDate(),
    ];
}

// Display list of all BookInstances.
exports.list = asyncHandler(async (req, res, next) => {
    const allBookInstances = await BookInstance.find().populate("book").exec();

    res.render("bookinstance_list", {
        title: "Book Instance List",
        bookinstance_list: allBookInstances,
    });
});

// Display detail page for a specific BookInstance.
exports.detail = asyncHandler(async (req, res, next) => {
    const bookInstance = await BookInstance.findById(req.params.id)
        .populate("book")
        .exec();

    if (bookInstance === null) {
        const err = new Error("Book copy not found");
        err.status = 404;
        return next(err);
    }

    res.render("bookinstance_detail", {
        title: "Book:",
        bookinstance: bookInstance,
    });
});

// Display BookInstance create form on GET.
exports.createGet = asyncHandler(async (req, res, next) => {
    const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

    res.render("bookinstance_form", {
        title: "Create Book Instance",
        book_list: allBooks,
    });
});

// Handle BookInstance create on POST.
exports.createPost = [
    ...validateForm(),
    asyncHandler(async (req, res, next) => {
        const errors = validator.validationResult(req);

        const bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
        });

        if (!errors.isEmpty()) {
            const allBooks = await Book.find({}, "title")
                .sort({ title: 1 })
                .exec();

            return res.render("bookinstance_form", {
                title: "Create Book Instance",
                book_list: allBooks,
                selected_book: bookInstance.book_id,
                errors: errors.array(),
                bookinstance: bookInstance,
            });
        } else {
            await bookInstance.save();
            res.redirect(bookInstance.url);
        }
    }),
];

// Display BookInstance delete form on GET.
exports.deleteGet = asyncHandler(async (req, res, next) => {
    const copy = await BookInstance.findById(req.params.id)
        .populate("book")
        .exec();

    res.render("bookinstance_delete", {
        copy,
    });
});

// Handle BookInstance delete on POST.
exports.deletePost = asyncHandler(async (req, res, next) => {
    const id = req.body.bookinstanceid;
    const copy = await BookInstance.findById(id).populate("book").exec();

    if (copy === null) {
        const err = new Error("Copy not found");
        err.status = 404;
        return next(err);
    }

    if (copy.book === null) {
        const err = new Error("Descendent book not found");
        err.status = 404;
        return next(err);
    }

    await BookInstance.findByIdAndDelete(id);
    res.redirect(`/catalog/book/${copy.book._id}`);
});

// Display BookInstance update form on GET.
async function handleUpdateFormRequest(req, res, next) {
    const [bookinstance, book_list] = await Promise.all([
        BookInstance.findById(req.params.id).exec(),
        Book.find().sort({ title: 1 }).exec(),
    ]);

    res.render("bookinstance_form", {
        title: "Update Book Copy",
        selected_book: bookinstance.book._id,
        bookinstance,
        book_list,
    });
}

exports.updateGet = asyncHandler(handleUpdateFormRequest);

// Handle bookinstance update on POST.
exports.updatePost = [
    ...validateForm(),
    asyncHandler(async (req, res, next) => {
        const errors = validator.validationResult(req);

        const bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            const allBooks = await Book.find({}, "title")
                .sort({ title: 1 })
                .exec();

            return res.render("bookinstance_form", {
                title: "Create Book Instance",
                book_list: allBooks,
                selected_book: bookInstance.book_id,
                errors: errors.array(),
                bookinstance: bookInstance,
            });
        } else {
            await BookInstance.findByIdAndUpdate(
                req.params.id,
                bookInstance,
                {},
            );
            res.redirect(bookInstance.url);
        }
    }),
];
