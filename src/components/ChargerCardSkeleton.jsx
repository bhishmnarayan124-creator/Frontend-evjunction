const ChargerCardSkeleton = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
        <div className="flex justify-between items-start mb-2">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded-full w-24"></div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-5 bg-gray-200 rounded"></div>
        <div className="h-5 bg-gray-200 rounded"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="h-10 bg-gray-200 rounded-lg"></div>
    </div>
  );
};

export default ChargerCardSkeleton;