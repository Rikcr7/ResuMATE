// components/CandidateCard.js
import React from 'react';
import { Star, Eye, Download, Mail, Phone, MapPin, Calendar } from 'lucide-react';

const CandidateCard = ({ candidate, isShortlisted, onToggleShortlist, showFullDetails = false }) => {
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-xl font-semibold text-gray-900 mr-3">{candidate.name}</h3>
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(candidate.matchScore)}`}>
                  {candidate.matchScore}% Match
                </span>
                <div className={`w-2 h-2 rounded-full ml-2 ${getScoreBadgeColor(candidate.matchScore)}`}></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                {candidate.email}
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                {candidate.phone}
              </div>
              {candidate.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {candidate.location}
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {candidate.experience} experience
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button className="text-indigo-600 hover:text-indigo-800 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleShortlist}
              className={`p-2 rounded-lg transition-colors ${
                isShortlisted
                  ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                  : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
              }`}
            >
              <Star className={`w-4 h-4 ${isShortlisted ? 'fill-current' : ''}`} />
            </button>
            <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Skills */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Technical Skills</h4>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.slice(0, showFullDetails ? candidate.skills.length : 8).map(skill => (
                <span 
                  key={skill} 
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
                >
                  {skill}
                </span>
              ))}
              {!showFullDetails && candidate.skills.length > 8 && (
                <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                  +{candidate.skills.length - 8} more
                </span>
              )}
            </div>
          </div>
          
          {/* Highlights */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Key Strengths</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {candidate.highlights.slice(0, showFullDetails ? candidate.highlights.length : 3).map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  {highlight}
                </li>
              ))}
              {!showFullDetails && candidate.highlights.length > 3 && (
                <li className="text-gray-400 text-xs">
                  +{candidate.highlights.length - 3} more strengths
                </li>
              )}
            </ul>
          </div>

          {/* Gaps */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Areas for Development</h4>
            {candidate.gaps && candidate.gaps.length > 0 ? (
              <ul className="text-sm text-gray-600 space-y-1">
                {candidate.gaps.slice(0, showFullDetails ? candidate.gaps.length : 2).map((gap, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-0.5">⚠</span>
                    {gap}
                  </li>
                ))}
                {!showFullDetails && candidate.gaps.length > 2 && (
                  <li className="text-gray-400 text-xs">
                    +{candidate.gaps.length - 2} more considerations
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-green-600 flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                No significant gaps identified
              </p>
            )}
          </div>
        </div>

        {/* Additional Details for Full View */}
        {showFullDetails && candidate.summary && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">AI Summary</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{candidate.summary}</p>
          </div>
        )}

        {/* Score Breakdown */}
        {showFullDetails && candidate.scoreBreakdown && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Score Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(candidate.scoreBreakdown).map(([category, score]) => (
                <div key={category} className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{score}%</div>
                  <div className="text-xs text-gray-500 capitalize">{category}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// components/StatsOverview.js
import React from 'react';
import { Users, Star, TrendingUp, Target, Award, Clock } from 'lucide-react';

const StatsOverview = ({ results }) => {
  const stats = {
    totalCandidates: results.length,
    highMatch: results.filter(c => c.matchScore >= 90).length,
    mediumMatch: results.filter(c => c.matchScore >= 80 && c.matchScore < 90).length,
    lowMatch: results.filter(c => c.matchScore < 80).length,
    averageScore: results.length > 0 
      ? Math.round(results.reduce((sum, c) => sum + c.matchScore, 0) / results.length)
      : 0,
    topSkills: getTopSkills(results)
  };

  function getTopSkills(candidates) {
    const skillCount = {};
    candidates.forEach(candidate => {
      candidate.skills.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });
    
    return Object.entries(skillCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Users className="w-10 h-10 text-indigo-600 mr-4" />
          <div>
            <p className="text-sm font-medium text-gray-600">Total Candidates</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalCandidates}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Award className="w-10 h-10 text-green-600 mr-4" />
          <div>
            <p className="text-sm font-medium text-gray-600">High Match (90%+)</p>
            <p className="text-3xl font-bold text-gray-900">{stats.highMatch}</p>
            <p className="text-xs text-green-600">
              {stats.totalCandidates > 0 ? Math.round((stats.highMatch / stats.totalCandidates) * 100) : 0}% of total
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Star className="w-10 h-10 text-blue-600 mr-4" />
          <div>
            <p className="text-sm font-medium text-gray-600">Good Match (80-89%)</p>
            <p className="text-3xl font-bold text-gray-900">{stats.mediumMatch}</p>
            <p className="text-xs text-blue-600">
              {stats.totalCandidates > 0 ? Math.round((stats.mediumMatch / stats.totalCandidates) * 100) : 0}% of total
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Target className="w-10 h-10 text-purple-600 mr-4" />
          <div>
            <p className="text-sm font-medium text-gray-600">Average Score</p>
            <p className="text-3xl font-bold text-gray-900">{stats.averageScore}%</p>
            <p className="text-xs text-gray-500">Across all candidates</p>
          </div>
        </div>
      </div>

      {/* Top Skills Overview */}
      <div className="md:col-span-2 lg:col-span-4 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Most Common Skills</h3>
        <div className="flex flex-wrap gap-3">
          {stats.topSkills.map(({ skill, count }) => (
            <div key={skill} className="flex items-center bg-gray-50 rounded-full px-4 py-2">
              <span className="font-medium text-gray-900">{skill}</span>
              <span className="ml-2 text-sm text-gray-500 bg-gray-200 rounded-full px-2 py-1">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// components/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600 ${sizeClasses[size]} ${className}`}></div>
  );
};

// components/CandidateDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Star, Download, Mail, Phone, MapPin, Calendar, ExternalLink } from 'lucide-react';

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidateDetails();
  }, [id]);

  const fetchCandidateDetails = async () => {
    try {
      const response = await axios.get(`/api/candidates/${id}`);
      setCandidate(response.data);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Candidate not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Return to dashboard
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </button>
            <div className="flex space-x-3">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                <Mail className="w-4 h-4 mr-2 inline" />
                Contact Candidate
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                <Download className="w-4 h-4 mr-2 inline" />
                Download Resume
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Candidate Header */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{candidate.name}</h1>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {candidate.email}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {candidate.phone}
                </div>
                {candidate.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {candidate.location}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {candidate.experience} experience
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className={`inline-flex px-6 py-3 rounded-full text-lg font-semibold ${getScoreColor(candidate.matchScore)}`}>
                {candidate.matchScore}% Match
              </div>
            </div>
          </div>

          {candidate.summary && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">Professional Summary</h2>
              <p className="text-gray-700 leading-relaxed">{candidate.summary}</p>
            </div>
          )}
        </div>

        {/* Detailed Analysis */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Skills & Experience */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Skills & Technologies</h2>
            <div className="space-y-4">
              {candidate.skillCategories ? (
                Object.entries(candidate.skillCategories).map(([category, skills]) => (
                  <div key={category}>
                    <h3 className="font-medium text-gray-900 mb-2 capitalize">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map(skill => (
                        <span key={skill} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Detailed Scoring</h2>
            {candidate.scoreBreakdown ? (
              <div className="space-y-4">
                {Object.entries(candidate.scoreBreakdown).map(([category, score]) => (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize">{category}</span>
                      <span className="text-lg font-semibold">{score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Detailed scoring not available</p>
            )}
          </div>
        </div>

        {/* Strengths and Gaps */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-700">Key Strengths</h2>
            <ul className="space-y-3">
              {candidate.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-3 mt-0.5">✓</span>
                  <span className="text-gray-700">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-700">Areas for Consideration</h2>
            {candidate.gaps && candidate.gaps.length > 0 ? (
              <ul className="space-y-3">
                {candidate.gaps.map((gap, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-3 mt-0.5">⚠</span>
                    <span className="text-gray-700">{gap}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-600 flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                No significant gaps identified for this role
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { CandidateCard, StatsOverview, LoadingSpinner, CandidateDetail };