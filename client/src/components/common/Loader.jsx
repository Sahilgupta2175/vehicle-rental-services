import React from "react";

const Loader = ({ message = "Loading..." }) => (
    <div className="flex justify-center items-center py-10">
        <div className="flex flex-col items-center gap-2 text-xs text-slate-400">
            <div className="w-5 h-5 border-2 border-slate-600 border-t-primary-soft rounded-full animate-spin" />
            <span>{message}</span>
        </div>
    </div>
);

export default Loader;