import React from "react";
import RatingScaleDemo from "./ui/rating-scale-demo";
import { RatingDialog } from "@/shared/components";
import { useRatingDialog } from "@/shared/hooks";

const RatingScaleTestPage = () => {
  const { openDialog } = useRatingDialog();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Rating Scale Component Demo
          </h1>
          <p className="text-lg text-gray-600">
            Testing the new shadcn/ui rating scale component integration
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Standalone Demo */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Standalone Component</h2>
            <RatingScaleDemo />
          </div>

          {/* Integrated Dialog Demo */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Integrated Dialog</h2>
            <p className="text-gray-600 mb-4">
              Click the button below to test the rating dialog with the new rating scale component.
            </p>
            <button
              onClick={openDialog}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Rating Dialog
            </button>
          </div>
        </div>

        {/* Component Features */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Component Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Implemented Features</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 1-10 rating scale with visual indicators</li>
                <li>• Smooth hover and focus states</li>
                <li>• Accessibility support (ARIA labels)</li>
                <li>• Responsive design</li>
                <li>• Integration with existing dialog system</li>
                <li>• Auto-popup after 1 minute</li>
                <li>• Anonymous submission option</li>
                <li>• Success confirmation state</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔧 Technical Details</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Built with Radix UI primitives</li>
                <li>• Tailwind CSS for styling</li>
                <li>• shadcn/ui component structure</li>
                <li>• TypeScript-ready (converted to JSX)</li>
                <li>• Proper forwardRef implementation</li>
                <li>• Custom utility functions</li>
                <li>• API integration with feedback service</li>
                <li>• Local storage persistence</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingScaleTestPage;
