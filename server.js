require("dotenv").config();
const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const routes = require("./routes/index.route")
const cors = require("cors");

const app = express();

// Local development SSL certificate for HTTPS server, not required on Render
const options = {
  key: fs.readFileSync("./ssl/key.pem"),
  cert: fs.readFileSync("./ssl/cert.pem"),
};

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cors());

app.use("/api", routes);

app.all(/.*/, (req, res) => {
  res.status(404).sendFile(path.join(__dirname, "404.html"));
})

// Global error handler to return JSON error responses
app.use((err, req, res, next) => {
  console.error("Error:", err.message); // log cleanly to console
  res.status(500).json({ error: err.message });
});

// Start HTTPS server with SSL cert on port 443
https.createServer(options, app).listen(443, () => {
  console.log("HTTPS server running on port 443 at https://127.0.0.1:443");
});