const express = require("express");
const router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
    res.send("respond with a resource");
});

/* Haha cool man */
router.get("/cool", (req, res, next) => {
    res.render("index", { title: "Cool Person App" });
});

module.exports = router;
