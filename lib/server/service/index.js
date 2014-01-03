(function() {
    "use strict";

    module.exports = {
        services: {},

        put: function(key, options) {
            if (this.services[key]) {
                throw new Error('Service with name [' + key + '] is already available.');
            }

            var Service = require('./' + (options.service || 'http'));
            this.services[key] = new Service(options);
            this.services[key].service = this;
        },

        get: function(key) {
            return this.services[key];
        },

        all: function() {
            return this.services;
        }
    };

})();