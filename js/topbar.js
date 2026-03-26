// topbar.js – дашборд с виджетами
const TopbarModule = (function() {
    let currentSection = 'dashboard';
    let projects = [];

    console.log('topbar.js loaded');

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
                    budget: 1250000,
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
                    budget: 3450000,
                    engineer: 'Сидоров С.С.',
                    projectManager: 'Петров П.П.',
                    priority: true,
                    meetings: [],
                    purchases: []
                },
                {
                    id: '3',
                    name: 'Диспетчерская',
                    status: 'construction',
                    statusStartDate: '2026-02-15',
                    nextStatus: 'done',
                    nextStatusDate: '2026-04-01',
                    progress: 70,
                    startDate: '2026-02-01',
                    budget: 890000,
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

    function formatCurrency(value) {
        return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(value);
    }

    // ========== ОБЩАЯ СТАТИСТИКА ==========
    function renderStats() {
        const total = projects.length;
        const active = projects.filter(p => p.status !== 'done').length;
        const presale = projects.filter(p => p.status === 'presale').length;
        const design = projects.filter(p => p.status === 'design').length;
        const ready = projects.filter(p => p.status === 'ready').length;
        const construction = projects.filter(p => p.status === 'construction').length;
        const urgent = projects.filter(p => p.priority === true).length;
        const archived = projects.filter(p => p.status === 'done').length;

        document.getElementById('statsTotal').innerText = total;
        document.getElementById('statsActive').innerText = active;
        document.getElementById('statsPresale').innerText = presale;
        document.getElementById('statsDesign').innerText = design;
        document.getElementById('statsReady').innerText = ready;
        document.getElementById('statsConstruction').innerText = construction;
        document.getElementById('statsUrgent').innerText = urgent;
        document.getElementById('statsArchived').innerText = archived;
    }

    // ========== ВИДЖЕТ ВСТРЕЧ ==========
    function renderMeetingsWidget() {
        const allMeetings = [];
        projects.forEach(project => {
            if (project.meetings) {
                project.meetings.forEach(meeting => {
                    allMeetings.push({
                        ...meeting,
                        projectName: project.name,
                        projectId: project.id
                    });
                });
            }
        });
        allMeetings.sort((a, b) => new Date(a.date) - new Date(b.date));
        const upcoming = allMeetings.slice(0, 3);
        const totalMeetings = allMeetings.length;

        const container = document.getElementById('meetingsWidget');
        if (!container) return;
        container.innerHTML = `
            <div class="stat-number">${totalMeetings}</div>
            <div class="stat-label">всего встреч</div>
            <div class="upcoming-meetings">
                ${upcoming.map(m => `
                    <div class="meeting-item">
                        <span class="meeting-date">${m.date}</span>
                        <span class="meeting-subject">${escapeHtml(m.subject)}</span>
                        <span class="meeting-project">${escapeHtml(m.projectName)}</span>
                    </div>
                `).join('')}
                ${upcoming.length === 0 ? '<div class="meeting-item">Нет предстоящих встреч</div>' : ''}
            </div>
        `;
    }

    // ========== ВИДЖЕТ СРОЧНЫХ ПРОЕКТОВ ==========
    function renderUrgentWidget() {
        const urgentProjects = projects.filter(p => p.priority === true && p.status !== 'done');
        const container = document.getElementById('urgentProjectsWidget');
        if (!container) return;
        if (urgentProjects.length === 0) {
            container.innerHTML = '<div class="stat-number">0</div><div class="stat-label">срочных проектов</div><div class="no-urgent">Нет срочных проектов</div>';
            return;
        }
        container.innerHTML = `
            <div class="stat-number">${urgentProjects.length}</div>
            <div class="stat-label">срочных проектов</div>
            <div class="urgent-list">
                ${urgentProjects.map(p => `
                    <div class="urgent-item">
                        <span class="urgent-name">${escapeHtml(p.name)}</span>
                        <span class="urgent-status ${getStatusColor(p.status)}">${getStatusText(p.status)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ========== ВИДЖЕТЫ ПРОЕКТОВ (карточки) ==========
    function renderProjectCards() {
        const activeProjects = projects.filter(p => p.status !== 'done');
        const container = document.getElementById('projectCardsContainer');
        if (!container) return;
        container.innerHTML = activeProjects.map(p => `
            <div class="project-card ${p.priority ? 'priority-card' : ''}" data-id="${p.id}">
                <div class="project-header">
                    <div class="project-name">${escapeHtml(p.name)}</div>
                    <div class="project-status ${getStatusColor(p.status)}">${getStatusText(p.status)}</div>
                    ${p.priority ? '<span class="priority-badge">Срочно</span>' : ''}
                </div>
                <div class="project-meta">
                    <div><i class="fas fa-calendar-alt"></i> Начало: ${p.startDate}</div>
                    <div><i class="fas fa-ruble-sign"></i> Бюджет: ${formatCurrency(p.budget)}</div>
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
                <details class="project-details">
                    <summary>Встречи и закупки</summary>
                    <div class="meetings-list">
                        <h4>Встречи</h4>
                        ${(p.meetings || []).map(m => `<div class="meeting-item">${m.date} — ${escapeHtml(m.subject)}</div>`).join('') || '<div>Нет встреч</div>'}
                    </div>
                    <div class="purchases-list">
                        <h4>Закупки</h4>
                        ${(p.purchases || []).map(pr => `<div class="purchase-item">${pr.name} — ${pr.status === 'ordered' ? 'Заказано' : 'Доставлено'} (${pr.date})</div>`).join('') || '<div>Нет закупок</div>'}
                    </div>
                </details>
            </div>
        `).join('');
        if (activeProjects.length === 0) container.innerHTML = '<div class="empty-state">Нет активных проектов</div>';
    }

    function renderDashboard() {
        renderStats();
        renderProjectCards();
        renderUrgentWidget();
        renderMeetingsWidget();
    }

    function createNewProject() {
        const name = prompt('Название проекта:');
        if (!name) return;
        const budget = prompt('Бюджет проекта (в рублях):');
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
            budget: parseInt(budget) || 0,
            engineer: engineer || '',
            projectManager: projectManager || '',
            priority: false,
            meetings: [],
            purchases: []
        };
        projects.push(newProject);
        saveProjects();
        renderDashboard();
    }

    // ========== ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ ==========
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

    // ========== ПРОЕКТЫ (список) – упрощённо ==========
    function renderProjectsList(activeId = null) {
        const container = document.getElementById('projectsList');
        if (!container) return;
        container.innerHTML = projects.map(p => `
            <div class="project-card">
                <div class="project-header">
                    <div class="project-name">${escapeHtml(p.name)}</div>
                    <div class="project-status ${getStatusColor(p.status)}">${getStatusText(p.status)}</div>
                </div>
                <div class="project-meta">
                    <div><i class="fas fa-ruble-sign"></i> ${formatCurrency(p.budget)}</div>
                    <div><i class="fas fa-user"></i> ${escapeHtml(p.engineer)}</div>
                </div>
                <div class="project-actions">
                    <button class="btn-small edit-project" data-id="${p.id}">Редактировать</button>
                    <button class="btn-small delete-project" data-id="${p.id}">Удалить</button>
                </div>
            </div>
        `).join('');
        if (!projects.length) container.innerHTML = '<div class="empty-state">Нет проектов. Нажмите "Новый проект".</div>';

        document.querySelectorAll('.edit-project').forEach(btn => {
            btn.addEventListener('click', () => alert('Редактирование в разработке'));
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
                content += `- Бюджет: ${formatCurrency(project.budget)}\n`;
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
        btns.forEach(btn => {
            btn.addEventListener('click', () => switchToSection(btn.dataset.section));
        });

        const createBtn = document.getElementById('createProjectBtn');
        if (createBtn) createBtn.addEventListener('click', createNewProject);
        const generateBtn = document.getElementById('generateDocBtn');
        if (generateBtn) generateBtn.addEventListener('click', generateDocument);

        switchToSection('dashboard');
    }

    return { init };
})();
