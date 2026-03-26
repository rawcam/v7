// topbar.js (финальная версия)
const TopbarModule = (function() {
    let currentSection = 'dashboard';
    let projects = [];
    let projectsSwiper = null;

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
                    progress: 30,
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
                    progress: 10,
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
                    progress: 80,
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
    function renderStatsCard() {
        const total = projects.length;
        const active = projects.filter(p => p.status !== 'done').length;
        const presale = projects.filter(p => p.status === 'presale').length;
        const design = projects.filter(p => p.status === 'design').length;
        const ready = projects.filter(p => p.status === 'ready').length;
        const construction = projects.filter(p => p.status === 'construction').length;
        const urgent = projects.filter(p => p.priority === true).length;
        const archived = projects.filter(p => p.status === 'done').length;

        const container = document.getElementById('statsCard');
        if (!container) return;
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item"><span class="stat-label">Всего проектов</span><span class="stat-number">${total}</span></div>
                <div class="stat-item"><span class="stat-label">Активные</span><span class="stat-number">${active}</span></div>
                <div class="stat-item"><span class="stat-label">Ожидают оплату</span><span class="stat-number">${presale}</span></div>
                <div class="stat-item"><span class="stat-label">Стадия П</span><span class="stat-number">${design}</span></div>
                <div class="stat-item"><span class="stat-label">Стадия Р</span><span class="stat-number">${ready}</span></div>
                <div class="stat-item"><span class="stat-label">Монтаж</span><span class="stat-number">${construction}</span></div>
                <div class="stat-item urgent-stat"><span class="stat-label">Срочные</span><span class="stat-number">${urgent}</span></div>
                <div class="stat-item"><span class="stat-label">В архиве</span><span class="stat-number">${archived}</span></div>
            </div>
        `;
    }

    // ========== ВИДЖЕТЫ ==========
    function renderBudgetWidget() {
        const activeProjects = projects.filter(p => p.status !== 'done');
        const totalBudget = activeProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const container = document.getElementById('budgetWidget');
        if (!container) return;
        container.innerHTML = `
            <div class="project-header">
                <div class="project-name">Общий бюджет активных проектов</div>
            </div>
            <div class="stat-number" style="font-size: 1.8rem;">${formatCurrency(totalBudget)}</div>
        `;
    }

    function renderProgressWidget() {
        const activeProjects = projects.filter(p => p.status !== 'done');
        const avgProgress = activeProjects.length
            ? Math.round(activeProjects.reduce((sum, p) => sum + p.progress, 0) / activeProjects.length)
            : 0;
        const container = document.getElementById('progressWidget');
        if (!container) return;
        container.innerHTML = `
            <div class="project-header">
                <div class="project-name">Средний прогресс</div>
            </div>
            <div class="stat-number" style="font-size: 1.8rem;">${avgProgress}%</div>
        `;
    }

    function renderUrgentWidget() {
        const urgentProjects = projects.filter(p => p.priority === true && p.status !== 'done');
        const container = document.getElementById('urgentProjectsWidget');
        if (!container) return;
        if (urgentProjects.length === 0) {
            container.innerHTML = `
                <div class="project-header">
                    <div class="project-name">Срочные проекты</div>
                </div>
                <div class="empty-state">Нет срочных проектов</div>
            `;
            return;
        }
        container.innerHTML = `
            <div class="project-header">
                <div class="project-name">Срочные проекты</div>
                <div class="project-status urgent-stat">${urgentProjects.length}</div>
            </div>
            ${urgentProjects.map(p => `
                <div class="urgent-item" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-light);">
                    <span class="urgent-name">${escapeHtml(p.name)}</span>
                    <span class="urgent-status ${getStatusColor(p.status)}">${getStatusText(p.status)}</span>
                </div>
            `).join('')}
        `;
    }

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
            <div class="project-header">
                <div class="project-name">Встречи</div>
                <div class="project-status">${totalMeetings}</div>
            </div>
            ${upcoming.map(m => `
                <div class="meeting-item" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed var(--border-light);">
                    <span class="meeting-date">${m.date}</span>
                    <span class="meeting-subject">${escapeHtml(m.subject)}</span>
                    <span class="meeting-project">${escapeHtml(m.projectName)}</span>
                </div>
            `).join('')}
            ${upcoming.length === 0 ? '<div class="empty-state">Нет предстоящих встреч</div>' : ''}
        `;
    }

    // ========== ВИДЖЕТ ЗАГРУЗКИ СОТРУДНИКОВ ==========
    function renderWorkloadWidget() {
        const engineers = {};
        const managers = {};

        projects.forEach(project => {
            const isActive = project.status !== 'done';
            if (project.engineer && isActive) {
                engineers[project.engineer] = (engineers[project.engineer] || 0) + 1;
            }
            if (project.projectManager && isActive) {
                managers[project.projectManager] = (managers[project.projectManager] || 0) + 1;
            }
        });

        const maxEngineerLoad = Math.max(...Object.values(engineers), 1);
        const maxManagerLoad = Math.max(...Object.values(managers), 1);

        let engineersHtml = '';
        for (const [name, count] of Object.entries(engineers).sort((a,b) => b[1] - a[1])) {
            const percent = (count / maxEngineerLoad) * 100;
            engineersHtml += `
                <div class="workload-item">
                    <span class="workload-name clickable" data-person="${escapeHtml(name)}" data-role="engineer">${escapeHtml(name)}</span>
                    <span class="workload-count">${count} проект(ов)</span>
                    <div class="progress-bar-container small">
                        <div class="progress-fill" style="width: ${percent}%; background: var(--accent);"></div>
                    </div>
                </div>
            `;
        }
        let managersHtml = '';
        for (const [name, count] of Object.entries(managers).sort((a,b) => b[1] - a[1])) {
            const percent = (count / maxManagerLoad) * 100;
            managersHtml += `
                <div class="workload-item">
                    <span class="workload-name clickable" data-person="${escapeHtml(name)}" data-role="manager">${escapeHtml(name)}</span>
                    <span class="workload-count">${count} проект(ов)</span>
                    <div class="progress-bar-container small">
                        <div class="progress-fill" style="width: ${percent}%; background: var(--accent);"></div>
                    </div>
                </div>
            `;
        }

        const totalActive = projects.filter(p => p.status !== 'done').length;
        const avgEngineerLoad = Object.values(engineers).length ? (Object.values(engineers).reduce((a,b) => a+b,0) / Object.values(engineers).length).toFixed(1) : 0;
        const avgManagerLoad = Object.values(managers).length ? (Object.values(managers).reduce((a,b) => a+b,0) / Object.values(managers).length).toFixed(1) : 0;

        const container = document.getElementById('workloadWidget');
        if (!container) return;

        container.innerHTML = `
            <div class="project-header">
                <div class="project-name">Загрузка сотрудников</div>
            </div>
            <div class="workload-stats">
                <div class="stat-summary">Активных проектов: <strong>${totalActive}</strong></div>
                <div class="stat-summary">Средняя загрузка инженеров: <strong>${avgEngineerLoad}</strong> проект(ов)</div>
                <div class="stat-summary">Средняя загрузка РП: <strong>${avgManagerLoad}</strong> проект(ов)</div>
            </div>
            <details class="workload-details">
                <summary>Инженеры</summary>
                <div class="workload-list">${engineersHtml || '<div>Нет активных проектов</div>'}</div>
            </details>
            <details class="workload-details">
                <summary>Руководители проектов</summary>
                <div class="workload-list">${managersHtml || '<div>Нет активных проектов</div>'}</div>
            </details>
        `;

        document.querySelectorAll('.workload-name.clickable').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const person = el.dataset.person;
                const role = el.dataset.role;
                showProjectsModal(person, role);
            });
        });
    }

    function showProjectsModal(person, role) {
        const filteredProjects = projects.filter(p => {
            if (role === 'engineer') return p.engineer === person && p.status !== 'done';
            if (role === 'manager') return p.projectManager === person && p.status !== 'done';
            return false;
        });

        if (filteredProjects.length === 0) {
            alert(`У ${person} нет активных проектов.`);
            return;
        }

        const modalHtml = `
            <div class="modal" id="projectsModal" style="display: flex;">
                <div class="modal-content" style="max-width: 600px;">
                    <span class="modal-close" id="closeModalBtn">&times;</span>
                    <h3>Проекты (${role === 'engineer' ? 'инженер' : 'руководитель'}) — ${escapeHtml(person)}</h3>
                    <div style="max-height: 60vh; overflow-y: auto;">
                        <table style="width:100%; margin-top:16px;">
                            <thead>
                                <tr>
                                    <th>Название</th>
                                    <th>Статус</th>
                                    <th>Прогресс</th>
                                    <th>Начало</th>
                                 </tr>
                            </thead>
                            <tbody>
                                ${filteredProjects.map(p => `
                                    <tr style="cursor:pointer;" class="project-row" data-id="${p.id}">
                                         <td>${escapeHtml(p.name)}</td>
                                         <td>${getStatusText(p.status)}</td>
                                         <td>${p.progress}%</td>
                                         <td>${p.startDate}</td>
                                     </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="modal-buttons">
                        <button class="btn-primary" id="closeModalBtn2">Закрыть</button>
                    </div>
                </div>
            </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);

        const modal = modalContainer.querySelector('.modal');
        const closeModal = () => modal.remove();

        modal.querySelector('#closeModalBtn').addEventListener('click', closeModal);
        modal.querySelector('#closeModalBtn2').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

        modal.querySelectorAll('.project-row').forEach(row => {
            row.addEventListener('click', () => {
                const id = row.dataset.id;
                if (id && typeof ProjectDetail !== 'undefined') {
                    closeModal();
                    if (typeof TopbarModule !== 'undefined' && TopbarModule.switchToSection) {
                        TopbarModule.switchToSection('projects');
                    }
                    ProjectDetail.showDetail(id);
                }
            });
        });
    }

    // ========== АКТИВНЫЕ ПРОЕКТЫ (КАРУСЕЛЬ) ==========
    function renderProjectCards() {
        const activeProjects = projects.filter(p => p.status !== 'done');
        const container = document.getElementById('projectCardsContainer');
        if (!container) return;
        container.innerHTML = activeProjects.map(p => `
            <div class="swiper-slide">
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
            </div>
        `).join('');
        if (activeProjects.length === 0) container.innerHTML = '<div class="empty-state">Нет активных проектов</div>';
        initProjectsSwiper();
    }

    function initProjectsSwiper() {
        if (projectsSwiper) projectsSwiper.destroy(true, true);
        const container = document.getElementById('projectsSwiperContainer');
        if (!container) return;
        if (document.querySelectorAll('#projectCardsContainer .swiper-slide').length === 0) return;
        projectsSwiper = new Swiper(container, {
            slidesPerView: 1,
            spaceBetween: 24,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
            },
        });
    }

    // ========== ДАШБОРД ==========
    function renderDashboard() {
        renderStatsCard();
        renderBudgetWidget();
        renderProgressWidget();
        renderUrgentWidget();
        renderMeetingsWidget();
        renderWorkloadWidget();
        renderProjectCards();
    }

    // ========== УПРАВЛЕНИЕ ПРОЕКТАМИ ==========
    function renderProjectsList() {
        const container = document.getElementById('projectsList');
        if (!container) return;
        container.innerHTML = projects.map(p => `
            <div class="project-card" data-id="${p.id}">
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
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                if (id && typeof ProjectDetail !== 'undefined') {
                    ProjectDetail.showDetail(id);
                }
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
            progress: 10,
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
        if (typeof ProjectDetail !== 'undefined') {
            ProjectDetail.showDetail(newProject.id);
        }
    }

    // ========== ШАБЛОНЫ ==========
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

    // ========== ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ (ЖЁСТКОЕ УПРАВЛЕНИЕ) ==========
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

        // Жёсткое управление контейнерами проектов
        const projectsContainer = document.getElementById('projectsContainer');
        const detailContainer = document.getElementById('projectDetailContainer');

        if (section !== 'projects') {
            if (projectsContainer) projectsContainer.style.display = 'none';
            if (detailContainer) {
                detailContainer.style.display = 'none';
                detailContainer.innerHTML = '';
            }
            if (typeof ProjectDetail !== 'undefined' && ProjectDetail.hideDetail) {
                ProjectDetail.hideDetail();
            }
        } else {
            if (projectsContainer) projectsContainer.style.display = 'block';
            if (detailContainer) detailContainer.style.display = 'none';
            renderProjectsList();
        }

        if (section === 'dashboard') renderDashboard();
        if (section === 'templates') renderTemplates();
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    function init() {
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

    return { init, renderDashboard, renderProjectsList, switchToSection };
})();
