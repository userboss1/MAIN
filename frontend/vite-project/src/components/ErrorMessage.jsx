const ErrorMessage = ({ message, onRetry }) => (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm" role="alert">
        <p className="font-bold">An Error Occurred</p>
        <p className="text-sm">{message}</p>
        {onRetry && (
            <button onClick={onRetry} className="mt-2 bg-red-500 text-white font-bold py-1 px-3 rounded hover:bg-red-700 transition-colors">
                Retry
            </button>
        )}
    </div>
);
export default ErrorMessage;