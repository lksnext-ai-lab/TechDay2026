export const API_BASE_URL = 'http://localhost:8001/api/sat';

export const satService = {
    getMachines: async () => {
        const response = await fetch(`${API_BASE_URL}/machines`);
        if (!response.ok) throw new Error('Failed to fetch machines');
        return response.json();
    },

    createMachine: async (machineData) => {
        const response = await fetch(`${API_BASE_URL}/machines`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(machineData),
        });
        if (!response.ok) throw new Error('Failed to create machine');
        return response.json();
    },

    updateMachine: async (id, machineData) => {
        const response = await fetch(`${API_BASE_URL}/machines/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(machineData),
        });
        if (!response.ok) throw new Error('Failed to update machine');
        return response.json();
    },

    deleteMachine: async (id) => {
        const response = await fetch(`${API_BASE_URL}/machines/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete machine');
        return response.json();
    },

    getMachineDocuments: async (id) => {
        const response = await fetch(`${API_BASE_URL}/machines/${id}/documents`);
        if (!response.ok) throw new Error('Failed to fetch documents');
        return response.json();
    },

    uploadMachineDocument: async (id, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_BASE_URL}/machines/${id}/documents`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload document');
        return response.json();
    },

    deleteMachineDocument: async (id, filename, appId, siloId) => {
        let url = `${API_BASE_URL}/machines/${id}/documents/${filename}`;
        const params = new URLSearchParams();
        if (appId) params.append('app_id', appId);
        if (siloId) params.append('silo_id', siloId);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete document');
        return response.json();
    },

    indexMachineDocument: async (id, filename, appId, siloId) => {
        let url = `${API_BASE_URL}/machines/${id}/documents/${filename}/index`;
        const params = new URLSearchParams();
        if (appId) params.append('app_id', appId);
        if (siloId) params.append('silo_id', siloId);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to index document');
        return response.json();
    },

    getIncidents: async () => {
        const response = await fetch(`${API_BASE_URL}/incidents`);
        if (!response.ok) throw new Error('Failed to fetch incidents');
        return response.json();
    },

    createIncident: async (incidentData) => {
        const response = await fetch(`${API_BASE_URL}/incidents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incidentData),
        });
        if (!response.ok) throw new Error('Failed to create incident');
        return response.json();
    },

    updateIncident: async (id, updates, appId = null, siloId = null) => {
        let url = `${API_BASE_URL}/incidents/${id}`;
        const params = new URLSearchParams();
        if (appId) params.append('app_id', appId);
        if (siloId) params.append('silo_id', siloId);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Failed to update incident');
        return response.json();
    },

    deleteIncident: async (id, appId = null, siloId = null) => {
        let url = `${API_BASE_URL}/incidents/${id}`;
        const params = new URLSearchParams();
        if (appId) params.append('app_id', appId);
        if (siloId) params.append('silo_id', siloId);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete incident');
        return response.json();
    },

    addLog: async (incidentId, logData) => {
        const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData),
        });
        if (!response.ok) throw new Error('Failed to add log');
        return response.json();
    },

    getSimilarIncidents: async (incidentId, appId = null, siloId = null) => {
        let url = `${API_BASE_URL}/incidents/${incidentId}/similar`;
        const params = new URLSearchParams();
        if (appId) params.append('app_id', appId);
        if (siloId) params.append('silo_id', siloId);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch similar incidents');
        return response.json();
    },

    getKnowledgeBase: async (incidentId, appId = null, siloId = null) => {
        let url = `${API_BASE_URL}/incidents/${incidentId}/knowledge`;
        const params = new URLSearchParams();
        if (appId) params.append('app_id', appId);
        if (siloId) params.append('silo_id', siloId);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch knowledge base');
        return response.json();
    }
};
