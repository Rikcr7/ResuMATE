import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  Upload, FileText, Users, Target, Star, TrendingUp, 
  Download, Eye, Filter, Search, ChevronDown, X, AlertCircle
} from 'lucide-react';
import CandidateCard from './CandidateCard';
import StatsOverview from './StatsOverview';
import LoadingSpinner from './LoadingSpinner';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null);

  // File upload with dropzone
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Some files were rejected. Please upload only PDF, DOC, or DOCX files.');
    }
    
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type,
      status: 'pending'
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(`${acceptedFiles.length} file(s) uploaded successfully`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const analyzeResumes = async () => {
    if (!jobDescription.trim() || !jobTitle.trim()) {
      toast.error('Please provide both job title and description.');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one resume.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('jobTitle', jobTitle);
      formData.append('jobDescription', jobDescription);
      
      uploadedFiles.forEach(fileObj => {
        formData.append('resumes', fileObj.file);
      });

      const response = await axios.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      });

      if (response.data.success) {
        setCurrentAnalysisId(response.data.analysisId);
        // Poll for results
        pollAnalysisResults(response.data.analysisId);
        toast.success('Analysis started successfully!');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to start analysis. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const pollAnalysisResults = async (analysisId) => {
    try {
      const response = await axios.get(`/api/analysis/${analysisId}/status`);
      
      if (response.data.status === 'completed') {
        setAnalysisResults(response.data.results);
        setIsAnalyzing(false);
        setActiveTab('results');
        toast.success('Analysis completed successfully!');
      } else if (response.data.status === 'failed') {
        setIsAnalyzing(false);
        toast.error('Analysis failed. Please try again.');
      } else {
        // Continue polling
        setTimeout(() => pollAnalysisResults(analysisId), 2000);
      }
    } catch (error) {
      console.error('Polling error:', error);
      setIsAnalyzing(false);
      toast.error('Failed to get analysis results.');
    }
  };

  const toggleShortlist = (candidate) => {
    setShortlistedCandidates(prev => {
      const isAlreadyShortlisted = prev.find(c => c.id === candidate.id);
      if (isAlreadyShortlisted) {
        toast.info(`${candidate.name} removed from shortlist`);
        return prev.filter(c => c.id !== candidate.id);
      } else {
        toast.success(`${candidate.name} added to shortlist`);
        return [...prev, candidate];
      }
    });
  };

  const exportResults = async () => {
    try {
      const response = await axios.get(`/api/analysis/${currentAnalysisId}/export`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analysis-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report.');
    }
  };

  // Filter and sort candidates
  const filteredAndSortedResults = analysisResults
    .filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterScore === 'all' || 
                           (filterScore === '90+' && candidate.matchScore >= 90) ||
                           (filterScore === '80-89' && candidate.matchScore >= 80 && candidate.matchScore < 90) ||
                           (filterScore === '70-79' && candidate.matchScore >= 70 && candidate.matchScore < 80) ||
                           (filterScore === '<70' && candidate.matchScore < 70);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.matchScore - a.matchScore;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'experience':
          return parseInt(b.experience) - parseInt(a.experience);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Resume Screener</h1>
              <p className="text-gray-600">Intelligent candidate matching and analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              {analysisResults.length > 0 && (
                <button
                  onClick={exportResults}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </button>
              )}
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                New Analysis
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'upload', label: 'Setup & Upload', icon: Upload, count: uploadedFiles.length },
              { id: 'results', label: 'Analysis Results', icon: TrendingUp, count: analysisResults.length },
              { id: 'shortlist', label: 'Shortlisted', icon: Star, count: shortlistedCandidates.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-8">
            {/* Job Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-indigo-600" />
                Job Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Full Stack Developer"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Select experience level</option>
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (2-5 years)</option>
                    <option value="senior">Senior Level (5-8 years)</option>
                    <option value="lead">Lead Level (8+ years)</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description including required skills, qualifications, responsibilities, and any specific requirements..."
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="mt-2 text-sm text-gray-600">
                  <p>💡 <strong>Pro tip:</strong> Include specific technologies, years of experience, certifications, and soft skills for more accurate matching.</p>
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-600" />
                Upload Candidate Resumes
              </h2>
              
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  isDragActive 
                    ? 'border-indigo-400 bg-indigo-50' 
                    : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop files here...' : 'Drop resumes here or click to upload'}
                </h3>
                <p className="text-gray-500 mb-4">
                  Supports PDF, DOC, DOCX files up to 10MB each. Upload up to 100 resumes at once.
                </p>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Choose Files
                </button>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Uploaded Files ({uploadedFiles.length})</h3>
                    <button
                      onClick={() => setUploadedFiles([])}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {uploadedFiles.map((fileObj) => (
                      <div key={fileObj.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center flex-1">
                          <FileText className="w-4 h-4 mr-3 text-gray-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {fileObj.name}
                            </p>
                            <p className="text-xs text-gray-500">{fileObj.size}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(fileObj.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Button */}
            <div className="text-center">
              <button
                onClick={analyzeResumes}
                disabled={isAnalyzing || !jobDescription.trim() || !jobTitle.trim() || uploadedFiles.length === 0}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
              >
                {isAnalyzing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Analyzing Resumes... This may take a few minutes
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5 mr-2" />
                    Start AI Analysis ({uploadedFiles.length} resumes)
                  </>
                )}
              </button>
              
              {!jobTitle.trim() || !jobDescription.trim() || uploadedFiles.length === 0 ? (
                <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Complete all fields above to start analysis
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            {analysisResults.length > 0 ? (
              <>
                <StatsOverview results={analysisResults} />
                
                {/* Search and Filter */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search by name, email, or skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-4">
                      <select
                        value={filterScore}
                        onChange={(e) => setFilterScore(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="all">All Scores</option>
                        <option value="90+">90%+ Match</option>
                        <option value="80-89">80-89% Match</option>
                        <option value="70-79">70-79% Match</option>
                        <option value="<70">Below 70%</option>
                      </select>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="score">Sort by Score</option>
                        <option value="name">Sort by Name</option>
                        <option value="experience">Sort by Experience</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Candidate Results */}
                <div className="space-y-4">
                  {filteredAndSortedResults.map(candidate => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      isShortlisted={shortlistedCandidates.some(c => c.id === candidate.id)}
                      onToggleShortlist={() => toggleShortlist(candidate)}
                    />
                  ))}
                </div>

                {filteredAndSortedResults.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No analysis results yet</h3>
                <p className="text-gray-500">Upload job requirements and resumes, then run the analysis to see results here.</p>
              </div>
            )}
          </div>
        )}

        {/* Shortlist Tab */}
        {activeTab === 'shortlist' && (
          <div className="space-y-6">
            {shortlistedCandidates.length > 0 ? (
              <>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-2">Shortlisted Candidates ({shortlistedCandidates.length})</h2>
                  <p className="text-gray-600">Your top picks for the position</p>
                </div>
                
                <div className="space-y-4">
                  {shortlistedCandidates.map(candidate => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      isShortlisted={true}
                      onToggleShortlist={() => toggleShortlist(candidate)}
                      showFullDetails={true}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shortlisted candidates yet</h3>
                <p className="text-gray-500">Star candidates from the results tab to add them to your shortlist.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;