require('./DB/DB')
const express = require('express')
const app = express()
const { render } = require('ejs')
const path = require('path')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const User = require('./models/user')
const Home = require('./models/home')
const moment = require("moment");
const cookieParser = require("cookie-parser");
//handling cors error
app.use(cors())
app.use(express.static("public"));
//use express json and urlencoded
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
//use ejs as view engine
app.set('view engine', 'ejs')
const dir = path.join(__dirname, 'public')
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render('home')

})
app.get('/about', (req, res) => {
    res.render('about')
    res.end();
})

app.get('/login', (req, res) => {
    res.render('login')
    res.end();
})
app.get('/signup', (req, res) => {
    res.render('signup')
    res.end();
})
app.get("/home", (req, res) => {
    const token = req.cookies.token;

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);

        res.render("automation");
    } catch (error) {
        res.render("login");
    }
});
app.post("/reg", async (req, res) => {
    console.log(req.body);
    const { name, email, password: plaintextpassword, specialaccess } = req.body;
    if (!name || typeof name !== "string") {
        return res.json({ status: "error", error: "Invalid Name" });
    }
    if (!email || typeof email !== "string") {
        return res.json({ status: "error", error: "Invalid Email" });
    }
    if (!plaintextpassword || typeof plaintextpassword !== "string") {
        return res.json({ status: "error", error: "Invalid password" });
    }
    const password = await bcrypt.hash(plaintextpassword, 10);
    try {
        if (specialaccess === process.env.ADMIN_CODE) {
            const response = await User.create({
                name,
                email,
                password,
                admin: true,
            });
            console.log("user record has been record ", response);
        } else {
            const response = await User.create({
                name,
                email,
                password,
                admin: false,
            });
            console.log("user record has been record ", response);
        }

    } catch (error) {
        console.log(JSON.stringify(error));
        if (error.code === 11000) {
            return res.json({
                status: "error",
                error: "Email / Username is Already in Use!",
            });
        }
        throw error;
    }
    res.json({
        status: "ok",
    });
});
app.post("/auth", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).lean();
    if (!user) {
        return res.json({ status: "error", error: "Invalid Email/password" });
    }
    if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
            {
                id: user._id,

                name: user.name,
                email: user.email,
                admin: user.admin,
            },
            process.env.JWT_SECRET
        );
        return res.json({ status: "ok", data: token });
    }

    res.json({ status: "error", error: "Invalid Email / password" });
});
app.post("/createhome", (req, res) => {
    const token = req.cookies.token;

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        if (user.admin == true) {
            const { name, desc } = req.body;
            try {
                const response = Home.create({
                    name,
                    desc,
                });
                res.json({ status: "ok", message: "Inserted Successfully! ✅" });
            } catch (error) {
                res.json({ status: "fail", message: "Something Went Wrong!" });
            }
        } else {
            throw 1;
        }
    } catch (error) {
        res.json({ status: "fail", message: "This is for admin only!" });
    }
});

app.get("/getallhouse", (req, res) => {
    Home.find({})
        .then((result) => {
            res.json(result);
        }
        )
        .catch((err) => {
            res.json({ status: "fail", message: "Something Went Wrong!" });
        }
        )
});

app.get("/home/:id", (req, res) => {
    const token = req.cookies.token;
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        Home.findById(req.params.id)
            .then((result) => {
                res.render("dashboard.ejs", { id: req.params.id });
            })
            .catch((err) => {
                res.redirect("/home");
            });
    }
    catch (error) {
        res.redirect("/login");
    }

});

app.get("/logout", (req, res) => {
    res.cookie("token", "").redirect("/login");
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})