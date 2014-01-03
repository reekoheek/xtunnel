(function() {
    "use strict";

    var http = require('http'),
        Http = function(options) {
        this.options = options;

        this.initialize();
    };

    Http.prototype = {
        start: function() {
            console.log('Starting http service at port ' + this.options.port);
            this.s.listen(this.options.port);
        },

        initialize: function() {
            var that = this;

            this.s = http.createServer(function(req, res) {
                var controller = that.service.controller,
                    options = {
                        type: 'http',
                        domain: req.headers.host.split(':')[0],
                        data: {
                            url: req.url,
                            method: req.method,
                            headers: req.headers
                        }
                    };

                controller.serve(options, function(err, data) {
                    if (err) {
                        console.log('Error', err);
                        res.statusCode = 500;
                        res.end('Nooooo!\n');
                    } else {
                        res.writeHead(data.statusCode, data.headers);
                        if (data.body) {
                            res.write(data.body);
                        }
                        res.end();
                    }
                });
            });
        }
    };

    module.exports = Http;
})();