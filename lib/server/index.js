(function() {
    "use strict";

    var http = require('http'),
        service = require('./service'),
        controller = require('./controller');

    var Server = function(options) {
        this.options = options;

        for(var key in options.service) {
            this.put(key, options.service[key]);
        }

        this.initController();
    };

    Server.prototype = {

        listen: function() {
            console.log('Start listening...');

            var services = service.all();
            for(var key in services) {
                services[key].start();
            }
        },

        put: function(key, options) {
            service.put(key, options);
        },

        initController: function() {
            controller.options = this.options.controller;
            controller.listen(service);
        }
    };

    module.exports = Server;
})();