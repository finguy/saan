var exec = require('cordova/exec');

exports.speak = function(arg0, success, error) {
    exec(success, error, "TTSPlugin", "speak", [arg0]);
};
