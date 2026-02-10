import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 模型發現服務
 * 從供應商 API 自動獲取可用的模型列表
 */
class ModelDiscoveryService {
  /**
   * 從 OpenAI 兼容 API 獲取模型列表
   */
  async discoverOpenAIModels(provider) {
    try {
      const response = await axios.get(`${provider.endpoint}/models`, {
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const models = response.data.data || [];
      return models.map(model => ({
        modelId: model.id,
        name: model.id,
        type: this.inferModelType(model.id),
        description: model.object || 'AI Model',
        contextSize: this.getContextSize(model.id),
        pricing: null
      }));
    } catch (error) {
      console.error(`Failed to discover models for provider ${provider.name}:`, error.message);
      return [];
    }
  }

  /**
   * 推斷模型類型
   */
  inferModelType(modelId) {
    const lowerId = modelId.toLowerCase();
    
    if (lowerId.includes('gpt') || lowerId.includes('chat') || lowerId.includes('text')) {
      return 'chat';
    }
    if (lowerId.includes('dall') || lowerId.includes('image') || lowerId.includes('stable')) {
      return 'image';
    }
    if (lowerId.includes('embed') || lowerId.includes('embedding')) {
      return 'embedding';
    }
    if (lowerId.includes('whisper') || lowerId.includes('audio') || lowerId.includes('speech')) {
      return 'audio';
    }
    
    return 'chat'; // 默認為聊天模型
  }

  /**
   * 獲取模型上下文大小
   */
  getContextSize(modelId) {
    const contextSizes = {
      'gpt-4': 8192,
      'gpt-4-32k': 32768,
      'gpt-4-turbo': 128000,
      'gpt-4-turbo-preview': 128000,
      'gpt-4o': 128000,
      'gpt-4o-mini': 128000,
      'gpt-3.5-turbo': 4096,
      'gpt-3.5-turbo-16k': 16384,
      'gpt-3.5-turbo-1106': 16384,
      'gpt-3.5-turbo-0125': 16384,
      'claude-3-opus': 200000,
      'claude-3-sonnet': 200000,
      'claude-3-haiku': 200000,
      'claude-3.5-sonnet': 200000,
    };

    for (const [key, size] of Object.entries(contextSizes)) {
      if (modelId.toLowerCase().includes(key.toLowerCase())) {
        return size;
      }
    }

    return 4096; // 默認上下文大小
  }

  /**
   * 為單個供應商發現並更新模型
   */
  async discoverModelsForProvider(providerId) {
    const provider = await prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new Error('Provider not found');
    }

    if (provider.status !== 'active') {
      console.log(`Provider ${provider.name} is not active, skipping discovery`);
      return [];
    }

    console.log(`Discovering models for provider: ${provider.name}`);

    let models = [];
    
    // 根據供應商類型選擇發現方法
    if (provider.endpoint.includes('openai') || provider.type === 'chat') {
      models = await this.discoverOpenAIModels(provider);
    } else {
      // 對於其他供應商，嘗試使用 OpenAI 兼容格式
      models = await this.discoverOpenAIModels(provider);
    }

    // 更新資料庫
    const results = [];
    for (const modelData of models) {
      const model = await prisma.model.upsert({
        where: {
          providerId_modelId: {
            providerId: provider.id,
            modelId: modelData.modelId
          }
        },
        update: {
          name: modelData.name,
          type: modelData.type,
          description: modelData.description,
          contextSize: modelData.contextSize,
          pricing: modelData.pricing,
          status: 'active',
          lastSynced: new Date()
        },
        create: {
          providerId: provider.id,
          modelId: modelData.modelId,
          name: modelData.name,
          type: modelData.type,
          description: modelData.description,
          contextSize: modelData.contextSize,
          pricing: modelData.pricing,
          status: 'active'
        }
      });
      results.push(model);
    }

    // 標記不再存在的模型為 inactive
    const existingModelIds = models.map(m => m.modelId);
    await prisma.model.updateMany({
      where: {
        providerId: provider.id,
        modelId: { notIn: existingModelIds },
        status: 'active'
      },
      data: { status: 'inactive' }
    });

    console.log(`Discovered ${results.length} models for provider ${provider.name}`);
    return results;
  }

  /**
   * 為所有啟用的供應商發現模型
   */
  async discoverAllModels() {
    const providers = await prisma.provider.findMany({
      where: { status: 'active' }
    });

    console.log(`Starting model discovery for ${providers.length} providers`);

    const allResults = [];
    for (const provider of providers) {
      try {
        const results = await this.discoverModelsForProvider(provider.id);
        allResults.push(...results);
      } catch (error) {
        console.error(`Failed to discover models for provider ${provider.name}:`, error.message);
      }
    }

    console.log(`Model discovery completed. Total models: ${allResults.length}`);
    return allResults;
  }

  /**
   * 獲取指定類型的可用模型
   */
  async getAvailableModels(type = null) {
    const where = {
      status: 'active',
      provider: { status: 'active' }
    };

    if (type) {
      where.type = type;
    }

    const models = await prisma.model.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: [
        { provider: { priority: 'desc' } },
        { name: 'asc' }
      ]
    });

    return models;
  }

  /**
   * 手動刷新指定供應商的模型
   */
  async refreshProviderModels(providerId) {
    return await this.discoverModelsForProvider(providerId);
  }
}

export default new ModelDiscoveryService();
