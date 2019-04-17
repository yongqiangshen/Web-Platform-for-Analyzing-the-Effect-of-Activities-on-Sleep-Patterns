var u = require('underscore');

var DataModelMapper = function (fields) {
    this.fields = fields;

    this.map = function (obj) {
        var result = {};
        u.each(fields, function (field) {
            var dest = u.isArray(field.dest) ? field.dest : [field.dest];
            var args = u.values(u.pick(obj, field.src));
            if (u.isFunction(field.map)) {
                args = field.map.apply(null, args);
            }
            if (!u.isArray(args)) args = [args];
            u.each(dest, function (name, index) {
                result[name] = args[index];
            });
        });
        return result;
    };

    this.revert = function (obj) {
        var result = {};
        u.each(fields, function (field) {
            var src = u.isArray(field.src) ? field.src : [field.src];
            var args = u.values(u.pick(obj, field.dest));
            if (u.isFunction(field.revert)) {
                args = field.revert.apply(null, args);
            }
            if (!u.isArray(args)) args = [args];
            u.each(src, function (name, index) {
                result[name] = args[index];
            });
        });
        return result;
    };

    this.map_existing_keys = function (obj) {
        var result = {}; 
        u.each(fields, function (field) {
            var allKeysExist = true;
            if (Array.isArray(field.src)){
                u.each(field.src, function (key) {
                    if (!u.has(obj, key)) {
                        allKeysExist = false;
                    }
                })
            }
            if ( (u.has(obj, field.src)) || ((Array.isArray(field.src)) && (allKeysExist))) {
                var dest = u.isArray(field.dest) ? field.dest : [field.dest];
                var args = u.values(u.pick(obj, field.src));
                if (u.isFunction(field.map)) {
                    args = field.map.apply(null, args);
                }
                if (!u.isArray(args)) args = [args];
                u.each(dest, function (name, index) {
                    result[name] = args[index];
                });
            }
        });
        return result;
    };

    this.revert_existing_keys = function (obj) {
        var result = {};
        u.each(fields, function (field) {
            var allKeysExist = true;
            if (Array.isArray(field.dest)){
                u.each(field.dest, function (key) {
                    if (!u.has(obj, key)) {
                        allKeysExist = false;
                    }
                })
            }
            if ( (u.has(obj, field.dest)) || ((Array.isArray(field.dest)) && (allKeysExist))) {
                var src = u.isArray(field.src) ? field.src : [field.src];
                var args = u.values(u.pick(obj, field.dest));
                if (u.isFunction(field.revert)) {
                    args = field.revert.apply(null, args);
                }
                if (!u.isArray(args)) args = [args];
                u.each(src, function (name, index) {
                    result[name] = args[index];
                });
            }
            
        });
        return result;
    };

};

module.exports = DataModelMapper;
