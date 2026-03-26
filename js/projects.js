// projects.js – полная версия с глобальным состоянием
(function() {
    // Инициализация глобального состояния
    window.appState = window.appState || {};
    if (!window.appState.projects) {
        // Тестовые проекты (как в вашем дашборде)
        window.appState.projects = [
            {
                id: '1',
                name: 'Ситуационный центр Пресейл',
                budget: 3500000,
                status: 'Монтаж',
                priority: 'Срочный',
                startDate: '2026-02-01',
                engineer: 'Иванов И.И.',
                projectManager: 'Петров П.П.'
            },
            {
                id: '2',
                name: 'Конференц-зал 1',
                budget: 890000,
                status: 'Стадия П',
                priority: 'Обычный',
                startDate: '2026-03-01',
                engineer: 'Сидоров С.С.',
                projectManager: 'Петров П.П.'
            },
            {
                id: '3',
                name: 'Диспетчерская',
                budget: 1200000,
                status: 'Активный',
                priority: 'Обычный',
                startDate: '2026-02-15',
                engineer: 'Кузнецов К.К.',
                projectManager: 'Иванов И.И.'
            }
        ];
        console.log('projects.js: initialized projects', window.appState.projects);
    }

    // Функция рендеринга списка проектов
    window.renderProjectsList = function() {
        const container = document.getElementById('projectsContainer');
        if (!container) {
            console.error('projectsContainer not found');
            return;
        }
        const projects = window.appState.projects || [];
        if (!projects.length) {
            container.innerHTML = '<p>Нет проектов. Создайте новый.</p>';
            return;
        }
        container.innerHTML = projects.map(project => `
            <div class="project-card" data-id="${project.id}">
                <h3>${escapeHtml(project.name)}</h3>
                <p><strong>Бюджет:</strong> ${formatNumber(project.budget)} ₽</p>
                <p><strong>Статус:</strong> ${project.status}</p>
                <p><strong>Инженер:</strong> ${project.engineer}</p>
                <p><strong>РП:</strong> ${project.projectManager}</p>
                <button onclick="openProjectDetail('${project.id}')">Редактировать</button>
                <button onclick="deleteProject('${project.id}')">Удалить</button>
            </div>
        `).join('');
    };

    // Функция открытия детальной страницы
    window.openProjectDetail = function(projectId) {
        const project = window.appState.projects.find(p => p.id === projectId);
        if (!project) return;
        const projectsContainer = document.getElementById('projectsContainer');
        const detailContainer = document.getElementById('projectDetailContainer');
        if (projectsContainer) projectsContainer.style.display = 'none';
        if (detailContainer) {
            detailContainer.style.display = 'block';
            if (typeof renderProjectDetail === 'function') {
                renderProjectDetail(project);
            } else {
                detailContainer.innerHTML = `<p>Детальная страница в разработке для проекта "${escapeHtml(project.name)}"</p>`;
            }
        }
    };

    // Функция удаления проекта
    window.deleteProject = function(projectId) {
        if (confirm('Удалить проект?')) {
            window.appState.projects = window.appState.projects.filter(p => p.id !== projectId);
            renderProjectsList();
            if (typeof updateDashboard === 'function') updateDashboard();
        }
    };

    // Функция создания нового проекта
    window.createProject = function() {
        const name = prompt('Название проекта:');
        if (!name) return;
        const budget = parseInt(prompt('Бюджет (₽):', '0'), 10) || 0;
        const engineer = prompt('Инженер:') || '';
        const projectManager = prompt('Руководитель проекта:') || '';

        const newId = String(Date.now());
        const newProject = {
            id: newId,
            name: name,
            budget: budget,
            status: 'Активный',
            priority: 'Обычный',
            startDate: new Date().toISOString().slice(0,10),
            engineer: engineer,
            projectManager: projectManager
        };
        window.appState.projects.push(newProject);
        renderProjectsList();
        if (typeof updateDashboard === 'function') updateDashboard();
    };

    // Вспомогательные функции
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    // Инициализация: если раздел "Проекты" уже видим, отрисовываем список
    document.addEventListener('DOMContentLoaded', () => {
        const projectsSection = document.getElementById('projects');
        if (projectsSection && projectsSection.style.display !== 'none') {
            renderProjectsList();
        }
        // Принудительно обновим дашборд, если он ещё не обновился
        if (typeof updateDashboard === 'function') updateDashboard();
    });
})();
