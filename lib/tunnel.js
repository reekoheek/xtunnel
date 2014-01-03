(function() {
    "use strict";

    var Client = require('./client'),
        Server = require('./server');

    module.exports = {
        createClient: function(options) {
            return new Client(options);
        },
        createServer: function(options) {
            return new Server(options);
        },
        Client: Client,
        Server: Server
    };
})();