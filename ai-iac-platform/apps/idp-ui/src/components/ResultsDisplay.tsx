import { useState } from 'react';
import { Code, Shield, DollarSign, Download, Copy, Check, FolderTree, FileCode } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import FileTree from './FileTree';
import { buildTerraformFileTree, downloadFile, downloadAllFiles } from '../utils/fileTreeBuilder';

interface ResultsDisplayProps {
  terraformCode: string;
  securityReport: any;
  costEstimate: any;
  fullResponse?: any;
}

export default function ResultsDisplay({ terraformCode, securityReport, costEstimate, fullResponse }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<'structure' | 'code' | 'security' | 'cost'>('structure');
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ content: string; name: string } | null>(null);

  const tabs = [
    { id: 'structure', name: 'File Structure', icon: FolderTree },
    { id: 'code', name: 'main.tf', icon: FileCode },
    { id: 'security', name: 'Security Report', icon: Shield },
    { id: 'cost', name: 'Cost Estimate', icon: DollarSign },
  ];

  const fileTree = buildTerraformFileTree(fullResponse || { terraform_code: terraformCode });

  const handleCopy = () => {
    navigator.clipboard.writeText(terraformCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadFile(terraformCode, 'main.tf');
  };

  const handleDownloadAll = () => {
    downloadAllFiles(fileTree);
  };

  const handleFileClick = (content: string, fileName: string) => {
    setSelectedFile({ content, name: fileName });
  };

  return (
    <div className="card">
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'structure' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Terraform Project Structure</h4>
            <button
              onClick={handleDownloadAll}
              className="btn-primary flex items-center space-x-2 text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Download All Files</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* File Tree */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Project Files</h5>
              <FileTree node={fileTree} onFileClick={handleFileClick} />
            </div>

            {/* File Preview */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                {selectedFile ? `Preview: ${selectedFile.name}` : 'Select a file to preview'}
              </h5>
              {selectedFile ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <SyntaxHighlighter
                    language="hcl"
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      fontSize: '13px',
                      maxHeight: '500px',
                    }}
                    showLineNumbers
                  >
                    {selectedFile.content}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-8 text-center bg-gray-50">
                  <FolderTree className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Click on a file to view its content</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 mb-2">📁 Modular Terraform Structure</h5>
            <p className="text-sm text-blue-800">
              Your infrastructure code is organized into modules following Terraform best practices.
              Each module is self-contained with its own variables, outputs, and resources.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'code' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-gray-900">Generated Terraform Code</h4>
            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                className="btn-secondary flex items-center space-x-2 text-sm"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="btn-primary flex items-center space-x-2 text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border border-gray-300">
            <SyntaxHighlighter
              language="hcl"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                fontSize: '14px',
              }}
              showLineNumbers
            >
              {terraformCode || '# No code generated yet'}
            </SyntaxHighlighter>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Security Scan Results</h4>

          {securityReport?.issues?.length > 0 ? (
            <div className="space-y-3">
              {securityReport.issues.map((issue: any, index: number) => (
                <div
                  key={index}
                  className={`
                    p-4 rounded-lg border-l-4
                    ${issue.severity === 'high' ? 'bg-red-50 border-red-500' :
                      issue.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                      'bg-blue-50 border-blue-500'}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{issue.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                      <p className="text-xs text-gray-500 mt-2">Resource: {issue.resource}</p>
                    </div>
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                        issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'}
                    `}>
                      {issue.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-green-50 rounded-lg border border-green-200">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <p className="text-lg font-medium text-green-900">No Security Issues Found</p>
              <p className="text-sm text-green-600 mt-1">Your infrastructure code passes all security checks</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'cost' && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Cost Estimation</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Monthly Cost</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                ${costEstimate?.monthly || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-medium">Annual Cost</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                ${costEstimate?.annual || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600 font-medium">Resources</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {costEstimate?.resourceCount || 0}
              </p>
            </div>
          </div>

          {costEstimate?.breakdown && (
            <div className="mt-6">
              <h5 className="font-semibold text-gray-900 mb-3">Cost Breakdown</h5>
              <div className="space-y-2">
                {Object.entries(costEstimate.breakdown).map(([resource, cost]) => (
                  <div key={resource} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{resource}</span>
                    <span className="text-sm font-semibold text-gray-900">${cost as number}/month</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {costEstimate?.recommendations && costEstimate.recommendations.length > 0 && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-semibold text-yellow-900 mb-2">Cost Optimization Recommendations</h5>
              <ul className="space-y-2">
                {costEstimate.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-yellow-800 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
