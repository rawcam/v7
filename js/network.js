// network.js
const NetworkModule = (function() {
    let unsubscribe = null;

    function syncToState() {
        const state = AppState.getState();
        const settings = state.globalSettings;

        const cable = document.getElementById('globalCable')?.value;
        const multicast = document.getElementById('globalMulticast')?.checked;
        const qos = document.getElementById('globalQoS')?.checked;
        const networkType = document.getElementById('networkType')?.value;
        const syncProtocol = document.getElementById('syncProtocol')?.value;
        const redundancy = document.getElementById('redundancy')?.checked;

        // Если какой-то элемент отсутствует, не обновляем состояние
        if (cable === undefined || networkType === undefined || syncProtocol === undefined) return;

        if (settings.cable !== cable ||
            settings.multicast !== multicast ||
            settings.qos !== qos ||
            settings.networkType !== networkType ||
            settings.syncProtocol !== syncProtocol ||
            settings.redundancy !== redundancy) {
            AppState.setState({
                globalSettings: {
                    ...settings,
                    cable, multicast, qos, networkType, syncProtocol, redundancy
                }
            });
        }
    }

    function syncFromState(settings) {
        const cableEl = document.getElementById('globalCable');
        const multicastEl = document.getElementById('globalMulticast');
        const qosEl = document.getElementById('globalQoS');
        const networkTypeEl = document.getElementById('networkType');
        const syncProtocolEl = document.getElementById('syncProtocol');
        const redundancyEl = document.getElementById('redundancy');
        const multicastStatus = document.getElementById('sidebarMulticastStatus');
        const qosStatus = document.getElementById('sidebarQoSStatus');

        if (cableEl) cableEl.value = settings.cable;
        if (multicastEl) multicastEl.checked = settings.multicast;
        if (qosEl) qosEl.checked = settings.qos;
        if (networkTypeEl) networkTypeEl.value = settings.networkType;
        if (syncProtocolEl) syncProtocolEl.value = settings.syncProtocol;
        if (redundancyEl) redundancyEl.checked = settings.redundancy;
        if (multicastStatus) multicastStatus.innerText = settings.multicast ? 'Вкл' : 'Выкл';
        if (qosStatus) qosStatus.innerText = settings.qos ? 'Вкл' : 'Выкл';
    }

    function init() {
        unsubscribe = AppState.subscribe((newState) => {
            syncFromState(newState.globalSettings);
        });

        const elements = ['globalCable', 'globalMulticast', 'globalQoS', 'networkType', 'syncProtocol', 'redundancy'];
        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', syncToState);
                if (el.type === 'checkbox') el.addEventListener('click', syncToState);
            }
        });

        const initialState = AppState.getState();
        syncFromState(initialState.globalSettings);
    }

    function destroy() {
        if (unsubscribe) unsubscribe();
    }

    return { init, destroy };
})();
