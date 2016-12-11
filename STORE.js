STORE = {
    available: {},
    use: 'fallback',

    init: function() {
        try {
            localStorage;
            STORE.use = 'html5';
        } catch (e) {}
        try {
            chrome.storage.local;
            STORE.use = 'chrome';
        } catch (e) {}
        console.log('STORE uses', STORE.use);

        STORE.set = STORE[STORE.use].set;
        STORE.get = STORE[STORE.use].get;
        STORE.del = STORE[STORE.use].del;
        STORE.getAll = STORE[STORE.use].getAll;
        STORE.list = STORE[STORE.use].list;
    },


    log: function(p) {
        console.log('STORE.js log:', p)
    },



    changeListeners: {},
    onChange: function(regex, callback, name) {
        // STORE.changeListeners[regex] = callback;
        if (!name) name = 'default';
        if (!STORE.changeListeners[regex])
            STORE.changeListeners[regex] = {};
        STORE.changeListeners[regex][name] = callback;
        // console.log(Object.keys(STORE.changeListeners[regex]), 'event handlers on', regex);
    },
    clearChangeListener: function(regex, name) {
        if (regex)
            if (name) delete STORE.changeListeners[regex][name];
            else STORE.changeListeners[regex] = {};
        else STORE.changeListeners = {};
    },
    informChange: function(key, val) {
        for (var regex in STORE.changeListeners)
            if (key.match(new RegExp('^' + regex + '$')))
                for (var i in STORE.changeListeners[regex])
                    STORE.changeListeners[regex][i](key, val);
            // STORE.changeListeners[regex](key, val);
            // console.log('inform', key, regex, key.match(new RegExp('^' + regex + '$')));
    },
    getChange: function(key, callback, name) {
        STORE.onChange(key, function(key, val) {
            callback(val);
        }, name);
        STORE.get(key, callback);
    },



    html5: {
        set: function(key, val) {
            localStorage.setItem(key, JSON.stringify(val));
            STORE.informChange(key, val);
            // STORE.changeListeners[key](val);
            // STORE.changeListeners['*'](val);
        },
        get: function(key, callback) {
            callback(JSON.parse(localStorage.getItem(key)));
        },
        getAll: function(callback) {
            var list = {};
            for (var key in localStorage)
                try {
                    list[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    list[key] = localStorage.getItem(key);
                }
            callback(list);
        },
        del: function(key) {
            localStorage.removeItem(key);
            STORE.informChange(key, null);
        },
        list: function(callback) {
            callback(Object.keys(localStorage));
        }
    },

    chrome: {
        set: function(key, val) {
            var set = {};
            set[key] = val;
            chrome.storage.local.set(set);
            STORE.informChange(key, val);
        },
        get: function(key, callback) {
            chrome.storage.local.get(key, function(res) {
                callback(res[key]);
            });
        },
        getAll: function(callback) {
            chrome.storage.local.get(callback);
        },
        del: function(key) {
            chrome.storage.local.remove(key);
            STORE.informChange(key, null);
        },
        list: function(callback) {
            chrome.storage.local.get(function(res) {
                callback(Object.keys(res));
            });
        }
    },

    win8: {

    },

    fallback: {

    }
};

STORE.init();



// set: function(key, val) {
//     STORE[STORE.use].set(key, val);
// },
// get: function(key, callback) {
//     STORE[STORE.use].get(key, function(res) {
//         if (callback) callback(res);
//         else console.log('STORE-GET', key, ':', res);
//     });
// },
// del: function(key) {
//     STORE[STORE.use].del(key);
// },
// getAll: function(callback) {
//     STORE[STORE.use].getAll(function(res) {
//         if (callback) callback(res);
//         else console.log('STORE-GETALL', res);
//     });
// },
// list: function(callback) {
//     STORE[STORE.use].list(function(res) {
//         if (callback) callback(res);
//         else console.log('STORE-LIST', res);
//     });
// },