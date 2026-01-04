import { StateManager } from './state-manager.js';
import { TimeSystem } from './time-system.js';
import { WeatherSystem } from './weather-system.js';
import { FactionSystem } from './faction-system.js';
import { EventSystem } from './event-system.js';
import { NPCAutonomySystem } from './npc-autonomy.js';
import { clamp, ordinalSuffix, padNumber, toTitleCase } from './utils.js';

const EXTENSION_ID = 'valdris-world-simulator';
const EXTENSION_TITLE = 'Valdris World Simulator';

const stateManager = new StateManager();
const timeSystem = new TimeSystem(stateManager);
const weatherSystem = new WeatherSystem(stateManager, timeSystem);
const factionSystem = new FactionSystem(stateManager, timeSystem);
const eventSystem = new EventSystem(stateManager, timeSystem, factionSystem);
const npcAutonomySystem = new NPCAutonomySystem(stateManager, timeSystem, factionSystem, eventSystem);

const TIME_PATTERNS = [
    { regex: /(\d+)\s*hours?\s*later/i, unit: 'hours', group: 1 },
    { regex: /after\s*(\d+)\s*hours?/i, unit: 'hours', group: 1 },
    { regex: /(\d+)\s*hours?\s*pass(?:es|ed)?/i, unit: 'hours', group: 1 },
    { regex: /(\d+)\s*minutes?\s*later/i, unit: 'minutes', group: 1 },
    { regex: /after\s*(\d+)\s*minutes?/i, unit: 'minutes', group: 1 },
    { regex: /(\d+)\s*minutes?\s*pass(?:es|ed)?/i, unit: 'minutes', group: 1 },
    { regex: /(\d+)\s*days?\s*later/i, unit: 'days', group: 1 },
    { regex: /after\s*(\d+)\s*days?/i, unit: 'days', group: 1 },
    { regex: /(\d+)\s*days?\s*pass(?:es|ed)?/i, unit: 'days', group: 1 },
    { regex: /(\d+)\s*weeks?\s*later/i, unit: 'weeks', group: 1 },
    { regex: /after\s*(\d+)\s*weeks?/i, unit: 'weeks', group: 1 },
    { regex: /a\s*week\s*later/i, unit: 'weeks', value: 1 },
    { regex: /(?:a|one)\s*hour\s*later/i, unit: 'hours', value: 1 },
    { regex: /(?:a\s*)?couple\s*(?:of\s*)?hours?\s*later/i, unit: 'hours', value: 2 },
    { regex: /(?:a\s*)?few\s*hours?\s*later/i, unit: 'hours', value: 3 },
    { regex: /several\s*hours?\s*later/i, unit: 'hours', value: 5 },
    { regex: /many\s*hours?\s*later/i, unit: 'hours', value: 8 },
    { regex: /(?:a|one)\s*day\s*later/i, unit: 'days', value: 1 },
    { regex: /(?:a\s*)?couple\s*(?:of\s*)?days?\s*later/i, unit: 'days', value: 2 },
    { regex: /(?:a\s*)?few\s*days?\s*later/i, unit: 'days', value: 3 },
    { regex: /several\s*days?\s*later/i, unit: 'days', value: 5 },
    { regex: /(?:by|at|when)\s*(?:the\s*)?dawn(?:\s*breaks)?/i, unit: 'setTime', hour: 6 },
    { regex: /(?:by|at|when)\s*(?:the\s*)?morning/i, unit: 'setTime', hour: 8 },
    { regex: /(?:by|at|when)\s*(?:the\s*)?midday/i, unit: 'setTime', hour: 12 },
    { regex: /(?:by|at|when)\s*(?:the\s*)?noon/i, unit: 'setTime', hour: 12 },
    { regex: /(?:by|at|when)\s*(?:the\s*)?afternoon/i, unit: 'setTime', hour: 14 },
    { regex: /(?:by|at|when)\s*(?:the\s*)?dusk/i, unit: 'setTime', hour: 18 },
    { regex: /(?:by|at|when)\s*(?:the\s*)?evening/i, unit: 'setTime', hour: 19 },
    { regex: /(?:by|at|when)\s*(?:the\s*)?nightfall/i, unit: 'setTime', hour: 21 },
    { regex: /(?:by|at|when)\s*(?:the\s*)?night/i, unit: 'setTime', hour: 21 },
    { regex: /(?:by|at|when)\s*(?:the\s*)?midnight/i, unit: 'setTime', hour: 0 },
    { regex: /(?:the\s*)?next\s*(?:day|morning)/i, unit: 'nextMorning' },
    { regex: /(?:the\s*)?following\s*(?:day|morning)/i, unit: 'nextMorning' },
    { regex: /(?:when\s*)?(?:you\s*)?(?:wake|woke)\s*(?:up)?(?:\s*the\s*next\s*(?:day|morning))?/i, unit: 'nextMorning' },
    { regex: /that\s*night/i, unit: 'setTime', hour: 21 },
    { regex: /later\s*that\s*(?:same\s*)?day/i, unit: 'hours', value: 4 },
    { regex: /later\s*that\s*(?:same\s*)?evening/i, unit: 'setTime', hour: 20 },
    { regex: /two\s*hours?\s*later/i, unit: 'hours', value: 2 },
    { regex: /three\s*hours?\s*later/i, unit: 'hours', value: 3 },
    { regex: /four\s*hours?\s*later/i, unit: 'hours', value: 4 },
    { regex: /five\s*hours?\s*later/i, unit: 'hours', value: 5 },
    { regex: /six\s*hours?\s*later/i, unit: 'hours', value: 6 },
    { regex: /two\s*days?\s*later/i, unit: 'days', value: 2 },
    { regex: /three\s*days?\s*later/i, unit: 'days', value: 3 },
    { regex: /overnight/i, unit: 'hours', value: 8 },
    { regex: /through\s*the\s*night/i, unit: 'hours', value: 8 },
    { regex: /all\s*(?:through\s*the\s*)?night/i, unit: 'hours', value: 10 },
    { regex: /as\s*(?:the\s*)?sun\s*(?:rises|rose)/i, unit: 'setTime', hour: 6 },
    { regex: /as\s*(?:the\s*)?sun\s*(?:sets|set)/i, unit: 'setTime', hour: 18 }
];

window.ValdrisWorldSim = {
    state: stateManager,
    time: timeSystem,
    weather: weatherSystem,
    factions: factionSystem,
    events: eventSystem,
    npcAutonomy: npcAutonomySystem
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
            <div class="vws-weather-display" data-role="weather-display" data-weather="clear">
                <div class="vws-weather-main">
                    <span class="vws-weather-icon" data-role="weather-icon">☀️</span>
                    <span class="vws-weather-type" data-role="weather-type">Clear</span>
                    <span class="vws-weather-temp" data-role="weather-temp">—</span>
                </div>
                <div class="vws-weather-detail" data-role="weather-detail">—</div>
            </div>
            <div class="vws-extreme-event-banner hidden" data-role="weather-event">
                <span class="event-icon" data-role="event-icon">⚠️</span>
                <span class="event-name" data-role="event-name">Extreme Event</span>
                <span class="event-duration" data-role="event-duration">—</span>
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
            <div class="vws-faction-panel">
                <div class="vws-section-header">
                    <span>⚔️ Factions</span>
                    <button class="vws-expand-btn" data-action="toggle-factions">▼</button>
                </div>
                <div class="vws-faction-content hidden" data-role="faction-content">
                    <div class="vws-player-standings" data-role="player-standings"></div>
                    <div class="vws-faction-buttons">
                        <button data-action="view-all-factions">📋 All Factions</button>
                        <button data-action="view-relationships">🔗 Relationships</button>
                        <button data-action="view-tensions">⚡ Tensions</button>
                        <button data-action="view-wars">⚔️ Wars</button>
                    </div>
                </div>
            </div>
            <div class="vws-events-panel">
                <div class="vws-section-header">
                    <span>📰 World Events</span>
                    <span class="vws-event-count" data-role="event-count">0 active</span>
                    <button class="vws-expand-btn" data-action="toggle-events">▼</button>
                </div>
                <div class="vws-events-content hidden" data-role="events-content">
                    <div class="vws-active-events" data-role="active-events"></div>
                    <div class="vws-event-buttons">
                        <button data-action="view-events">📋 All Events</button>
                        <button data-action="view-event-history">📜 History</button>
                        <button data-action="trigger-event">🎲 Trigger Event</button>
                    </div>
                </div>
            </div>
            <div class="vws-npc-panel">
                <div class="vws-section-header">
                    <span>👥 NPCs</span>
                    <span class="vws-npc-count" data-role="npc-count">0 active</span>
                    <button class="vws-expand-btn" data-action="toggle-npcs">▼</button>
                </div>
                <div class="vws-npc-content hidden" data-role="npc-content">
                    <div class="vws-npc-activity" data-role="npc-activity"></div>
                    <div class="vws-npc-buttons">
                        <button data-action="view-npcs">👥 All NPCs</button>
                        <button data-action="view-leaders">👑 Leaders</button>
                        <button data-action="view-npc-history">📜 History</button>
                    </div>
                </div>
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
                <div class="valdris-settings__subtitle">Weather</div>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="weatherEnabled" /> Enable weather system
                </label>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="injectWeatherIntoPrompt" /> Include weather in prompts
                </label>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="extremeEventsEnabled" /> Enable extreme weather events
                </label>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="showTemperatureInCelsius" /> Show temperature in Celsius
                </label>
                <button class="valdris-button" data-action="randomize-weather">🎲 Randomize Weather</button>
            </div>
            <div class="valdris-settings__section">
                <div class="valdris-settings__subtitle">Factions</div>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="factionSystemEnabled" /> Enable faction system
                </label>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="injectFactionsIntoPrompt" /> Include faction standings in prompts
                </label>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="dynamicRelationships" /> Enable dynamic relationship changes
                </label>
                <button class="valdris-button" data-action="reset-factions">🔄 Reset Factions to Default</button>
            </div>
            <div class="valdris-settings__section">
                <div class="valdris-settings__subtitle">World Events</div>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="eventsEnabled" /> Enable event system
                </label>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="eventsAuto" /> Auto-generate events
                </label>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="eventsNotify" /> Show event notifications
                </label>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="eventsInject" /> Include events in prompts
                </label>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="eventsMajorOnly" /> Major events only
                </label>
                <label class="valdris-field">
                    Events per week:
                    <input type="number" min="0" max="10" data-setting="eventsPerWeek" />
                </label>
            </div>
            <div class="valdris-settings__section">
                <div class="valdris-settings__subtitle">NPC Autonomy</div>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="npcEnabled" /> Enable NPC simulation
                </label>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="npcSimulate" /> Simulate on time change
                </label>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="npcLifeEvents" /> Enable life events
                </label>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="npcDeaths" /> Enable NPC deaths
                </label>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="npcBirths" /> Enable NPC births
                </label>
                <label class="valdris-checkbox">
                    <input type="checkbox" data-setting="npcInject" /> Include NPCs in prompts
                </label>
                <label class="valdris-field">
                    Simulation depth:
                    <select data-setting="npcDepth">
                        <option value="minimal">Minimal (leaders only)</option>
                        <option value="normal">Normal</option>
                        <option value="detailed">Detailed</option>
                    </select>
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
        <div class="vws-modal vws-faction-modal hidden" data-role="faction-modal">
            <div class="vws-modal-content">
                <div class="vws-modal-header">
                    <h3>📋 Faction Details</h3>
                    <button class="vws-modal-close" data-action="close-faction-modal">×</button>
                </div>
                <div class="vws-modal-body" data-role="faction-modal-body"></div>
            </div>
        </div>
        <div class="vws-modal vws-events-modal hidden" data-role="events-modal">
            <div class="vws-modal-content large">
                <div class="vws-modal-header">
                    <h3>📰 World Events</h3>
                    <button class="vws-modal-close" data-action="close-events-modal">×</button>
                </div>
                <div class="vws-modal-body" data-role="events-modal-body"></div>
            </div>
        </div>
        <div class="vws-modal vws-npc-modal hidden" data-role="npc-modal">
            <div class="vws-modal-content large">
                <div class="vws-modal-header">
                    <h3>👥 Autonomous NPCs</h3>
                    <button class="vws-modal-close" data-action="close-npc-modal">×</button>
                </div>
                <div class="vws-modal-body" data-role="npc-modal-body"></div>
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

    updateWeatherUI(panel);
    updateFactionUI(panel);
    updateEventUI(panel);
    updateNPCUI(panel);
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
        if (action === 'randomize-weather') {
            weatherSystem.forceWeatherUpdate();
        }
        if (action === 'toggle-factions') {
            panel.querySelector('[data-role="faction-content"]').classList.toggle('hidden');
        }
        if (action === 'view-all-factions') {
            openFactionModal(panel, 'all');
        }
        if (action === 'view-relationships') {
            openFactionModal(panel, 'relationships');
        }
        if (action === 'view-tensions') {
            openFactionModal(panel, 'tensions');
        }
        if (action === 'view-wars') {
            openFactionModal(panel, 'wars');
        }
        if (action === 'reset-factions') {
            resetFactions();
        }
        if (action === 'close-faction-modal') {
            panel.querySelector('[data-role="faction-modal"]').classList.add('hidden');
        }
        if (action === 'toggle-events') {
            panel.querySelector('[data-role="events-content"]').classList.toggle('hidden');
        }
        if (action === 'view-events') {
            openEventsModal(panel, 'active');
        }
        if (action === 'view-event-history') {
            openEventsModal(panel, 'history');
        }
        if (action === 'trigger-event') {
            eventSystem.generateRandomEvent();
            updateEventUI(panel);
        }
        if (action === 'close-events-modal') {
            panel.querySelector('[data-role="events-modal"]').classList.add('hidden');
        }
        if (action === 'toggle-npcs') {
            panel.querySelector('[data-role="npc-content"]').classList.toggle('hidden');
        }
        if (action === 'view-npcs') {
            openNPCModal(panel, 'all');
        }
        if (action === 'view-leaders') {
            openNPCModal(panel, 'leaders');
        }
        if (action === 'view-npc-history') {
            openNPCModal(panel, 'history');
        }
        if (action === 'close-npc-modal') {
            panel.querySelector('[data-role="npc-modal"]').classList.add('hidden');
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

    panel.querySelector('[data-setting="weatherEnabled"]').addEventListener('change', (event) => {
        stateManager.updateSection('weather', { weatherEnabled: event.target.checked });
        if (event.target.checked) {
            weatherSystem.forceWeatherUpdate();
        }
    });

    panel.querySelector('[data-setting="injectWeatherIntoPrompt"]').addEventListener('change', (event) => {
        stateManager.updateSection('weather', { injectWeatherIntoPrompt: event.target.checked });
    });

    panel.querySelector('[data-setting="extremeEventsEnabled"]').addEventListener('change', (event) => {
        stateManager.updateSection('weather', { extremeEventsEnabled: event.target.checked });
    });

    panel.querySelector('[data-setting="showTemperatureInCelsius"]').addEventListener('change', (event) => {
        stateManager.updateSection('weather', { showTemperatureInCelsius: event.target.checked });
        updateWeatherUI(panel);
    });

    panel.querySelector('[data-setting="factionSystemEnabled"]').addEventListener('change', (event) => {
        stateManager.updateSection('factions', { factionSystemEnabled: event.target.checked });
        updateFactionUI(panel);
    });

    panel.querySelector('[data-setting="injectFactionsIntoPrompt"]').addEventListener('change', (event) => {
        stateManager.updateSection('factions', { injectFactionsIntoPrompt: event.target.checked });
    });

    panel.querySelector('[data-setting="dynamicRelationships"]').addEventListener('change', (event) => {
        stateManager.updateSection('factions', { dynamicRelationships: event.target.checked });
    });

    panel.querySelector('[data-setting="eventsEnabled"]').addEventListener('change', (event) => {
        const events = stateManager.getSection('events');
        stateManager.updateSection('events', { settings: { ...events.settings, enabled: event.target.checked } });
        updateEventUI(panel);
    });

    panel.querySelector('[data-setting="eventsAuto"]').addEventListener('change', (event) => {
        const events = stateManager.getSection('events');
        stateManager.updateSection('events', { settings: { ...events.settings, autoGenerate: event.target.checked } });
    });

    panel.querySelector('[data-setting="eventsNotify"]').addEventListener('change', (event) => {
        const events = stateManager.getSection('events');
        stateManager.updateSection('events', { settings: { ...events.settings, notifyPlayer: event.target.checked } });
    });

    panel.querySelector('[data-setting="eventsInject"]').addEventListener('change', (event) => {
        const events = stateManager.getSection('events');
        stateManager.updateSection('events', { settings: { ...events.settings, injectEventsIntoPrompt: event.target.checked } });
    });

    panel.querySelector('[data-setting="eventsMajorOnly"]').addEventListener('change', (event) => {
        const events = stateManager.getSection('events');
        stateManager.updateSection('events', { settings: { ...events.settings, majorEventsOnly: event.target.checked } });
    });

    panel.querySelector('[data-setting="eventsPerWeek"]').addEventListener('change', (event) => {
        const value = clamp(Number(event.target.value), 0, 10);
        const events = stateManager.getSection('events');
        stateManager.updateSection('events', { settings: { ...events.settings, eventsPerWeek: { min: value, max: value } } });
    });

    panel.querySelector('[data-setting="npcEnabled"]').addEventListener('change', (event) => {
        const npcState = stateManager.getSection('npcAutonomy');
        stateManager.updateSection('npcAutonomy', { settings: { ...npcState.settings, enabled: event.target.checked } });
        updateNPCUI(panel);
    });

    panel.querySelector('[data-setting="npcSimulate"]').addEventListener('change', (event) => {
        const npcState = stateManager.getSection('npcAutonomy');
        stateManager.updateSection('npcAutonomy', { settings: { ...npcState.settings, simulateOnTimeChange: event.target.checked } });
    });

    panel.querySelector('[data-setting="npcLifeEvents"]').addEventListener('change', (event) => {
        const npcState = stateManager.getSection('npcAutonomy');
        stateManager.updateSection('npcAutonomy', { settings: { ...npcState.settings, enableLifeEvents: event.target.checked } });
    });

    panel.querySelector('[data-setting="npcDeaths"]').addEventListener('change', (event) => {
        const npcState = stateManager.getSection('npcAutonomy');
        stateManager.updateSection('npcAutonomy', { settings: { ...npcState.settings, enableNPCDeaths: event.target.checked } });
    });

    panel.querySelector('[data-setting="npcBirths"]').addEventListener('change', (event) => {
        const npcState = stateManager.getSection('npcAutonomy');
        stateManager.updateSection('npcAutonomy', { settings: { ...npcState.settings, enableNPCBirths: event.target.checked } });
    });

    panel.querySelector('[data-setting="npcInject"]').addEventListener('change', (event) => {
        const npcState = stateManager.getSection('npcAutonomy');
        stateManager.updateSection('npcAutonomy', { settings: { ...npcState.settings, injectNPCsIntoPrompt: event.target.checked } });
    });

    panel.querySelector('[data-setting="npcDepth"]').addEventListener('change', (event) => {
        const npcState = stateManager.getSection('npcAutonomy');
        stateManager.updateSection('npcAutonomy', { settings: { ...npcState.settings, simulationDepth: event.target.value } });
    });
}

function hookSillyTavernEvents() {
    if (!window?.eventSource || !window?.event_types) {
        return;
    }
    window.eventSource.on(window.event_types.GENERATE_BEFORE_COMBINE_PROMPTS, (data) => {
        const time = stateManager.getSection('time');
        const weather = stateManager.getSection('weather');
        const factions = stateManager.getSection('factions');
        const events = stateManager.getSection('events');
        const npcState = stateManager.getSection('npcAutonomy');
        const contextLines = [];
        if (time?.contextInjectionEnabled) {
            contextLines.push(`[Current Time: ${generateTimeContext()}]`);
        }
        if (weather?.weatherEnabled && weather?.injectWeatherIntoPrompt) {
            contextLines.push(`[Weather: ${weatherSystem.getWeatherForPrompt()}]`);
        }
        if (factions?.factionSystemEnabled && factions?.injectFactionsIntoPrompt) {
            const factionContext = factionSystem.getFactionsForPrompt();
            if (factionContext) {
                contextLines.push(`[Faction Standing: ${factionContext}]`);
            }
        }
        if (events?.settings?.enabled && events?.settings?.injectEventsIntoPrompt) {
            const eventContext = eventSystem.getEventsForPrompt();
            if (eventContext) {
                contextLines.push(`[Recent Events: ${eventContext}]`);
            }
        }
        if (npcState?.settings?.enabled && npcState?.settings?.injectNPCsIntoPrompt) {
            const npcContext = npcAutonomySystem.getNPCsForPrompt();
            if (npcContext) {
                contextLines.push(`[Notable NPCs: ${npcContext}]`);
            }
        }
        if (contextLines.length) {
            data.prompt += `\n\n${contextLines.join('\n')}`;
        }
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
        weatherSystem.refreshState();
        factionSystem.initialize();
        eventSystem.initialize();
        npcAutonomySystem.initialize();
    });
}

function generateTimeContext() {
    const state = timeSystem.stateManager.getSection('time');
    return `${state.dayName}, ${ordinalSuffix(state.dayOfMonth)} of ${state.monthName}, ${state.year} AV - ${toTitleCase(state.timeOfDay)} (${padNumber(state.hour)}:${padNumber(state.minute)})`;
}

function updateWeatherUI(panel) {
    const weatherState = weatherSystem.getCurrentWeather();
    if (!weatherState) {
        return;
    }
    const weatherType = weatherSystem.WEATHER_TYPES[weatherState.current.type];
    panel.querySelector('[data-role="weather-icon"]').textContent = weatherType.icon;
    panel.querySelector('[data-role="weather-type"]').textContent = weatherType.name;
    panel.querySelector('[data-role="weather-temp"]').textContent = weatherSystem.getDisplayTemperature();
    panel.querySelector('[data-role="weather-detail"]').textContent = weatherSystem.getWeatherDescription();
    panel.querySelector('[data-role="weather-display"]').dataset.weather = weatherState.current.type;

    const settings = panel.querySelector('.valdris-settings');
    settings.querySelector('[data-setting="weatherEnabled"]').checked = weatherState.weatherEnabled;
    settings.querySelector('[data-setting="injectWeatherIntoPrompt"]').checked = weatherState.injectWeatherIntoPrompt;
    settings.querySelector('[data-setting="extremeEventsEnabled"]').checked = weatherState.extremeEventsEnabled;
    settings.querySelector('[data-setting="showTemperatureInCelsius"]').checked = weatherState.showTemperatureInCelsius;

    const eventBanner = panel.querySelector('[data-role="weather-event"]');
    if (weatherState.activeEvent) {
        eventBanner.classList.remove('hidden');
        eventBanner.querySelector('[data-role="event-icon"]').textContent = weatherState.activeEvent.icon;
        eventBanner.querySelector('[data-role="event-name"]').textContent = weatherState.activeEvent.name;
        eventBanner.querySelector('[data-role="event-duration"]').textContent = `${weatherState.eventDuration}h remaining`;
    } else {
        eventBanner.classList.add('hidden');
    }
}

function updateFactionUI(panel) {
    const factionState = stateManager.getSection('factions');
    if (!factionState) {
        return;
    }
    const settings = panel.querySelector('.valdris-settings');
    settings.querySelector('[data-setting="factionSystemEnabled"]').checked = factionState.factionSystemEnabled;
    settings.querySelector('[data-setting="injectFactionsIntoPrompt"]').checked = factionState.injectFactionsIntoPrompt;
    settings.querySelector('[data-setting="dynamicRelationships"]').checked = factionState.dynamicRelationships;

    const container = panel.querySelector('[data-role="player-standings"]');
    container.innerHTML = '';
    if (!factionState.factionSystemEnabled) {
        container.innerHTML = '<div class="vws-empty-state">Faction system disabled.</div>';
        return;
    }
    const factions = factionSystem.getAllFactions();
    Object.entries(factions).forEach(([id, data]) => {
        const standing = factionSystem.getPlayerStanding(id);
        const level = factionSystem.getPlayerStandingLevel(id);
        const normalized = ((standing + 100) / 200) * 100;
        const item = document.createElement('div');
        item.className = 'vws-standing-item';
        item.dataset.faction = id;
        item.innerHTML = `
            <span class="faction-name">${data.shortName}</span>
            <span class="standing-bar">
                <span class="standing-fill ${level.toLowerCase()}" style="width: ${normalized}%;"></span>
            </span>
            <span class="standing-label">${level} (${standing >= 0 ? '+' : ''}${standing})</span>
        `;
        container.appendChild(item);
    });
}

function openFactionModal(panel, view) {
    const modal = panel.querySelector('[data-role="faction-modal"]');
    const body = panel.querySelector('[data-role="faction-modal-body"]');
    body.innerHTML = '';
    if (view === 'all') {
        const factions = factionSystem.getAllFactions();
        Object.entries(factions).forEach(([, data]) => {
            const block = document.createElement('div');
            block.className = 'vws-faction-info';
            block.style.setProperty('--faction-color', data.color);
            block.innerHTML = `
                <div class="faction-header">
                    <h4 class="faction-name">${data.name}</h4>
                    <span class="faction-type">${toTitleCase(data.type)} • ${toTitleCase(data.government)}</span>
                </div>
                <div class="faction-description">${data.description}</div>
            `;
            body.appendChild(block);
        });
    }
    if (view === 'relationships') {
        const relationships = factionSystem.getAllRelationshipsFor('valdric_empire');
        const list = document.createElement('div');
        list.className = 'relationship-list';
        Object.entries(relationships).forEach(([key, value]) => {
            const item = document.createElement('div');
            item.className = 'relationship-item';
            item.innerHTML = `<span class="rel-faction">${key}</span><span class="rel-value">${value}</span>`;
            list.appendChild(item);
        });
        body.appendChild(list);
    }
    if (view === 'tensions') {
        const tensions = factionSystem.getAllTensions();
        body.innerHTML = tensions.length
            ? tensions.map((tension) => `<div class="relationship-item">${tension.reason} (${tension.severity})</div>`).join('')
            : '<div class="vws-empty-state">No active tensions.</div>';
    }
    if (view === 'wars') {
        const wars = factionSystem.getActiveWars();
        body.innerHTML = wars.length
            ? wars.map((war) => `<div class="relationship-item">${war.aggressor} vs ${war.defender}</div>`).join('')
            : '<div class="vws-empty-state">No active wars.</div>';
    }
    modal.classList.remove('hidden');
}

function resetFactions() {
    const factions = stateManager.getSection('factions');
    stateManager.updateSection('factions', {
        ...factions,
        list: {},
        relationships: {},
        playerStandings: {},
        tensions: [],
        alliances: [],
        wars: [],
        history: []
    });
    factionSystem.initialize();
}

function updateEventUI(panel) {
    const eventsState = stateManager.getSection('events');
    if (!eventsState) {
        return;
    }
    const settings = panel.querySelector('.valdris-settings');
    settings.querySelector('[data-setting="eventsEnabled"]').checked = eventsState.settings.enabled;
    settings.querySelector('[data-setting="eventsAuto"]').checked = eventsState.settings.autoGenerate;
    settings.querySelector('[data-setting="eventsNotify"]').checked = eventsState.settings.notifyPlayer;
    settings.querySelector('[data-setting="eventsInject"]').checked = eventsState.settings.injectEventsIntoPrompt;
    settings.querySelector('[data-setting="eventsMajorOnly"]').checked = eventsState.settings.majorEventsOnly;
    settings.querySelector('[data-setting="eventsPerWeek"]').value = eventsState.settings.eventsPerWeek.min;

    const count = panel.querySelector('[data-role="event-count"]');
    count.textContent = `${eventSystem.getActiveEventCount()} active`;

    const list = panel.querySelector('[data-role="active-events"]');
    list.innerHTML = '';
    if (!eventsState.settings.enabled) {
        list.innerHTML = '<div class="vws-empty-state">Event system disabled.</div>';
        return;
    }
    const active = eventSystem.getActiveEvents();
    if (!active.length) {
        list.innerHTML = '<div class="vws-empty-state">No active events.</div>';
        return;
    }
    active.forEach((event) => {
        const typeMeta = eventSystem.EVENT_TYPES[event.type];
        const item = document.createElement('div');
        item.className = 'vws-event-item';
        item.dataset.severity = event.severity;
        item.innerHTML = `
            <span class="event-icon">${typeMeta?.icon || '📰'}</span>
            <div class="event-info">
                <span class="event-name">${event.name}</span>
                <span class="event-meta">${event.startDate} • ${typeMeta?.name || event.type}</span>
            </div>
            <span class="event-severity ${event.severity}">!</span>
        `;
        list.appendChild(item);
    });
}

function openEventsModal(panel, view) {
    const modal = panel.querySelector('[data-role="events-modal"]');
    const body = panel.querySelector('[data-role="events-modal-body"]');
    body.innerHTML = '';
    if (view === 'active') {
        eventSystem.getActiveEvents().forEach((event) => {
            const typeMeta = eventSystem.EVENT_TYPES[event.type];
            const detail = document.createElement('div');
            detail.className = 'vws-event-detail';
            detail.dataset.type = event.type;
            detail.innerHTML = `
                <div class="event-header">
                    <span class="event-icon large">${typeMeta?.icon || '📰'}</span>
                    <div class="event-title">
                        <h4>${event.name}</h4>
                        <span class="event-type">${typeMeta?.name || event.type} • ${event.severity}</span>
                    </div>
                </div>
                <p class="event-description">${event.description}</p>
                <div class="event-meta-grid">
                    <div class="meta-item"><label>Started:</label><span>${event.startDate}</span></div>
                    <div class="meta-item"><label>Ends:</label><span>${event.endDate}</span></div>
                    <div class="meta-item"><label>Subtype:</label><span>${event.subtype}</span></div>
                </div>
            `;
            body.appendChild(detail);
        });
        if (!eventSystem.getActiveEvents().length) {
            body.innerHTML = '<div class="vws-empty-state">No active events.</div>';
        }
    }
    if (view === 'history') {
        const history = eventSystem.getRecentEvents(20);
        body.innerHTML = history.length
            ? history.map((event) => `<div class="vws-event-detail" data-type="${event.type}">${event.name}</div>`).join('')
            : '<div class="vws-empty-state">No event history.</div>';
    }
    modal.classList.remove('hidden');
}

function showEventNotification(event) {
    const settings = stateManager.getSection('events').settings;
    if (!settings.notifyPlayer) {
        return;
    }
    const typeMeta = eventSystem.EVENT_TYPES[event.type];
    const toast = document.createElement('div');
    toast.className = 'vws-event-toast';
    toast.style.setProperty('--event-color', typeMeta?.color || '#666');
    toast.innerHTML = `
        <button class="toast-close">×</button>
        <div class="toast-header">
            <span class="toast-icon">${typeMeta?.icon || '📰'}</span>
            <span class="toast-title">${event.name}</span>
        </div>
        <div class="toast-body">${event.description}</div>
    `;
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function updateNPCUI(panel) {
    const npcState = stateManager.getSection('npcAutonomy');
    if (!npcState) {
        return;
    }
    const settings = panel.querySelector('.valdris-settings');
    settings.querySelector('[data-setting="npcEnabled"]').checked = npcState.settings.enabled;
    settings.querySelector('[data-setting="npcSimulate"]').checked = npcState.settings.simulateOnTimeChange;
    settings.querySelector('[data-setting="npcLifeEvents"]').checked = npcState.settings.enableLifeEvents;
    settings.querySelector('[data-setting="npcDeaths"]').checked = npcState.settings.enableNPCDeaths;
    settings.querySelector('[data-setting="npcBirths"]').checked = npcState.settings.enableNPCBirths;
    settings.querySelector('[data-setting="npcInject"]').checked = npcState.settings.injectNPCsIntoPrompt;
    settings.querySelector('[data-setting="npcDepth"]').value = npcState.settings.simulationDepth;

    const count = panel.querySelector('[data-role="npc-count"]');
    const alive = npcAutonomySystem.getAllNPCs().filter((npc) => npc.isAlive).length;
    count.textContent = `${alive} active`;

    const activity = panel.querySelector('[data-role="npc-activity"]');
    activity.innerHTML = '';
    if (!npcState.settings.enabled) {
        activity.innerHTML = '<div class="vws-empty-state">NPC simulation disabled.</div>';
        return;
    }
    const history = npcState.simulationHistory.slice(-5).reverse();
    if (!history.length) {
        activity.innerHTML = '<div class="vws-empty-state">No recent NPC activity.</div>';
        return;
    }
    history.forEach((entry) => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <span class="activity-icon">•</span>
            <span class="activity-text">${entry.npcName} ${entry.type}</span>
            <span class="activity-time">${entry.date}</span>
        `;
        activity.appendChild(item);
    });
}

function openNPCModal(panel, view) {
    const modal = panel.querySelector('[data-role="npc-modal"]');
    const body = panel.querySelector('[data-role="npc-modal-body"]');
    body.innerHTML = '';
    if (view === 'history') {
        const history = stateManager.getSection('npcAutonomy').simulationHistory.slice(-20).reverse();
        body.innerHTML = history.length
            ? history.map((entry) => `<div class="activity-item"><span class="activity-text">${entry.npcName} ${entry.type}</span><span class="activity-time">${entry.date}</span></div>`).join('')
            : '<div class="vws-empty-state">No NPC history.</div>';
    } else {
        const npcs = view === 'leaders' ? npcAutonomySystem.getImportantNPCs() : npcAutonomySystem.getAllNPCs();
        npcs.forEach((npc) => {
            const card = document.createElement('div');
            card.className = 'vws-npc-card';
            card.innerHTML = `
                <div class="npc-portrait">
                    <span class="npc-icon">👤</span>
                    <span class="npc-status ${npc.isAlive ? 'alive' : 'dead'}"></span>
                </div>
                <div class="npc-info">
                    <div class="npc-name">${npc.name}</div>
                    <div class="npc-title">${npc.title}</div>
                    <div class="npc-faction">${npc.faction} • ${npc.factionRank}</div>
                </div>
                <div class="npc-stats">
                    <div class="stat-mini"><span class="stat-icon">❤️</span><span class="stat-value">${npc.health ?? '—'}</span></div>
                    <div class="stat-mini"><span class="stat-icon">💰</span><span class="stat-value">${npc.wealth ?? '—'}</span></div>
                    <div class="stat-mini"><span class="stat-icon">⭐</span><span class="stat-value">${npc.influence ?? '—'}</span></div>
                </div>
                <div class="npc-location">📍 ${npc.currentLocation} (${npc.currentActivity})</div>
            `;
            body.appendChild(card);
        });
        if (!npcs.length) {
            body.innerHTML = '<div class="vws-empty-state">No NPCs found.</div>';
        }
    }
    modal.classList.remove('hidden');
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

    weatherSystem.initialize();
    factionSystem.initialize();
    eventSystem.initialize();
    npcAutonomySystem.initialize();

    const panel = attachPanel();
    handlePanelEvents(panel);

    timeSystem.onTimeAdvanced(() => updatePanel(panel));
    stateManager.on('stateUpdated', () => updatePanel(panel));
    stateManager.on('sectionUpdated', () => updatePanel(panel));
    stateManager.on('stateReset', () => {
        weatherSystem.refreshState();
        factionSystem.initialize();
        eventSystem.initialize();
        npcAutonomySystem.initialize();
        updatePanel(panel);
    });
    weatherSystem.onWeatherChanged(() => updatePanel(panel));
    eventSystem.onEventStarted((event) => {
        updatePanel(panel);
        showEventNotification(event);
    });
    eventSystem.onEventResolved(() => updatePanel(panel));
    npcAutonomySystem.onNPCEvent(() => updatePanel(panel));
    updatePanel(panel);

    hookSillyTavernEvents();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
