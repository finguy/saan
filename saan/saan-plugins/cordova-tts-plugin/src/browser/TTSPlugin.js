cordova.define("com.saan.tts.TTSPlugin", function(require, exports, module) { function speak(success, error, opts) {
  if (opts && typeof(opts[0].text) === 'string' && opts[0].text.length > 0){
    var msg = new SpeechSynthesisUtterance(opts[0].text);
    window.speechSynthesis.speak(msg);
    success();
  }else{
    error("Missing parameter");
  }
}

module.exports = {
  speak: speak
};

require('cordova/exec/proxy').add('TTSPlugin', module.exports);
});
