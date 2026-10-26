(() => {
  const views = [...document.querySelectorAll('.app-view')];
  const navLinks = [...document.querySelectorAll('[data-route]')];
  const simulator = document.querySelector('[data-simulator]');
  const validArchitecture = new Set(['monolith', 'microservices', 'events']);
  const params = new URLSearchParams(window.location.search);
  const requestedArchitecture = params.get('architecture');

  if (simulator && validArchitecture.has(requestedArchitecture)) {
    simulator.dataset.activeArchitecture = requestedArchitecture;
  }

  function showRoute() {
    const route = location.hash.slice(1).split('?')[0];
    const viewId = views.some(view => view.id === route) ? route : 'inicio';
    views.forEach(view => view.classList.toggle('is-active', view.id === viewId));
    navLinks.forEach(link => {
      const selected = link.dataset.route === viewId;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.title = `${viewId === 'production' ? 'Producción' : viewId === 'simulador' ? 'Arquitecturas' : 'Inicio'} | BioTech`;
    if (route && route === viewId) {
      requestAnimationFrame(() => document.getElementById(viewId)?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
    }
  }
  window.addEventListener('hashchange', showRoute);
  showRoute();

  function updateArchitectureFocus() {
    if (!simulator || !window.BioTechModel) return;
    const id = validArchitecture.has(simulator.dataset.activeArchitecture)
      ? simulator.dataset.activeArchitecture
      : 'monolith';
    const architecture = window.BioTechModel.architectures[id];
    if (!architecture) return;
    const focus = simulator.querySelector('.architecture-focus');
    if (!focus) return;
    focus.querySelector('[data-architecture-name]').textContent = architecture.name;
    focus.querySelector('[data-architecture-description]').textContent = architecture.description;
    focus.querySelector('[data-architecture-pro]').textContent = architecture.pro;
    focus.querySelector('[data-architecture-con]').textContent = architecture.con;
    focus.querySelector('[data-architecture-status]').textContent = id === 'monolith'
      ? 'Elegida para BioTech'
      : 'Alternativa de comparación';
    focus.querySelectorAll('[data-architecture-card]').forEach(button => {
      const selected = button.dataset.architectureCard === id;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }
  simulator?.addEventListener('click', event => {
    const button = event.target.closest('[data-architecture-card]');
    if (!button || !validArchitecture.has(button.dataset.architectureCard)) return;
    simulator.dataset.activeArchitecture = button.dataset.architectureCard;
    updateArchitectureFocus();
  });

  // Monolito modular: los motores se cargan en orden desde index.html,
  // comparten este documento y se publican como una sola aplicación.
  if (window.BioTechProduction && window.BioTechModel) updateArchitectureFocus();
  window.addEventListener('error', event => {
    if (!/assets\/(production|simulator|app)\.js/.test(event.filename || '')) return;
    const notice = document.createElement('p');
    notice.className = 'notice danger app-error';
    notice.setAttribute('role', 'alert');
    notice.textContent = 'Una parte de BioTech no pudo iniciar. Recarga la página y verifica que la carpeta assets esté publicada junto a index.html.';
    document.querySelector('#app-shell')?.prepend(notice);
  });
})();
