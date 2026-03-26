// app.js
(function() {
    // Инициализация всех модулей
    if (typeof Accordion !== 'undefined') Accordion.init();
    if (typeof VideoModule !== 'undefined') VideoModule.init();
    if (typeof NetworkModule !== 'undefined') NetworkModule.init();
    if (typeof TractsModule !== 'undefined') TractsModule.init();
    if (typeof LedModule !== 'undefined') LedModule.init();
    if (typeof SoundModule !== 'undefined') SoundModule.init();
    if (typeof VcModule !== 'undefined') VcModule.init();
    if (typeof ErgoModule !== 'undefined') ErgoModule.init();
    if (typeof PowerModule !== 'undefined') PowerModule.init();
    if (typeof StorageModule !== 'undefined') StorageModule.init();
    if (typeof LoggerModule !== 'undefined') LoggerModule.init();
    if (typeof SidebarEditor !== 'undefined') SidebarEditor.init();

    // Инициализация топбара (должна быть после всех, так как он может переключать разделы)
    if (typeof TopbarModule !== 'undefined') {
        TopbarModule.init();
    } else {
        console.error('TopbarModule not loaded');
    }

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
        const handleClick = () => {
            const isDark = document.body.classList.contains('dark');
            setTheme(isDark ? 'light' : 'dark');
        };
        if (themeSwitch) themeSwitch.addEventListener('click', handleClick);
        if (topbarThemeSwitch) topbarThemeSwitch.addEventListener('click', handleClick);
        if (localStorage.getItem('theme') === 'dark') setTheme('dark');
    }

    function initSidebarCollapse() {
        const sidebar = document.getElementById('sidebar');
        const collapseBtn = document.getElementById('collapseSidebarBtn');
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
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => setSidebarCollapsed(!sidebar.classList.contains('collapsed')));
        }
        if (localStorage.getItem('sidebarCollapsed') === 'true') setSidebarCollapsed(true);
    }

    function initMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const mobileToggle = document.getElementById('mobileMenuToggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
        }
        document.addEventListener('click', e => {
            if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== mobileToggle) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Обработчики кнопок в топбаре (сохранение, экспорт)
    const topbarSave = document.getElementById('topbarSave');
    const topbarExport = document.getElementById('topbarExport');
    if (topbarSave && typeof StorageModule !== 'undefined') {
        topbarSave.addEventListener('click', () => {
            if (StorageModule.saveToLocalStorage) StorageModule.saveToLocalStorage();
            else console.warn('StorageModule.saveToLocalStorage not available');
        });
    }
    if (topbarExport && typeof StorageModule !== 'undefined') {
        topbarExport.addEventListener('click', () => {
            if (StorageModule.exportToJson) StorageModule.exportToJson();
            else console.warn('StorageModule.exportToJson not available');
        });
    }

    initTheme();
    initSidebarCollapse();
    initMobileMenu();
})();
