const jwt = require("jsonwebtoken");
const blogModel = require("../models/blogModel");
const mongoose = require('mongoose');

//======================================================1st Middleware===================================================================//

const authenticate = function (req, res, next) {
    try {
        let token = req.headers["X-api-key"];
        if (!token) token = req.headers["x-api-key"];
        if (!token) return res.status(404).send({ status: false, msg: "token must be present" });
        console.log(token);

        let decodedToken = jwt.decode(token);
        if (decodedToken) {
            try {
                jwt.verify(token, "group19-project1")
                next()
            }
            catch (err) {
                return res.status(400).send({ status: false, msg: err.message })
            }
        }
        else return res.status(400).send({ status: false, msg: "token is invalid" });

    }
    catch (err) {
        console.log("This is the error:", err.message)
        return res.status(500).send({ status: false, msg: err.message })
    }
}

// //====================================================2nd Middleware=====================================================================//

const authorise = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"];
        let decodedToken = jwt.verify(token, "group19-project1");
        let blogId = req.params.blogId
        if (!mongoose.Types.ObjectId.isValid(blogId)) return res.status(400).send({ status: false, msg: "blogId is invalid!" })
        let findBlogId = await blogModel.findById(blogId).select({ authorId: 1, _id: 0 })
        if (!findBlogId) return res.status(400).send({ status: false, msg: "blogId is invalid!" })
        let userLoggedIn = decodedToken.authorId
        if (findBlogId.authorId != userLoggedIn) return res.status(400).send({ status: false, msg: "Author logged is not allowed to modify the requested author's blog data" })

        next()
    }
    catch (err) {
        console.log("This is the error:", err.message)
        return res.status(500).send({ status: false, msg: err.message })
    }
}

//=========================================================================================================================================//

module.exports = { authenticate, authorise }