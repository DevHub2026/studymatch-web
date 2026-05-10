/**
 * LIBRARY PAGE (Resource Sharing)
 * 
 * Share and access study resources with your study partners
 * 
 * Features:
 * - Upload study materials (PDF, DOC, PPT, images)
 * - Download shared resources
 * - Filter by subject/category
 * - File type icons and size display
 * - Search resources
 * - Empty state when no resources exist
 * 
 * How it works:
 * 1. Users upload files with title, subject, description
 * 2. Files are stored and shared with matched partners
 * 3. Users can browse and download resources
 */

import { useState, useEffect } from 'react';
import * as libraryApi from '../api/library';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function LibraryPage() {
  // State for resources list
  const [resources, setResources] = useState([]);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    file: null,
    title: '',
    subject: '',
    description: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState({});

  // Search/filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  /**
   * Fetch resources on component mount
   */
  useEffect(() => {
    const loadResources = async () => {
      try {
        const response = await libraryApi.getResources();
        console.log('Library API response:', response);
        
        // Correct: axios wraps the response, so it's response.data.data
        const resourcesData = response.data?.data || [];
        setResources(Array.isArray(resourcesData) ? resourcesData : []);
      } catch (error) {
        console.error('Failed to fetch resources:', error);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  /**
   * Handle file selection
   * @param {Event} e - File input change event
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (uploadErrors[name]) {
      setUploadErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  /**
   * Upload a new resource
   */
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      alert('Please select a file to upload');
      return;
    }
    
    setUploading(true);
    setUploadErrors({});
    
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      formData.append('subject', uploadForm.subject || '');
      formData.append('description', uploadForm.description || '');
      
      // Upload the file
      const response = await libraryApi.uploadResource(formData);
      
      alert('File uploaded successfully!');
      
      // Add the new resource to the list - FIXED: extract from response.data
      const newResource = response.data?.resource || response.resource;
      if (newResource) {
        setResources(prev => [newResource, ...prev]);
      }
      
      // Reset form and close modal
      setUploadForm({ file: null, title: '', subject: '', description: '' });
      setShowUploadModal(false);
      
    } catch (error) {
      console.error('Failed to upload file:', error);
      
      if (error.response?.data?.errors) {
        setUploadErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || 'Failed to upload file. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  /**
   * Download a resource
   * @param {number} resourceId - ID of resource to download
   */
  const handleDownload = async (resourceId) => {
    try {
      await libraryApi.downloadResource(resourceId);
    } catch (error) {
      console.error('Failed to download resource:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  /**
   * Get file icon based on file type
   * @param {string} fileName - Name of the file
   * @returns {string} Emoji icon for file type
   */
  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['ppt', 'pptx'].includes(ext)) return '📊';
    if (['xls', 'xlsx'].includes(ext)) return '📈';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
    if (['zip', 'rar'].includes(ext)) return '📦';
    return '📁';
  };

  /**
   * Format file size
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  /**
   * Filter resources based on search and subject
   */
  const filteredResources = Array.isArray(resources) ? resources.filter(resource => {
    // Search filter
    if (searchQuery && !resource?.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !resource?.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Subject filter
    if (selectedSubject && resource?.subject !== selectedSubject) {
      return false;
    }
    
    return true;
  }) : [];

  /**
   * Get unique subjects from resources for filter dropdown
   */
  const uniqueSubjects = Array.isArray(resources) 
    ? [...new Set(resources.map(r => r?.subject).filter(Boolean))]
    : [];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-2xl">Loading library...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        icon="📚"
        title="Library"
        subtitle="Share and access study resources"
        action={
          <Button onClick={() => setShowUploadModal(true)}>
            <span className="flex items-center gap-2">
              <span>📤</span>
              <span>Upload Resource</span>
            </span>
          </Button>
        }
      />

      {/* Info Banner */}
      <Card className="mb-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
        <div className="flex items-start gap-3">
          <div className="text-2xl">ℹ️</div>
          <div>
            <h3 className="text-lg font-bold text-blue-100 mb-1">Resource Sharing</h3>
            <p className="text-blue-200 text-sm">
              Upload study materials to share with your study partners. Supported formats: PDF, DOC, PPT, XLS, images.
            </p>
          </div>
        </div>
      </Card>

      {/* Search and Filter Bar */}
      {resources.length > 0 && (
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full px-4 py-2 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Subject Filter */}
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 bg-[#0f1218] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">All Subjects</option>
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State - No resources */}
      {resources.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Resources Yet</h3>
          <p className="text-gray-400 mb-6">
            Be the first to share study materials! Upload notes, past papers, or helpful resources.
          </p>
          <Button onClick={() => setShowUploadModal(true)}>
            Upload Your First Resource
          </Button>
        </Card>
      ) : filteredResources.length === 0 ? (
        // No results from filter
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Results Found</h3>
          <p className="text-gray-400 mb-6">
            Try adjusting your search or filters.
          </p>
          <Button 
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedSubject('');
            }}
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        // Resources Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(resource => (
            <Card key={resource.id} hover>
              {/* File Icon & Title */}
              <div className="flex items-start gap-3 mb-4">
                <div className="text-4xl">{getFileIcon(resource.filename)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-400 text-sm truncate">
                    {resource.filename}
                  </p>
                </div>
              </div>

              {/* Subject Tag */}
              {resource.subject && (
                <div className="mb-3">
                  <span className="inline-block bg-purple-600/50 text-purple-100 text-xs font-semibold px-3 py-1 rounded-full">
                    {resource.subject}
                  </span>
                </div>
              )}

              {/* Description */}
              {resource.description && (
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {resource.description}
                </p>
              )}

              {/* File Info */}
              <div className="flex items-center justify-between text-gray-400 text-xs mb-4">
                <span>{formatFileSize(resource.file_size)}</span>
                <span>{new Date(resource.uploaded_at || resource.created_at).toLocaleDateString()}</span>
              </div>

              {/* Download Button */}
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => handleDownload(resource.id)}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>Download</span>
                  <span>⬇️</span>
                </span>
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-[#1a1d2e] rounded-2xl p-6 max-w-md w-full border border-purple-500/50 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Upload Resource
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-white mb-2">File *</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                  required
                  className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:font-semibold hover:file:bg-purple-700"
                />
                <p className="text-gray-400 text-xs mt-1">
                  Max 10MB. Supported: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG
                </p>
                {uploadErrors.file && (
                  <p className="text-red-400 text-sm mt-1">{uploadErrors.file[0]}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-white mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={uploadForm.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Calculus I Notes"
                  required
                  className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                {uploadErrors.title && (
                  <p className="text-red-400 text-sm mt-1">{uploadErrors.title[0]}</p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-white mb-2">Subject (Optional)</label>
                <input
                  type="text"
                  name="subject"
                  value={uploadForm.subject}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics"
                  className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white mb-2">Description (Optional)</label>
                <textarea
                  name="description"
                  value={uploadForm.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the resource..."
                  rows="3"
                  className="w-full px-4 py-3 bg-[#0f1218] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadForm({ file: null, title: '', subject: '', description: '' });
                    setUploadErrors({});
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}