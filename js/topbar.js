// topbar.js – обновлённая версия с расширенными проектами
const TopbarModule = (function() {
    let currentSection = 'dashboard';
    let projects = [];

    console.log('topbar.js loaded');

    // ========== СТАТУСЫ ПРОЕКТОВ ==========
    const statuses = {
        presale: { name: 'Пресейл', color: 'status-presale', next: 'design' },
        design: { name: 'Стадия П', color: 'status-design', next: 'ready' },
        ready: { name: 'Стадия Р', color: 'status-ready', next: 'construction' },
        construction: { name: 'Монтаж', color: 'status-construction', next: 'done' },
        done: { name: 'Завершён', color: 'status-done', next: null }
    };

    function loadProjects() {
        const saved = localStorage.getItem('sputnik_projects');
        if (saved) {
            try {
                projects = JSON.parse(saved);
            } catch(e) { console.error(e); }
        }
        if (!projects.length) {
            const today = new Date().toISOString().slice(0,10);
            const nextWeek = new Date(Date.now() + 7*86400000).toISOString().slice(0,10);
            projects = [
                {
                    id: '1',
                    name: 'Конференц-зал 1',
                    status: 'design',
                    statusStartDate: today,
                    nextStatus: 'ready',
                    nextStatusDate: nextWeek,
                    progress: 45,
                    startDate: '2026-03-01',
                    engineer: 'Иванов И.И.',
                    projectManager: 'Петров П.П.',
                    priority: false,
                    meetings: [
                        { date: '2026-03-10', subject: 'Согласование ТЗ' },
                        { date: '2026-03-20', subject: 'Промежуточный отчёт' }
                    ],
                    purchases: [
                        { name: 'LED-экран', status: 'ordered', date: '2026-03-15' },
                        { name: 'Кодек ВКС', status: 'delivered', date: '2026-03-18' }
                    ]
                },
                {
                    id: '2',
                    name: 'Ситуационный центр',
                    status: 'presale',
                    statusStartDate: today,
                    nextStatus: 'design',
                    nextStatusDate: nextWeek,
                    progress: 20,
                    startDate: '2026-03-25',
                    engineer: 'Сидоров С.С.',
                    projectManager: 'Петров П.П.',
                    priority: true,
                    meetings: [],
                    purchases: []
                },
                {
                    id: '3',
                    name: 'Диспетчерская',
                    status: 'done',
                    statusStartDate: '2026-02-01',
                    nextStatus: null,
                    nextStatusDate: null,
                    progress: 100,
                    startDate: '2026-01-10',
                    engineer: 'Кузнецов К.К.',
                    projectManager: 'Иванов И.И.',
                    priority: false,
                    meetings: [],
                    purchases: []
                }
            ];
            saveProjects();
        }
    }

    function saveProjects() {
        localStorage.setItem('sputnik_projects', JSON.stringify(projects));
    }

    function getStatusText(status) {
        return statuses[status]?.name || status;
    }

    function getStatusColor(status) {
        return statuses[status]?.color || 'status-presale';
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // ========== ОБЩАЯ СТАТИСТИКА ==========
    function renderStats() {
        const total = projects.length;
        const active = projects.filter(p => p.status !== 'done' && p.status !== 'archive').length;
        const presale = projects.filter(p => p.status === 'presale').length;
        const design = projects.filter(p => p.status === 'design').length;
        const ready = projects.filter(p => p.status === 'ready').length;
        const construction = projects.filter(p => p.status === 'construction').length;
        const urgent = projects.filter(p => p.priority === true).length;
        const archived = projects.filter(p => p.status === 'done').length;

        document.getElementById('statsTotal')?.setAttribute('data-value', total);
        document.getElementById('statsActive')?.setAttribute('data-value', active);
        document.getElementById('statsPresale')?.setAttribute('data-value', presale);
        document.getElementById('statsDesign')?.setAttribute('data-value', design);
        document.getElementById('statsReady')?.setAttribute('data-value', ready);
        document.getElementById('statsConstruction')?.setAttribute('data-value', construction);
        document.getElementById('statsUrgent')?.setAttribute('data-value', urgent);
        document.getElementById('statsArchived')?.setAttribute('data-value', archived);

        // Обновляем текст
        const statElements = ['Total', 'Active', 'Presale', 'Design', 'Ready', 'Construction', 'Urgent', 'Archived'];
        statElements.forEach(el => {
            const elem = document.getElementById(`stats${el}`);
            if (elem) elem.innerText = elem.getAttribute('data-value') || '0';
        });
    }

    // ========== ДАШБОРД ==========
    function renderDashboard() {
        renderStats();

        const recentList = document.getElementById('recentProjectsList');
        if (!recentList) return;

        recentList.innerHTML = projects.map(p => `
            <div class="project-card ${p.priority ? 'priority-card' : ''}" data-id="${p.id}">
                <div class="project-header">
                    <div class="project-name">${escapeHtml(p.name)}</div>
                    <div class="project-status ${getStatusColor(p.status)}">${getStatusText(p.status)}</div>
                    ${p.priority ? '<span class="priority-badge">Срочно</span>' : ''}
                </div>
                <div class="project-meta">
                    <div><i class="fas fa-calendar-alt"></i> Начало: ${p.startDate}</div>
                    <div><i class="fas fa-user"></i> Инженер: ${escapeHtml(p.engineer)}</div>
                    <div><i class="fas fa-user-tie"></i> РП: ${escapeHtml(p.projectManager)}</div>
                </div>
                <div class="project-progress-bar">
                    <div class="progress-fill" style="width: ${p.progress}%; background: ${p.priority ? '#f97316' : 'var(--accent)'}"></div>
                </div>
                <div class="project-roadmap">
                    <div class="roadmap-item">
                        <span class="roadmap-status current">${getStatusText(p.status)}</span>
                        <span class="roadmap-date">с ${p.statusStartDate}</span>
                        ${p.nextStatus ? `<span class="roadmap-arrow">→</span>
                        <span class="roadmap-status next">${getStatusText(p.nextStatus)}</span>
                        <span class="roadmap-date">с ${p.nextStatusDate}</span>` : ''}
                    </div>
                </div>
                <div class="project-details" style="display:none" id="details-${p.id}">
                    <div class="meetings-list">
                        <h4>Встречи</h4>
                        ${(p.meetings || []).map(m => `<div class="meeting-item">${m.date} — ${escapeHtml(m.subject)}</div>`).join('') || '<div>Нет встреч</div>'}
                    </div>
                    <div class="purchases-list">
                        <h4>Закупки</h4>
                        ${(p.purchases || []).map(pr => `<div class="purchase-item">${pr.name} — ${pr.status === 'ordered' ? 'Заказано' : 'Доставлено'} (${pr.date})</div>`).join('') || '<div>Нет закупок</div>'}
                    </div>
                </div>
                <button class="btn-small edit-project" data-id="${p.id}">Подробнее</button>
            </div>
        `).join('');
        if (!projects.length) recentList.innerHTML = '<div class="empty-state">Нет проектов. Создайте первый проект.</div>';

        document.querySelectorAll('.edit-project').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const details = document.getElementById(`details-${id}`);
                if (details) details.style.display = details.style.display === 'none' ? 'block' : 'none';
            });
        });
    }

    // ========== СОЗДАНИЕ ПРОЕКТА (расширенное) ==========
    function createNewProject() {
        const name = prompt('Название проекта:');
        if (!name) return;
        const engineer = prompt('Инженер проекта:');
        const projectManager = prompt('Руководитель проекта (РП):');
        const today = new Date().toISOString().slice(0,10);
        const nextWeek = new Date(Date.now() + 7*86400000).toISOString().slice(0,10);
        const newProject = {
            id: Date.now().toString(),
            name: name,
            status: 'presale',
            statusStartDate: today,
            nextStatus: 'design',
            nextStatusDate: nextWeek,
            progress: 0,
            startDate: today,
            engineer: engineer || '',
            projectManager: projectManager || '',
            priority: false,
            meetings: [],
            purchases: []
        };
        projects.push(newProject);
        saveProjects();
        renderDashboard();
        switchToSection('projects');
    }

    // ========== ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ (остаётся без изменений) ==========
    function switchToSection(section) {
        console.log('switchToSection:', section);
        currentSection = section;
        document.querySelectorAll('.topbar-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === section);
        });
        document.querySelectorAll('.section-container').forEach(container => {
            container.classList.toggle('active', container.id === `${section}Container`);
        });
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        if (section === 'calculations') {
            if (sidebar) sidebar.classList.remove('hidden');
            if (mainContent) mainContent.classList.remove('full-width');
        } else {
            if (sidebar) sidebar.classList.add('hidden');
            if (mainContent) mainContent.classList.add('full-width');
        }
        if (section === 'dashboard') renderDashboard();
        if (section === 'projects') renderProjectsList();
        if (section === 'templates') renderTemplates();
    }

    // ========== ПРОЕКТЫ (список) – упрощённо, но можно расширить ==========
    function renderProjectsList(activeId = null) {
        const container = document.getElementById('projectsList');
        if (!container) return;
        container.innerHTML = projects.map(p => `
            <div class="project-card ${p.priority ? 'priority-card' : ''}">
                <div class="project-header">
                    <div class="project-name">${escapeHtml(p.name)}</div>
                    <div class="project-status ${getStatusColor(p.status)}">${getStatusText(p.status)}</div>
                    ${p.priority ? '<span class="priority-badge">Срочно</span>' : ''}
                </div>
                <div class="project-meta">
                    <div><i class="fas fa-calendar-alt"></i> Начало: ${p.startDate}</div>
                    <div><i class="fas fa-user"></i> Инженер: ${escapeHtml(p.engineer)}</div>
                    <div><i class="fas fa-user-tie"></i> РП: ${escapeHtml(p.projectManager)}</div>
                </div>
                <div class="project-progress-bar">
                    <div class="progress-fill" style="width: ${p.progress}%; background: ${p.priority ? '#f97316' : 'var(--accent)'}"></div>
                </div>
                <div class="project-actions">
                    <button class="btn-small edit-project-details" data-id="${p.id}">Редактировать</button>
                    <button class="btn-small delete-project" data-id="${p.id}">Удалить</button>
                </div>
            </div>
        `).join('');
        if (!projects.length) container.innerHTML = '<div class="empty-state">Нет проектов. Нажмите "Новый проект".</div>';

        // Обработчики (упрощённо)
        document.querySelectorAll('.edit-project-details').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                alert('Редактирование проекта пока в разработке');
            });
        });
        document.querySelectorAll('.delete-project').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                if (confirm('Удалить проект?')) {
                    projects = projects.filter(p => p.id !== id);
                    saveProjects();
                    renderDashboard();
                    renderProjectsList();
                }
            });
        });
    }

    function renderTemplates() {
        const projectSelect = document.getElementById('templateProjectSelect');
        if (projectSelect) {
            projectSelect.innerHTML = '<option value="">— Не привязывать —</option>' + projects.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
        }
    }

    function generateDocument() {
        const templateType = document.getElementById('templateSelect')?.value || 'explanatory';
        const selectedSubsystems = Array.from(document.querySelectorAll('#subsystemsChecklist input:checked')).map(cb => cb.value);
        const projectId = document.getElementById('templateProjectSelect')?.value;
        const project = projects.find(p => p.id === projectId);
        let content = '';

        if (templateType === 'explanatory') {
            content = `# Пояснительная записка\n\n`;
            content += `## Состав подсистем\n`;
            selectedSubsystems.forEach(s => {
                if (s === 'display') content += `- Подсистема отображения: проектирование видеостены с использованием LED-экранов и матричных коммутаторов.\n`;
                if (s === 'vks') content += `- ВКС: организация видеоконференцсвязи с использованием кодеков H.264/H.265, расчёт битрейта.\n`;
                if (s === 'sound') content += `- Звукоусиление: расчёт акустических параметров, подбор громкоговорителей.\n`;
                if (s === 'led') content += `- LED-экраны: расчёт шага пикселя, физических размеров, мощности.\n`;
                if (s === 'control') content += `- Управление: централизованная система управления на базе AV-контроллеров.\n`;
            });
            if (project) {
                content += `\n## Данные проекта\n`;
                content += `- Название: ${project.name}\n`;
                content += `- Статус: ${getStatusText(project.status)}\n`;
                content += `- Дата начала: ${project.startDate}\n`;
                content += `- Инженер: ${project.engineer}\n`;
                content += `- Руководитель проекта: ${project.projectManager}\n`;
            }
        } else if (templateType === 'specification') {
            content = `# Спецификация оборудования\n\n`;
            content += `| Наименование | Кол-во | Примечание |\n|-------------|--------|------------|\n`;
            selectedSubsystems.forEach(s => {
                if (s === 'display') content += `| Видеостена LED | 1 | По расчёту |\n`;
                if (s === 'vks') content += `| Кодек ВКС | 1 | H.264 |\n`;
                if (s === 'sound') content += `| Громкоговорители | 4 | Потолочные |\n`;
            });
        } else if (templateType === 'act') {
            content = `# Акт выполненных работ\n\n`;
            content += `Выполнены работы по проекту ${project ? project.name : '…'}\n`;
            content += `Состав работ:\n`;
            selectedSubsystems.forEach(s => {
                if (s === 'display') content += `- Монтаж видеостены\n`;
                if (s === 'vks') content += `- Настройка ВКС\n`;
                if (s === 'sound') content += `- Монтаж акустических систем\n`;
            });
        }

        const previewDiv = document.getElementById('documentPreview');
        const previewContent = document.getElementById('previewContent');
        if (previewDiv && previewContent) {
            previewContent.innerHTML = `<pre style="white-space: pre-wrap; font-family: monospace;">${escapeHtml(content)}</pre>`;
            previewDiv.style.display = 'block';
            const copyBtn = document.getElementById('copyDocBtn');
            if (copyBtn) copyBtn.onclick = () => {
                navigator.clipboard.writeText(content);
                alert('Текст скопирован');
            };
        }
    }

    function init() {
        console.log('TopbarModule.init() called');
        loadProjects();
        renderDashboard();

        const btns = document.querySelectorAll('.topbar-btn');
        console.log('Найдено кнопок топбара:', btns.length);
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('Нажата кнопка:', btn.dataset.section);
                switchToSection(btn.dataset.section);
            });
        });

        const createBtn = document.getElementById('createProjectBtn');
        if (createBtn) createBtn.addEventListener('click', createNewProject);
        const generateBtn = document.getElementById('generateDocBtn');
        if (generateBtn) generateBtn.addEventListener('click', generateDocument);

        switchToSection('dashboard');
    }

    return { init };
})();
