import { debounce } from './utils.js';

export const DEFAULT_WORLD_STATE = {
    version: '1.0.0',
    lastUpdated: null,
    time: {
        year: 2847,
        dayOfYear: 1,
        hour: 8,
        minute: 0,
        month: 1,
        dayOfMonth: 1,
        dayOfWeek: 1,
        season: 'spring',
        timeOfDay: 'morning',
        monthName: 'Firstlight',
        dayName: 'Solday',
        timeFlowEnabled: true,
        minutesPerMessage: 15,
        autoAdvanceTime: true,
        contextInjectionEnabled: true,
        aiTimeParsingEnabled: true
    },
    weather: {
        current: {
            type: 'clear',
            temperature: 65,
            humidity: 50,
            windSpeed: 5,
            windDirection: 'N',
            precipitation: 0,
            visibility: 100,
            lastUpdated: null
        },
        weatherDuration: 0,
        nextWeatherChange: null,
        forecast: [],
        activeEvent: null,
        eventDuration: 0,
        currentRegion: 'default',
        weatherEnabled: true,
        showTemperatureInCelsius: false,
        injectWeatherIntoPrompt: true,
        extremeEventsEnabled: true
    },
    factions: {
        list: {},
        relationships: {},
        playerStandings: {},
        tensions: [],
        alliances: [],
        wars: [],
        history: [],
        factionSystemEnabled: true,
        injectFactionsIntoPrompt: true,
        trackPlayerStandings: true,
        dynamicRelationships: true
    },
    events: {
        active: [],
        scheduled: [],
        history: [],
        globalModifiers: {
            tension: 0,
            prosperity: 0,
            danger: 0,
            stability: 0
        },
        settings: {
            enabled: true,
            autoGenerate: true,
            eventsPerWeek: { min: 1, max: 3 },
            notifyPlayer: true,
            majorEventsOnly: false,
            injectEventsIntoPrompt: true,
            maxActiveEvents: 20,
            maxHistorySize: 100
        },
        lastEventCheck: null,
        cooldowns: {}
    },
    npcAutonomy: {
        npcs: {},
        relationships: {},
        settings: {
            enabled: true,
            simulateOnTimeChange: true,
            simulationDepth: 'normal',
            importantNPCsOnly: false,
            enableLifeEvents: true,
            enableNPCDeaths: true,
            enableNPCBirths: true,
            injectNPCsIntoPrompt: true,
            maxNPCsInPrompt: 5
        },
        lastSimulation: null,
        simulationHistory: [],
        playerInteractions: {}
    },
    rumors: {
        news: [],
        playerKnowledge: [],
        spread: {},
        pendingRumors: [],
        settings: {
            enabled: true,
            autoGenerateFromEvents: true,
            spreadSimulation: true,
            rumorMutation: true,
            showNewsNotifications: true,
            injectNewsIntoPrompt: true,
            maxNewsItems: 100,
            newsExpirationDays: 60
        },
        stats: {
            totalGenerated: 0,
            totalExpired: 0,
            mutations: 0
        }
    },
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
