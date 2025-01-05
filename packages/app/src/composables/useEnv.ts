interface EnvironmentVariables {
  apiBaseUrl: string;
}

function useEnv(): EnvironmentVariables {
  const env = (import.meta as ImportMeta).env;
  return {
    apiBaseUrl: env.VITE_API_BASE_URL || 'http://localhost:43865',
  };
}

export default useEnv;
