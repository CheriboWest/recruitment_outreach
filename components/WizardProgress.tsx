'use client';

interface WizardProgressProps {
  steps: string[];
  currentStep: number;
}

export default function WizardProgress({ steps, currentStep }: WizardProgressProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                i < currentStep
                  ? 'bg-[#10B981] text-white'
                  : i === currentStep
                  ? 'bg-[#0F172A] text-white ring-4 ring-[#0F172A]/10'
                  : 'bg-[#F1F5F9] text-[#94A3B8]'
              }`}
            >
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span
              className={`text-xs mt-1.5 font-medium hidden sm:block ${
                i === currentStep ? 'text-[#0F172A]' : 'text-[#94A3B8]'
              }`}
            >
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-[2px] w-12 sm:w-16 mx-1 mb-4 transition-all duration-300 ${
                i < currentStep ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
