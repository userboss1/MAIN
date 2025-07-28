const Spinner = () => (
    <div className="flex justify-center items-center py-10">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" role="status">
            <span className="sr-only">Loading...</span>
        </div>
    </div>
);
export default Spinner;