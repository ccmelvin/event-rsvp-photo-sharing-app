'use client';

import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export function StorageStatus() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [bucketName, setBucketName] = useState<string>('');

  useEffect(() => {
    checkStorageConfiguration();
  }, []);

  const checkStorageConfiguration = () => {
    try {
      const config = Amplify.getConfig();
      const storageConfig = config.Storage?.S3;
      
      if (storageConfig?.bucket) {
        setIsConfigured(true);
        setBucketName(storageConfig.bucket);
      } else {
        setIsConfigured(false);
        setBucketName('');
      }
    } catch (error) {
      console.error('Error checking storage configuration:', error);
      setIsConfigured(false);
    }
  };

  if (isConfigured === null) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 text-gray-500 animate-spin" />
          <span className="text-sm text-gray-600">Checking storage configuration...</span>
        </div>
      </div>
    );
  }

  if (isConfigured) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-800 font-semibold">Storage Configured</span>
        </div>
        <p className="text-xs text-green-700 mt-1">
          Bucket: {bucketName}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <span className="text-sm text-yellow-800 font-semibold">Storage Not Configured</span>
      </div>
      <p className="text-xs text-yellow-700 mb-3">
        Photo uploads and display require S3 storage configuration.
      </p>
      <div className="bg-yellow-100 rounded p-2 font-mono text-xs text-yellow-800 mb-2">
        npx ampx sandbox
      </div>
      <button
        onClick={checkStorageConfiguration}
        className="text-xs text-yellow-700 hover:text-yellow-900 underline"
      >
        Recheck configuration
      </button>
    </div>
  );
}
