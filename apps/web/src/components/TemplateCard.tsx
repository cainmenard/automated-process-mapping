import { Link } from 'react-router-dom';

interface TemplateCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  payroll: 'bg-purple-50 text-purple-700',
  'accounts-payable': 'bg-green-50 text-green-700',
  'accounts-receivable': 'bg-blue-50 text-blue-700',
  'financial-close': 'bg-amber-50 text-amber-700',
  procurement: 'bg-rose-50 text-rose-700',
  'revenue-recognition': 'bg-teal-50 text-teal-700',
  inventory: 'bg-orange-50 text-orange-700',
  compliance: 'bg-red-50 text-red-700',
  general: 'bg-gray-50 text-gray-700',
};

export function TemplateCard({ id, name, description, category }: TemplateCardProps) {
  const colorClass = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.general;

  return (
    <Link
      to={`/templates/${id}`}
      className="block bg-white rounded-lg border border-gray-200 p-5 hover:border-brand-300 hover:shadow-sm transition-all"
    >
      {/* Thumbnail placeholder */}
      <div className="w-full h-40 bg-gray-50 rounded-md mb-4 flex items-center justify-center border border-gray-100">
        <svg
          className="w-16 h-16 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
          />
        </svg>
      </div>

      <span
        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${colorClass} mb-2`}
      >
        {category.replace(/-/g, ' ')}
      </span>
      <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
      <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
    </Link>
  );
}
