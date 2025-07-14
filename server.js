require("dotenv").config();
const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");

const app = express();

const options = {
  key: fs.readFileSync("./ssl/key.pem"),
  cert: fs.readFileSync("./ssl/cert.pem"),
};

app.use(express.static(path.join(__dirname, "public")));

https.createServer(options, app).listen(443, () => {
  console.log("HTTPS server running on port 443 at https://127.0.0.1:443");
});