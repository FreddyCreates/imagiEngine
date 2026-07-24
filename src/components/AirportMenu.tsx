import React from 'react';

type AirportMenuProps = {
    isOpen: boolean;
    onClose: () => void;
    onTeleport: (pos: [number, number, number]) => void;
};

export function AirportMenu({ isOpen, onClose, onTeleport }: AirportMenuProps) {
    if (!isOpen) return null;

    const locations = [
        { name: 'Runway Start', pos: [0, 2, -50] as [number, number, number] },
        { name: 'Runway End', pos: [0, 2, 50] as [number, number, number] },
        { name: 'Hangar A', pos: [40, 2, 0] as [number, number, number] },
        { name: 'Hangar B', pos: [-40, 2, 0] as [number, number, number] },
    ];

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 text-white">
            <div className="p-8 bg-gray-900 rounded-lg shadow-xl w-96">
                <h2 className="mb-4 text-2xl font-bold">Airport Map</h2>
                <div className="bg-gray-800 p-4 rounded mb-6 h-48 flex items-center justify-center border border-gray-600">
                    <p className="text-gray-400">Map Visualization</p>
                </div>
                <ul className="space-y-2">
                    {locations.map((loc, index) => (
                        <li 
                            key={index} 
                            onClick={() => { onTeleport(loc.pos); onClose(); }}
                            className="p-3 rounded cursor-pointer bg-gray-700 hover:bg-orange-600 transition"
                        >
                            {loc.name}
                        </li>
                    ))}
                </ul>
                <button 
                    onClick={onClose}
                    className="w-full py-2 mt-6 font-bold bg-gray-600 rounded hover:bg-gray-700"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
