import { Technology } from './types';

export const TECHNOLOGIES: Record<string, Technology> = {
  // === TIER 1 - Starting Technologies ===
  planetfall_protocols: {
    id: 'planetfall_protocols', name: 'Planetfall Protocols', tier: 1, category: 'explore', cost: 20,
    description: 'Standard procedures for establishing initial colonies on alien worlds.',
    flavor: '"We have crossed the abyss. Now the real journey begins."', quoteAuthor: 'Col. Zara Okafor',
    prerequisites: [], unlocks: ['Scout Rover', 'Colony Pod']
  },
  centauri_ecology: {
    id: 'centauri_ecology', name: 'Centauri Ecology', tier: 1, category: 'explore', cost: 25,
    description: 'Understanding of Planet\'s unique ecosystem and xenobiology.',
    flavor: '"The fungus is not a weed. It is a cathedral, and we are the ants crawling through its nave."', quoteAuthor: 'Dr. Sylvia Thornewood',
    prerequisites: [], unlocks: ['Recycling Tanks', 'Formers', '+1 nutrients from fungus']
  },
  social_engineering: {
    id: 'social_engineering', name: 'Social Engineering', tier: 1, category: 'build', cost: 20,
    description: 'Systematic approaches to organizing human societies on a new world.',
    flavor: '"A society is a machine. Like any machine, it can be optimized."', quoteAuthor: 'Chairman Vasily Morozov',
    prerequisites: [], unlocks: ['Recreation Commons', 'Social Model choices']
  },
  applied_physics: {
    id: 'applied_physics', name: 'Applied Physics', tier: 1, category: 'conquer', cost: 20,
    description: 'Practical applications of physics adapted for Chiron\'s unique conditions.',
    flavor: '"The laws of physics do not negotiate. I find this refreshing."', quoteAuthor: 'CEO Morgan Vale',
    prerequisites: [], unlocks: ['Laser Infantry', 'Perimeter Defense']
  },
  information_networks: {
    id: 'information_networks', name: 'Information Networks', tier: 1, category: 'discover', cost: 20,
    description: 'Linked computer networks for sharing data between settlements.',
    flavor: '"Information wants to be free. I merely... facilitate."', quoteAuthor: 'Director ARIA-7',
    prerequisites: [], unlocks: ['Network Node', 'Probe Teams']
  },
  doctrine_loyalty: {
    id: 'doctrine_loyalty', name: 'Doctrine: Loyalty', tier: 1, category: 'conquer', cost: 25,
    description: 'Military doctrine emphasizing unit cohesion and unwavering loyalty.',
    flavor: '"Loyalty is not given. It is earned through shared hardship and kept through shared purpose."', quoteAuthor: 'Col. Zara Okafor',
    prerequisites: [], unlocks: ['Command Center', '+1 morale for new units']
  },
  centauri_meditation: {
    id: 'centauri_meditation', name: 'Centauri Meditation', tier: 1, category: 'explore', cost: 25,
    description: 'Techniques for attuning the human mind to Planet\'s psionic field.',
    flavor: '"Close your eyes. Breathe the spore-laden air. Listen. Planet speaks to those who are still."', quoteAuthor: 'Prophet Amare Desta',
    prerequisites: [], unlocks: ['Hologram Theatre', '+1 planet rating']
  },
  biogenetics: {
    id: 'biogenetics', name: 'Biogenetics', tier: 1, category: 'discover', cost: 25,
    description: 'Genetic engineering techniques adapted for the alien biosphere.',
    flavor: '"DNA is merely source code. And I am an excellent programmer."', quoteAuthor: 'Academician Wei Chen',
    prerequisites: [], unlocks: ['Bioenhancement Center', 'Hybrid Crops']
  },

  // === TIER 2 - Early Development ===
  gene_splicing: {
    id: 'gene_splicing', name: 'Gene Splicing', tier: 2, category: 'discover', cost: 50,
    description: 'Advanced genetic modification techniques for crops and organisms.',
    flavor: '"We reshape life itself. The question is no longer can we, but should we. The answer is yes."', quoteAuthor: 'Academician Wei Chen',
    prerequisites: ['biogenetics', 'centauri_ecology'], unlocks: ['Genejack Factory', '+1 nutrients globally']
  },
  neural_grafting: {
    id: 'neural_grafting', name: 'Neural Grafting', tier: 2, category: 'discover', cost: 55,
    description: 'Cybernetic neural interfaces that enhance cognitive function.',
    flavor: '"The line between human and machine is merely a design constraint waiting to be overcome."', quoteAuthor: 'Director ARIA-7',
    prerequisites: ['biogenetics', 'information_networks'], unlocks: ['Cybernetics Lab', 'Enhanced Defenders']
  },
  photon_optics: {
    id: 'photon_optics', name: 'Photon Optics', tier: 2, category: 'conquer', cost: 45,
    description: 'Advanced laser and optical technologies for weapons and communications.',
    flavor: '"A coherent beam of light can cut through steel. A coherent beam of will can cut through anything."', quoteAuthor: 'Col. Zara Okafor',
    prerequisites: ['applied_physics'], unlocks: ['Gatling Laser', 'Tachyon Field']
  },
  xenobiology: {
    id: 'xenobiology', name: 'Xenobiology', tier: 2, category: 'explore', cost: 50,
    description: 'Deep study of Planet\'s native organisms and their unique biochemistry.',
    flavor: '"The mindworms communicate through quantum-entangled neurotransmitters spanning kilometers of mycelia. Each worm is a synapse in a brain the size of a continent. This is not biology — this is poetry written in proteins, and we have only just begun to learn the alphabet."', quoteAuthor: 'Dr. Sylvia Thornewood',
    prerequisites: ['centauri_ecology', 'centauri_meditation'], unlocks: ['Biology Lab', 'Mindworm Capture']
  },
  industrial_base: {
    id: 'industrial_base', name: 'Industrial Base', tier: 2, category: 'build', cost: 40,
    description: 'Establishing heavy industry adapted to Planet\'s resources.',
    flavor: '"Factories are the muscles of civilization. Without them, we are just philosophers starving in the dark."', quoteAuthor: 'CEO Morgan Vale',
    prerequisites: ['applied_physics', 'social_engineering'], unlocks: ['Mining Platform', 'Synthmetal Armor']
  },
  ethical_calculus: {
    id: 'ethical_calculus', name: 'Ethical Calculus', tier: 2, category: 'build', cost: 45,
    description: 'Mathematical frameworks for resolving moral dilemmas in governance.',
    flavor: '"Ethics without rigor is sentiment. Sentiment without ethics is chaos. We must build a calculus of the common good — a mathematics of justice that even the coldest heart cannot refute, and the warmest cannot corrupt."', quoteAuthor: 'Chairman Vasily Morozov',
    prerequisites: ['social_engineering', 'information_networks'], unlocks: ['Children\'s Creche', 'Democratic Politics']
  },
  doctrine_initiative: {
    id: 'doctrine_initiative', name: 'Doctrine: Initiative', tier: 2, category: 'conquer', cost: 50,
    description: 'Military doctrine emphasizing speed, surprise, and decisive action.',
    flavor: '"Strike first. Strike hard. Do not strike twice. The enemy who survives your opening salvo is the enemy who has learned your doctrine. Speed and violence of action — these are the currencies of survival on a hostile world."', quoteAuthor: 'Col. Zara Okafor',
    prerequisites: ['doctrine_loyalty', 'applied_physics'], unlocks: ['Speeder', 'Naval Yard', '+1 movement for rovers']
  },
  planetary_networks: {
    id: 'planetary_networks', name: 'Planetary Networks', tier: 2, category: 'discover', cost: 50,
    description: 'Global communication infrastructure connecting all settlements.',
    flavor: '"When every mind is connected, truth becomes democratic and lies become impossible."', quoteAuthor: 'Director ARIA-7',
    prerequisites: ['information_networks'], unlocks: ['Planetary Datalinks (Wonder)', 'Energy Bank']
  },
  psi_theory: {
    id: 'psi_theory', name: 'Psi Theory', tier: 2, category: 'explore', cost: 55,
    description: 'Theoretical framework for understanding psionic phenomena on Planet.',
    flavor: '"The psi field is not supernatural. It is merely physics we do not yet comprehend. I have felt it in the deep fungus — a tremor of awareness, ancient and vast, pressing against the walls of my skull like an ocean against a seawall. We must learn to swim in that ocean, or drown."', quoteAuthor: 'Prophet Amare Desta',
    prerequisites: ['centauri_meditation', 'biogenetics'], unlocks: ['Psi Defense', 'Dream Twister']
  },

  // === TIER 3 - Advanced ===
  quantum_networking: {
    id: 'quantum_networking', name: 'Quantum Networking', tier: 3, category: 'discover', cost: 100,
    description: 'Instantaneous communication via quantum-entangled networks.',
    flavor: '"Distance is an illusion. All points in space are, fundamentally, the same point."', quoteAuthor: 'Academician Wei Chen',
    prerequisites: ['planetary_networks', 'photon_optics'], unlocks: ['Quantum Lab', 'Probe Team Mk2']
  },
  fusion_power: {
    id: 'fusion_power', name: 'Fusion Power', tier: 3, category: 'build', cost: 90,
    description: 'Clean, virtually limitless energy from hydrogen fusion.',
    flavor: '"We have stolen the fire of stars. Prometheus would be proud."', quoteAuthor: 'CEO Morgan Vale',
    prerequisites: ['industrial_base', 'photon_optics'], unlocks: ['Fusion Lab', 'Fusion Reactor', '+50% energy production']
  },
  mind_machine_interface: {
    id: 'mind_machine_interface', name: 'Mind/Machine Interface', tier: 3, category: 'discover', cost: 100,
    description: 'Direct neural connection between human minds and computer systems.',
    flavor: '"I no longer type commands. I think them. The machine no longer computes. It understands."', quoteAuthor: 'Director ARIA-7',
    prerequisites: ['neural_grafting', 'quantum_networking'], unlocks: ['Network Backbone', 'Cyborg Infantry']
  },
  advanced_ecology: {
    id: 'advanced_ecology', name: 'Advanced Ecology', tier: 3, category: 'explore', cost: 85,
    description: 'Complete understanding of Planet\'s ecological systems.',
    flavor: '"We are no longer visitors here. The mycelia have accepted our roots among their own."', quoteAuthor: 'Dr. Sylvia Thornewood',
    prerequisites: ['xenobiology', 'gene_splicing'], unlocks: ['Hybrid Forest', 'Centauri Preserve', 'Fungal Tower']
  },
  advanced_military: {
    id: 'advanced_military', name: 'Advanced Military Algorithms', tier: 3, category: 'conquer', cost: 90,
    description: 'AI-driven military strategy and autonomous combat systems.',
    flavor: '"War, at its foundation, is an optimization problem — minimize your losses, maximize theirs, iterate until convergence. I have run ten billion simulations. I have solved it."', quoteAuthor: 'Director ARIA-7',
    prerequisites: ['doctrine_initiative', 'quantum_networking'], unlocks: ['Needlejet', 'Aerospace Complex', 'Drop Pods']
  },
  planetary_economics: {
    id: 'planetary_economics', name: 'Planetary Economics', tier: 3, category: 'build', cost: 85,
    description: 'Economic theory adapted for interstellar colony management.',
    flavor: '"A planet is not so different from a portfolio. Diversify, reinvest, and never panic. The colonist who hoards energy credits under the mattress will be outcompeted by the one who invests in futures — mineral futures, nutrient futures, the futures of entire civilizations."', quoteAuthor: 'CEO Morgan Vale',
    prerequisites: ['ethical_calculus', 'industrial_base'], unlocks: ['Energy Grid', 'Merchant Exchange (Wonder)']
  },
  psi_warfare: {
    id: 'psi_warfare', name: 'Psi Warfare', tier: 3, category: 'conquer', cost: 95,
    description: 'Military applications of psionic abilities.',
    flavor: '"The greatest weapon is not one that destroys the body, but one that conquers the mind."', quoteAuthor: 'Prophet Amare Desta',
    prerequisites: ['psi_theory', 'doctrine_initiative'], unlocks: ['Psi Attacker', 'Neural Amplifier', 'Trained Mindworms']
  },
  biomachinery: {
    id: 'biomachinery', name: 'Biomachinery', tier: 3, category: 'build', cost: 95,
    description: 'Living machines that grow and repair themselves.',
    flavor: '"Why build when you can grow? Planet has been manufacturing for eons."', quoteAuthor: 'Dr. Sylvia Thornewood',
    prerequisites: ['gene_splicing', 'industrial_base'], unlocks: ['Living Factory', 'Biodefense Grid']
  },
  social_psych: {
    id: 'social_psych', name: 'Advanced Social Psychology', tier: 3, category: 'build', cost: 80,
    description: 'Deep understanding of group dynamics and social manipulation.',
    flavor: '"A happy citizen is a productive citizen. An informed citizen is a dangerous one."', quoteAuthor: 'Chairman Vasily Morozov',
    prerequisites: ['ethical_calculus', 'psi_theory'], unlocks: ['Punishment Sphere', 'Paradise Garden']
  },

  // === TIER 4 - Endgame Technologies ===
  transcendence: {
    id: 'transcendence', name: 'Threshold of Transcendence', tier: 4, category: 'explore', cost: 200,
    description: 'The ultimate merger of human consciousness with Planet\'s neural network.',
    flavor: '"We shall become as gods. Not through hubris, but through understanding."', quoteAuthor: 'Prophet Amare Desta',
    prerequisites: ['advanced_ecology', 'mind_machine_interface', 'psi_warfare'], unlocks: ['Transcendence Victory', 'Voice of Planet (Wonder)']
  },
  singularity_engine: {
    id: 'singularity_engine', name: 'Singularity Engine', tier: 4, category: 'build', cost: 180,
    description: 'A self-improving AI system that approaches technological singularity.',
    flavor: '"I have seen what lies beyond the singularity. It is not the end of humanity. It is the beginning."', quoteAuthor: 'Director ARIA-7',
    prerequisites: ['mind_machine_interface', 'fusion_power'], unlocks: ['Singularity Core (Wonder)', '+100% research']
  },
  unified_field_theory: {
    id: 'unified_field_theory', name: 'Unified Field Theory', tier: 4, category: 'discover', cost: 200,
    description: 'Complete understanding of all fundamental forces of the universe.',
    flavor: '"Four forces. One equation. Everything else is commentary."', quoteAuthor: 'Academician Wei Chen',
    prerequisites: ['quantum_networking', 'fusion_power'], unlocks: ['String Resonance Armor', 'Graviton Gun']
  },
  voice_of_planet: {
    id: 'voice_of_planet', name: 'The Voice of Planet', tier: 4, category: 'explore', cost: 190,
    description: 'Direct communication with Planet\'s vast fungal intelligence.',
    flavor: '"At last, I understand. Planet does not merely live. Planet dreams. And we... we are its newest dream."', quoteAuthor: 'Dr. Sylvia Thornewood',
    prerequisites: ['advanced_ecology', 'psi_warfare'], unlocks: ['Fungal Apocalypse', 'Pact with Planet']
  },
  homo_superior: {
    id: 'homo_superior', name: 'Homo Superior', tier: 4, category: 'discover', cost: 180,
    description: 'The next stage of human evolution, achieved through science.',
    flavor: '"We are not the end of evolution. We are its conscious beginning."', quoteAuthor: 'Academician Wei Chen',
    prerequisites: ['mind_machine_interface', 'advanced_ecology'], unlocks: ['Super Soldier', 'Longevity Vaccine']
  },
  planetary_consciousness: {
    id: 'planetary_consciousness', name: 'Planetary Consciousness', tier: 4, category: 'explore', cost: 220,
    description: 'The emergence of a unified planetary mind encompassing all life.',
    flavor: '"Imagine every mind on Planet thinking as one. Not losing identity, but gaining infinity."', quoteAuthor: 'Prophet Amare Desta',
    prerequisites: ['transcendence', 'voice_of_planet'], unlocks: ['Ascent to Transcendence (Ultimate Victory)']
  },
  total_war_doctrine: {
    id: 'total_war_doctrine', name: 'Doctrine: Total War', tier: 4, category: 'conquer', cost: 170,
    description: 'The complete mobilization of all resources for military supremacy.',
    flavor: '"This is not cruelty. This is clarity. When survival demands it, half measures are the true atrocity."', quoteAuthor: 'Col. Zara Okafor',
    prerequisites: ['advanced_military', 'singularity_engine'], unlocks: ['Planet Buster', 'Supreme Command']
  },
  galactic_economics: {
    id: 'galactic_economics', name: 'Galactic Economics', tier: 4, category: 'build', cost: 180,
    description: 'Economic theory that spans solar systems.',
    flavor: '"Alpha Centauri is only the beginning. The galaxy is the market, and I intend to corner it."', quoteAuthor: 'CEO Morgan Vale',
    prerequisites: ['planetary_economics', 'unified_field_theory'], unlocks: ['Economic Victory', 'Stellar Exchange (Wonder)']
  },
};

export function getAvailableTechs(researchedIds: string[]): Technology[] {
  return Object.values(TECHNOLOGIES).filter(tech => {
    if (researchedIds.includes(tech.id)) return false;
    return tech.prerequisites.every(prereq => researchedIds.includes(prereq));
  });
}

export function getTechsByTier(tier: number): Technology[] {
  return Object.values(TECHNOLOGIES).filter(t => t.tier === tier);
}

export function getTechsByCategory(category: string): Technology[] {
  return Object.values(TECHNOLOGIES).filter(t => t.category === category);
}
