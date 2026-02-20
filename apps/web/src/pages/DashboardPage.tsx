import { Link } from 'react-router-dom';

export function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Create and manage BPMN 2.0 process maps for your consulting engagements.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          to="/templates"
          className="bg-white border border-gray-200 rounded-lg p-5 hover:border-brand-300 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">Start from Template</h3>
          <p className="text-sm text-gray-500 mt-1">
            Choose from pre-built process templates and customize with your client's details.
          </p>
        </Link>

        <Link
          to="/editor"
          className="bg-white border border-gray-200 rounded-lg p-5 hover:border-brand-300 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">Blank Canvas</h3>
          <p className="text-sm text-gray-500 mt-1">
            Start with an empty BPMN canvas and build your process map from scratch.
          </p>
        </Link>

        <div className="bg-white border border-gray-200 rounded-lg p-5 opacity-60">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">Import BPMN File</h3>
          <p className="text-sm text-gray-500 mt-1">
            Upload an existing .bpmn file to view and edit in the visual editor.
          </p>
        </div>
      </div>

      {/* Recent process maps — populated from API */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Process Maps</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-400 text-sm">
            No process maps yet. Start by selecting a template or creating a blank canvas.
          </p>
        </div>
      </div>
    </div>
  );
}
