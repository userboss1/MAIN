
import React from 'react'; // Already imported at the top
import { API_BASE_URL } from '../services/api';
import useFetch from '../hooks/useFetch';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
const PoolsList = ({ onViewDetails }) => {
    const { data, loading, error, retry } = useFetch(API_BASE_URL);

    if (loading) return <Spinner />;
    if (error) return <ErrorMessage message={error} onRetry={retry} />;
    
    const pools = data?.pools || [];
    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 w-full max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Investment Pools</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pool Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Details</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pools.length > 0 ? pools.map((pool) => (
                            <tr key={pool._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pool.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(pool.totalAmount)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(pool.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onViewDetails(pool._id)} className="text-indigo-600 hover:text-indigo-900 font-semibold">View Details</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="text-center py-10 text-gray-500">No pools found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default PoolsList