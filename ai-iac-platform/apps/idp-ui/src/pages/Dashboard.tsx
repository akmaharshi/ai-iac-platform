import { useState } from 'react';
import Layout from '../components/Layout';
import CloudProviderSelector from '../components/CloudProviderSelector';
import DiagramUpload from '../components/DiagramUpload';
import ProgressTracker from '../components/ProgressTracker';
import ResultsDisplay from '../components/ResultsDisplay';
import { AlertCircle, CheckCircle } from 'lucide-react';

const GENERATION_STEPS = [
  {
    id: 'upload',
    name: 'Diagram Analysis',
    description: 'Analyzing your architecture diagram using AI vision',
  },
  {
    id: 'generate',
    name: 'Code Generation',
    description: 'Generating Terraform infrastructure code',
  },
  {
    id: 'security',
    name: 'Security Scanning',
    description: 'Running security checks with Checkov',
  },
  {
    id: 'cost',
    name: 'Cost Estimation',
    description: 'Calculating infrastructure costs',
  },
  {
    id: 'complete',
    name: 'Complete',
    description: 'Infrastructure code is ready to use',
  },
];

export default function Dashboard() {
  const [cloudProvider, setCloudProvider] = useState<string>('aws');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsGenerating(true);
    setCurrentStep(0);
    setError(null);
    setResults(null);

    try {
      // Step 1: Upload and analyze
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate infrastructure code');
      }

      // Simulate progress through steps
      for (let i = 1; i < GENERATION_STEPS.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCurrentStep(i);
      }

      const data = await response.json();

      // Parse the response
      setResults({
        terraformCode: data.terraform_code || formatTerraformCode(data),
        securityReport: {
          issues: data.security?.issues || [],
        },
        costEstimate: {
          monthly: data.cost?.monthly || 0,
          annual: (data.cost?.monthly || 0) * 12,
          resourceCount: data.resources?.length || 0,
          breakdown: data.cost?.breakdown || {},
          recommendations: data.cost?.recommendations || [],
        },
        fullResponse: data, // Store full response for file tree
      });

      setCurrentStep(GENERATION_STEPS.length - 1);
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation');
      setCurrentStep(-1);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTerraformCode = (data: any): string => {
    // Format the response data into a readable Terraform code string
    if (typeof data === 'string') return data;
    if (data.terraform_code) return data.terraform_code;
    return JSON.stringify(data, null, 2);
  };

  const handleReset = () => {
    setCurrentStep(-1);
    setResults(null);
    setError(null);
    setIsGenerating(false);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            AI-Powered Infrastructure as Code Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transform your architecture diagrams into production-ready Terraform code for AWS, Azure, and GCP.
            Get instant security scanning and cost estimates.
          </p>
        </div>

        {/* Cloud Provider Selection */}
        <div className="card">
          <CloudProviderSelector
            selected={cloudProvider}
            onSelect={setCloudProvider}
          />
        </div>

        {/* Upload Section */}
        {!isGenerating && !results && (
          <div className="card">
            <DiagramUpload onUpload={handleUpload} disabled={isGenerating} />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Generation Failed</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={handleReset}
                className="mt-4 btn-primary bg-red-600 hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Progress Tracker */}
        {isGenerating && currentStep >= 0 && (
          <ProgressTracker currentStep={currentStep} steps={GENERATION_STEPS} />
        )}

        {/* Success Message */}
        {results && currentStep === GENERATION_STEPS.length - 1 && (
          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg flex items-start space-x-4">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900">Infrastructure Code Generated Successfully!</h3>
              <p className="text-green-700 mt-1">
                Your Terraform code is ready. Review the security report and cost estimates below.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="btn-secondary"
            >
              Generate New
            </button>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <ResultsDisplay
            terraformCode={results.terraformCode}
            securityReport={results.securityReport}
            costEstimate={results.costEstimate}
            fullResponse={results.fullResponse}
          />
        )}

        {/* Features Section */}
        {!isGenerating && !results && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="card text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Generation</h3>
              <p className="text-sm text-gray-600">
                Convert architecture diagrams to Terraform code in seconds using AI vision technology
              </p>
            </div>

            <div className="card text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Security First</h3>
              <p className="text-sm text-gray-600">
                Automatic security scanning with Checkov to ensure best practices and compliance
              </p>
            </div>

            <div className="card text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost Optimization</h3>
              <p className="text-sm text-gray-600">
                Get instant cost estimates and FinOps recommendations to optimize your cloud spending
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
