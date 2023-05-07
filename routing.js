const path = require("path");

module.exports = function(app)
{
    const clientDir = path.resolve(__dirname, "client");

    // custom serve component files!
    app.get("/components/:component", (req, res) => {
        res.sendFile(path.resolve(clientDir, "components", `${req.params.component}.html`));
        return;
    });

    // all other routes serve the index.html (TODO add layout file)
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(clientDir, "index.html"));
        return;
    });
}