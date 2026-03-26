// app.js
(function() {
    let calculationsInitialized = false;

    // Модули, которые не зависят от сайдбара
    if (typeof LoggerModule !== 'undefined') LoggerModule.init();
    if (typeof StorageModule !== 'undefined') StorageModule.init();

    // Инициализация топбара
    if (typeof TopbarModule !== 'undefined') {
        TopbarModule.init();
    } else {
        console.error('TopbarModule not loaded');
    }

    // Функция инициализации всех модулей, зависящих от сайдбара
    function initCalculationsModules() {
        if (calculationsInitialized) return;
        calculationsInitialized = true;
        console.log('Initializing calculations modules');

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

    // Следим за переключением на раздел "Расчёты"
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
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
        }
        document.addEventListener('click', e => {
            if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== mobileToggle) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Обработчики кнопок в топбаре
    const topbarSave = document.getElementById('topbarSave');
    const topbarExport = document.getElementById('topbarExport');

    if (topbarSave && StorageModule && typeof StorageModule.saveToLocalStorage === 'function') {
        topbarSave.addEventListener('click', () => StorageModule.saveToLocalStorage());
    }
    if (topbarExport && StorageModule && typeof StorageModule.exportToJson === 'function') {
        topbarExport.addEventListener('click', () => StorageModule.exportToJson());
    }

    initTheme();
    initSidebarCollapse();
    initMobileMenu();
})();
if (typeof ProjectDetail !== 'undefined') ProjectDetail.init();
