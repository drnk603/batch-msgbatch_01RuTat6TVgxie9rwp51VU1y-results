(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var burger = header.querySelector('.dr-header-burger');
  var menu = header.querySelector('.dr-header-menu');
  if (!burger || !menu) return;

  function closeMenu() {
    burger.classList.remove('dr-is-open');
    menu.classList.remove('dr-is-open');
    burger.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    var isOpen = burger.classList.toggle('dr-is-open');
    if (isOpen) {
      menu.classList.add('dr-is-open');
      burger.setAttribute('aria-expanded', 'true');
    } else {
      closeMenu();
    }
  }

  burger.addEventListener('click', toggleMenu);

  header.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      if (burger.classList.contains('dr-is-open')) {
        closeMenu();
        burger.focus();
      }
    }
  });

  header.addEventListener('click', function (event) {
    if (!burger.classList.contains('dr-is-open')) return;
    if (menu.contains(event.target) || burger.contains(event.target)) return;
    closeMenu();
  });
})();
