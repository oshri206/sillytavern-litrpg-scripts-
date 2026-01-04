import { StateManager } from './state-manager.js';
import { TimeSystem } from './time-system.js';
import { clamp, ordinalSuffix, padNumber, toTitleCase } from './utils.js';

const EXTENSION_ID = 'valdris-world-simulator';
const EXTENSION_TITLE = 'Valdris World Simulator';

const stateManager = new StateManager();
const timeSystem = new TimeSystem(stateManager);

const TIME_PATTERNS = [
    { regex: /(\\d+)\\s*hours?\\s*later/i, unit: 'hours', group: 1 },
    { regex: /after\\s*(\\d+)\\s*hours?/i, unit: 'hours', group: 1 },
    { regex: /(\\d+)\\s*hours?\\s*pass(?:es|ed)?/i, unit: 'hours', group: 1 },
    { regex: /(\\d+)\\s*minutes?\\s*later/i, unit: 'minutes', group: 1 },
    { regex: /after\\s*(\\d+)\\s*minutes?/i, unit: 'minutes', group: 1 },
    { regex: /(\\d+)\\s*minutes?\\s*pass(?:es|ed)?/i, unit: 'minutes', group: 1 },
    { regex: /(\\d+)\\s*days?\\s*later/i, unit: 'days', group: 1 },
    { regex: /after\\s*(\\d+)\\s*days?/i, unit: 'days', group: 1 },
    { regex: /(\\d+)\\s*days?\\s*pass(?:es|ed)?/i, unit: 'days', group: 1 },
    { regex: /(\\d+)\\s*weeks?\\s*later/i, unit: 'weeks', group: 1 },
    { regex: /after\\s*(\\d+)\\s*weeks?/i, unit: 'weeks', group: 1 },
    { regex: /a\\s*week\\s*later/i, unit: 'weeks', value: 1 },
    { regex: /(?:a|one)\\s*hour\\s*later/i, unit: 'hours', value: 1 },
    { regex: /(?:a\\s*)?couple\\s*(?:of\\s*)?hours?\\s*later/i, unit: 'hours', value: 2 },
    { regex: /(?:a\\s*)?few\\s*hours?\\s*later/i, unit: 'hours', value: 3 },
    { regex: /several\\s*hours?\\s*later/i, unit: 'hours', value: 5 },
    { regex: /many\\s*hours?\\s*later/i, unit: 'hours', value: 8 },
    { regex: /(?:a|one)\\s*day\\s*later/i, unit: 'days', value: 1 },
    { regex: /(?:a\\s*)?couple\\s*(?:of\\s*)?days?\\s*later/i, unit: 'days', value: 2 },
    { regex: /(?:a\\s*)?few\\s*days?\\s*later/i, unit: 'days', value: 3 },
    { regex: /several\\s*days?\\s*later/i, unit: 'days', value: 5 },
    { regex: /(?:by|at|when)\\s*(?:the\\s*)?dawn(?:\\s*breaks)?/i, unit: 'setTime', hour: 6 },
    { regex: /(?:by|at|when)\\s*(?:the\\s*)?morning/i, unit: 'setTime', hour: 8 },
    { regex: /(?:by|at|when)\\s*(?:the\\s*)?midday/i, unit: 'setTime', hour: 12 },
    { regex: /(?:by|at|when)\\s*(?:the\\s*)?noon/i, unit: 'setTime', hour: 12 },
    { regex: /(?:by|at|when)\\s*(?:the\\s*)?afternoon/i, unit: 'setTime', hour: 14 },
    { regex: /(?:by|at|when)\\s*(?:the\\s*)?dusk/i, unit: 'setTime', hour: 18 },
    { regex: /(?:by|at|when)\\s*(?:the\\s*)?evening/i, unit: 'setTime', hour: 19 },
    { regex: /(?:by|at|when)\\s*(?:the\\s*)?nightfall/i, unit: 'setTime', hour: 21 },
    { regex: /(?:by|at|when)\\s*(?:the\\s*)?night/i, unit: 'setTime', hour: 21 },
    { regex: /(?:by|at|when)\\s*(?:the\\s*)?midnight/i, unit: 'setTime', hour: 0 },
    { regex: /(?:the\\s*)?next\\s*(?:day|morning)/i, unit: 'nextMorning' },
    { regex: /(?:the\\s*)?following\\s*(?:day|morning)/i, unit: 'nextMorning' },
    { regex: /(?:when\\s*)?(?:you\\s*)?(?:wake|woke)\\s*(?:up)?(?:\\s*the\\s*next\\s*(?:day|morning))?/i, unit: 'nextMorning' },
    { regex: /that\\s*night/i, unit: 'setTime', hour: 21 },
    { regex: /later\\s*that\\s*(?:same\\s*)?day/i, unit: 'hours', value: 4 },
    { regex: /later\\s*that\\s*(?:same\\s*)?evening/i, unit: 'setTime', hour: 20 },
    { regex: /two\\s*hours?\\s*later/i, unit: 'hours', value: 2 },
    { regex: /three\\s*hours?\\s*later/i, unit: 'hours', value: 3 },
    { regex: /four\\s*hours?\\s*later/i, unit: 'hours', value: 4 },
    { regex: /five\\s*hours?\\s*later/i, unit: 'hours', value: 5 },
    { regex: /six\\s*hours?\\s*later/i, unit: 'hours', value: 6 },
    { regex: /two\\s*days?\\s*later/i, unit: 'days', value: 2 },
    { regex: /three\\s*days?\\s*later/i, unit: 'days', value: 3 },
    { regex: /overnight/i, unit: 'hours', value: 8 },
    { regex: /through\\s*the\\s*night/i, unit: 'hours', value: 8 },
    { regex: /all\\s*(?:through\\s*the\\s*)?night/i, unit: 'hours', value: 10 },
    { regex: /as\\s*(?:the\\s*)?sun\\s*(?:rises|rose)/i, unit: 'setTime', hour: 6 },
    { regex: /as\\s*(?:the\\s*)?sun\\s*(?:sets|set)/i, unit: 'setTime', hour: 18 }
];

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
                <div class="valdris-settings__subtitle">AI Integration</div>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="contextInjectionEnabled" /> Inject current time into prompts
                </label>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="aiTimeParsingEnabled" /> Parse time passages from AI responses
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
    settings.querySelector('[data-setting="contextInjectionEnabled"]').checked = time.contextInjectionEnabled;
    settings.querySelector('[data-setting="aiTimeParsingEnabled"]').checked = time.aiTimeParsingEnabled;
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

    panel.querySelector('[data-setting="contextInjectionEnabled"]').addEventListener('change', (event) => {
        stateManager.updateSection('time', { contextInjectionEnabled: event.target.checked });
    });

    panel.querySelector('[data-setting="aiTimeParsingEnabled"]').addEventListener('change', (event) => {
        stateManager.updateSection('time', { aiTimeParsingEnabled: event.target.checked });
    });
}

function hookSillyTavernEvents() {
    if (!window?.eventSource || !window?.event_types) {
        return;
    }
    window.eventSource.on(window.event_types.GENERATE_BEFORE_COMBINE_PROMPTS, (data) => {
        const time = stateManager.getSection('time');
        if (!time?.contextInjectionEnabled) {
            return;
        }
        const timeString = generateTimeContext();
        data.prompt += `\n\n[Current Time: ${timeString}]`;
    });

    window.eventSource.on(window.event_types.MESSAGE_SENT, () => {
        const time = stateManager.getSection('time');
        if (time?.timeFlowEnabled) {
            timeSystem.advanceTime(time.minutesPerMessage);
        }
    });

    window.eventSource.on(window.event_types.MESSAGE_RECEIVED, (data) => {
        const time = stateManager.getSection('time');
        const parsed = time?.aiTimeParsingEnabled ? parseTimeFromResponse(data?.message || '') : false;
        if (!parsed && time?.timeFlowEnabled && !time.autoAdvanceTime) {
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

function generateTimeContext() {
    const state = timeSystem.stateManager.getSection('time');
    return `${state.dayName}, ${ordinalSuffix(state.dayOfMonth)} of ${state.monthName}, ${state.year} AV - ${state.timeOfDay} (${padNumber(state.hour)}:${padNumber(state.minute)})`;
}

function applyTimeChange(pattern, match, currentState) {
    if (pattern.unit === 'hours') {
        const hours = pattern.value ?? parseInt(match?.[pattern.group], 10);
        if (!Number.isNaN(hours) && hours > 0 && hours <= 24) {
            timeSystem.advanceHours(hours);
            showTimeAdvanceNotification(`Time advanced ${hours} hour(s)`);
            return true;
        }
    }
    if (pattern.unit === 'minutes') {
        const minutes = pattern.value ?? parseInt(match?.[pattern.group], 10);
        if (!Number.isNaN(minutes) && minutes > 0 && minutes <= 180) {
            timeSystem.advanceTime(minutes);
            showTimeAdvanceNotification(`Time advanced ${minutes} minute(s)`);
            return true;
        }
    }
    if (pattern.unit === 'days') {
        const days = pattern.value ?? parseInt(match?.[pattern.group], 10);
        if (!Number.isNaN(days) && days > 0 && days <= 30) {
            timeSystem.advanceDays(days);
            showTimeAdvanceNotification(`Time advanced ${days} day(s)`);
            return true;
        }
    }
    if (pattern.unit === 'weeks') {
        const weeks = pattern.value ?? parseInt(match?.[pattern.group], 10);
        if (!Number.isNaN(weeks) && weeks > 0 && weeks <= 4) {
            timeSystem.advanceDays(weeks * 7);
            showTimeAdvanceNotification(`Time advanced ${weeks} week(s)`);
            return true;
        }
    }
    if (pattern.unit === 'setTime') {
        const targetHour = pattern.hour;
        if (targetHour <= currentState.hour) {
            timeSystem.advanceDays(1);
        }
        setTimeFromCurrent(targetHour, 0);
        showTimeAdvanceNotification(`Time set to ${formatTimeOfDay(targetHour)}`);
        return true;
    }
    if (pattern.unit === 'nextMorning') {
        timeSystem.advanceDays(1);
        setTimeFromCurrent(8, 0);
        showTimeAdvanceNotification('Advanced to next morning');
        return true;
    }
    return false;
}

function parseTimeFromResponse(responseText) {
    const currentState = timeSystem.stateManager.getSection('time');
    for (const pattern of TIME_PATTERNS) {
        const match = responseText.match(pattern.regex);
        if (match && applyTimeChange(pattern, match, currentState)) {
            return true;
        }
    }
    return false;
}

function setTimeFromCurrent(hour, minute) {
    const time = timeSystem.stateManager.getSection('time');
    timeSystem.setTime(time.year, time.dayOfYear, hour, minute);
}

function formatTimeOfDay(hour) {
    return `${padNumber(hour)}:00`;
}

function showTimeAdvanceNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'vws-time-toast';
    toast.innerHTML = `⏰ ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
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
