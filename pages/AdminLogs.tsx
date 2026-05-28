
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/api/system-logs');
        setLogs(res.data.logs);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      }
    };
    fetchLogs();

    const evtSource = new EventSource('/api/system-logs/stream');
    evtSource.onmessage = (event) => {
      const newLog = JSON.parse(event.data);
      setLogs(prev => [newLog, ...prev]);
    };

    return () => evtSource.close();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Operational Logs</h1>
      {logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>User Email</th>
              <th>Action</th>
              <th>Method</th>
              <th>Endpoint</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td>{log.id}</td>
                <td>{log.user_email}</td>
                <td>{log.action}</td>
                <td>{log.method}</td>
                <td>{log.endpoint}</td>
                <td>{log.status_code}</td>
                <td>{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminLogs;
