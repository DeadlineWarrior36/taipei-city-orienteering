'use client';

import { useApi } from '@/hooks/useApi';
import { useState } from 'react';
import type { MissionsListResponse } from '@/types/api';

export default function ExamplePage() {
  const api = useApi();
  const [missions, setMissions] = useState<MissionsListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.getMissionsList({
        lnt: 123.456,
        lat: 23.456,
      });
      setMissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch missions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Example: Fetch Missions</h1>

      <button
        onClick={fetchMissions}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 mb-4"
      >
        {loading ? 'Loading...' : 'Fetch Missions'}
      </button>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
          Error: {error}
        </div>
      )}

      {missions && (
        <div>
          <h2 className="text-xl font-bold mb-2">Missions ({missions.missions.length})</h2>
          <div className="space-y-4">
            {missions.missions.map((mission) => (
              <div key={mission.id} className="p-4 border rounded">
                <h3 className="font-bold">{mission.name}</h3>
                <p className="text-sm text-gray-600">ID: {mission.id}</p>
                <p className="text-sm text-gray-600">Locations: {mission.locations.length}</p>
                <div className="mt-2">
                  {mission.locations.map((location) => (
                    <div key={location.id} className="text-xs text-gray-500">
                      • Point {location.point}: ({location.lat}, {location.lnt})
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
