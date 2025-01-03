type ModelId = 'claude-3-5-sonnet-latest' | 'claude-3-5-haiku-latest';

interface Model {
  id: ModelId;
  name: string;
  description: string;
}

interface Provider {
  id: string;
  name: string;
  iconUrl: string;
  apiKey: string;
  models: Model[];
}

export type { ModelId, Model, Provider };
