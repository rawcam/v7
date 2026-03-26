// project-detail.js – детальная страница проекта

(function() {
  // Глобальная функция рендеринга детальной страницы
  window.renderProjectDetail = function(project) {
    const container = document.getElementById('projectDetailContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="project-detail">
        <h2>Редактирование проекта: ${escapeHtml(project.name)}</h2>
        <form id="projectDetailForm">
          <label>Название:</label>
          <input type="text" name="name" value="${escapeHtml(project.name)}" required>

          <label>Бюджет (₽):</label>
          <input type="number" name="budget" value="${project.budget}" required>

          <label>Статус:</label>
          <select name="status">
            <option value="Активный" ${project.status === 'Активный' ? 'selected' : ''}>Активный</option>
            <option value="Стадия П" ${project.status === 'Стадия П' ? 'selected' : ''}>Стадия П</option>
            <option value="Стадия Р" ${project.status === 'Стадия Р' ? 'selected' : ''}>Стадия Р</option>
            <option value="Монтаж" ${project.status === 'Монтаж' ? 'selected' : ''}>Монтаж</option>
            <option value="Сдан" ${project.status === 'Сдан' ? 'selected' : ''}>Сдан</option>
          </select>

          <label>Приоритет:</label>
          <select name="priority">
            <option value="Обычный" ${project.priority === 'Обычный' ? 'selected' : ''}>Обычный</option>
            <option value="Срочный" ${project.priority === 'Срочный' ? 'selected' : ''}>Срочный</option>
          </select>

          <label>Дата начала:</label>
          <input type="date" name="startDate" value="${project.startDate || ''}">

          <label>Инженер:</label>
          <input type="text" name="engineer" value="${escapeHtml(project.engineer || '')}">

          <label>Руководитель проекта:</label>
          <input type="text" name="projectManager" value="${escapeHtml(project.projectManager || '')}">

          <div style="margin-top: 20px;">
            <button type="submit">Сохранить изменения</button>
            <button type="button" id="backToProjectsBtn">Назад к проектам</button>
            <button type="button" id="deleteProjectBtn" style="background-color: #dc3545;">Удалить проект</button>
          </div>
        </form>
      </div>
    `;

    const form = document.getElementById('projectDetailForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Обновляем проект
      const updatedProject = {
        ...project,
        name: form.name.value.trim(),
        budget: parseInt(form.budget.value, 10),
        status: form.status.value,
        priority: form.priority.value,
        startDate: form.startDate.value,
        engineer: form.engineer.value.trim(),
        projectManager: form.projectManager.value.trim()
      };
      // Обновляем в массиве проектов (глобальном)
      if (window.appState && window.appState.projects) {
        const index = window.appState.projects.findIndex(p => p.id === project.id);
        if (index !== -1) window.appState.projects[index] = updatedProject;
      }
      // Также обновляем локальную переменную (если projects.js использует свою)
      if (typeof updateProjectsArray === 'function') {
        updateProjectsArray(updatedProject);
      }
      // Возвращаемся к списку
      backToProjectsList();
    });

    document.getElementById('backToProjectsBtn').addEventListener('click', backToProjectsList);
    document.getElementById('deleteProjectBtn').addEventListener('click', () => {
      if (confirm('Удалить проект?')) {
        if (window.appState && window.appState.projects) {
          window.appState.projects = window.appState.projects.filter(p => p.id !== project.id);
        }
        if (typeof deleteProjectFromArray === 'function') {
          deleteProjectFromArray(project.id);
        }
        backToProjectsList();
        if (typeof updateDashboard === 'function') updateDashboard();
      }
    });
  };

  function backToProjectsList() {
    const projectsContainer = document.getElementById('projectsContainer');
    const detailContainer = document.getElementById('projectDetailContainer');
    if (projectsContainer) projectsContainer.style.display = 'block';
    if (detailContainer) detailContainer.style.display = 'none';
    if (typeof renderProjectsList === 'function') renderProjectsList();
    if (typeof updateDashboard === 'function') updateDashboard();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  // Если projects.js не предоставляет глобальных функций для обновления массива,
  // мы их определим здесь как заглушки (они будут переопределены, если projects.js загружен позже)
  window.updateProjectsArray = window.updateProjectsArray || function(updatedProject) {
    // Эта функция будет переопределена в projects.js, если нужно
    console.warn('updateProjectsArray not implemented');
  };
  window.deleteProjectFromArray = window.deleteProjectFromArray || function(projectId) {
    console.warn('deleteProjectFromArray not implemented');
  };
})();
