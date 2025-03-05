/**
 * Dice utility for Kingdoms & Warfare
 * Provides functions for rolling dice and calculating results
 */

/**
 * Roll a single die
 * @param {Number} sides - Number of sides on the die
 * @returns {Number} - Result of the roll
 */
export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll multiple dice
 * @param {Number} count - Number of dice to roll
 * @param {Number} sides - Number of sides on each die
 * @returns {Array} - Results of the rolls
 */
export function rollDice(count, sides) {
  const results = [];
  
  for (let i = 0; i < count; i++) {
    results.push(rollDie(sides));
  }
  
  return results;
}

/**
 * Roll dice and sum the results
 * @param {Number} count - Number of dice to roll
 * @param {Number} sides - Number of sides on each die
 * @returns {Number} - Sum of the rolls
 */
export function rollSum(count, sides) {
  return rollDice(count, sides).reduce((sum, roll) => sum + roll, 0);
}

/**
 * Roll dice and keep the highest results
 * @param {Number} count - Number of dice to roll
 * @param {Number} sides - Number of sides on each die
 * @param {Number} keep - Number of dice to keep
 * @returns {Array} - Highest results
 */
export function rollKeepHighest(count, sides, keep) {
  const results = rollDice(count, sides);
  
  return results
    .sort((a, b) => b - a)
    .slice(0, keep);
}

/**
 * Roll dice and keep the lowest results
 * @param {Number} count - Number of dice to roll
 * @param {Number} sides - Number of sides on each die
 * @param {Number} keep - Number of dice to keep
 * @returns {Array} - Lowest results
 */
export function rollKeepLowest(count, sides, keep) {
  const results = rollDice(count, sides);
  
  return results
    .sort((a, b) => a - b)
    .slice(0, keep);
}

/**
 * Roll dice with advantage (roll twice, keep highest)
 * @param {Number} sides - Number of sides on the die
 * @returns {Object} - Result of the roll with advantage
 */
export function rollWithAdvantage(sides) {
  const roll1 = rollDie(sides);
  const roll2 = rollDie(sides);
  const result = Math.max(roll1, roll2);
  
  return {
    rolls: [roll1, roll2],
    result,
  };
}

/**
 * Roll dice with disadvantage (roll twice, keep lowest)
 * @param {Number} sides - Number of sides on the die
 * @returns {Object} - Result of the roll with disadvantage
 */
export function rollWithDisadvantage(sides) {
  const roll1 = rollDie(sides);
  const roll2 = rollDie(sides);
  const result = Math.min(roll1, roll2);
  
  return {
    rolls: [roll1, roll2],
    result,
  };
}

/**
 * Parse a dice notation string and roll the dice
 * @param {String} notation - Dice notation (e.g. "2d6+3")
 * @returns {Object} - Result of the roll
 */
export function rollFromNotation(notation) {
  // Parse the notation
  const regex = /(\d+)?d(\d+)(?:([-+])(\d+))?/i;
  const match = notation.match(regex);
  
  if (!match) {
    throw new Error(`Invalid dice notation: ${notation}`);
  }
  
  const count = parseInt(match[1] || 1, 10);
  const sides = parseInt(match[2], 10);
  const operator = match[3];
  const modifier = parseInt(match[4] || 0, 10);
  
  // Roll the dice
  const rolls = rollDice(count, sides);
  const sum = rolls.reduce((total, roll) => total + roll, 0);
  
  // Apply the modifier
  let result = sum;
  if (operator === '+') {
    result += modifier;
  } else if (operator === '-') {
    result -= modifier;
  }
  
  return {
    notation,
    rolls,
    modifier: operator ? `${operator}${modifier}` : null,
    result,
  };
}

/**
 * Roll a skill check
 * @param {Number} bonus - Skill bonus
 * @param {Number} difficulty - Difficulty class (DC)
 * @param {Boolean} advantage - Whether to roll with advantage
 * @param {Boolean} disadvantage - Whether to roll with disadvantage
 * @returns {Object} - Result of the skill check
 */
export function rollSkillCheck(bonus, difficulty, advantage = false, disadvantage = false) {
  let dieRoll;
  
  // Handle advantage and disadvantage
  if (advantage && !disadvantage) {
    dieRoll = rollWithAdvantage(20);
  } else if (disadvantage && !advantage) {
    dieRoll = rollWithDisadvantage(20);
  } else {
    // If both advantage and disadvantage, or neither, roll normally
    const roll = rollDie(20);
    dieRoll = {
      rolls: [roll],
      result: roll,
    };
  }
  
  // Calculate the total
  const total = dieRoll.result + bonus;
  
  // Determine success or failure
  const success = total >= difficulty;
  
  return {
    dieRoll: dieRoll.result,
    bonus,
    total,
    difficulty,
    success,
    advantage,
    disadvantage,
    allRolls: dieRoll.rolls,
  };
}

/**
 * Roll an attack
 * @param {Number} attackBonus - Attack bonus
 * @param {Number} defenseScore - Defense score
 * @param {Boolean} advantage - Whether to roll with advantage
 * @param {Boolean} disadvantage - Whether to roll with disadvantage
 * @returns {Object} - Result of the attack
 */
export function rollAttack(attackBonus, defenseScore, advantage = false, disadvantage = false) {
  return rollSkillCheck(attackBonus, defenseScore, advantage, disadvantage);
}

/**
 * Roll damage
 * @param {Number} count - Number of damage dice to roll
 * @param {Number} sides - Number of sides on each damage die
 * @param {Number} powerBonus - Power bonus
 * @returns {Object} - Result of the damage roll
 */
export function rollDamage(count, sides, powerBonus = 0) {
  const rolls = rollDice(count, sides);
  const sum = rolls.reduce((total, roll) => total + roll, 0);
  const total = sum + powerBonus;
  
  return {
    rolls,
    sum,
    powerBonus,
    total,
  };
}

/**
 * Roll a saving throw
 * @param {Number} bonus - Saving throw bonus
 * @param {Number} difficulty - Difficulty class (DC)
 * @param {Boolean} advantage - Whether to roll with advantage
 * @param {Boolean} disadvantage - Whether to roll with disadvantage
 * @returns {Object} - Result of the saving throw
 */
export function rollSavingThrow(bonus, difficulty, advantage = false, disadvantage = false) {
  return rollSkillCheck(bonus, difficulty, advantage, disadvantage);
}

/**
 * Roll a morale check
 * @param {Number} moraleScore - Morale score
 * @param {Number} difficulty - Difficulty class (DC)
 * @returns {Object} - Result of the morale check
 */
export function rollMoraleCheck(moraleScore, difficulty) {
  const roll = rollDie(20);
  const total = roll + moraleScore;
  const success = total >= difficulty;
  
  return {
    roll,
    moraleScore,
    total,
    difficulty,
    success,
  };
}

/**
 * Roll a domain skill check
 * @param {Number} skillBonus - Skill bonus
 * @param {Number} domainSize - Domain size (1-5)
 * @param {Number} difficulty - Difficulty class (DC)
 * @param {Boolean} advantage - Whether to roll with advantage
 * @param {Boolean} disadvantage - Whether to roll with disadvantage
 * @returns {Object} - Result of the domain skill check
 */
export function rollDomainSkillCheck(skillBonus, domainSize, difficulty, advantage = false, disadvantage = false) {
  // Calculate the proficiency bonus
  const proficiencyBonus = 2 + Math.floor(domainSize / 2);
  
  // Calculate the total bonus
  const totalBonus = skillBonus + proficiencyBonus;
  
  // Roll the skill check
  return rollSkillCheck(totalBonus, difficulty, advantage, disadvantage);
}

/**
 * Roll a domain defense check
 * @param {Number} defenseScore - Defense score
 * @param {Number} attackBonus - Attack bonus
 * @returns {Object} - Result of the domain defense check
 */
export function rollDomainDefenseCheck(defenseScore, attackBonus) {
  const roll = rollDie(20);
  const total = roll + defenseScore;
  const success = total >= attackBonus;
  
  return {
    roll,
    defenseScore,
    total,
    attackBonus,
    success,
  };
}
