// sidebar-editor.js
const SidebarEditor = (function() {
    let sortable = null;
    let isEditMode = false;

    // Порядок секций по умолчанию
    const defaultOrder = [
        'videoSection',
        'networkSection',
        'ledSection',
        'soundSection',
        'vcSection',
        'ergoSection',
        'pathsSection',
        'networkStatsSection',
        'powerStatsSection',
        'powerSection',
        'manageSection'
    ];

    // Сохранение порядка в localStorage
    function saveOrder() {
        const sections = document.querySelectorAll('.sidebar-section');
        const order = Array.from(sections).map(section => section.id);
        localStorage.setItem('sidebar_order', JSON.stringify(order));
    }

    // Восстановление порядка из localStorage
    function restoreOrder() {
        const savedOrder = localStorage.getItem('sidebar_order');
        if (!savedOrder) return false;
        try {
            const container = document.getElementById('sidebarSectionsContainer');
sections.forEach(section => container.appendChild(section));
// Остальные секции тоже добавляем в этот контейнер
            const sections = order.map(id => document.getElementById(id)).filter(el => el);
            if (sections.length === 0) return false;
            sections.forEach(section => container.appendChild(section));
            return true;
        } catch(e) {
            return false;
        }
    }

    // Сброс порядка по умолчанию
    function resetOrder() {
        localStorage.removeItem('sidebar_order');
        const container = document.querySelector('.sidebar');
        const sections = defaultOrder.map(id => document.getElementById(id)).filter(el => el);
        sections.forEach(section => container.appendChild(section));
        // Если какие-то секции не входят в defaultOrder, добавляем их в конец
        const allSections = document.querySelectorAll('.sidebar-section');
        const existingIds = sections.map(s => s.id);
        allSections.forEach(section => {
            if (!existingIds.includes(section.id)) {
                container.appendChild(section);
            }
        });
        saveOrder(); // сохраняем новый порядок
        if (isEditMode) disableEditMode();
    }

    // Включение режима редактирования
    function enableEditMode() {
        if (sortable) sortable.destroy();
        const container = document.getElementById('sidebarSectionsContainer');
        sortable = new Sortable(container, {
            handle: '.section-header',
            animation: 150,
            onEnd: () => saveOrder()
        });
        // Добавляем визуальный индикатор (курсор-рука и иконка)
        document.querySelectorAll('.section-header').forEach(header => {
            header.style.cursor = 'grab';
            header.style.userSelect = 'none';
            // Добавляем иконку перетаскивания, если её нет
            if (!header.querySelector('.drag-handle')) {
                const handle = document.createElement('i');
                handle.className = 'fas fa-grip-vertical drag-handle';
                handle.style.marginRight = '8px';
                handle.style.color = 'var(--text-secondary)';
                header.insertBefore(handle, header.firstChild);
            }
        });
        isEditMode = true;
    }

    // Отключение режима редактирования
    function disableEditMode() {
        if (sortable) {
            sortable.destroy();
            sortable = null;
        }
        document.querySelectorAll('.section-header').forEach(header => {
            header.style.cursor = '';
            header.style.userSelect = '';
            const handle = header.querySelector('.drag-handle');
            if (handle) handle.remove();
        });
        isEditMode = false;
    }

    // Переключение режима
    function toggleEditMode() {
        if (isEditMode) {
            disableEditMode();
        } else {
            enableEditMode();
        }
        // Обновляем текст кнопки
        const btn = document.getElementById('editSidebarBtn');
        if (btn) {
            btn.innerHTML = isEditMode ? '<i class="fas fa-check"></i><span> Готово</span>' : '<i class="fas fa-arrows-alt"></i><span> Редактировать сайдбар</span>';
        }
    }

    function init() {
        // Восстанавливаем порядок при загрузке
        if (!restoreOrder()) {
            // Если нет сохранённого порядка, используем порядок по умолчанию
            resetOrder();
        }
        // Добавляем кнопки в раздел "УПРАВЛЕНИЕ"
        const manageContent = document.getElementById('manageContent');
        if (manageContent) {
            const buttonsContainer = manageContent.querySelector('.manage-buttons');
            if (buttonsContainer) {
                // Кнопка редактирования сайдбара
                const editBtn = document.createElement('button');
                editBtn.id = 'editSidebarBtn';
                editBtn.className = 'btn-secondary';
                editBtn.innerHTML = '<i class="fas fa-arrows-alt"></i><span> Редактировать сайдбар</span>';
                editBtn.addEventListener('click', toggleEditMode);
                buttonsContainer.appendChild(editBtn);

                // Кнопка сброса порядка
                const resetBtn = document.createElement('button');
                resetBtn.id = 'resetSidebarOrderBtn';
                resetBtn.className = 'btn-secondary';
                resetBtn.innerHTML = '<i class="fas fa-undo-alt"></i><span> Сбросить порядок</span>';
                resetBtn.addEventListener('click', () => {
                    if (confirm('Сбросить порядок секций в сайдбаре?')) {
                        resetOrder();
                        if (isEditMode) disableEditMode();
                        const editBtn = document.getElementById('editSidebarBtn');
                        if (editBtn) editBtn.innerHTML = '<i class="fas fa-arrows-alt"></i><span> Редактировать сайдбар</span>';
                    }
                });
                buttonsContainer.appendChild(resetBtn);
            }
        }
    }

    return { init, resetOrder, enableEditMode, disableEditMode, toggleEditMode };
})();
