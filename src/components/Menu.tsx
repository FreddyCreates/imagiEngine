import React, { useState, useEffect } from 'react';

type Weapon = { id: number; name: string; type: string; damage: number; ammo: number };
type MenuProps = {
    isOpen: boolean;
    onClose: () => void;
};

export function Menu({ isOpen, onClose }: MenuProps) {
    const [weapons, setWeapons] = useState<Weapon[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        fetch('/api/weapons')
            .then(res => res.json())
            .then(setWeapons);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') setSelectedIndex(prev => Math.max(0, prev - 1));
            if (e.key === 'ArrowDown') setSelectedIndex(prev => Math.min(weapons.length - 1, prev + 1));
            if (e.key === 'Enter') {
                console.log('Selected:', weapons[selectedIndex]);
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, weapons, onClose]);

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 text-white">
            <div className="p-8 bg-gray-900 rounded-lg shadow-xl w-96">
                <h2 className="mb-4 text-2xl font-bold">Weapon Select</h2>
                <ul className="space-y-2">
                    {weapons.map((weapon, index) => (
                        <li 
                            key={weapon.id} 
                            className={`p-2 rounded cursor-pointer ${selectedIndex === index ? 'bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            {weapon.name} - {weapon.damage} DMG
                        </li>
                    ))}
                </ul>
                <button 
                    onClick={onClose}
                    className="w-full py-2 mt-6 font-bold bg-gray-600 rounded hover:bg-gray-700"
                >
                    Close (Enter)
                </button>
            </div>
        </div>
    );
}
