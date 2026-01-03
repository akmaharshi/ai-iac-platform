import { Cloud } from 'lucide-react';

interface CloudProviderSelectorProps {
  selected: string;
  onSelect: (provider: string) => void;
}

export default function CloudProviderSelector({ selected, onSelect }: CloudProviderSelectorProps) {
  const providers = [
    {
      id: 'aws',
      name: 'Amazon Web Services',
      icon: '☁️',
      color: 'from-orange-500 to-orange-600',
      description: 'AWS Cloud Platform'
    },
    {
      id: 'azure',
      name: 'Microsoft Azure',
      icon: '⚡',
      color: 'from-blue-500 to-blue-600',
      description: 'Azure Cloud Platform'
    },
    {
      id: 'gcp',
      name: 'Google Cloud Platform',
      icon: '🔷',
      color: 'from-green-500 to-green-600',
      description: 'GCP Cloud Platform'
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Cloud className="h-5 w-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Select Cloud Provider</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => onSelect(provider.id)}
            className={`
              relative p-6 rounded-xl border-2 transition-all
              ${selected === provider.id
                ? 'border-primary-600 bg-primary-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'}
            `}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className={`
                text-4xl w-16 h-16 flex items-center justify-center rounded-full
                bg-gradient-to-br ${provider.color} text-white shadow-lg
              `}>
                {provider.icon}
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{provider.description}</p>
              </div>
            </div>

            {selected === provider.id && (
              <div className="absolute top-3 right-3">
                <div className="bg-primary-600 text-white rounded-full p-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
