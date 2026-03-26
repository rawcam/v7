// video.js
const VideoModule = (function() {
    let unsubscribe = null;

    function syncToState() {
        const state = AppState.getState();
        const settings = state.globalSettings;

        const resolution = document.getElementById('resolutionSidebar')?.value;
        const chroma = document.getElementById('chromaSidebar')?.value;
        const fps = document.getElementById('fpsSidebar')?.value ? parseInt(document.getElementById('fpsSidebar').value) : settings.fps;
        const colorSpace = document.getElementById('colorSpace')?.value;
        const bitDepth = document.getElementById('bitDepth')?.value;

        // Если какой-то элемент отсутствует, не обновляем состояние
        if (resolution === undefined || chroma === undefined || colorSpace === undefined || bitDepth === undefined) return;

        if (settings.resolution !== resolution ||
            settings.chroma !== chroma ||
            settings.fps !== fps ||
            settings.colorSpace !== colorSpace ||
            settings.bitDepth !== bitDepth) {
            AppState.setState({
                globalSettings: {
                    ...settings,
                    resolution,
                    chroma,
                    fps,
                    colorSpace,
                    bitDepth
                }
            });
        }
    }

    function syncFromState(settings) {
        const resolutionSelect = document.getElementById('resolutionSidebar');
        const chromaSelect = document.getElementById('chromaSidebar');
        const fpsSelect = document.getElementById('fpsSidebar');
        const colorSpaceSelect = document.getElementById('colorSpace');
        const bitDepthSelect = document.getElementById('bitDepth');

        if (resolutionSelect && resolutionSelect.value !== settings.resolution) resolutionSelect.value = settings.resolution;
        if (chromaSelect && chromaSelect.value !== settings.chroma) chromaSelect.value = settings.chroma;
        if (fpsSelect && fpsSelect.value !== settings.fps.toString()) fpsSelect.value = settings.fps;
        if (colorSpaceSelect && colorSpaceSelect.value !== settings.colorSpace) colorSpaceSelect.value = settings.colorSpace;
        if (bitDepthSelect && bitDepthSelect.value !== settings.bitDepth.toString()) bitDepthSelect.value = settings.bitDepth;
    }

    function init() {
        // Подписываемся на изменения состояния
        unsubscribe = AppState.subscribe((newState) => {
            syncFromState(newState.globalSettings);
        });

        // Привязываем обработчики к элементам
        const elements = ['resolutionSidebar', 'chromaSidebar', 'fpsSidebar', 'colorSpace', 'bitDepth'];
        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', syncToState);
            }
        });

        // Первоначальная синхронизация из состояния в DOM
        const initialState = AppState.getState();
        syncFromState(initialState.globalSettings);
    }

    function destroy() {
        if (unsubscribe) unsubscribe();
    }

    return { init, destroy };
})();
