const https = require("https");
const fs = require("fs");
const path = require("path");


const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // (NOTE: this will disable client verification)
  cert: fs.readFileSync(path.resolve("./cert.pem")),
  key: fs.readFileSync(path.resolve("./key.pem")),
  passphrase: "Creole@123"
});

module.exports = httpsAgent;