(() => {
  const trigger = document.getElementById('startup-sound-trigger');
  const audio = document.getElementById('startup-sound');
  const status = document.getElementById('audio-status');
  const reset = document.getElementById('reset-trigger');
  const reverseAudio = document.getElementById('startup-reset-sound');
  if (!trigger || !audio || !status || !reset || !reverseAudio) return;

  function setPlaying(playing) {
    trigger.setAttribute('aria-pressed', String(playing));
    const label = `${playing ? 'Stop' : 'Play'} Windows XP startup sound`;
    trigger.setAttribute('aria-label', label);
    trigger.title = label;
  }

  // RMS from the exact startup WAV, sampled every 20 ms with a 55 ms
  // attack and 130 ms release. Embedded analysis avoids CORS/audio-routing
  // changes; the media clock keeps the reveal aligned during buffering.
  const waveform = [0.0306,0.0902,0.1457,0.1752,0.1851,0.1878,0.1853,0.1805,0.1769,0.1753,0.1748,0.1818,0.1857,0.1902,0.1945,0.2057,0.2524,0.2891,0.3085,0.3332,0.3422,0.3416,0.3892,0.4236,0.4321,0.4302,0.4285,0.4281,0.4256,0.4303,0.4424,0.4595,0.4664,0.4887,0.4992,0.51,0.5109,0.5181,0.5171,0.5144,0.5091,0.5835,0.6802,0.7223,0.717,0.7194,0.7217,0.7249,0.7529,0.7477,0.7519,0.7802,0.7846,0.7778,0.8145,0.8353,0.8764,0.9305,0.9216,0.9156,0.948,0.9737,0.9842,0.9863,0.9861,0.9873,0.982,0.9652,0.9423,0.9302,0.9523,0.9887,1.0,0.9948,0.9826,0.9717,0.9615,0.9541,0.9437,0.9287,0.9124,0.9014,0.9055,0.9074,0.9262,0.9683,0.961,0.9379,0.9238,0.897,0.8696,0.8626,0.8531,0.854,0.8508,0.842,0.8254,0.8008,0.7912,0.7825,0.7944,0.785,0.7924,0.8084,0.8217,0.8646,0.8613,0.8768,0.8928,0.9036,0.9183,0.942,0.9532,0.9502,0.9502,0.966,0.9649,0.9585,0.9614,0.955,0.9501,0.9411,0.9279,0.9169,0.9036,0.8914,0.8729,0.8476,0.8192,0.7963,0.769,0.7402,0.7152,0.6905,0.6678,0.6394,0.6108,0.5889,0.5711,0.555,0.5439,0.5346,0.5234,0.5069,0.4887,0.4732,0.4559,0.4342,0.4112,0.393,0.3736,0.3525,0.3334,0.32,0.3065,0.2885,0.2699,0.2558,0.2433,0.229,0.2145,0.204,0.1923,0.1798,0.1668,0.1559,0.1443,0.1321,0.1215,0.1128,0.1048,0.0972,0.0898,0.083,0.077,0.0716,0.0666,0.0615,0.0568,0.0524,0.0485,0.0452,0.0424,0.0398,0.0372,0.0349,0.0326,0.0307,0.029,0.0273,0.0257,0.0244,0.0231,0.0217,0.0204,0.0191,0.0182,0.0173,0.0165,0.0156,0.0148,0.0141,0.0133,0.0125,0.0118,0.0111,0.0104,0.0098,0.0093,0.0088,0.0084,0.0081,0.0086,0.0083,0.008,0.0078,0.0074,0.0069,0.0063,0.0059,0.0055,0.0052,0.0048,0.0044,0.0041,0.0037,0.0034,0.0031,0.0029,0.0028,0.0027,0.0025,0.0024,0.0023,0.0022,0.0019,0.0017,0.0014,0.0012,0.0011,0.0009];
  const waveformDuration = 4.814058956916099;
  const waveformStep = 0.02;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const cumulative = [0];
  for (const energy of waveform) {
    cumulative.push(cumulative[cumulative.length - 1] + Math.pow(energy, 0.7));
  }
  const totalEnergy = cumulative[cumulative.length - 1];
  for (let i = 0; i < cumulative.length; i++) cumulative[i] /= totalEnergy;
  let animationFrame = 0;
  let activeAudio = null;
  let direction = 'forward';
  let playbackRequest = 0;
  let reveal = 0;

  function setReveal(value) {
    reveal = Math.max(0, Math.min(1, value));
    document.body.style.setProperty('--xp-reveal', String(reveal));
    reset.hidden = reveal === 0 && direction !== 'reverse';
  }

  function stopAnimation() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  function revealAt(time, duration) {
    const progress = Math.max(0, Math.min(1, time / duration));
    const position = progress * waveformDuration / waveformStep;
    const index = Math.min(waveform.length - 1, Math.floor(position));
    const fraction = Math.min(1, position - index);
    const next = Math.min(index + 1, waveform.length - 1);
    const energy = waveform[index] + (waveform[next] - waveform[index]) * fraction;
    const accumulated = cumulative[index] + (cumulative[index + 1] - cumulative[index]) * fraction;
    const settle = progress * progress * (3 - 2 * progress);
    // Accumulated sound opens the scene; each swell adds a soft bloom.
    // The bloom recedes with the notes while the long reverb resolves to 1.
    return 0.78 * accumulated + 0.22 * settle + 0.22 * energy * Math.sin(Math.PI * progress);
  }

  function animateReveal() {
    if (!activeAudio) return;
    if (motionPreference.matches) {
      document.body.classList.toggle('xp-mode', direction === 'forward');
      setReveal(direction === 'forward' ? 1 : 0);
      return;
    }
    const duration = activeAudio.duration || waveformDuration;
    const time = direction === 'forward' ? activeAudio.currentTime : duration - activeAudio.currentTime;
    setReveal(revealAt(time, duration));
    if (!activeAudio.paused && !activeAudio.ended) {
      animationFrame = requestAnimationFrame(animateReveal);
    }
  }

  function finishPlayback() {
    stopAnimation();
    activeAudio = null;
    setPlaying(false);
    reset.disabled = false;
    const finishedReverse = direction === 'reverse';
    if (finishedReverse && document.activeElement === reset) trigger.focus();
    document.body.classList.toggle('xp-mode', !finishedReverse);
    direction = 'forward';
    setReveal(finishedReverse ? 0 : 1);
  }

  function stopPlayback() {
    stopAnimation();
    const previous = activeAudio;
    activeAudio = null;
    if (previous) previous.pause();
    setPlaying(false);
  }

  async function play(nextDirection, startTime = 0) {
    const request = ++playbackRequest;
    stopPlayback();
    direction = nextDirection;
    const player = direction === 'forward' ? audio : reverseAudio;
    activeAudio = player;
    status.textContent = '';
    reset.disabled = direction === 'reverse';
    setPlaying(direction === 'forward');
    if (direction === 'forward' && startTime === 0) setReveal(0);
    // These WAVs share the same duration and sample rate. Reversing complete
    // stereo frames preserves channels and gives an exact backward recording.
    player.currentTime = startTime;
    try {
      await player.play();
    } catch (error) {
      if (request === playbackRequest && error.name !== 'AbortError') {
        finishPlayback();
        status.textContent = 'The sound couldn’t play. Please try again.';
      }
    }
  }

  for (const player of [audio, reverseAudio]) {
    player.addEventListener('playing', () => {
      if (activeAudio !== player) return;
      stopAnimation();
      document.body.classList.add('xp-mode');
      animateReveal();
    });
    player.addEventListener('ended', () => {
      if (activeAudio === player) finishPlayback();
    });
    player.addEventListener('pause', () => {
      if (activeAudio === player) stopAnimation();
    });
    player.addEventListener('error', () => {
      if (activeAudio !== player) return;
      finishPlayback();
      status.textContent = 'The sound couldn’t play. Please try again.';
    });
  }

  motionPreference.addEventListener('change', () => {
    stopAnimation();
    if (activeAudio) animateReveal();
  });

  trigger.addEventListener('click', () => {
    if (activeAudio === audio) {
      ++playbackRequest;
      stopPlayback();
      direction = 'forward';
      finishPlayback();
      return;
    }
    // Switching direction mid-sound continues from the same visual position.
    const startTime = activeAudio === reverseAudio
      ? Math.max(0, (reverseAudio.duration || waveformDuration) - reverseAudio.currentTime)
      : 0;
    play('forward', startTime);
  });

  reset.addEventListener('click', () => {
    const startTime = activeAudio === audio
      ? Math.max(0, (audio.duration || waveformDuration) - audio.currentTime)
      : 0;
    play('reverse', startTime);
  });

})();
