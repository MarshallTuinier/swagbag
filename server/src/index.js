const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env" });
const createServer = require("./createServer");
const db = require("./db");

const server = createServer();

// Use middleware to handle JWT and cookies
server.express.use(cookieParser());

// Decode JWT to get user ID on each request
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    // Attatch user id to the request
    req.userId = userId;
  }
  next();
});

// Attatch the user object to each request
server.express.use(async (req, res, next) => {
  // If they are not logged in, skip this
  if (!req.userId) return next();

  // Attatch the user to the request
  const user = await db.query.user(
    { where: { id: req.userId } },
    "{ id, permissions, email, name, cart { id quantity item { title price id description image largeImage }} }"
  );
  req.user = user;
  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  details => {
    console.log(
      `Server is now running on port http://localhost:${details.port}`
    );
  }
);
