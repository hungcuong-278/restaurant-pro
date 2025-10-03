import React, { useState, useEffect } from 'react';
import { healthService } from '../services/healthService';

const APITestComponent: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [apiData, setApiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const testAPIConnection = async () => {
      try {
        setIsLoading(true);
        const response = await healthService.testAPI();
        setApiStatus('✅ Connected');
        setApiData(response);
      } catch (error: any) {
        setApiStatus('❌ Connection Failed');
        setApiData({ error: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    testAPIConnection();
  }, []);

  const testHealthCheck = async () => {
    try {
      setIsLoading(true);
      const response = await healthService.checkHealth();
      setApiStatus('✅ Health Check Passed');
      setApiData(response);
    } catch (error: any) {
      setApiStatus('❌ Health Check Failed');
      setApiData({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        🔗 Week 4: API Integration Test
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Backend Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            apiStatus.includes('✅') 
              ? 'bg-green-100 text-green-800' 
              : apiStatus.includes('❌') 
                ? 'bg-red-100 text-red-800' 
                : 'bg-yellow-100 text-yellow-800'
          }`}>
            {apiStatus}
          </span>
        </div>

        {apiData && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">API Response:</h3>
            <pre className="text-sm text-gray-600 overflow-auto max-h-40">
              {JSON.stringify(apiData, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={testHealthCheck}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Health Check'}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Refresh
          </button>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>API Base URL:</strong> http://localhost:5000/api</p>
          <p><strong>Frontend URL:</strong> http://localhost:3000</p>
          <p><strong>Week 4 Status:</strong> ✅ API Integration Complete</p>
        </div>
      </div>
    </div>
  );
};

export default APITestComponent;