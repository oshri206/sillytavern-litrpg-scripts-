import { debounce } from './utils.js';

export const DEFAULT_WORLD_STATE = {
    // Meta
    version: '1.0.0',
    lastUpdated: null,

    // Time System (Phase 1)
    time: {
        year: 2847,
        dayOfYear: 1,
        hour: 8,
        minute: 0,

        // Cached/computed (update when time changes)
        month: 1,
        dayOfMonth: 1,
        dayOfWeek: 1,
        season: 'spring',
        timeOfDay: 'morning',
        monthName: 'Firstlight',
        dayName: 'Solday',

        // Settings
        timeFlowEnabled: true,
        minutesPerMessage: 15,
        autoAdvanceTime: true
    },

    // Placeholder sections for future phases (initialize empty)
    weather: {},
    factions: {},
    events: {},
    rumors: {},
    wars: {},
    dynasties: {},
    npcs: {},
    dungeons: {},
    economy: {},
    divine: {},
    crime: {},
    disasters: {},
    consequences: {},
    settlements: {},
    reputation: {},
    espionage: {},
    settings: {}
};

export class StateManager {
    constructor() {
        this.state = null;
        this.characterId = null;
        this.listeners = {};
        this.saveStateDebounced = debounce(() => this.saveState(), 600);
    }

    async initialize(characterId) {
        this.characterId = characterId;
        const loadedState = await this.loadState();
        if (loadedState) {
            this.state = loadedState;
        } else {
            this.resetState();
        }
        this.emit('initialized', this.state);
        return this.state;
    }

    getState() {
        return this.state;
    }

    getSection(sectionName) {
        return this.state?.[sectionName];
    }

    updateSection(sectionName, data) {
        if (!this.state) {
            return;
        }
        this.state[sectionName] = {
            ...this.state[sectionName],
            ...data
        };
        this.state.lastUpdated = new Date().toISOString();
        this.emit('sectionUpdated', { sectionName, data: this.state[sectionName] });
        this.saveStateDebounced();
    }

    setState(newState) {
        this.state = newState;
        this.state.lastUpdated = new Date().toISOString();
        this.emit('stateUpdated', this.state);
        this.saveStateDebounced();
    }

    async saveState() {
        if (!this.state || !this.characterId) {
            return;
        }
        const key = `valdris_world_state_${this.characterId}`;
        localStorage.setItem(key, JSON.stringify(this.state));
        if (window?.SillyTavern?.getContext) {
            try {
                await window.SillyTavern.getContext().extensionSettings.saveSettings();
            } catch (error) {
                console.warn('Valdris World Simulator: Failed to save extension settings.', error);
            }
        }
    }

    async loadState() {
        if (!this.characterId) {
            return null;
        }
        const key = `valdris_world_state_${this.characterId}`;
        const raw = localStorage.getItem(key);
        if (!raw) {
            return null;
        }
        try {
            return JSON.parse(raw);
        } catch (error) {
            console.warn('Valdris World Simulator: Failed to parse saved state.', error);
            return null;
        }
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (!this.listeners[event]) {
            return;
        }
        this.listeners[event].forEach((callback) => callback(data));
    }

    resetState() {
        this.state = JSON.parse(JSON.stringify(DEFAULT_WORLD_STATE));
        this.state.lastUpdated = new Date().toISOString();
        this.emit('stateReset', this.state);
        this.saveStateDebounced();
    }

    exportState() {
        return JSON.stringify(this.state, null, 2);
    }

    importState(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            this.setState(parsed);
            return true;
        } catch (error) {
            console.warn('Valdris World Simulator: Invalid import JSON.', error);
            return false;
        }
    }
}
