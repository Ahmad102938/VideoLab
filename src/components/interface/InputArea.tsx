// components/InputArea.tsx
export default function InputArea() {
  return (
    <div className="mt-8">
      <textarea
        placeholder="Ask whatever you want..."
        className="w-full p-4 border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-500"
      />
      <div className="flex items-center space-x-2 mt-2">
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">📎</button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">🖼</button>
        <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
          Send
        </button>
      </div>
    </div>
  );
}