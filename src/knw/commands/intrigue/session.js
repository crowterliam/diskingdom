/**
 * Session command handlers for Kingdoms & Warfare
 * Handles Discord commands related to intrigue sessions
 */

import { InteractionResponseType } from 'discord-interactions';
import { createIntrigue, INTRIGUE_PHASES, createSkillTestAction } from '../../models/intrigue.js';
import { saveIntrigue, getIntrigue, deleteIntrigue, getDomain, getServerData, saveServerData } from '../../utils/storage.js';
import { formatIntrigue, formatDiceRoll } from '../../utils/formatter.js';
import { rollSkillCheck } from '../../utils/dice.js';
import { KV_NAMESPACE, formatIntrigueAction } from './index.js';

/**
 * Handle session commands
 * @param {Object} interaction - Discord interaction
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
export async function handleSessionCommand(interaction, env) {
  const { options } = interaction.data.options[0];
  const action = options.find(opt => opt.name === 'action').value;
  
  switch (action) {
    case 'create':
      return handleCreateSession(interaction, env);
    case 'view':
      return handleViewSession(interaction, env);
    case 'list':
      return handleListSessions(interaction, env);
    case 'delete':
      return handleDeleteSession(interaction, env);
    case 'start':
      return handleStartSession(interaction, env);
    case 'action':
      return handleSessionAction(interaction, env);
    default:
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Unknown session action: ${action}` },
      };
  }
}

/**
 * Handle creating an intrigue session
 * @param {Object} interaction - Discord interaction
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleCreateSession(interaction, env) {
  const { options } = interaction.data.options[0];
  const name = options.find(opt => opt.name === 'name')?.value;
  
  if (!name) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Intrigue session name is required' },
    };
  }
  
  // Create the intrigue session
  const intrigue = createIntrigue({
    name,
  });
  
  // Save the intrigue session
  try {
    await saveIntrigue(env, KV_NAMESPACE, intrigue);
    
    // Add the intrigue session to the server's intrigue list
    const serverId = interaction.guild_id;
    let serverData = await getServerData(env, KV_NAMESPACE, serverId);
    
    if (!serverData) {
      serverData = {
        units: [],
        domains: [],
        battles: [],
        intrigues: [],
      };
    }
    
    if (!serverData.intrigues) {
      serverData.intrigues = [];
    }
    
    serverData.intrigues.push(intrigue.id);
    
    await saveServerData(env, KV_NAMESPACE, serverId, serverData);
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Intrigue session created: ${intrigue.name} (ID: ${intrigue.id})` },
    };
  } catch (error) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Error creating intrigue session: ${error.message}` },
    };
  }
}

/**
 * Handle viewing an intrigue session
 * @param {Object} interaction - Discord interaction
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleViewSession(interaction, env) {
  const { options } = interaction.data.options[0];
  const sessionId = options.find(opt => opt.name === 'session_id')?.value;
  
  if (!sessionId) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Intrigue session ID is required' },
    };
  }
  
  try {
    // Get the intrigue session
    const intrigue = await getIntrigue(env, KV_NAMESPACE, sessionId);
    
    if (!intrigue) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Intrigue session not found: ${sessionId}` },
      };
    }
    
    // Get the domains for the intrigue session
    const domains = {};
    
    // Get all domains in the intrigue session
    for (const domainId of intrigue.domains) {
      const domain = await getDomain(env, KV_NAMESPACE, domainId);
      
      if (domain) {
        domains[domainId] = domain;
      }
    }
    
    // Format the intrigue session
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: formatIntrigue(intrigue, domains) },
    };
  } catch (error) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Error viewing intrigue session: ${error.message}` },
    };
  }
}

/**
 * Handle listing intrigue sessions
 * @param {Object} interaction - Discord interaction
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleListSessions(interaction, env) {
  try {
    // Get the server's intrigue list
    const serverId = interaction.guild_id;
    const serverData = await getServerData(env, KV_NAMESPACE, serverId);
    
    if (!serverData || !serverData.intrigues || serverData.intrigues.length === 0) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: 'No intrigue sessions found for this server' },
      };
    }
    
    // Get all intrigue sessions
    const intrigues = [];
    
    for (const intrigueId of serverData.intrigues) {
      const intrigue = await getIntrigue(env, KV_NAMESPACE, intrigueId);
      
      if (intrigue) {
        intrigues.push(intrigue);
      }
    }
    
    if (intrigues.length === 0) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: 'No intrigue sessions found for this server' },
      };
    }
    
    // Sort intrigue sessions by name
    intrigues.sort((a, b) => a.name.localeCompare(b.name));
    
    // Format the list
    let content = `**Intrigue Sessions (${intrigues.length})**\n\n`;
    
    intrigues.forEach(intrigue => {
      content += `**${intrigue.name}** (ID: ${intrigue.id}) - ${intrigue.phase}\n`;
    });
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content },
    };
  } catch (error) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Error listing intrigue sessions: ${error.message}` },
    };
  }
}

/**
 * Handle deleting an intrigue session
 * @param {Object} interaction - Discord interaction
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleDeleteSession(interaction, env) {
  const { options } = interaction.data.options[0];
  const sessionId = options.find(opt => opt.name === 'session_id')?.value;
  
  if (!sessionId) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Intrigue session ID is required' },
    };
  }
  
  try {
    // Get the intrigue session
    const intrigue = await getIntrigue(env, KV_NAMESPACE, sessionId);
    
    if (!intrigue) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Intrigue session not found: ${sessionId}` },
      };
    }
    
    // Delete the intrigue session
    await deleteIntrigue(env, KV_NAMESPACE, sessionId);
    
    // Remove the intrigue session from the server's intrigue list
    const serverId = interaction.guild_id;
    const serverData = await getServerData(env, KV_NAMESPACE, serverId);
    
    if (serverData && serverData.intrigues) {
      serverData.intrigues = serverData.intrigues.filter(id => id !== sessionId);
      await saveServerData(env, KV_NAMESPACE, serverId, serverData);
    }
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Intrigue session deleted: ${intrigue.name} (ID: ${intrigue.id})` },
    };
  } catch (error) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Error deleting intrigue session: ${error.message}` },
    };
  }
}

/**
 * Handle starting an intrigue session
 * @param {Object} interaction - Discord interaction
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleStartSession(interaction, env) {
  const { options } = interaction.data.options[0];
  const sessionId = options.find(opt => opt.name === 'session_id')?.value;
  const initiatorId = options.find(opt => opt.name === 'initiator_id')?.value;
  const domainId = options.find(opt => opt.name === 'domain_id')?.value;
  
  if (!sessionId) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Intrigue session ID is required' },
    };
  }
  
  if (!initiatorId) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Initiator domain ID is required' },
    };
  }
  
  try {
    // Get the intrigue session
    const intrigue = await getIntrigue(env, KV_NAMESPACE, sessionId);
    
    if (!intrigue) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Intrigue session not found: ${sessionId}` },
      };
    }
    
    // Check if the intrigue session is already started
    if (intrigue.phase !== INTRIGUE_PHASES.SETUP) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Intrigue session ${intrigue.name} is already in ${intrigue.phase} phase` },
      };
    }
    
    // Get the initiator domain
    const initiator = await getDomain(env, KV_NAMESPACE, initiatorId);
    
    if (!initiator) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Initiator domain not found: ${initiatorId}` },
      };
    }
    
    // Update the intrigue session
    const updatedIntrigue = { ...intrigue };
    
    // Set the initiator
    updatedIntrigue.initiator = initiatorId;
    
    // Add the initiator to the domains if it's not already there
    if (!updatedIntrigue.domains.includes(initiatorId)) {
      updatedIntrigue.domains.push(initiatorId);
    }
    
    // Add the target domain if provided
    if (domainId && !updatedIntrigue.domains.includes(domainId)) {
      // Get the target domain
      const domain = await getDomain(env, KV_NAMESPACE, domainId);
      
      if (!domain) {
        return {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: `Target domain not found: ${domainId}` },
        };
      }
      
      updatedIntrigue.domains.push(domainId);
    }
    
    // Save the updated intrigue session
    await saveIntrigue(env, KV_NAMESPACE, updatedIntrigue);
    
    // Get the domains for the intrigue session
    const domains = {};
    
    // Get all domains in the intrigue session
    for (const id of updatedIntrigue.domains) {
      const domain = await getDomain(env, KV_NAMESPACE, id);
      
      if (domain) {
        domains[id] = domain;
      }
    }
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Intrigue session ${updatedIntrigue.name} updated with initiator ${initiator.name}\n\n${formatIntrigue(updatedIntrigue, domains)}` },
    };
  } catch (error) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Error starting intrigue session: ${error.message}` },
    };
  }
}

/**
 * Handle taking an action in an intrigue session
 * @param {Object} interaction - Discord interaction
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleSessionAction(interaction, env) {
  const { options } = interaction.data.options[0];
  const sessionId = options.find(opt => opt.name === 'session_id')?.value;
  const domainId = options.find(opt => opt.name === 'domain_id')?.value;
  const skill = options.find(opt => opt.name === 'skill')?.value;
  const targetId = options.find(opt => opt.name === 'target_id')?.value;
  const difficulty = options.find(opt => opt.name === 'difficulty')?.value;
  const description = options.find(opt => opt.name === 'description')?.value || '';
  
  if (!sessionId) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Intrigue session ID is required' },
    };
  }
  
  if (!domainId) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Domain ID is required' },
    };
  }
  
  if (!skill) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Skill is required' },
    };
  }
  
  try {
    // Get the intrigue session
    const intrigue = await getIntrigue(env, KV_NAMESPACE, sessionId);
    
    if (!intrigue) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Intrigue session not found: ${sessionId}` },
      };
    }
    
    // Get the domain
    const domain = await getDomain(env, KV_NAMESPACE, domainId);
    
    if (!domain) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Domain not found: ${domainId}` },
      };
    }
    
    // Create the action
    const action = createSkillTestAction({
      skill,
      target: targetId,
      difficulty,
      description,
    });
    
    // Roll the skill check
    const rollResult = rollSkillCheck({
      skillModifier: domain.skills[skill],
      dc: difficulty,
    });
    
    // Update the action with the result
    action.result = formatDiceRoll(rollResult);
    
    // Update the intrigue session
    const updatedIntrigue = { ...intrigue };
    
    // Add the turn
    updatedIntrigue.turns.push({
      domainId,
      action,
      timestamp: new Date().toISOString(),
    });
    
    // Log the action
    updatedIntrigue.log.push({
      type: 'action_taken',
      domainId,
      action,
      timestamp: new Date().toISOString(),
    });
    
    // Save the updated intrigue session
    await saveIntrigue(env, KV_NAMESPACE, updatedIntrigue);
    
    // Get the domains for the intrigue session
    const domains = {};
    
    // Get all domains in the intrigue session
    for (const id of updatedIntrigue.domains) {
      const d = await getDomain(env, KV_NAMESPACE, id);
      
      if (d) {
        domains[id] = d;
      }
    }
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `${domain.name} took action: ${formatIntrigueAction(action)}\n\n${formatIntrigue(updatedIntrigue, domains)}` },
    };
  } catch (error) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Error taking action in intrigue session: ${error.message}` },
    };
  }
}
