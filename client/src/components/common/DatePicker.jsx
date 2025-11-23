import React, { useState, useRef, useEffect } from 'react';

const DatePicker = ({ value, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [displayMonth, setDisplayMonth] = useState(value.month);
    const [displayYear, setDisplayYear] = useState(value.year);
    const dropdownRef = useRef(null);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const getDaysInMonth = (year, month) => {
        return new Date(year, month, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month - 1, 1).getDay();
    };

    const handlePrevMonth = () => {
        if (displayMonth === 1) {
            setDisplayMonth(12);
            setDisplayYear(displayYear - 1);
        } else {
            setDisplayMonth(displayMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (displayMonth === 12) {
            setDisplayMonth(1);
            setDisplayYear(displayYear + 1);
        } else {
            setDisplayMonth(displayMonth + 1);
        }
    };

    const handleDayClick = (day) => {
        onChange({ year: displayYear, month: displayMonth, day });
        setIsOpen(false);
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(displayYear, displayMonth);
        const firstDay = getFirstDayOfMonth(displayYear, displayMonth);
        const daysInPrevMonth = getDaysInMonth(displayYear, displayMonth - 1);
        
        const days = [];
        
        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push(
                <button
                    key={`prev-${i}`}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 text-xs hover:bg-slate-800/50 rounded-lg transition-colors"
                    disabled
                >
                    {daysInPrevMonth - i}
                </button>
            );
        }
        
        // Current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const isSelected = displayYear === value.year && displayMonth === value.month && day === value.day;
            const isToday = displayYear === new Date().getFullYear() && 
                           displayMonth === new Date().getMonth() + 1 && 
                           day === new Date().getDate();
            
            days.push(
                <button
                    key={`current-${day}`}
                    onClick={() => handleDayClick(day)}
                    className={`w-8 h-8 flex items-center justify-center text-xs rounded-lg font-medium transition-all ${
                        isSelected
                            ? 'bg-linear-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                            : isToday
                            ? 'border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10'
                            : 'text-slate-200 hover:bg-slate-800 hover:scale-105'
                    }`}
                >
                    {day}
                </button>
            );
        }
        
        // Next month's days to fill grid
        const remainingDays = 42 - days.length;
        for (let day = 1; day <= remainingDays; day++) {
            days.push(
                <button
                    key={`next-${day}`}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 text-xs hover:bg-slate-800/50 rounded-lg transition-colors"
                    disabled
                >
                    {day}
                </button>
            );
        }
        
        return days;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {label}
            </label>
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white text-left flex items-center justify-between hover:bg-slate-800/80"
            >
                <span>{`${monthNames[value.month - 1]} ${value.year}`}</span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 min-w-60 max-w-60">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-white">
                            {monthNames[displayMonth - 1]} {displayYear}
                        </h3>
                        <div className="flex gap-1.5">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Days of Week */}
                    <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                        {daysOfWeek.map((day) => (
                            <div key={day} className="w-8 h-6 flex items-center justify-center text-slate-500 text-xs font-semibold">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-0.5">
                        {renderCalendar()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;
