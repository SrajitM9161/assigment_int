export default function KickedScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <span className="text-white bg-[#7765DA] px-4 py-1 rounded-full text-sm font-medium mb-6">
        ✨ Intervue Poll
      </span>
      <h1 className="text-3xl font-bold text-red-600 mb-2">You’ve been Kicked out!</h1>
      <p className="text-gray-600 max-w-md">
        Looks like the teacher has removed you from the poll system. Please try again sometime.
      </p>
      <a
        href="/"
        className="mt-6 inline-block bg-[#7765DA] hover:bg-[#4F00CE] text-white px-6 py-2 rounded font-medium"
      >
        🔁 Back to Home
      </a>
    </div>
  );
}
