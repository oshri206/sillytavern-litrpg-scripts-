import { clamp } from './utils.js';

export class EventSystem {
    constructor(stateManager, timeSystem, factionSystem) {
        this.stateManager = stateManager;
        this.timeSystem = timeSystem;
        this.factionSystem = factionSystem;
        this.listeners = {
            started: [],
            resolved: [],
            major: []
        };
        this.EVENT_TYPES = {
            political: {
                name: 'Political',
                icon: '👑',
                color: '#9b59b6',
                subtypes: ['coup', 'treaty', 'assassination', 'succession', 'rebellion', 'reform', 'scandal', 'marriage']
            },
            military: {
                name: 'Military',
                icon: '⚔️',
                color: '#e74c3c',
                subtypes: ['war_declared', 'war_ended', 'siege', 'battle', 'border_skirmish', 'invasion', 'military_buildup']
            },
            economic: {
                name: 'Economic',
                icon: '💰',
                color: '#f1c40f',
                subtypes: ['trade_disruption', 'resource_discovery', 'market_crash', 'boom', 'embargo', 'trade_agreement', 'currency_crisis']
            },
            natural: {
                name: 'Natural',
                icon: '🌍',
                color: '#2ecc71',
                subtypes: ['earthquake', 'flood', 'drought', 'plague', 'famine', 'wildfire', 'volcanic_eruption', 'tsunami']
            },
            supernatural: {
                name: 'Supernatural',
                icon: '✨',
                color: '#3498db',
                subtypes: ['dungeon_break', 'monster_horde', 'magical_anomaly', 'divine_intervention', 'curse', 'blessing', 'portal_opening']
            },
            social: {
                name: 'Social',
                icon: '🎭',
                color: '#1abc9c',
                subtypes: ['festival', 'religious_movement', 'cultural_shift', 'famous_death', 'famous_birth', 'discovery', 'invention']
            }
        };
        this.EVENT_TEMPLATES = {
            coup_attempt: {
                id: 'coup_attempt',
                type: 'political',
                subtype: 'coup',
                name: 'Coup Attempt in {{faction}}',
                description: 'A faction within {{faction}} attempts to seize power from {{leader}}.',
                severity: 'major',
                duration: { min: 7, max: 30 },
                probability: 0.5,
                requirements: { factionType: ['nation'], minTension: 30 },
                effects: [
                    { type: 'faction_stability', target: '{{faction}}', change: -30 },
                    { type: 'relationship', target: 'allies', change: -10 }
                ],
                outcomes: [
                    { name: 'Coup Succeeds', weight: 30, effects: [{ type: 'leader_change', target: '{{faction}}' }] },
                    { name: 'Coup Fails', weight: 50, effects: [{ type: 'faction_stability', change: +10 }] },
                    { name: 'Civil War', weight: 20, effects: [{ type: 'spawn_event', event: 'civil_war' }] }
                ]
            },
            royal_marriage: {
                id: 'royal_marriage',
                type: 'political',
                subtype: 'marriage',
                name: 'Royal Marriage: {{faction1}} and {{faction2}}',
                description: 'A marriage alliance is formed between {{faction1}} and {{faction2}}.',
                severity: 'moderate',
                duration: { min: 1, max: 1 },
                probability: 0.3,
                requirements: { factionType: ['nation'], relationshipMin: 20 },
                effects: [
                    { type: 'relationship', faction1: '{{faction1}}', faction2: '{{faction2}}', change: +25 },
                    { type: 'form_alliance', faction1: '{{faction1}}', faction2: '{{faction2}}', allianceType: 'marriage' }
                ],
                outcomes: []
            },
            assassination: {
                id: 'assassination',
                type: 'political',
                subtype: 'assassination',
                name: 'Assassination Attempt on {{leader}}',
                description: 'An assassin targets {{leader}} of {{faction}}.',
                severity: 'major',
                duration: { min: 1, max: 3 },
                probability: 0.2,
                requirements: { hasEnemies: true },
                effects: [],
                outcomes: [
                    {
                        name: 'Leader Killed',
                        weight: 25,
                        effects: [
                            { type: 'leader_death', target: '{{faction}}' },
                            { type: 'spawn_event', event: 'succession_crisis' }
                        ]
                    },
                    { name: 'Leader Wounded', weight: 35, effects: [{ type: 'faction_stability', change: -15 }] },
                    { name: 'Assassin Caught', weight: 40, effects: [{ type: 'relationship', target: '{{enemy}}', change: -30 }] }
                ]
            },
            succession_crisis: {
                id: 'succession_crisis',
                type: 'political',
                subtype: 'succession',
                name: 'Succession Crisis in {{faction}}',
                description: 'The death of {{leader}} has left {{faction}} without a clear heir.',
                severity: 'major',
                duration: { min: 30, max: 180 },
                probability: 0,
                effects: [
                    { type: 'faction_stability', target: '{{faction}}', change: -40 },
                    { type: 'faction_power', target: '{{faction}}', change: -20 }
                ],
                outcomes: [
                    { name: 'Heir Emerges', weight: 50, effects: [{ type: 'leader_change' }, { type: 'faction_stability', change: +20 }] },
                    { name: 'Civil War', weight: 30, effects: [{ type: 'spawn_event', event: 'civil_war' }] },
                    { name: 'Foreign Intervention', weight: 20, effects: [{ type: 'spawn_event', event: 'foreign_intervention' }] }
                ]
            },
            treaty_signed: {
                id: 'treaty_signed',
                type: 'political',
                subtype: 'treaty',
                name: 'Peace Treaty: {{faction1}} and {{faction2}}',
                description: '{{faction1}} and {{faction2}} sign a peace treaty ending hostilities.',
                severity: 'major',
                duration: { min: 1, max: 1 },
                probability: 0,
                effects: [
                    { type: 'end_war', faction1: '{{faction1}}', faction2: '{{faction2}}' },
                    { type: 'relationship', change: +40 }
                ],
                outcomes: []
            },
            war_declared: {
                id: 'war_declared',
                type: 'military',
                subtype: 'war_declared',
                name: 'War Declared: {{faction1}} vs {{faction2}}',
                description: '{{faction1}} has declared war on {{faction2}}!',
                severity: 'critical',
                duration: { min: 90, max: 365 },
                probability: 0.1,
                requirements: { relationshipMax: -50, noActiveWar: true },
                effects: [
                    { type: 'start_war', faction1: '{{faction1}}', faction2: '{{faction2}}' },
                    { type: 'relationship', change: -50 },
                    { type: 'global_tension', change: +20 }
                ],
                outcomes: []
            },
            major_battle: {
                id: 'major_battle',
                type: 'military',
                subtype: 'battle',
                name: 'Battle of {{location}}',
                description: 'Forces of {{faction1}} clash with {{faction2}} at {{location}}.',
                severity: 'major',
                duration: { min: 1, max: 7 },
                probability: 0,
                effects: [],
                outcomes: [
                    { name: '{{faction1}} Victory', weight: 40, effects: [{ type: 'war_score', faction: '{{faction1}}', change: +20 }] },
                    { name: '{{faction2}} Victory', weight: 40, effects: [{ type: 'war_score', faction: '{{faction2}}', change: +20 }] },
                    { name: 'Stalemate', weight: 20, effects: [{ type: 'war_exhaustion', both: true, change: +10 }] }
                ]
            },
            siege_begins: {
                id: 'siege_begins',
                type: 'military',
                subtype: 'siege',
                name: 'Siege of {{city}}',
                description: '{{faction1}} has laid siege to {{city}}, controlled by {{faction2}}.',
                severity: 'major',
                duration: { min: 30, max: 180 },
                probability: 0,
                effects: [
                    { type: 'location_status', target: '{{city}}', status: 'under_siege' }
                ],
                outcomes: [
                    { name: 'City Falls', weight: 40, effects: [{ type: 'territory_change' }] },
                    { name: 'Siege Lifted', weight: 35, effects: [] },
                    { name: 'City Destroyed', weight: 10, effects: [{ type: 'location_destroyed' }] },
                    { name: 'Negotiated Surrender', weight: 15, effects: [{ type: 'relationship', change: +10 }] }
                ]
            },
            trade_route_disrupted: {
                id: 'trade_route_disrupted',
                type: 'economic',
                subtype: 'trade_disruption',
                name: 'Trade Route Disrupted: {{route}}',
                description: 'The {{route}} trade route has been disrupted by {{cause}}.',
                severity: 'moderate',
                duration: { min: 14, max: 90 },
                probability: 0.4,
                effects: [
                    { type: 'economy', target: 'affected_factions', change: -15 },
                    { type: 'prices', category: 'trade_goods', change: +30 }
                ],
                outcomes: [
                    { name: 'Route Restored', weight: 60, effects: [] },
                    { name: 'New Route Found', weight: 25, effects: [{ type: 'new_trade_route' }] },
                    { name: 'Permanent Closure', weight: 15, effects: [{ type: 'economy', change: -10, permanent: true }] }
                ]
            },
            resource_discovery: {
                id: 'resource_discovery',
                type: 'economic',
                subtype: 'resource_discovery',
                name: '{{resource}} Discovery in {{location}}',
                description: 'A significant deposit of {{resource}} has been discovered in {{location}}.',
                severity: 'moderate',
                duration: { min: 1, max: 1 },
                probability: 0.2,
                effects: [
                    { type: 'economy', target: '{{faction}}', change: +20 },
                    { type: 'faction_power', target: '{{faction}}', change: +10 },
                    { type: 'prices', item: '{{resource}}', change: -20 }
                ],
                outcomes: []
            },
            market_crash: {
                id: 'market_crash',
                type: 'economic',
                subtype: 'market_crash',
                name: 'Market Crash in {{faction}}',
                description: 'Economic panic has caused a market crash in {{faction}}.',
                severity: 'major',
                duration: { min: 30, max: 90 },
                probability: 0.1,
                effects: [
                    { type: 'economy', target: '{{faction}}', change: -40 },
                    { type: 'faction_stability', target: '{{faction}}', change: -20 },
                    { type: 'prices', category: 'all', change: +50 }
                ],
                outcomes: [
                    { name: 'Recovery', weight: 60, effects: [{ type: 'economy', change: +30 }] },
                    { name: 'Depression', weight: 30, effects: [{ type: 'spawn_event', event: 'economic_depression' }] },
                    { name: 'Reform', weight: 10, effects: [{ type: 'economy', change: +50 }] }
                ]
            },
            plague_outbreak: {
                id: 'plague_outbreak',
                type: 'natural',
                subtype: 'plague',
                name: 'Plague Outbreak in {{region}}',
                description: 'A deadly plague has broken out in {{region}}, spreading rapidly.',
                severity: 'critical',
                duration: { min: 60, max: 180 },
                probability: 0.05,
                effects: [
                    { type: 'population', target: '{{region}}', change: -20 },
                    { type: 'economy', target: '{{region}}', change: -30 },
                    { type: 'faction_stability', target: '{{faction}}', change: -25 }
                ],
                outcomes: [
                    { name: 'Plague Contained', weight: 40, effects: [] },
                    { name: 'Plague Spreads', weight: 35, effects: [{ type: 'spread_to_neighbors' }] },
                    { name: 'Cure Found', weight: 15, effects: [{ type: 'reputation', faction: '{{faction}}', change: +30 }] },
                    { name: 'Mass Death', weight: 10, effects: [{ type: 'population', change: -40 }] }
                ]
            },
            earthquake: {
                id: 'earthquake',
                type: 'natural',
                subtype: 'earthquake',
                name: 'Earthquake Strikes {{location}}',
                description: 'A powerful earthquake has struck {{location}}, causing widespread destruction.',
                severity: 'major',
                duration: { min: 1, max: 3 },
                probability: 0.1,
                effects: [
                    { type: 'location_damage', target: '{{location}}', damage: 40 },
                    { type: 'economy', target: '{{faction}}', change: -20 },
                    { type: 'population', target: '{{location}}', change: -10 }
                ],
                outcomes: [
                    { name: 'Rebuilding Begins', weight: 70, effects: [] },
                    { name: 'Aftershocks', weight: 20, effects: [{ type: 'location_damage', change: -20 }] },
                    { name: 'Ancient Ruins Revealed', weight: 10, effects: [{ type: 'spawn_event', event: 'ruins_discovered' }] }
                ]
            },
            famine: {
                id: 'famine',
                type: 'natural',
                subtype: 'famine',
                name: 'Famine in {{region}}',
                description: 'Crop failures have led to widespread famine in {{region}}.',
                severity: 'major',
                duration: { min: 90, max: 270 },
                probability: 0.1,
                effects: [
                    { type: 'population', target: '{{region}}', change: -15 },
                    { type: 'faction_stability', change: -30 },
                    { type: 'prices', category: 'food', change: +200 }
                ],
                outcomes: [
                    { name: 'Foreign Aid', weight: 30, effects: [{ type: 'relationship', target: 'helpers', change: +20 }] },
                    { name: 'Mass Migration', weight: 25, effects: [{ type: 'population_shift' }] },
                    { name: 'Recovery', weight: 35, effects: [] },
                    { name: 'Rebellion', weight: 10, effects: [{ type: 'spawn_event', event: 'peasant_rebellion' }] }
                ]
            },
            dungeon_break: {
                id: 'dungeon_break',
                type: 'supernatural',
                subtype: 'dungeon_break',
                name: 'Dungeon Break: {{dungeon}}',
                description: 'Monsters have broken containment at {{dungeon}} and are flooding into the surrounding area!',
                severity: 'critical',
                duration: { min: 7, max: 30 },
                probability: 0.15,
                effects: [
                    { type: 'location_danger', target: '{{region}}', change: +50 },
                    { type: 'spawn_monsters', type: 'horde', location: '{{region}}' }
                ],
                outcomes: [
                    { name: 'Adventurers Contain It', weight: 50, effects: [{ type: 'adventurer_fame' }] },
                    { name: 'Military Response', weight: 30, effects: [{ type: 'faction_military', change: -10 }] },
                    { name: 'Area Overrun', weight: 15, effects: [{ type: 'location_status', status: 'monster_territory' }] },
                    { name: 'Hero Emerges', weight: 5, effects: [{ type: 'spawn_npc', type: 'hero' }] }
                ]
            },
            monster_horde: {
                id: 'monster_horde',
                type: 'supernatural',
                subtype: 'monster_horde',
                name: 'Monster Horde Approaches {{location}}',
                description: 'A massive horde of {{monster_type}} is approaching {{location}}!',
                severity: 'major',
                duration: { min: 3, max: 14 },
                probability: 0.1,
                effects: [
                    { type: 'location_danger', target: '{{location}}', change: +40 },
                    { type: 'faction_military', target: '{{faction}}', change: -5 }
                ],
                outcomes: [
                    { name: 'Horde Defeated', weight: 55, effects: [] },
                    { name: 'Horde Diverted', weight: 25, effects: [{ type: 'horde_moves', target: 'neighbor' }] },
                    { name: 'City Damaged', weight: 15, effects: [{ type: 'location_damage', change: -30 }] },
                    { name: 'City Falls', weight: 5, effects: [{ type: 'location_status', status: 'destroyed' }] }
                ]
            },
            magical_anomaly: {
                id: 'magical_anomaly',
                type: 'supernatural',
                subtype: 'magical_anomaly',
                name: 'Magical Anomaly at {{location}}',
                description: 'Strange magical phenomena have been reported at {{location}}.',
                severity: 'moderate',
                duration: { min: 7, max: 60 },
                probability: 0.2,
                effects: [
                    { type: 'location_modifier', target: '{{location}}', modifier: 'magical_instability' }
                ],
                outcomes: [
                    { name: 'Anomaly Fades', weight: 40, effects: [] },
                    { name: 'Permanent Change', weight: 25, effects: [{ type: 'location_modifier', permanent: true }] },
                    { name: 'Portal Opens', weight: 15, effects: [{ type: 'spawn_event', event: 'portal_opening' }] },
                    { name: 'Mages Investigate', weight: 20, effects: [{ type: 'mage_attention' }] }
                ]
            },
            grand_festival: {
                id: 'grand_festival',
                type: 'social',
                subtype: 'festival',
                name: 'Grand Festival in {{location}}',
                description: '{{faction}} is hosting a grand festival in {{location}}.',
                severity: 'minor',
                duration: { min: 3, max: 14 },
                probability: 0.5,
                effects: [
                    { type: 'faction_stability', target: '{{faction}}', change: +10 },
                    { type: 'economy', target: '{{faction}}', change: +5 },
                    { type: 'global_mood', change: +5 }
                ],
                outcomes: []
            },
            religious_movement: {
                id: 'religious_movement',
                type: 'social',
                subtype: 'religious_movement',
                name: 'Religious Movement in {{region}}',
                description: 'A new religious movement devoted to {{deity}} is spreading through {{region}}.',
                severity: 'moderate',
                duration: { min: 30, max: 365 },
                probability: 0.15,
                effects: [
                    { type: 'religion_influence', deity: '{{deity}}', change: +20 }
                ],
                outcomes: [
                    { name: 'Movement Fades', weight: 40, effects: [] },
                    { name: 'New Sect Forms', weight: 30, effects: [{ type: 'spawn_faction', type: 'religious' }] },
                    { name: 'Official Adoption', weight: 15, effects: [{ type: 'state_religion_change' }] },
                    { name: 'Religious Conflict', weight: 15, effects: [{ type: 'spawn_event', event: 'religious_war' }] }
                ]
            },
            famous_death: {
                id: 'famous_death',
                type: 'social',
                subtype: 'famous_death',
                name: 'Death of {{npc}}',
                description: 'The renowned {{npc}} has died of {{cause}}.',
                severity: 'moderate',
                duration: { min: 1, max: 1 },
                probability: 0.1,
                effects: [
                    { type: 'npc_death', target: '{{npc}}' },
                    { type: 'faction_mood', target: '{{faction}}', change: -10 }
                ],
                outcomes: []
            }
        };
        this.timeSystem.onDayChanged(() => this.checkForNewEvents());
        this.timeSystem.onWeekChanged(() => this.resolveScheduledEvents());
    }

    initialize() {
        const state = this.stateManager.getSection('events');
        if (!state.lastEventCheck) {
            this.stateManager.updateSection('events', { lastEventCheck: new Date().toISOString() });
        }
    }

    getSettings() {
        return this.stateManager.getSection('events').settings;
    }

    checkForNewEvents() {
        const settings = this.getSettings();
        if (!settings.enabled || !settings.autoGenerate) {
            return;
        }
        const expectedPerWeek = (settings.eventsPerWeek.min + settings.eventsPerWeek.max) / 2;
        const dailyChance = clamp(expectedPerWeek / 7, 0, 1);
        if (Math.random() < dailyChance) {
            this.generateRandomEvent();
        }
    }

    generateRandomEvent() {
        const eligible = this.getEligibleEvents();
        if (!eligible.length) {
            return null;
        }
        const template = this.selectEventTemplate(eligible);
        const context = this.buildContext(template);
        const event = this.instantiateEvent(template, context);
        this.addEvent(event);
        return event;
    }

    getEligibleEvents() {
        const state = this.stateManager.getSection('events');
        const cooldowns = state.cooldowns || {};
        const templates = Object.values(this.EVENT_TEMPLATES);
        return templates.filter((template) => {
            if (template.probability <= 0) {
                return false;
            }
            const last = cooldowns[template.id];
            if (last && Date.now() - last < 1000 * 60 * 60 * 24 * 7) {
                return false;
            }
            return true;
        });
    }

    selectEventTemplate(eligibleEvents) {
        const total = eligibleEvents.reduce((sum, item) => sum + item.probability, 0);
        let roll = Math.random() * total;
        for (const template of eligibleEvents) {
            if (roll < template.probability) {
                return template;
            }
            roll -= template.probability;
        }
        return eligibleEvents[0];
    }

    instantiateEvent(template, context = {}) {
        const durationDays = this.randomRange(template.duration.min, template.duration.max);
        const startIndex = this.getCurrentDayIndex();
        const endIndex = startIndex + durationDays;
        return {
            id: `event_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            templateId: template.id,
            name: this.fillTemplate(template.name, context),
            description: this.fillTemplate(template.description, context),
            type: template.type,
            subtype: template.subtype,
            severity: template.severity,
            startDayIndex: startIndex,
            endDayIndex: endIndex,
            startDate: this.getDateStringFromIndex(startIndex),
            endDate: this.getDateStringFromIndex(endIndex),
            context,
            effects: template.effects,
            outcomes: template.outcomes,
            resolved: false,
            outcome: null,
            playerInvolved: false
        };
    }

    fillTemplate(text, context) {
        return text.replace(/{{(\w+)}}/g, (_, key) => context[key] || key);
    }

    addEvent(event) {
        const state = this.stateManager.getSection('events');
        const active = [...state.active, event].slice(0, state.settings.maxActiveEvents);
        const cooldowns = { ...state.cooldowns, [event.templateId]: Date.now() };
        this.stateManager.updateSection('events', { active, cooldowns });
        this.applyEffects(event.effects, event.context);
        this.listeners.started.forEach((callback) => callback(event));
        if (['major', 'critical'].includes(event.severity)) {
            this.listeners.major.forEach((callback) => callback(event));
        }
    }

    getActiveEvents() {
        return this.stateManager.getSection('events').active;
    }

    getEventsByType(type) {
        return this.getActiveEvents().filter((event) => event.type === type);
    }

    getEventsByFaction(factionId) {
        return this.getActiveEvents().filter((event) => {
            const values = Object.values(event.context || {});
            return values.includes(factionId);
        });
    }

    getActiveEventCount() {
        return this.getActiveEvents().length;
    }

    resolveScheduledEvents() {
        const active = this.getActiveEvents();
        const currentIndex = this.getCurrentDayIndex();
        active
            .filter((event) => !event.resolved && currentIndex >= event.endDayIndex)
            .forEach((event) => this.resolveEvent(event.id));
    }

    resolveEvent(eventId, forcedOutcome = null) {
        const state = this.stateManager.getSection('events');
        const event = state.active.find((entry) => entry.id === eventId);
        if (!event) {
            return;
        }
        const outcome = forcedOutcome || this.selectOutcome(event);
        if (outcome) {
            event.outcome = outcome.name;
            this.applyEffects(outcome.effects || [], event.context);
        }
        event.resolved = true;
        const remaining = state.active.filter((entry) => entry.id !== eventId);
        const history = [event, ...state.history].slice(0, state.settings.maxHistorySize);
        this.stateManager.updateSection('events', { active: remaining, history });
        this.listeners.resolved.forEach((callback) => callback(event));
    }

    selectOutcome(event) {
        if (!event.outcomes || !event.outcomes.length) {
            return null;
        }
        const total = event.outcomes.reduce((sum, outcome) => sum + outcome.weight, 0);
        let roll = Math.random() * total;
        for (const outcome of event.outcomes) {
            if (roll < outcome.weight) {
                return outcome;
            }
            roll -= outcome.weight;
        }
        return event.outcomes[0];
    }

    applyEffects(effects, context) {
        effects.forEach((effect) => {
            switch (effect.type) {
                case 'relationship': {
            const faction1 = context.faction1Id || context.factionId;
            const faction2 = context.faction2Id || context.enemyId;
                    if (faction1 && faction2) {
                        this.factionSystem.modifyRelationship(faction1, faction2, effect.change || 0, effect.type);
                    }
                    break;
                }
                case 'start_war': {
                    if (context.faction1Id && context.faction2Id) {
                        this.factionSystem.declareWar(context.faction1Id, context.faction2Id, 'Event trigger');
                    }
                    break;
                }
                case 'end_war': {
                    const active = this.factionSystem.getActiveWars();
                    const war = active.find(
                        (entry) =>
                            (entry.aggressor === context.faction1Id && entry.defender === context.faction2Id) ||
                            (entry.aggressor === context.faction2Id && entry.defender === context.faction1Id)
                    );
                    if (war) {
                        this.factionSystem.endWar(war.id);
                    }
                    break;
                }
                case 'form_alliance': {
                    if (context.faction1Id && context.faction2Id) {
                        this.factionSystem.formAlliance(context.faction1Id, context.faction2Id, effect.allianceType || 'defensive');
                    }
                    break;
                }
                case 'global_tension': {
                    const state = this.stateManager.getSection('events');
                    const globalModifiers = {
                        ...state.globalModifiers,
                        tension: clamp(state.globalModifiers.tension + effect.change, -100, 100)
                    };
                    this.stateManager.updateSection('events', { globalModifiers });
                    break;
                }
                case 'spawn_event': {
                    this.triggerEvent(effect.event, context);
                    break;
                }
                default:
                    break;
            }
        });
    }

    getEventsForPrompt() {
        const settings = this.getSettings();
        if (!settings.injectEventsIntoPrompt) {
            return null;
        }
        const active = this.getActiveEvents();
        if (!active.length) {
            return 'No major events';
        }
        const filtered = settings.majorEventsOnly
            ? active.filter((event) => ['major', 'critical'].includes(event.severity))
            : active;
        if (!filtered.length) {
            return 'No major events';
        }
        return filtered.slice(0, 3).map((event) => event.name).join('; ');
    }

    getRecentEvents(limit = 5) {
        return this.stateManager.getSection('events').history.slice(0, limit);
    }

    getEventHistory(factionId = null, limit = 20) {
        const history = this.stateManager.getSection('events').history;
        const filtered = factionId
            ? history.filter((event) => Object.values(event.context || {}).includes(factionId))
            : history;
        return filtered.slice(0, limit);
    }

    triggerEvent(templateId, context = {}) {
        const template = this.EVENT_TEMPLATES[templateId];
        if (!template) {
            return null;
        }
        const event = this.instantiateEvent(template, context);
        this.addEvent(event);
        return event;
    }

    triggerRandomEventOfType(type) {
        const eligible = Object.values(this.EVENT_TEMPLATES).filter((template) => template.type === type);
        if (!eligible.length) {
            return null;
        }
        const template = this.selectEventTemplate(eligible);
        return this.triggerEvent(template.id, this.buildContext(template));
    }

    onEventStarted(callback) {
        this.listeners.started.push(callback);
    }

    onEventResolved(callback) {
        this.listeners.resolved.push(callback);
    }

    onMajorEvent(callback) {
        this.listeners.major.push(callback);
    }

    buildContext(template) {
        const factionIds = Object.keys(this.factionSystem.getAllFactions());
        const faction1Id = factionIds[0];
        const faction2Id = factionIds[1] || factionIds[0];
        const faction1 = this.factionSystem.getFaction(faction1Id);
        const faction2 = this.factionSystem.getFaction(faction2Id);
        return {
            factionId: faction1Id,
            faction1Id,
            faction2Id,
            enemyId: faction2Id,
            faction: faction1?.name || 'Unknown',
            leader: faction1?.leader || 'Unknown',
            faction1: faction1?.name || 'Unknown',
            faction2: faction2?.name || 'Unknown',
            enemy: faction2?.name || 'Unknown',
            location: faction1?.capital || 'Unknown',
            region: faction1?.capital || 'Unknown',
            resource: 'gold',
            route: 'Grand Trade Road',
            cause: 'bandit attacks',
            dungeon: 'Shadowvault',
            monster_type: 'goblins',
            deity: 'Solarius',
            npc: 'renowned scholar',
            city: faction2?.capital || 'Unknown'
        };
    }

    getCurrentDayIndex() {
        const time = this.stateManager.getSection('time');
        return (time.year * 360) + time.dayOfYear;
    }

    getDateStringFromIndex(index) {
        const year = Math.floor((index - 1) / 360);
        const dayOfYear = ((index - 1) % 360) + 1;
        const tempTime = {
            year,
            dayOfYear,
            hour: 12,
            minute: 0,
            month: 1,
            dayOfMonth: 1,
            dayOfWeek: 1,
            season: 'spring',
            timeOfDay: 'midday',
            monthName: '',
            dayName: ''
        };
        this.timeSystem.updateComputedFields(tempTime);
        return `${tempTime.dayName}, ${tempTime.dayOfMonth} ${tempTime.monthName}, ${tempTime.year} AV`;
    }

    randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
