import React from 'react'; // Already imported
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Already imported
import { API_BASE_URL } from '../services/api';
import useFetch from '../hooks/useFetch';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import InfoCard from '../components/InfoCard';
import InvestmentPieChart from '../components/InvestmentPieChart';

const PoolDetail = ({ poolId, onBack }) => {
    const { data, loading, error, retry } = useFetch(`${API_BASE_URL}/${poolId}/summary`);

    if (loading) return <Spinner />;
    if (error) return <ErrorMessage message={error} onRetry={retry} />;
    if (!data) return null;

    const { summary } = data;
    const { poolDetails, investmentStatus, adminContribution, investors } = summary;
    
    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    const fundingPercentage = (investmentStatus.totalInvestment / poolDetails.totalAmount) * 100;

    const pieChartData = [
        { name: 'Admin', value: adminContribution.amount },
        { name: 'Investors', value: investmentStatus.totalInvestment - adminContribution.amount },
    ];

    return (
        <div className="w-full max-w-6xl mx-auto">
            <button onClick={onBack} className="mb-6 text-indigo-600 hover:text-indigo-900 font-semibold">&larr; Back to All Pools</button>
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-800">{poolDetails.name}</h1>
                <p className="text-gray-500 mb-8">Created on: {new Date(poolDetails.createdAt).toLocaleDateString()}</p>
                <div className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Funding Status</h2>
                    <div className="w-full bg-gray-200 rounded-full h-4"><div className="bg-green-500 h-4 rounded-full" style={{ width: `${fundingPercentage}%` }}></div></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                        <InfoCard title="Total Raised" value={formatCurrency(investmentStatus.totalInvestment)} subValue={`${fundingPercentage.toFixed(2)}% Funded`} />
                        <InfoCard title="Funding Goal" value={formatCurrency(poolDetails.totalAmount)} />
                        <InfoCard title="Amount Remaining" value={formatCurrency(investmentStatus.remainingAmount)} className={investmentStatus.isFunded ? 'bg-green-50' : 'bg-orange-50'}/>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg border">
                         <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Investment Distribution</h2>
                         <InvestmentPieChart data={pieChartData} />
                    </div>
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Participants ({summary.investorCount + 1})</h2>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Invested</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share %</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr className="bg-indigo-50"><td className="px-6 py-4 text-sm font-bold text-indigo-800">Admin</td><td className="px-6 py-4 text-sm font-bold text-indigo-800">{formatCurrency(adminContribution.amount)}</td><td className="px-6 py-4 text-sm font-bold text-indigo-800">{adminContribution.sharePercentage}%</td></tr>
                                    {investors.map(investor => (
                                        <tr key={investor._id}><td className="px-6 py-4 text-sm font-medium text-gray-900">{investor.personName}</td><td className="px-6 py-4 text-sm text-gray-700">{formatCurrency(investor.amount)}</td><td className="px-6 py-4 text-sm text-gray-700">{investor.sharePercentage}%</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PoolDetail