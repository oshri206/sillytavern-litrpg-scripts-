import { StateManager } from './state-manager.js';
import { TimeSystem } from './time-system.js';
import { clamp, padNumber, toTitleCase } from './utils.js';

const EXTENSION_ID = 'valdris-world-simulator';
const EXTENSION_TITLE = 'Valdris World Simulator';

const stateManager = new StateManager();
const timeSystem = new TimeSystem(stateManager);

window.ValdrisWorldSim = {
    state: stateManager,
    time: timeSystem
};

function getCharacterId() {
    if (window?.SillyTavern?.getContext) {
        return window.SillyTavern.getContext().characterId;
    }
    return null;
}

function createPanel() {
    const container = document.createElement('div');
    container.id = `${EXTENSION_ID}-panel`;
    container.className = 'valdris-panel collapsed season-spring';
    container.innerHTML = `
        <div class="valdris-panel__header">
            <div class="valdris-panel__title">🌍 ${EXTENSION_TITLE}</div>
            <div class="valdris-panel__controls">
                <button class="valdris-icon-button" data-action="toggle">−</button>
                <button class="valdris-icon-button" data-action="settings">⚙</button>
            </div>
        </div>
        <div class="valdris-panel__body">
            <div class="valdris-panel__datetime">
                <div class="valdris-panel__date" data-role="date">—</div>
                <div class="valdris-panel__time" data-role="time">—</div>
                <div class="valdris-panel__season" data-role="season">—</div>
            </div>
            <div class="valdris-panel__buttons">
                <button class="valdris-button" data-advance="60">+1 Hour</button>
                <button class="valdris-button" data-advance="360">+6 Hours</button>
                <button class="valdris-button" data-advance="1440">+1 Day</button>
                <button class="valdris-button" data-advance="10080">+1 Week</button>
            </div>
            <div class="valdris-panel__flow">
                <span>Time Flow:</span>
                <button class="valdris-toggle" data-role="flow-toggle">ON</button>
                <span class="valdris-panel__flow-detail" data-role="flow-detail">+15 min per message</span>
            </div>
        </div>
        <div class="valdris-settings hidden">
            <div class="valdris-settings__header">
                <div>⚙️ Time Settings</div>
                <button class="valdris-icon-button" data-action="settings-close">×</button>
            </div>
            <div class="valdris-settings__section">
                <div class="valdris-settings__subtitle">Time Flow</div>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="timeFlowEnabled" /> Enable automatic time flow
                </label>
                <label class="valdris-field">
                    Minutes per message:
                    <input type="number" min="1" max="240" step="1" data-setting="minutesPerMessage" />
                </label>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="autoAdvanceTime" /> Advance on player message only
                </label>
            </div>
            <div class="valdris-settings__section">
                <div class="valdris-settings__subtitle">Manual Override</div>
                <div class="valdris-settings__grid">
                    <label class="valdris-field">Year:<input type="number" min="1" data-setting="year" /></label>
                    <label class="valdris-field">Day:<input type="number" min="1" max="360" data-setting="dayOfYear" /></label>
                    <label class="valdris-field">Hour:<input type="number" min="0" max="23" data-setting="hour" /></label>
                    <label class="valdris-field">Minute:<input type="number" min="0" max="59" data-setting="minute" /></label>
                </div>
                <button class="valdris-button" data-action="set-time">Set Time</button>
            </div>
            <div class="valdris-settings__section">
                <div class="valdris-settings__subtitle">Data</div>
                <div class="valdris-settings__buttons">
                    <button class="valdris-button" data-action="export">Export World State</button>
                    <button class="valdris-button" data-action="import">Import World State</button>
                    <button class="valdris-button danger" data-action="reset">Reset to Defaults</button>
                </div>
            </div>
        </div>
    `;
    return container;
}

function attachPanel() {
    const panel = createPanel();
    const target =
        document.querySelector('#extensions_settings') ||
        document.querySelector('#extensions_settings2') ||
        document.querySelector('#extensions-panel') ||
        document.body;
    target.appendChild(panel);
    return panel;
}

function updatePanel(panel) {
    const time = stateManager.getSection('time');
    if (!time) {
        return;
    }
    panel.querySelector('[data-role="date"]').textContent = timeSystem.getFullTimestamp();
    panel.querySelector('[data-role="time"]').textContent = `${toTitleCase(time.timeOfDay)} (${padNumber(time.hour)}:${padNumber(time.minute)})`;
    panel.querySelector('[data-role="season"]').textContent = `${toTitleCase(time.season)}`;
    panel.querySelector('[data-role="flow-detail"]').textContent = `+${time.minutesPerMessage} min per message`;
    panel.querySelector('[data-role="flow-toggle"]').textContent = time.timeFlowEnabled ? 'ON' : 'OFF';

    panel.classList.remove('season-spring', 'season-summer', 'season-autumn', 'season-winter');
    panel.classList.add(`season-${time.season}`);

    const settings = panel.querySelector('.valdris-settings');
    settings.querySelector('[data-setting="timeFlowEnabled"]').checked = time.timeFlowEnabled;
    settings.querySelector('[data-setting="minutesPerMessage"]').value = time.minutesPerMessage;
    settings.querySelector('[data-setting="autoAdvanceTime"]').checked = time.autoAdvanceTime;
    settings.querySelector('[data-setting="year"]').value = time.year;
    settings.querySelector('[data-setting="dayOfYear"]').value = time.dayOfYear;
    settings.querySelector('[data-setting="hour"]').value = time.hour;
    settings.querySelector('[data-setting="minute"]').value = time.minute;
}

function handlePanelEvents(panel) {
    panel.addEventListener('click', (event) => {
        const action = event.target?.dataset?.action;
        if (!action) {
            return;
        }
        if (action === 'toggle') {
            panel.classList.toggle('collapsed');
        }
        if (action === 'settings') {
            panel.querySelector('.valdris-settings').classList.remove('hidden');
        }
        if (action === 'settings-close') {
            panel.querySelector('.valdris-settings').classList.add('hidden');
        }
        if (action === 'set-time') {
            const settings = panel.querySelector('.valdris-settings');
            const year = Number(settings.querySelector('[data-setting="year"]').value);
            const dayOfYear = Number(settings.querySelector('[data-setting="dayOfYear"]').value);
            const hour = Number(settings.querySelector('[data-setting="hour"]').value);
            const minute = Number(settings.querySelector('[data-setting="minute"]').value);
            timeSystem.setTime(
                clamp(year, 1, 9999),
                clamp(dayOfYear, 1, 360),
                clamp(hour, 0, 23),
                clamp(minute, 0, 59)
            );
        }
        if (action === 'export') {
            const payload = stateManager.exportState();
            if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(payload);
            }
            alert('World state copied to clipboard.');
        }
        if (action === 'import') {
            const input = prompt('Paste world state JSON:');
            if (!input) {
                return;
            }
            const success = stateManager.importState(input);
            if (!success) {
                alert('Import failed. JSON was invalid.');
            }
        }
        if (action === 'reset') {
            const confirmed = confirm('Reset world state to defaults?');
            if (confirmed) {
                stateManager.resetState();
            }
        }
    });

    panel.addEventListener('click', (event) => {
        const advance = event.target?.dataset?.advance;
        if (!advance) {
            return;
        }
        timeSystem.advanceTime(Number(advance));
    });

    panel.querySelector('[data-role="flow-toggle"]').addEventListener('click', () => {
        const time = stateManager.getSection('time');
        stateManager.updateSection('time', { timeFlowEnabled: !time.timeFlowEnabled });
    });

    panel.querySelector('[data-setting="timeFlowEnabled"]').addEventListener('change', (event) => {
        stateManager.updateSection('time', { timeFlowEnabled: event.target.checked });
    });

    panel.querySelector('[data-setting="minutesPerMessage"]').addEventListener('change', (event) => {
        const value = clamp(Number(event.target.value), 1, 240);
        stateManager.updateSection('time', { minutesPerMessage: value });
    });

    panel.querySelector('[data-setting="autoAdvanceTime"]').addEventListener('change', (event) => {
        stateManager.updateSection('time', { autoAdvanceTime: event.target.checked });
    });
}

function hookSillyTavernEvents() {
    if (!window?.eventSource || !window?.event_types) {
        return;
    }
    window.eventSource.on(window.event_types.MESSAGE_SENT, () => {
        const time = stateManager.getSection('time');
        if (time?.timeFlowEnabled) {
            timeSystem.advanceTime(time.minutesPerMessage);
        }
    });

    window.eventSource.on(window.event_types.MESSAGE_RECEIVED, () => {
        const time = stateManager.getSection('time');
        if (time?.timeFlowEnabled && !time.autoAdvanceTime) {
            timeSystem.advanceTime(time.minutesPerMessage);
        }
    });

    window.eventSource.on(window.event_types.CHAT_CHANGED, async () => {
        const characterId = getCharacterId();
        await stateManager.initialize(characterId);
        const time = { ...stateManager.getSection('time') };
        timeSystem.updateComputedFields(time);
        stateManager.updateSection('time', time);
    });
}

async function initialize() {
    const characterId = getCharacterId();
    await stateManager.initialize(characterId);
    const time = { ...stateManager.getSection('time') };
    timeSystem.updateComputedFields(time);
    stateManager.updateSection('time', time);

    const panel = attachPanel();
    handlePanelEvents(panel);

    timeSystem.onTimeAdvanced(() => updatePanel(panel));
    stateManager.on('stateUpdated', () => updatePanel(panel));
    stateManager.on('sectionUpdated', () => updatePanel(panel));
    stateManager.on('stateReset', () => updatePanel(panel));
    updatePanel(panel);

    hookSillyTavernEvents();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
