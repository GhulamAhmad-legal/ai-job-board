'use client';

export default function PostJob() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Hire Top AI Talent</h1>
        <p className="mt-4 text-lg text-gray-600">
          Reach thousands of specialized AI engineers, researchers, and developers. Jobs remain active for 30 days.
        </p>
      </div>

      <form className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl p-8 space-y-8">
        
        {/* Job Details Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-6">1. Job Details</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Title</label>
              <input type="text" placeholder="e.g. Senior Prompt Engineer" className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none" required />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Location / Remote</label>
                <input type="text" placeholder="e.g. Remote, US Only" className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Application URL</label>
                <input type="url" placeholder="https://yourcompany.com/careers" className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Job Description</label>
              <textarea rows={6} placeholder="Describe the role, requirements, and benefits..." className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none" required />
            </div>
          </div>
        </div>

        {/* Company Details Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-6">2. Company Details</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input type="text" placeholder="e.g. OpenAI" className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none" required />
            </div>
          </div>
        </div>

        <button type="button" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-150">
          Continue to Payment ($299)
        </button>
      </form>
    </main>
  );
}