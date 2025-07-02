import { Zap, Target, AlertCircle } from "lucide-react";

export default function GameStats({ cpm, accuracy, errors }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-3 gap-6 text-center">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-center mb-2">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-4xl font-bold text-blue-600">{cpm}</div>
          <div className="text-sm text-blue-700 font-medium">CPM</div>
        </div>
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-center mb-2">
            <Target className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-4xl font-bold text-green-600">{accuracy}%</div>
          <div className="text-sm text-green-700 font-medium">Accuracy</div>
        </div>
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="flex items-center justify-center mb-2">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="text-4xl font-bold text-red-600">{errors}</div>
          <div className="text-sm text-red-700 font-medium">Errors</div>
        </div>
      </div>
    </div>
  );
}
