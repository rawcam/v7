// project-detail.js
const ProjectDetail = (function() {
    let currentProjectId = null;
    let currentProject = null;

    function getProjects() {
        const saved = localStorage.getItem('sputnik_projects');
        return saved ? JSON.parse(saved) : [];
    }

    function saveProjects(projects) {
        localStorage.setItem('sputnik_projects', JSON.stringify(projects));
        if (typeof TopbarModule !== 'undefined' && TopbarModule.renderDashboard) {
            TopbarModule.renderDashboard();
        }
        if (typeof TopbarModule !== 'undefined' && TopbarModule.renderProjectsList) {
            TopbarModule.renderProjectsList();
        }
    }

    function findProject(id) {
        const projects = getProjects();
        return projects.find(p => p.id === id);
    }

    function updateProject(updatedProject) {
        const projects = getProjects();
        const index = projects.findIndex(p => p.id === updatedProject.id);
        if (index !== -1) {
            projects[index] = updatedProject;
            saveProjects(projects);
            currentProject = updatedProject;
        }
    }

    function deleteProject(id) {
        if (confirm('Удалить проект? Все данные будут потеряны.')) {
            const projects = getProjects().filter(p => p.id !== id);
            saveProjects(projects);
            hideDetail();
        }
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(value);
    }

    function parseCurrency(value) {
        return parseInt(value.replace(/[^0-9]/g, '')) || 0;
    }

    function getStatusText(status) {
        const statuses = {
            presale: 'Пресейл',
            design: 'Стадия П',
            ready: 'Стадия Р',
            construction: 'Монтаж',
            done: 'Завершён'
        };
        return statuses[status] || status;
    }

    function getNextStatusText(status) {
        const next = {
            presale: 'Стадия П',
            design: 'Стадия Р',
            ready: 'Монтаж',
            construction: 'Завершён',
            done: null
        };
        return next[status] || null;
    }

    function getProgressByStatus(status) {
        switch(status) {
            case 'presale': return 10;
            case 'design': return 30;
            case 'ready': return 60;
            case 'construction': return 80;
            case 'done': return 100;
            default: return 0;
        }
    }

    function renderDetail() {
        if (!currentProject) return;
        const container = document.getElementById('projectDetailContainer');
        if (!container) return;

        const p = currentProject;
        const nextStatus = getNextStatusText(p.status);
        const autoProgress = getProgressByStatus(p.status);
        const progress = p.progress !== undefined ? p.progress : autoProgress;

        container.innerHTML = `
            <div class="dashboard-wrapper" style="max-width: 800px; margin: 0 auto;">
                <button class="btn-secondary" id="backToProjectsBtn" style="margin-bottom: 20px;">
                    <i class="fas fa-arrow-left"></i> Назад к проектам
                </button>
                <div class="project-detail-card">
                    <div class="detail-header">
                        <input type="text" id="projectName" value="${escapeHtml(p.name)}" class="detail-title editable-field">
                        <div class="detail-badges">
                            <select id="projectStatus" class="detail-status">
                                <option value="presale" ${p.status === 'presale' ? 'selected' : ''}>Пресейл</option>
                                <option value="design" ${p.status === 'design' ? 'selected' : ''}>Стадия П</option>
                                <option value="ready" ${p.status === 'ready' ? 'selected' : ''}>Стадия Р</option>
                                <option value="construction" ${p.status === 'construction' ? 'selected' : ''}>Монтаж</option>
                                <option value="done" ${p.status === 'done' ? 'selected' : ''}>Завершён</option>
                            </select>
                            <label class="priority-checkbox">
                                <input type="checkbox" id="projectPriority" ${p.priority ? 'checked' : ''}> Срочный
                            </label>
                        </div>
                    </div>

                    <div class="detail-grid">
                        <div class="detail-field">
                            <label>Бюджет (руб):</label>
                            <input type="text" id="projectBudget" value="${formatCurrency(p.budget)}" class="budget-input editable-field">
                        </div>
                        <div class="detail-field">
                            <label>Дата начала:</label>
                            <input type="date" id="projectStartDate" value="${p.startDate}" class="editable-field">
                        </div>
                        <div class="detail-field">
                            <label>Инженер:</label>
                            <input type="text" id="projectEngineer" value="${escapeHtml(p.engineer)}" class="editable-field">
                        </div>
                        <div class="detail-field">
                            <label>Руководитель проекта (РП):</label>
                            <input type="text" id="projectManager" value="${escapeHtml(p.projectManager)}" class="editable-field">
                        </div>
                    </div>

                    <div class="detail-progress">
                        <label>Прогресс: <span id="progressValue">${progress}%</span></label>
                        <div class="progress-bar-container">
                            <div class="progress-fill" id="progressFill" style="width: ${progress}%; background: ${p.priority ? '#f97316' : 'var(--accent)'}"></div>
                        </div>
                    </div>

                    <div class="detail-roadmap">
                        <h4>Дорожная карта</h4>
                        <div class="roadmap-item">
                            <span class="roadmap-status current">${getStatusText(p.status)}</span>
                            <span class="roadmap-date">с ${p.statusStartDate}</span>
                            ${nextStatus ? `<span class="roadmap-arrow">→</span>
                            <span class="roadmap-status next">${nextStatus}</span>
                            <input type="date" id="nextStatusDate" value="${p.nextStatusDate || ''}" class="roadmap-date-input editable-field">` : ''}
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>Встречи</h4>
                        <div id="meetingsList" class="detail-list">
                            ${(p.meetings || []).map((m, idx) => `
                                <div class="list-item" data-idx="${idx}">
                                    <input type="date" value="${m.date}" class="meeting-date editable-field" data-idx="${idx}">
                                    <input type="text" value="${escapeHtml(m.subject)}" class="meeting-subject editable-field" data-idx="${idx}">
                                    <button class="remove-item" data-type="meeting" data-idx="${idx}"><i class="fas fa-trash-alt"></i></button>
                                </div>
                            `).join('')}
                        </div>
                        <button class="btn-small add-item" data-type="meeting">+ Добавить встречу</button>
                    </div>

                    <div class="detail-section">
                        <h4>Закупки</h4>
                        <div id="purchasesList" class="detail-list">
                            ${(p.purchases || []).map((pr, idx) => `
                                <div class="list-item" data-idx="${idx}">
                                    <input type="text" value="${escapeHtml(pr.name)}" class="purchase-name editable-field" data-idx="${idx}">
                                    <select class="purchase-status" data-idx="${idx}">
                                        <option value="awaiting_payment" ${pr.status === 'awaiting_payment' ? 'selected' : ''}>Ожидает оплаты</option>
                                        <option value="paid" ${pr.status === 'paid' ? 'selected' : ''}>Оплачено</option>
                                        <option value="reserved" ${pr.status === 'reserved' ? 'selected' : ''}>Зарезервировано</option>
                                        <option value="ordered" ${pr.status === 'ordered' ? 'selected' : ''}>Заказано</option>
                                        <option value="in_transit" ${pr.status === 'in_transit' ? 'selected' : ''}>В пути</option>
                                        <option value="delivered" ${pr.status === 'delivered' ? 'selected' : ''}>Доставлено</option>
                                        <option value="cancelled" ${pr.status === 'cancelled' ? 'selected' : ''}>Отменено</option>
                                        <option value="out_of_stock" ${pr.status === 'out_of_stock' ? 'selected' : ''}>Нет в наличии</option>
                                    </select>
                                    <input type="date" value="${pr.date}" class="purchase-date editable-field" data-idx="${idx}">
                                    <button class="remove-item" data-type="purchase" data-idx="${idx}"><i class="fas fa-trash-alt"></i></button>
                                </div>
                            `).join('')}
                        </div>
                        <button class="btn-small add-item" data-type="purchase">+ Добавить закупку</button>
                    </div>

                    <div class="detail-actions">
                        <button class="btn-primary" id="saveProjectBtn">Сохранить изменения</button>
                        <button class="btn-danger" id="deleteProjectBtn">Удалить проект</button>
                    </div>
                </div>
            </div>
        `;

        attachEventHandlers();
    }

    function attachEventHandlers() {
        document.getElementById('backToProjectsBtn')?.addEventListener('click', hideDetail);
        document.getElementById('saveProjectBtn')?.addEventListener('click', saveChanges);
        document.getElementById('deleteProjectBtn')?.addEventListener('click', () => deleteProject(currentProject.id));
        document.getElementById('projectBudget')?.addEventListener('blur', (e) => {
            const val = parseCurrency(e.target.value);
            e.target.value = formatCurrency(val);
        });

        const statusSelect = document.getElementById('projectStatus');
        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                const newStatus = e.target.value;
                const newProgress = getProgressByStatus(newStatus);
                const progressFill = document.getElementById('progressFill');
                const progressValue = document.getElementById('progressValue');
                if (progressFill && progressValue) {
                    progressFill.style.width = newProgress + '%';
                    progressValue.innerText = newProgress + '%';
                }
            });
        }

        document.querySelectorAll('.add-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                if (type === 'meeting') {
                    if (!currentProject.meetings) currentProject.meetings = [];
                    currentProject.meetings.push({ date: new Date().toISOString().slice(0,10), subject: 'Новая встреча' });
                } else if (type === 'purchase') {
                    if (!currentProject.purchases) currentProject.purchases = [];
                    currentProject.purchases.push({ name: 'Новая закупка', status: 'awaiting_payment', date: new Date().toISOString().slice(0,10) });
                }
                renderDetail();
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const idx = parseInt(btn.dataset.idx);
                if (type === 'meeting') {
                    currentProject.meetings.splice(idx, 1);
                } else if (type === 'purchase') {
                    currentProject.purchases.splice(idx, 1);
                }
                renderDetail();
            });
        });
    }

    function saveChanges() {
        if (!currentProject) return;

        currentProject.name = document.getElementById('projectName').value;
        currentProject.status = document.getElementById('projectStatus').value;
        currentProject.priority = document.getElementById('projectPriority').checked;
        currentProject.budget = parseCurrency(document.getElementById('projectBudget').value);
        currentProject.startDate = document.getElementById('projectStartDate').value;
        currentProject.engineer = document.getElementById('projectEngineer').value;
        currentProject.projectManager = document.getElementById('projectManager').value;
        currentProject.progress = getProgressByStatus(currentProject.status);
        currentProject.nextStatusDate = document.getElementById('nextStatusDate')?.value || null;

        const meetings = [];
        const meetingItems = document.querySelectorAll('#meetingsList .list-item');
        meetingItems.forEach((item, idx) => {
            const dateInput = item.querySelector('.meeting-date');
            const subjectInput = item.querySelector('.meeting-subject');
            if (dateInput && subjectInput) {
                meetings.push({ date: dateInput.value, subject: subjectInput.value });
            }
        });
        currentProject.meetings = meetings;

        const purchases = [];
        const purchaseItems = document.querySelectorAll('#purchasesList .list-item');
        purchaseItems.forEach((item, idx) => {
            const nameInput = item.querySelector('.purchase-name');
            const statusSelect = item.querySelector('.purchase-status');
            const dateInput = item.querySelector('.purchase-date');
            if (nameInput && statusSelect && dateInput) {
                purchases.push({ name: nameInput.value, status: statusSelect.value, date: dateInput.value });
            }
        });
        currentProject.purchases = purchases;

        updateProject(currentProject);
        alert('Изменения сохранены');
        renderDetail();
    }

    function showDetail(projectId) {
        currentProjectId = projectId;
        currentProject = findProject(projectId);
        if (!currentProject) return;
        const projectsContainer = document.getElementById('projectsContainer');
        const detailContainer = document.getElementById('projectDetailContainer');
        if (projectsContainer && detailContainer) {
            projectsContainer.style.display = 'none';
            detailContainer.style.display = 'block';
            renderDetail();
        }
    }

    function hideDetail() {
    const projectsContainer = document.getElementById('projectsContainer');
    const detailContainer = document.getElementById('projectDetailContainer');
    if (projectsContainer && detailContainer) {
        detailContainer.style.display = 'none';
        detailContainer.innerHTML = ''; // очищаем
        projectsContainer.style.display = 'block';
        currentProjectId = null;
        currentProject = null;
        if (typeof TopbarModule !== 'undefined' && TopbarModule.renderProjectsList) {
            TopbarModule.renderProjectsList();
        }
    }
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

    function init() {
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            if (card && card.closest('#projectsList')) {
                const id = card.dataset.id;
                if (id) showDetail(id);
            }
        });
    }

    return { init, showDetail, hideDetail };
})();
