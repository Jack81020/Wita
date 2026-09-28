const configuredVideos = new WeakSet();

const attemptPlay = (video) => {
  if (document.hidden) return;

  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    void playPromise.catch(() => {});
  }
};

const configureVideo = (video) => {
  if (configuredVideos.has(video)) return;
  configuredVideos.add(video);

  video.controls = false;
  video.removeAttribute('controls');
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.disablePictureInPicture = true;
  video.setAttribute('muted', '');
  video.setAttribute('autoplay', '');
  video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('disablepictureinpicture', '');
  video.setAttribute('disableremoteplayback', '');

  const resumePlayback = () => attemptPlay(video);
  const restartPlayback = () => {
    video.currentTime = 0;
    attemptPlay(video);
  };

  video.addEventListener('loadeddata', resumePlayback);
  video.addEventListener('canplay', resumePlayback);
  video.addEventListener('pause', resumePlayback);
  video.addEventListener('ended', restartPlayback);

  if (video.readyState >= 2) {
    attemptPlay(video);
  } else {
    video.load();
  }
};

const configureVideosWithin = (root) => {
  if (root instanceof HTMLVideoElement) configureVideo(root);
  root.querySelectorAll?.('video').forEach(configureVideo);
};

configureVideosWithin(document);

const videoObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node instanceof Element) configureVideosWithin(node);
    });
  });
});

videoObserver.observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) document.querySelectorAll('video').forEach(attemptPlay);
});

window.addEventListener('pageshow', () => {
  document.querySelectorAll('video').forEach(attemptPlay);
});
