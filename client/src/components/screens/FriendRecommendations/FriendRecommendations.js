import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Check, X, Users, Loader } from 'lucide-react';

const FriendRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendRequests, setFriendRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // For tracking which request is being processed

  useEffect(() => {
    fetchRecommendations();
    fetchFriendRequests();
  }, []);

  const fetchRecommendations = () => {
    fetch('/friend-recommendations', {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
    .then(res => res.json())
    .then(result => {
      setRecommendations(result);
      setLoading(false);
    })
    .catch(err => {
      console.log(err);
      setLoading(false);
    });
  };

  const fetchFriendRequests = () => {
    fetch('/friend-requests', {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
    .then(res => res.json())
    .then(result => {
      setFriendRequests(result.filter(req => req.status === 'pending'));
    });
  };

  const sendFriendRequest = (userId) => {
    setActionLoading(userId);
    fetch('/send-friend-request', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        userId
      })
    })
    .then(res => res.json())
    .then(() => {
      setRecommendations(prev => prev.filter(user => user._id !== userId));
    })
    .finally(() => {
      setActionLoading(null);
    });
  };

  const handleRequest = (requestId, fromUserId, action) => {
    setActionLoading(requestId);
    fetch(`/${action}-friend-request`, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        requestId,
        fromUserId
      })
    })
    .then(res => res.json())
    .then(() => {
      setFriendRequests(prev => 
        prev.filter(req => req._id !== requestId)
      );
      if (action === 'accept') {
        fetchRecommendations();
      }
    })
    .finally(() => {
      setActionLoading(null);
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-w-sm w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {showRequests ? 'Friend Requests' : 'People You May Know'}
        </h2>
        <button
          onClick={() => setShowRequests(!showRequests)}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Users className="w-4 h-4" />
          <span className="text-sm">{showRequests ? 'Show Recommendations' : 'Show Requests'}</span>
        </button>
      </div>

      {showRequests ? (
        <div className="space-y-4">
          {friendRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending friend requests</p>
          ) : (
            friendRequests.map(request => (
              <div key={request._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img 
                    src={request.from.pic} 
                    alt={request.from.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <Link to={`/profile/${request.from._id}`} className="font-medium text-gray-900 hover:underline">
                      {request.from.name}
                    </Link>
                  </div>
                </div>
                <div className="flex gap-2">
                  {actionLoading === request._id ? (
                    <Loader className="w-5 h-5 animate-spin text-gray-600" />
                  ) : (
                    <>
                      <button
                        onClick={() => handleRequest(request._id, request.from._id, 'accept')}
                        className="p-1 text-green-600 hover:bg-green-50 rounded-full"
                        disabled={actionLoading === request._id}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRequest(request._id, request.from._id, 'reject')}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                        disabled={actionLoading === request._id}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recommendations available</p>
          ) : (
            recommendations.map(user => (
              <div key={user._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img 
                    src={user.pic} 
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <Link to={`/profile/${user._id}`} className="font-medium text-gray-900 hover:underline">
                      {user.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {user.mutualCount} mutual {user.mutualCount === 1 ? 'friend' : 'friends'}
                    </p>
                  </div>
                </div>
                {actionLoading === user._id ? (
                  <div className="px-3 py-1">
                    <Loader className="w-4 h-4 animate-spin text-gray-600" />
                  </div>
                ) : (
                  <button
                    onClick={() => sendFriendRequest(user._id)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    disabled={actionLoading === user._id}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="text-sm">Add</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FriendRecommendations;