const cookieParser = require("cookie-parser");

require("dotenv").config({ path: ".env" });
const createServer = require("./createServer");
const db = require("./db");

const server = createServer();

// Use middleware to handle JWT and cookies
server.express.use(cookieParser());

// TODO use middleware to populate user data

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
