/**
 * Domain command handlers for Kingdoms & Warfare
 * Handles Discord commands related to domains
 */

import { InteractionResponseType } from 'discord-interactions';
import { createDomain, DOMAIN_SKILLS } from '../../models/domain.js';
import { saveDomain, getDomain, deleteDomain, getServerData, saveServerData } from '../../utils/storage.js';
import { formatDomain } from '../../utils/formatter.js';
import { KV_NAMESPACE } from './index.js';

/**
 * Handle domain commands
 * @param {Object} interaction - Discord interaction
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
export async function handleDomainCommand(interaction, env) {
  const { options } = interaction.data.options[0];
  const action = options.find(opt => opt.name === 'action').value;
  
  switch (action) {
    case 'create':
      return handleCreateDomain(interaction, env);
    case 'view':
      return handleViewDomain(interaction, env);
    case 'list':
      return handleListDomains(interaction, env);
    case 'delete':
      return handleDeleteDomain(interaction, env);
    default:
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Unknown domain action: ${action}` },
      };
  }
}

/**
 * Handle creating a domain
 * @param {Object} interaction - Discord interaction
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleCreateDomain(interaction, env) {
  const { options } = interaction.data.options[0];
  const name = options.find(opt => opt.name === 'name')?.value;
  const size = options.find(opt => opt.name === 'size')?.value;
  const diplomacy = options.find(opt => opt.name === 'diplomacy')?.value || 0;
  const espionage = options.find(opt => opt.name === 'espionage')?.value || 0;
  const lore = options.find(opt => opt.name === 'lore')?.value || 0;
  const operations = options.find(opt => opt.name === 'operations')?.value || 0;
  
  if (!name) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Domain name is required' },
    };
  }
  
  // Create the domain
  const domain = createDomain({
    name,
    size: size || 1,
    skills: {
      [DOMAIN_SKILLS.DIPLOMACY]: diplomacy,
      [DOMAIN_SKILLS.ESPIONAGE]: espionage,
      [DOMAIN_SKILLS.LORE]: lore,
      [DOMAIN_SKILLS.OPERATIONS]: operations,
    },
  });
  
  // Save the domain
  try {
    await saveDomain(env, KV_NAMESPACE, domain);
    
    // Add the domain to the server's domain list
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
    
    if (!serverData.domains) {
      serverData.domains = [];
    }
    
    serverData.domains.push(domain.id);
    
    await saveServerData(env, KV_NAMESPACE, serverId, serverData);
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Domain created: ${domain.name} (ID: ${domain.id})\n\n${formatDomain(domain)}` },
    };
  } catch (error) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Error creating domain: ${error.message}` },
    };
  }
}

/**
 * Handle viewing a domain
 * @param {Object} interaction - Discord interaction
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleViewDomain(interaction, env) {
  const { options } = interaction.data.options[0];
  const name = options.find(opt => opt.name === 'name')?.value;
  
  if (!name) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Domain name is required' },
    };
  }
  
  try {
    // Get the server's domain list
    const serverId = interaction.guild_id;
    const serverData = await getServerData(env, KV_NAMESPACE, serverId);
    
    if (!serverData || !serverData.domains || serverData.domains.length === 0) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: 'No domains found for this server' },
      };
    }
    
    // Find domains that match the name
    const matchingDomains = [];
    
    for (const domainId of serverData.domains) {
      const domain = await getDomain(env, KV_NAMESPACE, domainId);
      
      if (domain && domain.name.toLowerCase().includes(name.toLowerCase())) {
        matchingDomains.push(domain);
      }
    }
    
    if (matchingDomains.length === 0) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `No domains found with name: ${name}` },
      };
    }
    
    if (matchingDomains.length === 1) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: formatDomain(matchingDomains[0]) },
      };
    }
    
    // Multiple matches, show a list
    let content = `Found ${matchingDomains.length} domains matching "${name}":\n\n`;
    
    matchingDomains.forEach(domain => {
      content += `**${domain.name}** (ID: ${domain.id})\n`;
    });
    
    content += '\nUse the domain ID to view a specific domain.';
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content },
    };
  } catch (error) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Error viewing domain: ${error.message}` },
    };
  }
}

/**
 * Handle listing domains
 * @param {Object} interaction - Discord interaction
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleListDomains(interaction, env) {
  try {
    // Get the server's domain list
    const serverId = interaction.guild_id;
    const serverData = await getServerData(env, KV_NAMESPACE, serverId);
    
    if (!serverData || !serverData.domains || serverData.domains.length === 0) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: 'No domains found for this server' },
      };
    }
    
    // Get all domains
    const domains = [];
    
    for (const domainId of serverData.domains) {
      const domain = await getDomain(env, KV_NAMESPACE, domainId);
      
      if (domain) {
        domains.push(domain);
      }
    }
    
    if (domains.length === 0) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: 'No domains found for this server' },
      };
    }
    
    // Sort domains by name
    domains.sort((a, b) => a.name.localeCompare(b.name));
    
    // Format the list
    let content = `**Domains (${domains.length})**\n\n`;
    
    domains.forEach(domain => {
      content += `**${domain.name}** (ID: ${domain.id}) - Size ${domain.size}\n`;
    });
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content },
    };
  } catch (error) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Error listing domains: ${error.message}` },
    };
  }
}

/**
 * Handle deleting a domain
 * @param {Object} interaction - Discord interaction
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Response to send back to Discord
 */
async function handleDeleteDomain(interaction, env) {
  const { options } = interaction.data.options[0];
  const name = options.find(opt => opt.name === 'name')?.value;
  
  if (!name) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Domain name or ID is required' },
    };
  }
  
  try {
    // Get the server's domain list
    const serverId = interaction.guild_id;
    const serverData = await getServerData(env, KV_NAMESPACE, serverId);
    
    if (!serverData || !serverData.domains || serverData.domains.length === 0) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: 'No domains found for this server' },
      };
    }
    
    // Find domains that match the name or ID
    const matchingDomains = [];
    
    for (const domainId of serverData.domains) {
      const domain = await getDomain(env, KV_NAMESPACE, domainId);
      
      if (domain && (domain.id === name || domain.name.toLowerCase().includes(name.toLowerCase()))) {
        matchingDomains.push(domain);
      }
    }
    
    if (matchingDomains.length === 0) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `No domains found with name or ID: ${name}` },
      };
    }
    
    if (matchingDomains.length === 1) {
      // Delete the domain
      await deleteDomain(env, KV_NAMESPACE, matchingDomains[0].id);
      
      // Remove the domain from the server's domain list
      serverData.domains = serverData.domains.filter(id => id !== matchingDomains[0].id);
      
      await saveServerData(env, KV_NAMESPACE, serverId, serverData);
      
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `Domain deleted: ${matchingDomains[0].name} (ID: ${matchingDomains[0].id})` },
      };
    }
    
    // Multiple matches, show a list
    let content = `Found ${matchingDomains.length} domains matching "${name}":\n\n`;
    
    matchingDomains.forEach(domain => {
      content += `**${domain.name}** (ID: ${domain.id})\n`;
    });
    
    content += '\nPlease use the domain ID to delete a specific domain.';
    
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content },
    };
  } catch (error) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `Error deleting domain: ${error.message}` },
    };
  }
}
