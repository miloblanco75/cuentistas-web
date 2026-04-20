"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function PulseTooltips({ type, targetId, text, delay = 1000 }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const showTimeout = setTimeout(() => setVisible(true), delay);
        const hideTimeout = setTimeout(() => setVisible(false), delay + 4000);
        return () => {
            clearTimeout(showTimeout);
            clearTimeout(hideTimeout);
        };
    }, [delay]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute z-[400] flex flex-col items-center pointer-events-none"
                    style={{
                        top: '50px', // Adjusted via target logic if needed, but fixed for now based on UI
                        right: type === 'tinta' ? '20%' : 'auto',
                        left: type === 'nivel' ? '20%' : 'auto'
                    }}
                >
                    <div className="bg-gold/90 text-black text-[9px] font-black tracking-widest uppercase px-4 py-2 rounded-sm shadow-2xl relative">
                        {text}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gold/90"></div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
