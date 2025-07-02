import { Trophy, Crown, Zap, Target, AlertCircle } from "lucide-react";

export default function GameResults({
  isComplete,
  position,
  cpm,
  accuracy,
  errors,
}) {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-8 text-center mb-6">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <Trophy className="h-8 w-8 text-green-600" />
        <h3 className="text-3xl font-bold text-gray-900">Race Finished!</h3>
      </div>
      {isComplete && (
        <div className="flex items-center justify-center space-x-2 mb-6">
          <Crown className="h-6 w-6 text-amber-500" />
          <p className="text-xl text-gray-800">Your Position: #{position}</p>
        </div>
      )}
      <p className="text-lg text-gray-700 mb-6">
        {isComplete
          ? "Congratulations on completing the race!"
          : "Time's up! Check the leaderboard for final results."}
      </p>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <Zap className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">{cpm}</div>
          <div className="text-sm text-blue-700">Final CPM</div>
        </div>
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
          <div className="text-sm text-green-700">Accuracy</div>
        </div>
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-600">{errors}</div>
          <div className="text-sm text-red-700">Errors</div>
        </div>
      </div>
    </div>
  );
}
