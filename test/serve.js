#!/usr/bin/env node

(function() {
    "use strict";

    var tunnel = require('../lib/tunnel');

    var options = {
        controller: {
            salt: '1q2w3e',
            domain: 'tunnel.local'
        },
        service: {
            main: {
                port: 8080,
                service: 'http'
            }
        }
    };

    tunnel.createServer(options).listen();

})();