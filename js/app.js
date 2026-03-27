// app.js
(function() {
    let calculationsInitialized = false;

    // Модули, не зависящие от сайдбара
    if (typeof LoggerModule !== 'undefined') LoggerModule.init();
    if (typeof StorageModule !== 'undefined') StorageModule.init();

    // Функция обновления дашборда (виджеты)
    window.updateDashboard = function() {
        console.log('updateDashboard called');
        const projects = window.appState?.projects || [];
        if (!projects.length) {
            console.warn('No projects found');
            // Заполняем пустыми данными, чтобы виджеты не были пустыми
            document.getElementById('statsCard').innerHTML = '<div class="stats-grid"><div class="stat-item"><span class="stat-label">Нет проектов</span><span class="stat-number">0</span></div></div>';
            document.getElementById('budgetWidget').innerHTML = '<div class="widget-value">0 ₽</div><div class="stat-label">Общий бюджет</div>';
            document.getElementById('progressWidget').innerHTML = '<div class="widget-value">0%</div><div class="stat-label">Средний прогресс</div>';
            document.getElementById('urgentProjectsWidget').innerHTML = '<div class="widget-value">0</div><div class="stat-label">Срочные проекты</div>';
            document.getElementById('meetingsWidget').innerHTML = '<div class="widget-value">0</div><div class="stat-label">Встречи</div>';
            document.getElementById('workloadWidget').innerHTML = '<div class="widget-value">—</div><div class="stat-label">Загрузка</div>';
            return;
        }

        // Статистика
        const total = projects.length;
        const active = projects.filter(p => p.status !== 'Архив' && p.status !== 'Сдан').length;
        const awaitingPayment = projects.filter(p => p.status === 'Ожидает оплату').length;
        const stageP = projects.filter(p => p.status === 'Стадия П').length;
        const stageR = projects.filter(p => p.status === 'Стадия Р').length;
        const installation = projects.filter(p => p.status === 'Монтаж').length;
        const urgent = projects.filter(p => p.priority === 'Срочный').length;
        const archived = projects.filter(p => p.status === 'Архив').length;

        const statsHtml = `
            <div class="stats-grid">
                <div class="stat-item"><span class="stat-label">Всего</span><span class="stat-number">${total}</span></div>
                <div class="stat-item"><span class="stat-label">Активные</span><span class="stat-number">${active}</span></div>
                <div class="stat-item"><span class="stat-label">Ожидают оплату</span><span class="stat-number">${awaitingPayment}</span></div>
                <div class="stat-item"><span class="stat-label">Стадия П</span><span class="stat-number">${stageP}</span></div>
                <div class="stat-item"><span class="stat-label">Стадия Р</span><span class="stat-number">${stageR}</span></div>
                <div class="stat-item"><span class="stat-label">Монтаж</span><span class="stat-number">${installation}</span></div>
                <div class="stat-item urgent-stat"><span class="stat-label">Срочные</span><span class="stat-number">${urgent}</span></div>
                <div class="stat-item"><span class="stat-label">Архив</span><span class="stat-number">${archived}</span></div>
            </div>
        `;
        document.getElementById('statsCard').innerHTML = statsHtml;

        // Бюджет активных проектов
        const totalBudget = projects.filter(p => p.status !== 'Архив' && p.status !== 'Сдан')
            .reduce((sum, p) => sum + (p.budget || 0), 0);
        document.getElementById('budgetWidget').innerHTML = `
            <div class="widget-value">${totalBudget.toLocaleString()} ₽</div>
            <div class="stat-label">Общий бюджет активных проектов</div>
        `;

        // Средний прогресс (на основе статуса)
        const progressMap = { 'Активный': 30, 'Стадия П': 50, 'Стадия Р': 70, 'Монтаж': 85, 'Сдан': 100 };
        const activeProjects = projects.filter(p => p.status !== 'Архив');
        const avgProgress = activeProjects.length ? Math.round(activeProjects.reduce((sum, p) => sum + (progressMap[p.status] || 0), 0) / activeProjects.length) : 0;
        document.getElementById('progressWidget').innerHTML = `
            <div class="widget-value">${avgProgress}%</div>
            <div class="stat-label">Средний прогресс</div>
        `;

        // Срочные проекты
        const urgentProjects = projects.filter(p => p.priority === 'Срочный');
        let urgentHtml = `<div class="widget-value">${urgentProjects.length}</div><div class="stat-label">Срочные проекты</div>`;
        if (urgentProjects.length) {
            urgentHtml += `<ul class="urgent-list">${urgentProjects.map(p => `<li>${escapeHtml(p.name)}</li>`).join('')}</ul>`;
        }
        document.getElementById('urgentProjectsWidget').innerHTML = urgentHtml;

        // Встречи (заглушка, можно заменить реальными данными)
        const meetings = [
            { title: 'Согласование ТЗ', date: '2026-03-10', place: 'Конференц-зал 1' },
            { title: 'Промежуточный отчёт', date: '2026-03-20', place: 'Конференц-зал 1' }
        ];
        document.getElementById('meetingsWidget').innerHTML = `
            <div class="widget-value">${meetings.length}</div>
            <div class="stat-label">Встречи</div>
            <ul class="meetings-list">${meetings.map(m => `<li>${m.date} ${escapeHtml(m.title)}</li>`).join('')}</ul>
        `;

        // Загрузка сотрудников
        const engineers = {};
        const projectManagers = {};
        projects.forEach(p => {
            if (p.engineer) engineers[p.engineer] = (engineers[p.engineer] || 0) + 1;
            if (p.projectManager) projectManagers[p.projectManager] = (projectManagers[p.projectManager] || 0) + 1;
        });
        const avgEngineerLoad = Object.keys(engineers).length ? (Object.values(engineers).reduce((a,b)=>a+b,0) / Object.keys(engineers).length).toFixed(1) : 0;
        const avgPmLoad = Object.keys(projectManagers).length ? (Object.values(projectManagers).reduce((a,b)=>a+b,0) / Object.keys(projectManagers).length).toFixed(1) : 0;

        const workloadHtml = `
            <div class="workload-stats">
                <div class="stat-summary">Активных проектов: ${active}</div>
                <div class="stat-summary">Средняя загрузка инженеров: ${avgEngineerLoad} проект(ов)</div>
                <div class="stat-summary">Средняя загрузка РП: ${avgPmLoad} проект(ов)</div>
            </div>
            <details class="workload-details">
                <summary>Инженеры</summary>
                <div class="workload-list">${Object.entries(engineers).map(([name, count]) => `
                    <div class="workload-item">
                        <span class="workload-name">${escapeHtml(name)}</span>
                        <span class="workload-count">${count} проект(ов)</span>
                        <div class="progress-bar-container small">
                            <div class="progress-fill" style="width: ${Math.min(100, count * 20)}%; background: var(--accent);"></div>
                        </div>
                    </div>
                `).join('')}</div>
            </details>
            <details class="workload-details">
                <summary>Руководители проектов</summary>
                <div class="workload-list">${Object.entries(projectManagers).map(([name, count]) => `
                    <div class="workload-item">
                        <span class="workload-name">${escapeHtml(name)}</span>
                        <span class="workload-count">${count} проект(ов)</span>
                        <div class="progress-bar-container small">
                            <div class="progress-fill" style="width: ${Math.min(100, count * 20)}%; background: var(--accent);"></div>
                        </div>
                    </div>
                `).join('')}</div>
            </details>
        `;
        document.getElementById('workloadWidget').innerHTML = workloadHtml;
    };

    // Инициализация модулей расчётов (при переходе на вкладку)
    function initCalculationsModules() {
        if (calculationsInitialized) return;
        calculationsInitialized = true;
        if (typeof Accordion !== 'undefined') Accordion.init();
        if (typeof VideoModule !== 'undefined') VideoModule.init();
        if (typeof NetworkModule !== 'undefined') NetworkModule.init();
        if (typeof TractsModule !== 'undefined') TractsModule.init();
        if (typeof LedModule !== 'undefined') LedModule.init();
        if (typeof SoundModule !== 'undefined') SoundModule.init();
        if (typeof VcModule !== 'undefined') VcModule.init();
        if (typeof ErgoModule !== 'undefined') ErgoModule.init();
        if (typeof PowerModule !== 'undefined') PowerModule.init();
        if (typeof SidebarEditor !== 'undefined') SidebarEditor.init();
    }

    function waitForCalculations() {
        const checkInterval = setInterval(() => {
            const calculationsContainer = document.getElementById('calculationsContainer');
            if (calculationsContainer && calculationsContainer.classList.contains('active')) {
                clearInterval(checkInterval);
                initCalculationsModules();
            }
        }, 100);
    }
    waitForCalculations();

    // Тема и сайдбар
    function initTheme() {
        const themeSwitch = document.getElementById('themeSwitch');
        const topbarThemeSwitch = document.getElementById('topbarThemeSwitch');
        function setTheme(theme) {
            if(theme === 'dark'){
                document.body.classList.add('dark');
                if (themeSwitch) themeSwitch.innerHTML = '<i class="fas fa-moon"></i>';
                if (topbarThemeSwitch) topbarThemeSwitch.innerHTML = '<i class="fas fa-moon"></i>';
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark');
                if (themeSwitch) themeSwitch.innerHTML = '<i class="fas fa-sun"></i>';
                if (topbarThemeSwitch) topbarThemeSwitch.innerHTML = '<i class="fas fa-sun"></i>';
                localStorage.setItem('theme', 'light');
            }
        }
        const handleClick = () => setTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
        if (themeSwitch) themeSwitch.addEventListener('click', handleClick);
        if (topbarThemeSwitch) topbarThemeSwitch.addEventListener('click', handleClick);
        if (localStorage.getItem('theme') === 'dark') setTheme('dark');
    }

    function initSidebarCollapse() {
        const sidebar = document.getElementById('sidebar');
        const collapseBtn = document.getElementById('collapseSidebarBtn');
        if (!sidebar || !collapseBtn) return;
        function setSidebarCollapsed(collapsed) {
            if(collapsed){
                sidebar.classList.add('collapsed');
                collapseBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
                localStorage.setItem('sidebarCollapsed', 'true');
            } else {
                sidebar.classList.remove('collapsed');
                collapseBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
                localStorage.setItem('sidebarCollapsed', 'false');
            }
        }
        collapseBtn.addEventListener('click', () => setSidebarCollapsed(!sidebar.classList.contains('collapsed')));
        if (localStorage.getItem('sidebarCollapsed') === 'true') setSidebarCollapsed(true);
    }

    function initMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const mobileToggle = document.getElementById('mobileMenuToggle');
        if (mobileToggle) mobileToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
        document.addEventListener('click', e => {
            if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== mobileToggle) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Кнопки сохранения/экспорта
    const topbarSave = document.getElementById('topbarSave');
    const topbarExport = document.getElementById('topbarExport');
    if (topbarSave && StorageModule?.saveToLocalStorage) topbarSave.addEventListener('click', () => StorageModule.saveToLocalStorage());
    if (topbarExport && StorageModule?.exportToJson) topbarExport.addEventListener('click', () => StorageModule.exportToJson());

    initTheme();
    initSidebarCollapse();
    initMobileMenu();

    // Запускаем обновление дашборда после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.updateDashboard();
        });
    } else {
        window.updateDashboard();
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
})();

if (typeof ProjectDetail !== 'undefined') ProjectDetail.init();
