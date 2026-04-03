import React, { useState } from 'react';
import { UploadCloud, ListVideo, Filter, Settings, Globe, Target } from 'lucide-react';
import AdUploader from '../components/AdUploader';
import AdList from '../components/AdList';

export default function AdminDashboard() {
  const [refresh, setRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const triggerRefresh = () => {
    setRefresh(!refresh);
    setActiveTab('manage');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Ad Management Dashboard
                </span>
              </h1>
              <p className="text-gray-600">Upload and manage advertisements for your kiosk network</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Clean Tab Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl border border-gray-200 mb-8 max-w-md">
          <button
            className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-200 ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('upload')}
          >
            <UploadCloud className="w-5 h-5 mr-2" />
            Upload Ads
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-200 ${
              activeTab === 'manage'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('manage')}
          >
            <ListVideo className="w-5 h-5 mr-2" />
            Manage Ads
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm sticky top-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-gray-500" />
                Ad Distribution
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Global Ads</p>
                      <p className="text-xs text-blue-600">For all kiosks</p>
                    </div>
                  </div>
                  <p className="text-sm text-blue-800 mt-2">
                    Displayed on every screen across your network
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-700">Targeted Ads</p>
                      <p className="text-xs text-purple-600">Kiosk-specific</p>
                    </div>
                  </div>
                  <p className="text-sm text-purple-800 mt-2">
                    Show on selected kiosks only for targeted campaigns
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'upload' ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                      <UploadCloud className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Upload New Advertisement</h2>
                      <p className="text-gray-600">Upload videos, images, or interactive content</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <AdUploader onUpload={triggerRefresh} />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4">
                        <ListVideo className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Manage Advertisements</h2>
                        <p className="text-gray-600">View and organize your ad campaigns</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center self-start sm:self-center">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter Options
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <AdList key={refresh} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        {activeTab === 'upload' && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">💡</span>
                </div>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Upload Tips</h4>
                <p className="text-sm text-blue-700 mt-1">
                  • Supported formats: MP4, WebM, JPEG, PNG, GIF<br />
                  • Maximum file size: 500MB<br />
                  • Recommended resolution: 1920x1080
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}