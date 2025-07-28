const InfoCard = ({ title, value, subValue, className = '' }) => (
    <div className={`bg-white p-5 rounded-lg border border-gray-200 ${className}`}>
        <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
        <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
        {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
    </div>
);
export default InfoCard;