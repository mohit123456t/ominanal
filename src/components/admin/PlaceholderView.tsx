'use client';

const PlaceholderView = ({ name, onNavigate, onViewBrand }: { name: string; onNavigate?: (view: string) => void; onViewBrand?: (brandId: string) => void; }) => (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-12 text-center">
        <h2 className="text-2xl font-bold text-slate-800">{name}</h2>
        <p className="text-slate-500 mt-2">This is a placeholder for the {name} view.</p>
        {onNavigate && <button onClick={() => onNavigate('earnings')} className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded">Go to Earnings (Demo)</button>}
        {onViewBrand && <button onClick={() => onViewBrand('brand-123')} className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded">View Brand (Demo)</button>}
    </div>
);

export default PlaceholderView;
