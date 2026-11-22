const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.desktop-nav');
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  navigation.classList.toggle('open', !expanded);
});
navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('open');
}));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const backgroundVideos = document.querySelectorAll('video');

if (prefersReducedMotion) {
  backgroundVideos.forEach((video) => video.pause());
} else {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target: video, isIntersecting }) => {
      if (isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.12 });

  backgroundVideos.forEach((video) => videoObserver.observe(video));
}

const phoneStage = document.querySelector('.phone-stage');
const phoneModel = document.querySelector('.phone-model');
const finishButtons = document.querySelectorAll('.finish-swatch');
const finishName = document.querySelector('.finish-name');
const stageColor = document.querySelector('.stage-color');
const spinToggle = document.querySelector('.spin-toggle');
const finishes = {
  black: { name: 'Preto', label: 'PRETO' },
  silver: { name: 'Prateado', label: 'PRATEADO' },
  glacier: { name: 'Glacial', label: 'GLACIAL' },
  burgundy: { name: 'Bordô', label: 'BORDÔ' },
};

if (phoneStage && phoneModel) {
  let rotationX = 8;
  let rotationY = -28;
  let dragPoint = null;
  let autoRotate = false;
  let animationFrame = 0;

  const renderPhone = () => {
    phoneModel.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(var(--model-scale, 1))`;
  };

  const stopAutoRotate = () => {
    autoRotate = false;
    spinToggle.setAttribute('aria-pressed', 'false');
    spinToggle.classList.remove('active');
    cancelAnimationFrame(animationFrame);
  };

  finishButtons.forEach((button) => button.addEventListener('click', () => {
    const finish = finishes[button.dataset.finish];
    if (!finish) return;
    phoneModel.dataset.finish = button.dataset.finish;
    phoneModel.setAttribute('aria-label', `iPhone 18 Pro Max na cor ${finish.name}`);
    finishName.textContent = finish.name;
    stageColor.textContent = finish.label;
    finishButtons.forEach((option) => {
      const selected = option === button;
      option.classList.toggle('selected', selected);
      option.setAttribute('aria-pressed', String(selected));
    });
  }));

  phoneStage.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    stopAutoRotate();
    dragPoint = { x: event.clientX, y: event.clientY };
    phoneStage.classList.add('dragging');
    phoneStage.setPointerCapture(event.pointerId);
  });

  phoneStage.addEventListener('pointermove', (event) => {
    if (!dragPoint) return;
    const deltaX = event.clientX - dragPoint.x;
    const deltaY = event.clientY - dragPoint.y;
    rotationY += deltaX * 0.65;
    rotationX = Math.max(-55, Math.min(55, rotationX - deltaY * 0.45));
    dragPoint = { x: event.clientX, y: event.clientY };
    renderPhone();
  });

  const endDrag = () => {
    dragPoint = null;
    phoneStage.classList.remove('dragging');
  };
  phoneStage.addEventListener('pointerup', endDrag);
  phoneStage.addEventListener('pointercancel', endDrag);

  phoneStage.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 18 : 8;
    if (event.key === 'ArrowLeft') rotationY -= step;
    else if (event.key === 'ArrowRight') rotationY += step;
    else if (event.key === 'ArrowUp') rotationX = Math.max(-55, rotationX - step);
    else if (event.key === 'ArrowDown') rotationX = Math.min(55, rotationX + step);
    else return;
    event.preventDefault();
    stopAutoRotate();
    renderPhone();
  });

  spinToggle.addEventListener('click', () => {
    if (prefersReducedMotion) return;
    autoRotate = !autoRotate;
    spinToggle.setAttribute('aria-pressed', String(autoRotate));
    spinToggle.classList.toggle('active', autoRotate);
    if (!autoRotate) {
      cancelAnimationFrame(animationFrame);
      return;
    }
    const animate = () => {
      if (!autoRotate) return;
      rotationY += 0.35;
      renderPhone();
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
  });

  renderPhone();
}
