// topbar.js
const TopbarModule = (function() {
    let currentSection = 'dashboard';
    let projects = [];

    console.log('topbar.js loaded');

    function loadProjects() {
        const saved = localStorage.getItem('sputnik_projects');
        if (saved) {
            try {
                projects = JSON.parse(saved);
            } catch(e) { console.error(e); }
        }
        if (!projects.length) {
            projects = [
                { id: '1', name: 'Конференц-зал 1', status: 'design', progress: 45, date: '2026-03-20', team: ['Иванов', 'Петров'], meetings: [] },
                { id: '2', name: 'Ситуационный центр', status: 'presale', progress: 20, date: '2026-03-25', team: ['Сидоров'], meetings: [] }
            ];
            saveProjects();
        }
    }

    function saveProjects() {
        localStorage.setItem('sputnik_projects', JSON.stringify(projects));
    }

    function getStatusText(status) {
        const statuses = { presale: 'Пресейл', design: 'Стадия П', ready: 'Стадия Р', construction: 'Монтаж', done: 'Завершён' };
        return statuses[status] || status;
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

    function renderDashboard() {
        const projectsCountEl = document.getElementById('dashboardProjectsCount');
        const avgProgressEl = document.getElementById('dashboardAvgProgress');
        const teamCountEl = document.getElementById('dashboardTeamCount');
        const recentList = document.getElementById('recentProjectsList');

        if (projectsCountEl) projectsCountEl.innerText = projects.length;
        const totalProgress = projects.reduce((sum, p) => sum + p.progress, 0);
        const avgProgress = projects.length ? Math.round(totalProgress / projects.length) : 0;
        if (avgProgressEl) avgProgressEl.innerText = avgProgress + '%';
        if (teamCountEl) teamCountEl.innerText = '3';

        if (recentList) {
            recentList.innerHTML = projects.slice(0, 5).map(p => `
                <div class="project-card" data-id="${p.id}">
                    <div class="project-name">${escapeHtml(p.name)}</div>
                    <div class="project-status status-${p.status}">${getStatusText(p.status)}</div>
                    <div class="project-progress">Прогресс: ${p.progress}%</div>
                    <div class="project-date">${p.date}</div>
                    <button class="btn-small open-project" data-id="${p.id}">Открыть</button>
                </div>
            `).join('');
            if (!projects.length) recentList.innerHTML = '<div class="empty-state">Нет проектов. Создайте первый проект.</div>';
        }

        document.querySelectorAll('.open-project').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.dataset.id;
                const project = projects.find(p => p.id === id);
                if (project) {
                    switchToSection('projects');
                    renderProjectsList(id);
                }
            });
        });
    }

    function renderProjectsList(activeId = null) {
        const container = document.getElementById('projectsList');
        if (!container) return;

        container.innerHTML = projects.map(p => `
            <div class="project-card" data-id="${p.id}">
                <div class="project-header">
                    <div class="project-name">${escapeHtml(p.name)}</div>
                    <div class="project-actions">
                        <button class="btn-small edit-project" data-id="${p.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-small delete-project" data-id="${p.id}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="project-details" style="${activeId === p.id ? 'display:block' : 'display:none'}" id="details-${p.id}">
                    <div class="setting"><label>Статус:</label><select class="project-status-select" data-id="${p.id}">
                        <option value="presale" ${p.status === 'presale' ? 'selected' : ''}>Пресейл</option>
                        <option value="design" ${p.status === 'design' ? 'selected' : ''}>Стадия П</option>
                        <option value="ready" ${p.status === 'ready' ? 'selected' : ''}>Стадия Р</option>
                        <option value="construction" ${p.status === 'construction' ? 'selected' : ''}>Монтаж</option>
                        <option value="done" ${p.status === 'done' ? 'selected' : ''}>Завершён</option>
                    </select></div>
                    <div class="setting"><label>Прогресс (%):</label><input type="number" class="project-progress-input" data-id="${p.id}" value="${p.progress}" min="0" max="100" step="5"></div>
                    <div class="setting"><label>Дата:</label><input type="date" class="project-date-input" data-id="${p.id}" value="${p.date}"></div>
                    <div class="setting"><label>Участники:</label><input type="text" class="project-team-input" data-id="${p.id}" value="${p.team.join(', ')}"></div>
                    <div class="meetings-list" id="meetings-${p.id}">
                        <h4>Встречи</h4>
                        <div class="meetings-container">
                            ${(p.meetings || []).map((m, idx) => `<div class="meeting-item">${m.date} — ${m.subject} <button class="remove-meeting" data-id="${p.id}" data-meeting-idx="${idx}"><i class="fas fa-times"></i></button></div>`).join('')}
                        </div>
                        <button class="btn-small add-meeting" data-id="${p.id}"><i class="fas fa-plus"></i> Добавить встречу</button>
                    </div>
                </div>
            </div>
        `).join('');
        if (!projects.length) container.innerHTML = '<div class="empty-state">Нет проектов. Нажмите "Новый проект".</div>';

        document.querySelectorAll('.edit-project').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const details = document.getElementById(`details-${id}`);
                if (details) details.style.display = details.style.display === 'none' ? 'block' : 'none';
            });
        });
        document.querySelectorAll('.delete-project').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                if (confirm('Удалить проект?')) {
                    projects = projects.filter(p => p.id !== id);
                    saveProjects();
                    renderProjectsList();
                    renderDashboard();
                }
            });
        });
        document.querySelectorAll('.project-status-select').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const id = sel.dataset.id;
                const project = projects.find(p => p.id === id);
                if (project) project.status = sel.value;
                saveProjects();
                renderDashboard();
            });
        });
        document.querySelectorAll('.project-progress-input').forEach(inp => {
            inp.addEventListener('change', (e) => {
                const id = inp.dataset.id;
                const project = projects.find(p => p.id === id);
                if (project) project.progress = parseInt(inp.value) || 0;
                saveProjects();
                renderDashboard();
            });
        });
        document.querySelectorAll('.project-date-input').forEach(inp => {
            inp.addEventListener('change', (e) => {
                const id = inp.dataset.id;
                const project = projects.find(p => p.id === id);
                if (project) project.date = inp.value;
                saveProjects();
            });
        });
        document.querySelectorAll('.project-team-input').forEach(inp => {
            inp.addEventListener('change', (e) => {
                const id = inp.dataset.id;
                const project = projects.find(p => p.id === id);
                if (project) project.team = inp.value.split(',').map(s => s.trim()).filter(s => s);
                saveProjects();
            });
        });
        document.querySelectorAll('.add-meeting').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const project = projects.find(p => p.id === id);
                if (project) {
                    const date = prompt('Дата встречи (ГГГГ-ММ-ДД):');
                    const subject = prompt('Тема встречи:');
                    if (date && subject) {
                        if (!project.meetings) project.meetings = [];
                        project.meetings.push({ date, subject });
                        saveProjects();
                        renderProjectsList(id);
                    }
                }
            });
        });
        document.querySelectorAll('.remove-meeting').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const idx = parseInt(btn.dataset.meetingIdx);
                const project = projects.find(p => p.id === id);
                if (project && project.meetings) {
                    project.meetings.splice(idx, 1);
                    saveProjects();
                    renderProjectsList(id);
                }
            });
        });
    }

    function createNewProject() {
        const name = prompt('Название проекта:');
        if (name) {
            const newProject = {
                id: Date.now().toString(),
                name: name,
                status: 'presale',
                progress: 0,
                date: new Date().toISOString().slice(0,10),
                team: [],
                meetings: []
            };
            projects.push(newProject);
            saveProjects();
            renderProjectsList();
            renderDashboard();
            switchToSection('projects');
        }
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
                content += `- Дата: ${project.date}\n`;
                content += `- Участники: ${project.team.join(', ')}\n`;
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
            document.getElementById('copyDocBtn').onclick = () => {
                navigator.clipboard.writeText(content);
                alert('Текст скопирован');
            };
        }
    }

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
