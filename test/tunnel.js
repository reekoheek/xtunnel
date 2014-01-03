#!/usr/bin/env node

(function() {
    "use strict";

    var tunnel = require('../lib/tunnel'),
        url = require('url'),
        server = 'http://localhost:8080';

    var parsed = url.parse('http://localhost'),
        domain = 'test.tunnel.local' || null;
    parsed.protocol = parsed.protocol || 'http:';
    parsed.hostname = parsed.hostname || 'localhost';
    parsed.port = parsed.port || 80;

    var options = {
            server: server,
            tunnel: {}
        };

    if (parsed.protocol) {
        options.tunnel.main = {
            type: parsed.protocol.substr(0, parsed.protocol.length-1),
            host: parsed.hostname,
            port: parsed.port,
            domain: domain
        };
    }

    var client = tunnel.createClient(options).connect();
})();