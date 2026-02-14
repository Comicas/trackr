'use client';

import { useState, useEffect } from 'react';
import { repo } from '@/lib/storage/repo';
import { backup } from '@/lib/storage/backup';
import { MediaItem, MediaType, MediaStatus } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export default function StorageDemo() {
    const [counts, setCounts] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [statusMsg, setStatusMsg] = useState('');

    const refreshData = async () => {
        const c = await repo.getDashboardCounts();
        setCounts(c);
        const all = await repo.getAllMediaWithEntries();
        setItems(all);
    };

    useEffect(() => {
        refreshData();
    }, []);

    const addMockItem = async (type: MediaType) => {
        const id = uuidv4();
        const item: MediaItem = {
            id,
            type,
            source: 'manual',
            title: `Mock ${type} ${Math.floor(Math.random() * 1000)}`,
            year: 2024,
        };

        await repo.upsertMediaItem(item);
        // Default status
        const status: MediaStatus = type === 'game' ? 'backlog' : 'plan';
        await repo.setEntryStatus(id, status);

        setStatusMsg(`Added ${item.title}`);
        refreshData();
    };

    const updateStatus = async (id: string, newStatus: MediaStatus) => {
        await repo.setEntryStatus(id, newStatus);
        setStatusMsg(`Updated status to ${newStatus}`);
        await refreshData();
    };

    const handleDelete = async (id: string) => {
        await repo.removeEntry(id);
        setStatusMsg(`Removed entry ${id}`);
        await refreshData();
    }

    const handleExport = async () => {
        const json = await backup.exportAll();
        console.log(json);
        alert('Exported to console (and could download file)');
    };

    const handleImport = async () => {
        const json = prompt("Paste JSON here:");
        if (json) {
            try {
                await backup.importAll(json);
                setStatusMsg("Import successful!");
                refreshData();
            } catch (e) {
                setStatusMsg("Import failed: " + e);
            }
        }
    };

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-2xl font-bold">Storage Demo</h1>

            <div className="space-x-4">
                <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => addMockItem('movie')}>Add Movie</button>
                <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={() => addMockItem('game')}>Add Game</button>
                <button className="px-4 py-2 bg-purple-500 text-white rounded" onClick={() => addMockItem('anime')}>Add Anime</button>
            </div>

            <div className="space-x-4">
                <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={handleExport}>Export JSON</button>
                <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={handleImport}>Import JSON</button>
                <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={refreshData}>Refresh</button>
            </div>

            <div className="p-4 bg-gray-100 rounded">
                <h2 className="font-bold">Dashboard Counts</h2>
                <pre>{JSON.stringify(counts, null, 2)}</pre>
            </div>

            <div className="p-4 bg-yellow-50 text-yellow-800 rounded">
                {statusMsg}
            </div>

            <div className="space-y-2">
                <h2 className="font-bold">All Items ({items.length})</h2>
                {items.map((item) => (
                    <div key={item.id} className="border p-2 flex justify-between items-center rounded bg-white shadow-sm">
                        <div>
                            <span className="font-semibold uppercase text-xs px-2 py-1 bg-gray-200 rounded mr-2">{item.type}</span>
                            <span className="font-medium mr-2">{item.title}</span>
                            <span className="text-sm text-gray-500">
                                Status: {item.entry?.status}
                            </span>
                        </div>
                        <div className="space-x-2">
                            {item.type === 'game' ? (
                                <>
                                    <button onClick={() => updateStatus(item.id, 'playing')} className="text-xs text-blue-600 underline">Playing</button>
                                    <button onClick={() => updateStatus(item.id, 'completed')} className="text-xs text-green-600 underline">Completed</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => updateStatus(item.id, 'watching')} className="text-xs text-blue-600 underline">Watching</button>
                                    <button onClick={() => updateStatus(item.id, 'completed')} className="text-xs text-green-600 underline">Completed</button>
                                </>
                            )}
                            <button onClick={() => handleDelete(item.id)} className="text-xs text-red-600 underline ml-2">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
