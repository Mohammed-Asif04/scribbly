export default function Home() {
  return (
    <main className="min-h-screen bg-scribble bg-cover bg-center flex flex-col items-center justify-center p-4">
      <div className="bg-blue-800 bg-opacity-70 p-8 rounded-lg shadow-lg max-w-md w-full text-center font-comic">
        <h1 className="text-4xl font-bold text-white mb-6">skribl.io</h1>

        <input
          type="text"
          placeholder="Enter your name"
          className="w-full p-3 rounded mb-4 text-lg"
        />

        <select className="w-full p-3 rounded mb-6 text-lg">
          <option>English</option>
          <option>Spanish</option>
        </select>

        <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded mb-3">
          Play!
        </button>

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded">
          Create Private Room
        </button>
      </div>
    </main>
  )
}