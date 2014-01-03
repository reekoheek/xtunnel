(function() {
    "use strict";

    var socketio = require('socket.io'),
        Hashids = require("hashids"),
        index = 0,
        serveMap = {
            http: {

            }
        };

    module.exports = {
        indexer: [new Date().getTime(), 0],
        sessionMap: {},

        serve: function(options, cb) {
            if (!serveMap[options.type][options.domain]) {
                return cb(null, {statusCode: 404});
            }

            var socket = serveMap[options.type][options.domain].sock,
                now = new Date().getTime();
            if (!socket) {
                return cb(new Error('No socket'));
            }

            if (this.indexer[0] == now) {
                this.indexer[1] += 1;
            } else {
                this.indexer = [now, 1];
            }

            options.session = this.indexer[0] + '-' + this.indexer[1];

            this.sessionMap[options.session] = {
                options: options,
                callback: cb
            };

            socket.emit('request', options);
        },

        listen: function(service) {
            var that = this;

            service.controller = this;

            this.hashids = new Hashids(this.options.salt || 'my salt', this.options.size || 8);

            this.io = socketio.listen(service.get('main').s);
            this.io.sockets.on('connection', function (socket) {
                socket.serveIndex = {};
                socket.on('register', function (data) {
                    for(var i in data) {
                        if (!data[i].domain) {
                            var hash = that.hashids.encrypt(index++);
                            data[i].domain = hash + '.' + that.options.domain;
                        }

                        var serve = {};
                        for(var j in data[i]) {
                            serve[j] = data[i][j];
                        }

                        if (serveMap[serve.type][serve.domain]) {
                            data[i].status = serve.status = false;
                        } else {
                            data[i].status = serve.status = true;
                            serve.sock = socket;
                            socket.serveIndex[serve.type] = socket.serveIndex[serve.type] || [];
                            socket.serveIndex[serve.type].push(serve.domain);
                            serveMap[serve.type][serve.domain] = serve;
                        }
                    }

                    console.log('socket registered');
                    socket.emit('registered', data);
                });

                socket.on('response', function(data) {
                    var session = that.sessionMap[data.session];
                    if (session) {
                        session.callback(null, data);
                    }
                });

                socket.on('disconnect', function () {
                    console.log('socket disconnected');
                    for(var i in socket.serveIndex) {
                        for(var j in socket.serveIndex[i]) {
                            delete serveMap[i][socket.serveIndex[i][j]];
                        }
                    }
                });
            });
        }
    };
})();