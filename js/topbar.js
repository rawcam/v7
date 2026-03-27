// topbar.js – стабильная версия
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
                    <span class="meeting-project">
