export default function TestComponent() {
  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
      <div className="flex-shrink-0">
        <div className="h-12 w-12 bg-blue-500 rounded-full"></div>
      </div>
      <div>
        <div className="text-xl font-medium text-black">Tailwind CSS Test</div>
        <p className="text-gray-500">If you can see this styled component, Tailwind CSS is working!</p>
      </div>
    </div>
  );
}