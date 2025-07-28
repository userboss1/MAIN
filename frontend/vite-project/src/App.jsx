import React, { useState, useEffect, useCallback } from 'react';
// Make sure to run `npm install recharts lucide-react`
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, X, Loader2, CheckCircle, AlertTriangle, TrendingUp, Users, Target, Briefcase, UserPlus } from 'lucide-react';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000/api/pool';

// ============================================================================
//  HELPER & UI COMPONENTS (Self-contained & Redesigned)
// ============================================================================

const Spinner = () => <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />;

const Toast = ({ message, type, onDismiss }) => {
    const Icon = type === 'success' ? CheckCircle : AlertTriangle;
    const colors = type === 'success' ? 'bg-green-600' : 'bg-red-600';

    useEffect(() => {
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className={`fixed bottom-5 right-5 text-white p-4 rounded-lg shadow-2xl flex items-center z-[100] animate-fade-in-up ${colors}`}>
            <Icon size={24} className="mr-3" />
            <span className="font-semibold">{message}</span>
        </div>
    );
};

// --- IMPROVED MODAL with size prop ---
const Modal = ({ children, isOpen, onClose, title, size = 'lg' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '4xl': 'max-w-4xl',
        '6xl': 'max-w-6xl',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 rounded-full p-1 hover:bg-gray-100 hover:text-gray-700 transition-all"><X size={20} /></button>
                </header>
                <div className="p-6 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, subValue, color }) => {
    const Icon = icon;
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
            </div>
        </div>
    );
}

const FundingProgressBar = ({ percentage }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-600">Funding Progress</span>
            <span className="text-sm font-bold text-indigo-600">{percentage.toFixed(2)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
        </div>
    </div>
);

const InvestmentPieChart = ({ data }) => {
    const COLORS = ['#4338CA', '#16A34A', '#D1D5DB']; // Indigo, Green, Gray
    return (
        <div className="w-full h-72">
            <ResponsiveContainer>
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={85} fill="#8884d8" paddingAngle={5} dataKey="value" nameKey="name">
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)} />
                    <Legend iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};


// ============================================================================
//  CUSTOM HOOKS (Self-contained)
// ============================================================================

const useApi = () => {
    const [loading, setLoading] = useState(false);
    const post = async (url, body) => {
        setLoading(true);
        try {
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ error: 'An unknown error occurred.' }));
                throw new Error(errorBody.error);
            }
            return await response.json();
        } finally {
            setLoading(false);
        }
    };
    return { post, loading };
};

const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            if (result.success) setData(result);
            else throw new Error(result.error);
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    }, [url]);
    useEffect(() => { fetchData(); }, [fetchData]);
    return { data, loading, error, retry: fetchData };
};


// ============================================================================
//  FORM & VIEW COMPONENTS (Self-contained & Redesigned)
// ============================================================================

const FormInput = ({ label, name, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input name={name} id={name} {...props} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
    </div>
);

const FormButton = ({ isLoading, children }) => (
    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed">
        {isLoading ? <Spinner /> : children}
    </button>
);

const CreatePoolForm = ({ onComplete, showToast }) => {
    const { post, loading } = useApi();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await post(`${API_BASE_URL}/create`, {
                name: formData.get('name'),
                totalAmount: Number(formData.get('totalAmount')),
                adminShare: Number(formData.get('adminShare')) || 0,
            });
            showToast('Pool created successfully!', 'success');
            onComplete();
        } catch (err) { showToast(err.message || 'Failed to create pool.', 'error'); }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput label="Pool Name" name="name" type="text" required />
            <FormInput label="Total Funding Goal ($)" name="totalAmount" type="number" required />
            <FormInput label="Admin's Initial Share ($) (Optional)" name="adminShare" type="number" />
            <FormButton isLoading={loading}>Create Pool</FormButton>
        </form>
    );
};

const AddPersonForm = ({ poolId, onComplete, showToast }) => {
    const { post, loading } = useApi();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await post(`${API_BASE_URL}/add-person`, {
                poolId,
                personName: formData.get('personName'),
                amount: Number(formData.get('amount')),
            });
            showToast('Investor added successfully!', 'success');
            onComplete();
        } catch (err) { showToast(err.message || 'Failed to add investor.', 'error'); }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput label="Investor Name" name="personName" type="text" required />
            <FormInput label="Amount to Invest ($)" name="amount" type="number" required />
            <FormButton isLoading={loading}>Add Investor</FormButton>
        </form>
    );
};

const AddAdminSharesForm = ({ poolId, onComplete, showToast }) => {
    const { post, loading } = useApi();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const extraAmount = Number(formData.get('extraAmount'));
        if (extraAmount <= 0) {
            showToast('Please enter a positive amount.', 'error');
            return;
        }
        try {
            await post(`${API_BASE_URL}/admin/add-shares`, { poolId, extraAmount });
            showToast('Admin shares added successfully!', 'success');
            onComplete();
        } catch (err) {
            showToast(err.message || 'Failed to add shares.', 'error');
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput label="Amount to Add to Admin Share ($)" name="extraAmount" type="number" required />
            <FormButton isLoading={loading}>Add Shares</FormButton>
        </form>
    );
};

// ============================================================================
//  FIXED & IMPROVED PoolDetailView COMPONENT
// ============================================================================
const PoolDetailView = ({ poolId, onDataUpdate, showToast }) => {
    const { data, loading, error, retry } = useFetch(`${API_BASE_URL}/${poolId}/summary`);
    const [isAddPersonModalOpen, setAddPersonModalOpen] = useState(false);
    const [isAddSharesModalOpen, setAddSharesModalOpen] = useState(false);

    if (loading) return <div className="flex justify-center items-center h-96"><Spinner /></div>;
    if (error) return <ErrorMessage message={error} onRetry={retry} />;
    if (!data) return null;

    const { summary } = data;
    const { poolDetails, investmentStatus, adminContribution, investors } = summary;
    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    const fundingPercentage = poolDetails.totalAmount > 0 ? (investmentStatus.totalInvestment / poolDetails.totalAmount) * 100 : 0;
    const pieChartData = [
        { name: 'Admin', value: adminContribution.amount },
        { name: 'Investors', value: investmentStatus.totalInvestment - adminContribution.amount },
        { name: 'Unfunded', value: Math.max(0, investmentStatus.remainingAmount) }
    ];

    return (
        <div className="p-1">
            <Modal isOpen={isAddPersonModalOpen} onClose={() => setAddPersonModalOpen(false)} title="Add New Investor">
                <AddPersonForm poolId={poolId} onComplete={() => { setAddPersonModalOpen(false); retry(); onDataUpdate(); }} showToast={showToast} />
            </Modal>
            <Modal isOpen={isAddSharesModalOpen} onClose={() => setAddSharesModalOpen(false)} title="Add Admin Shares">
                <AddAdminSharesForm poolId={poolId} onComplete={() => { setAddSharesModalOpen(false); retry(); onDataUpdate(); }} showToast={showToast} />
            </Modal>

            <header className="flex flex-wrap justify-between items-start mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{poolDetails.name}</h1>
                    <p className="text-sm text-gray-500 mt-1">Created on: {new Date(poolDetails.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-x-2 flex-shrink-0">
                    <button onClick={() => setAddSharesModalOpen(true)} className="flex items-center gap-2 py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        <Briefcase size={16} /> Add Admin Shares
                    </button>
                    <button onClick={() => setAddPersonModalOpen(true)} className="flex items-center gap-2 py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                        <Plus size={16} /> Add Investor
                    </button>
                </div>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Funding Overview</h3>
                        <FundingProgressBar percentage={fundingPercentage} />
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Participants ({investors.length + 1})</h3>
                        <div className="overflow-y-auto max-h-96">
                            <table className="min-w-full">
                                <thead className="sticky top-0 bg-white/70 backdrop-blur-sm">
                                    <tr>
                                        <th className="py-3 pr-3 text-left text-sm font-semibold text-gray-600">Name</th>
                                        <th className="py-3 px-3 text-left text-sm font-semibold text-gray-600">Amount</th>
                                        <th className="py-3 pl-3 text-right text-sm font-semibold text-gray-600">Share %</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <tr className="bg-indigo-50 hover:bg-indigo-100 transition-colors">
                                        <td className="py-3 pr-3 font-bold text-indigo-800 flex items-center gap-2"><Briefcase size={14} /> Admin</td>
                                        <td className="py-3 px-3 font-bold text-indigo-800">{formatCurrency(adminContribution.amount)}</td>
                                        <td className="py-3 pl-3 text-right font-bold text-indigo-800">{adminContribution.sharePercentage}%</td>
                                    </tr>
                                    {investors.length > 0 ? investors.map(i => (
                                        <tr key={i._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 pr-3 font-medium text-gray-800">{i.personName}</td>
                                            <td className="py-3 px-3 text-gray-600">{formatCurrency(i.amount)}</td>
                                            <td className="py-3 pl-3 text-right text-sm text-indigo-600 font-semibold">{i.sharePercentage}%</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="text-center py-10 text-gray-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <UserPlus size={24} className="text-gray-400" />
                                                    <span>No other investors yet.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Investment Distribution</h3>
                        <InvestmentPieChart data={pieChartData} />
                    </div>
                    <div className="space-y-4">
                        <StatCard icon={Target} title="Funding Goal" value={formatCurrency(poolDetails.totalAmount)} color="blue" />
                        <StatCard icon={TrendingUp} title="Admin Contribution" value={formatCurrency(adminContribution.amount)} subValue={`${adminContribution.sharePercentage}% of total`} color="purple" />
                        <StatCard icon={Users} title="Total Investors" value={investors.length} color="green" />
                    </div>
                </div>
            </div>
        </div>
    );
};


// ============================================================================
//  MAIN APP COMPONENT (The only default export)
// ============================================================================

export default function App() {
    const [viewingPoolId, setViewingPoolId] = useState(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [dataVersion, setDataVersion] = useState(0);
    const { data, loading, error, retry } = useFetch(`${API_BASE_URL}?v=${dataVersion}`);

    const showToast = (message, type) => setToast({ message, type });
    const handleDataUpdate = () => setDataVersion(v => v + 1);

    const pools = data?.pools || [];
    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
            <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Investment Pool">
                <CreatePoolForm onComplete={() => { setCreateModalOpen(false); handleDataUpdate(); }} showToast={showToast} />
            </Modal>
            {/* --- Use the new '6xl' size for the details modal --- */}
            <Modal isOpen={!!viewingPoolId} onClose={() => setViewingPoolId(null)} size="6xl">
                {viewingPoolId && <PoolDetailView poolId={viewingPoolId} onDataUpdate={handleDataUpdate} showToast={showToast} />}
            </Modal>

            <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Investment Dashboard</h1>
                    <button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
                        <Plus size={18} /> Create New Pool
                    </button>
                </header>
                <main className="bg-white p-2 sm:p-4 rounded-xl border border-gray-200 shadow-sm">
                    {loading && <div className="text-center py-20"><Spinner /></div>}
                    {error && <div className="p-4"><ErrorMessage message={error} onRetry={retry} /></div>}
                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead><tr><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pool Name</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Funding Goal</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Created</th><th className="relative px-6 py-3"><span className="sr-only">Details</span></th></tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pools.length > 0 ? pools.map((pool) => (
                                        <tr key={pool._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-gray-900">{pool.name}</td>
                                            <td className="px-6 py-4 text-gray-600">{formatCurrency(pool.totalAmount)}</td>
                                            <td className="px-6 py-4 text-gray-600">{new Date(pool.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right"><button onClick={() => setViewingPoolId(pool._id)} className="font-semibold text-indigo-600 hover:text-indigo-800">Details</button></td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center py-16 text-gray-500">No pools found. Click 'Create New Pool' to get started.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
