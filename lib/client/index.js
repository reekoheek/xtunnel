(function() {
    "use strict";

    var io = require('socket.io-client'),
        request = require('request'),
        zlib = require('zlib'),
        Client = function(options) {
            this.options = options;
        };

    Client.prototype = {
        client: null,
        clientMap: {
            http: {}
        },

        connect: function() {
            var that = this;

            console.log(this.options.server);

            var client = this.client = io.connect(this.options.server);

            client.on('connect', function () {
                console.log('client connected');
                client.emit('register', that.options.tunnel);
            });

            client.on('registered', function (data) {
                console.log('event::registered');
                for(var i in data) {
                    var s = data[i];
                    that.clientMap[s.type][s.domain] = s;
                }
            });

            client.on('request', function(data) {

                var s = that.clientMap[data.type][data.domain];
                if (!s.status) {
                    client.emit('response', {
                        statusCode: 404
                    });
                    return;
                }

                var options = {
                    url: s.type + '://' + s.host + ':' + s.port + data.data.url,
                    method: data.data.method,
                    headers: data.data.headers
                };
                options.headers['accept-encoding'] = 'none';

                request(options, function(err, res, body) {
                    var sendBody = function(body) {
                        // console.log(body);
                        client.emit('response', {
                            statusCode: res.statusCode,
                            headers: res.headers,
                            body: res.body,
                            session: data.session
                        });
                    };


                    sendBody(res.body.toString('utf8'));

                    // var contentEncoding = res.headers['content-encoding'];
                    // switch(contentEncoding){
                    // case 'gzip':
                    //     zlib.gunzip(new Buffer(body), function(error, body){
                    //         if(error){
                    //             console.log(error);
                    //             //Handle error
                    //         } else {
                    //             sendBody(body);
                    //         }
                    //     });
                    //     break;
                    // case 'deflate':
                    //     zlib.inflate(body, function(error, body){
                    //         if(error){
                    //             //Handle error
                    //         } else {
                    //             sendBody(body);
                    //         }
                    //     });
                    //     break;
                    // default:
                    //     sendBody(body);
                    //     break;
                    // }

                });
            });

            client.on('disconnect', function () {
                console.log('client disconnected');
            });
        }
    };

    module.exports = Client;
})();