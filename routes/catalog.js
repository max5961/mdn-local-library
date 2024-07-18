const express = require("express");
const catalogRouter = express.Router();
const Catalog = require("../config/catalogRoutes");

const AuthorController = require("../controllers/authorController");
const BookController = require("../controllers/bookController");
const BookInstanceController = require("../controllers/bookinstanceController");
const GenreController = require("../controllers/genreController");

/*
 * Book Routes
 * */

catalogRouter.get("/", BookController.index);

catalogRouter
    .route("/book/create")
    .get(BookController.createGet)
    .post(BookController.createPost);

catalogRouter
    .route("/book/:id/delete")
    .get(BookController.deleteGet)
    .post(BookController.deletePost);

catalogRouter
    .route("/book/:id/update")
    .get(BookController.updateGet)
    .post(BookController.updatePost);

catalogRouter.get("/books", BookController.list);
catalogRouter.get("/book/:id", BookController.detail);

/*
 * Author Routes
 * */

catalogRouter
    .route("/author/create")
    .get(AuthorController.createGet)
    .post(AuthorController.createPost);

catalogRouter
    .route("/author/:id/delete")
    .get(AuthorController.deleteGet)
    .post(AuthorController.deletePost);

catalogRouter
    .route("/author/:id/update")
    .get(AuthorController.updateGet)
    .post(AuthorController.updatePost);

catalogRouter.get("/authors", AuthorController.list);
catalogRouter.get("/author/:id", AuthorController.detail);

/*
 * Genre Routes
 * */

catalogRouter
    .route("/genre/create")
    .get(GenreController.createGet)
    .post(GenreController.createPost);

catalogRouter
    .route("/genre/:id/update")
    .get(GenreController.updateGet)
    .post(GenreController.updatePost);

catalogRouter
    .route("/genre/:id/delete")
    .get(GenreController.deleteGet)
    .post(GenreController.deletePost);

catalogRouter.get("/genres", GenreController.list);
catalogRouter.get("/genre/:id", GenreController.detail);

/*
 * Book Instance Routes
 * */

catalogRouter
    .route("/bookinstance/create")
    .get(BookInstanceController.createGet)
    .post(BookInstanceController.createPost);

catalogRouter
    .route("/bookinstance/:id/delete")
    .get(BookInstanceController.deleteGet)
    .post(BookInstanceController.deletePost);

catalogRouter
    .route("/bookinstance/:id/update")
    .get(BookInstanceController.updateGet)
    .post(BookInstanceController.updatePost);

catalogRouter.get("/bookinstances", BookInstanceController.list);
catalogRouter.get("/bookinstance/:id", BookInstanceController.detail);

module.exports = catalogRouter;
