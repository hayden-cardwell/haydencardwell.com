(() => {
  const trigger = document.getElementById('startup-sound-trigger');
  const audio = document.getElementById('startup-sound');
  const status = document.getElementById('audio-status');
  if (!trigger || !audio || !status) return;

  function setPlaying(playing) {
    trigger.setAttribute('aria-pressed', String(playing));
    const label = `${playing ? 'Stop' : 'Play'} Windows XP startup sound`;
    trigger.setAttribute('aria-label', label);
    trigger.title = label;
  }

  function showError() {
    setPlaying(false);
    status.textContent = 'The sound couldn’t play. Please try again.';
  }

  trigger.addEventListener('click', async () => {
    status.textContent = '';
    if (trigger.getAttribute('aria-pressed') === 'true') {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
      return;
    }

    audio.currentTime = 0;
    setPlaying(true);
    try {
      await audio.play();
    } catch (error) {
      if (error.name !== 'AbortError') showError();
    }
  });

  audio.addEventListener('ended', () => setPlaying(false));
  audio.addEventListener('pause', () => setPlaying(false));
  audio.addEventListener('error', showError);
})();
