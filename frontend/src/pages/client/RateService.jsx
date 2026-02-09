import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Star, Send, ArrowLeft } from 'lucide-react';

const RateService = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await api.post(`/client/cases/${id}/rate`, {
                rating,
                review
            });
            navigate('/client/dashboard');
        } catch (err) {
            console.error("Failed to submit rating", err);
            setError(err.response?.data?.message || 'Failed to submit rating. Please try again.');
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <button
                onClick={() => navigate('/client/dashboard')}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Dashboard
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Rate Your Service</h1>
                        <p className="text-gray-500">How was your experience with this case?</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Star Rating */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            size={40}
                                            className={`${(hoveredRating || rating) >= star
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                                } transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="text-sm font-medium text-gray-600 h-6">
                                {hoveredRating === 1 ? 'Poor'
                                    : hoveredRating === 2 ? 'Fair'
                                        : hoveredRating === 3 ? 'Good'
                                            : hoveredRating === 4 ? 'Very Good'
                                                : hoveredRating === 5 ? 'Excellent'
                                                    : rating > 0 ? (
                                                        rating === 1 ? 'Poor'
                                                            : rating === 2 ? 'Fair'
                                                                : rating === 3 ? 'Good'
                                                                    : rating === 4 ? 'Very Good'
                                                                        : 'Excellent'
                                                    ) : 'Select a rating'}
                            </span>
                        </div>

                        {/* Review Text */}
                        <div className="space-y-2">
                            <label htmlFor="review" className="block text-sm font-medium text-gray-700">
                                Share your feedback (Optional)
                            </label>
                            <textarea
                                id="review"
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
                                placeholder="Tell us what went well or how we could improve..."
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Submit Feedback
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RateService;
