import { clamp } from './utils.js';

export const DEFAULT_FACTIONS = {
    valdric_empire: {
        name: 'The Valdric Empire',
        shortName: 'Valdric',
        type: 'nation',
        government: 'empire',
        power: 95,
        alignment: 'lawful_neutral',
        description: 'The dominant human empire, seat of the High King',
        capital: 'Valdris Prime',
        leader: 'High King Aldric Valdren IV',
        playerStanding: 0,
        traits: ['expansionist', 'bureaucratic', 'militaristic'],
        color: '#4a90d9'
    },
    sylvan_dominion: {
        name: 'The Sylvan Dominion',
        shortName: 'Sylvan',
        type: 'nation',
        government: 'monarchy',
        power: 70,
        alignment: 'neutral_good',
        description: 'Ancient elven forest kingdom',
        capital: 'Aelindra',
        leader: 'Queen Selenara Moonweave',
        playerStanding: 0,
        traits: ['isolationist', 'magical', 'ancient'],
        color: '#2ecc71'
    },
    dwarven_holds: {
        name: 'The Dwarven Holds',
        shortName: 'Dwarven',
        type: 'nation',
        government: 'confederation',
        power: 75,
        alignment: 'lawful_good',
        description: 'Underground confederation of dwarven mountain kingdoms',
        capital: 'Khaz-Morath',
        leader: 'High Thane Borin Ironforge',
        playerStanding: 0,
        traits: ['industrious', 'stubborn', 'honorable'],
        color: '#e67e22'
    },
    orcish_dominion: {
        name: 'The Orcish Dominion',
        shortName: 'Orcish',
        type: 'nation',
        government: 'tribal_confederation',
        power: 60,
        alignment: 'chaotic_neutral',
        description: 'United orc clans of the eastern steppes',
        capital: 'Grakhan',
        leader: 'Warchief Thrakan Bloodfist',
        playerStanding: 0,
        traits: ['warrior_culture', 'honorable', 'territorial'],
        color: '#c0392b'
    },
    merchant_republic: {
        name: 'The Merchant Guild Republic',
        shortName: 'Merchant',
        type: 'nation',
        government: 'republic',
        power: 65,
        alignment: 'true_neutral',
        description: 'Wealthy trade nation ruled by merchant princes',
        capital: 'Goldport',
        leader: 'Guildmaster Valorian Thex',
        playerStanding: 0,
        traits: ['mercantile', 'pragmatic', 'wealthy'],
        color: '#f1c40f'
    },
    theocracy_solarius: {
        name: 'The Solarian Theocracy',
        shortName: 'Solarian',
        type: 'nation',
        government: 'theocracy',
        power: 55,
        alignment: 'lawful_good',
        description: 'Holy nation devoted to Solarius, god of light',
        capital: 'Sunspire',
        leader: 'High Sunlord Aldric the Radiant',
        playerStanding: 0,
        traits: ['religious', 'militant', 'righteous'],
        color: '#f39c12'
    },
    free_cities: {
        name: 'The Free Cities Coalition',
        shortName: 'Free Cities',
        type: 'nation',
        government: 'confederation',
        power: 50,
        alignment: 'chaotic_good',
        description: 'Loose alliance of independent city-states',
        capital: 'None (rotating council)',
        leader: 'Council of Mayors',
        playerStanding: 0,
        traits: ['independent', 'diverse', 'fractious'],
        color: '#9b59b6'
    },
    adventurers_guild: {
        name: "The Adventurer's Guild",
        shortName: 'Adventurers',
        type: 'organization',
        government: 'guild',
        power: 40,
        alignment: 'neutral_good',
        description: 'International guild of adventurers and mercenaries',
        capital: "Guildmaster's Hall (Valdris Prime)",
        leader: 'Guildmaster Helena Stormblade',
        playerStanding: 0,
        traits: ['professional', 'widespread', 'meritocratic'],
        color: '#1abc9c'
    },
    mages_college: {
        name: 'The College of Arcana',
        shortName: 'Arcana',
        type: 'organization',
        government: 'council',
        power: 45,
        alignment: 'true_neutral',
        description: 'Premier magical institution and regulatory body',
        capital: 'The Spire of Arcana',
        leader: 'Archmage Vexaria',
        playerStanding: 0,
        traits: ['scholarly', 'secretive', 'powerful'],
        color: '#3498db'
    },
    shadow_syndicate: {
        name: 'The Shadow Syndicate',
        shortName: 'Shadow',
        type: 'organization',
        government: 'criminal',
        power: 35,
        alignment: 'neutral_evil',
        description: 'Continental criminal organization',
        capital: 'Unknown',
        leader: 'The Veiled One',
        playerStanding: 0,
        traits: ['criminal', 'secretive', 'ruthless'],
        color: '#2c3e50'
    },
    order_silver_dawn: {
        name: 'The Order of the Silver Dawn',
        shortName: 'Silver Dawn',
        type: 'organization',
        government: 'knightly_order',
        power: 30,
        alignment: 'lawful_good',
        description: 'Holy knights dedicated to fighting darkness',
        capital: 'Dawn Fortress',
        leader: 'Grandmaster Aldric Lightbringer',
        playerStanding: 0,
        traits: ['righteous', 'militant', 'disciplined'],
        color: '#ecf0f1'
    }
};

export const DEFAULT_RELATIONSHIPS = {
    valdric_empire_sylvan_dominion: 30,
    valdric_empire_dwarven_holds: 60,
    valdric_empire_orcish_dominion: -40,
    valdric_empire_merchant_republic: 50,
    valdric_empire_theocracy_solarius: 40,
    valdric_empire_free_cities: -10,
    valdric_empire_shadow_syndicate: -80,
    valdric_empire_adventurers_guild: 45,
    valdric_empire_mages_college: 35,
    valdric_empire_order_silver_dawn: 55,
    sylvan_dominion_dwarven_holds: 20,
    sylvan_dominion_orcish_dominion: -30,
    sylvan_dominion_merchant_republic: 10,
    sylvan_dominion_theocracy_solarius: 0,
    sylvan_dominion_free_cities: 25,
    sylvan_dominion_shadow_syndicate: -60,
    sylvan_dominion_adventurers_guild: 15,
    sylvan_dominion_mages_college: 50,
    sylvan_dominion_order_silver_dawn: 30,
    dwarven_holds_orcish_dominion: -50,
    dwarven_holds_merchant_republic: 70,
    dwarven_holds_theocracy_solarius: 25,
    dwarven_holds_free_cities: 35,
    dwarven_holds_shadow_syndicate: -70,
    dwarven_holds_adventurers_guild: 40,
    dwarven_holds_mages_college: 20,
    dwarven_holds_order_silver_dawn: 45,
    orcish_dominion_merchant_republic: 10,
    orcish_dominion_theocracy_solarius: -60,
    orcish_dominion_free_cities: -20,
    orcish_dominion_shadow_syndicate: -30,
    orcish_dominion_adventurers_guild: 20,
    orcish_dominion_mages_college: -10,
    orcish_dominion_order_silver_dawn: -50,
    merchant_republic_theocracy_solarius: 30,
    merchant_republic_free_cities: 55,
    merchant_republic_shadow_syndicate: -20,
    merchant_republic_adventurers_guild: 60,
    merchant_republic_mages_college: 45,
    merchant_republic_order_silver_dawn: 20,
    theocracy_solarius_free_cities: -15,
    theocracy_solarius_shadow_syndicate: -90,
    theocracy_solarius_adventurers_guild: 25,
    theocracy_solarius_mages_college: -25,
    theocracy_solarius_order_silver_dawn: 80,
    free_cities_shadow_syndicate: -40,
    free_cities_adventurers_guild: 50,
    free_cities_mages_college: 35,
    free_cities_order_silver_dawn: 15,
    shadow_syndicate_adventurers_guild: -50,
    shadow_syndicate_mages_college: -40,
    shadow_syndicate_order_silver_dawn: -85,
    adventurers_guild_mages_college: 40,
    adventurers_guild_order_silver_dawn: 35,
    mages_college_order_silver_dawn: 10
};

export class FactionSystem {
    constructor(stateManager, timeSystem) {
        this.stateManager = stateManager;
        this.timeSystem = timeSystem;
        this.listeners = {
            relationship: [],
            standing: [],
            warDeclared: [],
            warEnded: [],
            allianceFormed: [],
            allianceBroken: []
        };
        this.timeSystem.onDayChanged(() => this.checkRelationshipDrift());
        this.timeSystem.onWeekChanged(() => this.checkTensionEscalation());
    }

    initialize() {
        const state = this.stateManager.getSection('factions');
        if (!Object.keys(state.list || {}).length) {
            this.stateManager.updateSection('factions', {
                list: { ...DEFAULT_FACTIONS },
                relationships: { ...DEFAULT_RELATIONSHIPS }
            });
        }
    }

    getFaction(factionId) {
        const { list } = this.stateManager.getSection('factions');
        return list?.[factionId] || null;
    }

    getAllFactions() {
        return this.stateManager.getSection('factions').list || {};
    }

    getFactionsByType(type) {
        const factions = this.getAllFactions();
        return Object.entries(factions)
            .filter(([, data]) => data.type === type)
            .map(([id, data]) => ({ id, ...data }));
    }

    addFaction(factionId, factionData) {
        const factions = this.getAllFactions();
        this.stateManager.updateSection('factions', {
            list: { ...factions, [factionId]: factionData }
        });
    }

    updateFaction(factionId, updates) {
        const factions = this.getAllFactions();
        if (!factions[factionId]) {
            return;
        }
        this.stateManager.updateSection('factions', {
            list: { ...factions, [factionId]: { ...factions[factionId], ...updates } }
        });
    }

    removeFaction(factionId) {
        const factions = this.getAllFactions();
        if (!factions[factionId]) {
            return;
        }
        const updated = { ...factions };
        delete updated[factionId];
        const relationships = { ...this.stateManager.getSection('factions').relationships };
        Object.keys(relationships).forEach((key) => {
            if (key.includes(factionId)) {
                delete relationships[key];
            }
        });
        this.stateManager.updateSection('factions', { list: updated, relationships });
    }

    getRelationship(faction1Id, faction2Id) {
        const { relationships } = this.stateManager.getSection('factions');
        const key = `${faction1Id}_${faction2Id}`;
        const reverseKey = `${faction2Id}_${faction1Id}`;
        return relationships?.[key] ?? relationships?.[reverseKey] ?? 0;
    }

    setRelationship(faction1Id, faction2Id, value) {
        const { relationships } = this.stateManager.getSection('factions');
        const key = `${faction1Id}_${faction2Id}`;
        const nextValue = clamp(value, -100, 100);
        this.stateManager.updateSection('factions', {
            relationships: { ...relationships, [key]: nextValue }
        });
        this.listeners.relationship.forEach((callback) => callback({ faction1Id, faction2Id, value: nextValue }));
    }

    modifyRelationship(faction1Id, faction2Id, change, reason = null) {
        const current = this.getRelationship(faction1Id, faction2Id);
        const updated = clamp(current + change, -100, 100);
        this.setRelationship(faction1Id, faction2Id, updated);
        if (reason) {
            this.logEvent('relationship_change', [faction1Id, faction2Id], reason);
        }
    }

    getRelationshipLevel(value) {
        if (value <= -80) return 'War/Hostile';
        if (value <= -50) return 'Enemies';
        if (value <= -20) return 'Unfriendly';
        if (value < 0) return 'Cold';
        if (value === 0) return 'Neutral';
        if (value < 20) return 'Cordial';
        if (value < 50) return 'Friendly';
        if (value < 80) return 'Allied';
        return 'Blood Brothers';
    }

    getRelationshipColor(value) {
        const normalized = (value + 100) / 200;
        const red = Math.round(255 * (1 - normalized));
        const green = Math.round(255 * normalized);
        return `rgb(${red}, ${green}, 100)`;
    }

    getAllRelationshipsFor(factionId) {
        const { relationships } = this.stateManager.getSection('factions');
        const filtered = {};
        Object.entries(relationships || {}).forEach(([key, value]) => {
            if (key.startsWith(`${factionId}_`) || key.endsWith(`_${factionId}`)) {
                filtered[key] = value;
            }
        });
        return filtered;
    }

    getPlayerStanding(factionId) {
        const { playerStandings } = this.stateManager.getSection('factions');
        if (playerStandings?.[factionId] !== undefined) {
            return playerStandings[factionId];
        }
        return this.getFaction(factionId)?.playerStanding ?? 0;
    }

    setPlayerStanding(factionId, value) {
        const { playerStandings } = this.stateManager.getSection('factions');
        const nextValue = clamp(value, -100, 100);
        this.stateManager.updateSection('factions', {
            playerStandings: { ...playerStandings, [factionId]: nextValue }
        });
        this.listeners.standing.forEach((callback) => callback({ factionId, value: nextValue }));
    }

    modifyPlayerStanding(factionId, change, reason = null) {
        const current = this.getPlayerStanding(factionId);
        const updated = clamp(current + change, -100, 100);
        this.setPlayerStanding(factionId, updated);
        if (reason) {
            this.logEvent('player_standing', [factionId], reason);
        }
    }

    getPlayerStandingLevel(factionId) {
        const value = this.getPlayerStanding(factionId);
        if (value <= -80) return 'Hated';
        if (value <= -50) return 'Hostile';
        if (value <= -20) return 'Unfriendly';
        if (value < 20) return 'Neutral';
        if (value < 50) return 'Friendly';
        if (value < 70) return 'Honored';
        if (value < 90) return 'Revered';
        return 'Exalted';
    }

    createTension(faction1Id, faction2Id, reason, severity = 50) {
        const factions = this.stateManager.getSection('factions');
        const tension = {
            id: `tension_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            faction1Id,
            faction2Id,
            reason,
            severity: clamp(severity, 1, 100),
            createdAt: new Date().toISOString()
        };
        this.stateManager.updateSection('factions', { tensions: [...factions.tensions, tension] });
        this.logEvent('tension', [faction1Id, faction2Id], reason);
        return tension;
    }

    escalateTension(tensionId, amount) {
        const factions = this.stateManager.getSection('factions');
        const tensions = factions.tensions.map((tension) => {
            if (tension.id !== tensionId) {
                return tension;
            }
            return { ...tension, severity: clamp(tension.severity + amount, 1, 100) };
        });
        this.stateManager.updateSection('factions', { tensions });
    }

    resolveTension(tensionId, resolution = 'diplomatic') {
        const factions = this.stateManager.getSection('factions');
        const tension = factions.tensions.find((entry) => entry.id === tensionId);
        const tensions = factions.tensions.filter((entry) => entry.id !== tensionId);
        this.stateManager.updateSection('factions', { tensions });
        if (tension) {
            this.logEvent('tension_resolved', [tension.faction1Id, tension.faction2Id], resolution);
        }
    }

    getTensionsBetween(faction1Id, faction2Id) {
        const { tensions } = this.stateManager.getSection('factions');
        return tensions.filter(
            (entry) =>
                (entry.faction1Id === faction1Id && entry.faction2Id === faction2Id) ||
                (entry.faction1Id === faction2Id && entry.faction2Id === faction1Id)
        );
    }

    getAllTensions() {
        return this.stateManager.getSection('factions').tensions;
    }

    declareWar(aggressor, defender, reason) {
        const factions = this.stateManager.getSection('factions');
        const war = {
            id: `war_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            aggressor,
            defender,
            reason,
            startedAt: new Date().toISOString()
        };
        this.modifyRelationship(aggressor, defender, -30, `War declared: ${reason}`);
        this.stateManager.updateSection('factions', { wars: [...factions.wars, war] });
        this.listeners.warDeclared.forEach((callback) => callback(war));
        return war;
    }

    endWar(warId, winner = null, terms = {}) {
        const factions = this.stateManager.getSection('factions');
        const war = factions.wars.find((entry) => entry.id === warId);
        const wars = factions.wars.filter((entry) => entry.id !== warId);
        this.stateManager.updateSection('factions', { wars });
        if (war) {
            this.logEvent('war_ended', [war.aggressor, war.defender], JSON.stringify({ winner, ...terms }));
            this.listeners.warEnded.forEach((callback) => callback({ war, winner, terms }));
        }
    }

    getActiveWars() {
        return this.stateManager.getSection('factions').wars;
    }

    isAtWar(factionId) {
        return this.getActiveWars().some(
            (war) => war.aggressor === factionId || war.defender === factionId
        );
    }

    formAlliance(faction1Id, faction2Id, type = 'defensive') {
        const factions = this.stateManager.getSection('factions');
        const alliance = {
            id: `alliance_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            faction1Id,
            faction2Id,
            type,
            startedAt: new Date().toISOString()
        };
        this.modifyRelationship(faction1Id, faction2Id, 10, 'Alliance formed');
        this.stateManager.updateSection('factions', { alliances: [...factions.alliances, alliance] });
        this.listeners.allianceFormed.forEach((callback) => callback(alliance));
        return alliance;
    }

    breakAlliance(allianceId, breakerId, reason) {
        const factions = this.stateManager.getSection('factions');
        const alliance = factions.alliances.find((entry) => entry.id === allianceId);
        const alliances = factions.alliances.filter((entry) => entry.id !== allianceId);
        this.stateManager.updateSection('factions', { alliances });
        if (alliance) {
            const other = alliance.faction1Id === breakerId ? alliance.faction2Id : alliance.faction1Id;
            this.modifyRelationship(breakerId, other, -15, reason);
            this.listeners.allianceBroken.forEach((callback) => callback(alliance));
        }
    }

    getAlliances() {
        return this.stateManager.getSection('factions').alliances;
    }

    getAlliancesFor(factionId) {
        return this.getAlliances().filter(
            (entry) => entry.faction1Id === factionId || entry.faction2Id === factionId
        );
    }

    checkRelationshipDrift() {
        const state = this.stateManager.getSection('factions');
        if (!state.dynamicRelationships) {
            return;
        }
        const relationships = { ...state.relationships };
        Object.entries(relationships).forEach(([key, value]) => {
            if (value > 0) {
                relationships[key] = clamp(value - 1, -100, 100);
            } else if (value < 0) {
                relationships[key] = clamp(value - 1, -100, 100);
            }
        });
        this.stateManager.updateSection('factions', { relationships });
    }

    checkTensionEscalation() {
        const state = this.stateManager.getSection('factions');
        if (!state.dynamicRelationships) {
            return;
        }
        const tensions = state.tensions.map((tension) => ({
            ...tension,
            severity: clamp(tension.severity + 5, 1, 100)
        }));
        const newWars = [];
        tensions.forEach((tension) => {
            if (tension.severity >= 100) {
                newWars.push(this.declareWar(tension.faction1Id, tension.faction2Id, tension.reason));
            }
        });
        const filtered = tensions.filter((tension) => tension.severity < 100);
        if (newWars.length || filtered.length !== state.tensions.length) {
            this.stateManager.updateSection('factions', { tensions: filtered });
        }
    }

    simulateEvent(eventType, involvedFactions) {
        const description = `${eventType} involving ${involvedFactions.join(', ')}`;
        this.logEvent(eventType, involvedFactions, description);
    }

    getFactionsForPrompt() {
        const state = this.stateManager.getSection('factions');
        if (!state.injectFactionsIntoPrompt) {
            return null;
        }
        const entries = Object.keys(state.list).map((id) => {
            const value = this.getPlayerStanding(id);
            return {
                id,
                name: state.list[id].shortName,
                value,
                level: this.getPlayerStandingLevel(id)
            };
        });
        const notable = entries.filter((entry) => Math.abs(entry.value) >= 20);
        if (!notable.length) {
            return 'No notable faction standings';
        }
        return notable.map((entry) => `${entry.name}: ${entry.level} (${entry.value})`).join(', ');
    }

    getRelevantFactions(keywords = []) {
        const factions = this.getAllFactions();
        const keywordLower = keywords.map((word) => word.toLowerCase());
        return Object.entries(factions)
            .filter(([, data]) => keywordLower.some((word) => data.name.toLowerCase().includes(word)))
            .map(([id, data]) => ({ id, ...data }));
    }

    logEvent(eventType, factions, description) {
        const state = this.stateManager.getSection('factions');
        const entry = {
            id: `event_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            eventType,
            factions,
            description,
            timestamp: new Date().toISOString()
        };
        this.stateManager.updateSection('factions', { history: [entry, ...state.history].slice(0, 200) });
    }

    getHistory(factionId = null, limit = 10) {
        const { history } = this.stateManager.getSection('factions');
        const filtered = factionId
            ? history.filter((entry) => entry.factions.includes(factionId))
            : history;
        return filtered.slice(0, limit);
    }

    onRelationshipChanged(callback) {
        this.listeners.relationship.push(callback);
    }

    onPlayerStandingChanged(callback) {
        this.listeners.standing.push(callback);
    }

    onWarDeclared(callback) {
        this.listeners.warDeclared.push(callback);
    }

    onWarEnded(callback) {
        this.listeners.warEnded.push(callback);
    }

    onAllianceFormed(callback) {
        this.listeners.allianceFormed.push(callback);
    }

    onAllianceBroken(callback) {
        this.listeners.allianceBroken.push(callback);
    }
}
