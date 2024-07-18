const mongoose = require("mongoose");
const { Schema } = mongoose;
const { DateTime } = require("luxon");

const AuthorSchema = new Schema({
    first_name: { type: String, required: true, maxLength: 100 },
    family_name: { type: String, required: true, maxLength: 100 },
    date_of_birth: { type: Date },
    date_of_death: { type: Date },
});

// Virtual for author's full name
AuthorSchema.virtual("name").get(function () {
    // To avoid errors in cases where an author does not have either a family name or first name
    // We want to make sure we handle the exception by returning an empty string for that case
    let fullname = "";
    if (this.first_name && this.family_name) {
        fullname = `${this.family_name}, ${this.first_name}`;
    }

    return fullname;
});

// Virtual for author's URL
AuthorSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/catalog/author/${this._id}`;
});

AuthorSchema.virtual("lifespan").get(function () {
    function toFormatted(date) {
        return DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED);
    }
    const dob = toFormatted(this.date_of_birth);
    let dod = "present";

    if (this.date_of_death) {
        dod = toFormatted(this.date_of_death);
    }

    return `${dob} - ${dod}`;
});

AuthorSchema.methods.toISOFormat = function (date) {
    return DateTime.fromJSDate(date).toISODate();
};

AuthorSchema.virtual("dob_formatted").get(function () {
    return this.toISOFormat(this.date_of_birth);
});

AuthorSchema.virtual("dod_formatted").get(function () {
    if (!this.date_of_death) return null;
    return this.toISOFormat(this.date_of_death);
});

// Export model
module.exports = mongoose.model("Author", AuthorSchema);
