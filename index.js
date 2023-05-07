const express = require("express");
const path = require("path");

require("dotenv").config();

const CONFIG = {
    isDev: process.env.isDev || false,
    useManagedMode: process.env.useManagedMode || false,
    port: process.env.PORT || 3000,
}

console.log(CONFIG);

const app = express();

app.use(express.static(path.resolve(__dirname, 'client')));
require("./routing.js")(app);

if(CONFIG.isDev)
{
    const server = app.listen(CONFIG.port, () => {
        console.log(`Server listening on port http://localhost:${server.address().port}`);
    });

    return;
}

if(CONFIG.useManagedMode)
{
    const server = app.listen(0, () => {
        console.log(`Server listening on port http://localhost:${server.address().port}`);
    });

    return;
}

module.exports = app;
