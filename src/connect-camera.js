const { width, height } = require("./constants");
module.exports = function connectCamera(callback) {
  const MEDIA_CONSTRAINTS = {
    audio: false,
    video: {
      width: {
        ideal: width
      },
      height: {
        ideal: height
      }
    }
  };

  if (navigator.mediaDevices) {
    navigator.mediaDevices
      .getUserMedia(MEDIA_CONSTRAINTS)
      .then(function (mediaStream) {
        const video = document.querySelector("#video");
        video.srcObject = mediaStream;
        video.onloadedmetadata = function () {
          video.play();
          video.muted = true;
          callback(null, video);
        };
      })
      .catch(function (err) {
        callback(err);
      });
  } else {
    callback(new Error("navigator.mediaDevices not supported"));
  }
};
