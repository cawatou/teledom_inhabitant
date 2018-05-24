var exec = require('cordova/exec');

var PLUGIN_NAME = 'RingtonePlugin';

var ringtonePlugin = {
  start: function() {
    exec(
      null,
      null,
      PLUGIN_NAME,
      'start',
      []
    );
  },
  stop: function() {
    exec(
      null,
      null,
      PLUGIN_NAME,
      'stop',
      []
    );
  }
}

module.exports = ringtonePlugin;
