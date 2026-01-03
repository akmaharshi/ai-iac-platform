import { Check, Loader2 } from 'lucide-react';

interface Step {
  id: string;
  name: string;
  description: string;
}

interface ProgressTrackerProps {
  currentStep: number;
  steps: Step[];
}

export default function ProgressTracker({ currentStep, steps }: ProgressTrackerProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Generation Progress</h3>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div key={step.id} className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {isCompleted && (
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                )}
                {isCurrent && (
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </div>
                )}
                {isPending && (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">{index + 1}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`
                  text-sm font-medium
                  ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}
                `}>
                  {step.name}
                </p>
                <p className={`
                  text-xs mt-1
                  ${isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'}
                `}>
                  {step.description}
                </p>
                {isCurrent && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-primary-600 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                )}
              </div>

              {index < steps.length - 1 && (
                <div className={`
                  absolute left-5 top-14 w-0.5 h-12 ml-px
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                `} style={{ marginTop: '2.5rem' }}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
