// topbar.js – управление топбаром и переключением разделов

(function() {
  // Инициализация при загрузке DOM
  document.addEventListener('DOMContentLoaded', () => {
    initTopbar();
  });

  function initTopbar() {
    // Находим все кнопки топбара
    const buttons = document.querySelectorAll('.topbar-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sectionId = btn.getAttribute('data-section');
        if (sectionId) {
          switchToSection(sectionId);
          // Активный класс для кнопки
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      });
    });

    // По умолчанию показываем главную (если не было сохранённого раздела)
    const savedSection = localStorage.getItem('activeSection') || 'dashboard';
    switchToSection(savedSection);
    const activeBtn = document.querySelector(`.topbar-btn[data-section="${savedSection}"]`);
    if (activeBtn) activeBtn.classList.add('active');
  }

  window.switchToSection = function(sectionId) {
    console.log('switchToSection:', sectionId);
    localStorage.setItem('activeSection', sectionId);

    // Скрываем все секции (элементы с классом section-container)
    document.querySelectorAll('.section-container').forEach(section => {
      section.style.display = 'none';
    });

    // Показываем выбранную секцию
    const activeSection = document.getElementById(sectionId);
    if (activeSection) activeSection.style.display = 'block';

    // Управление контейнерами проектов
    const projectsContainer = document.getElementById('projectsContainer');
    const detailContainer = document.getElementById('projectDetailContainer');

    if (sectionId === 'projects') {
      if (projectsContainer) projectsContainer.style.display = 'block';
      if (detailContainer) detailContainer.style.display = 'none';
      // Рендерим список проектов, если функция доступна
      if (typeof renderProjectsList === 'function') {
        renderProjectsList();
      } else {
        console.warn('renderProjectsList not defined yet');
      }
    } else {
      if (projectsContainer) projectsContainer.style.display = 'none';
      if (detailContainer) {
        detailContainer.style.display = 'none';
        detailContainer.innerHTML = ''; // очищаем детальную страницу
      }
    }

    // Дополнительная логика для других разделов (можно расширять)
    if (sectionId === 'calculations') {
      // Здесь можно инициализировать калькуляторы
    }
    if (sectionId === 'templates') {
      // Здесь можно инициализировать шаблоны
    }
  };

  // Экспортируем функцию глобально
  window.switchToSection = switchToSection;
})();
