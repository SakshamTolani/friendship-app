import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../../App';
import { useParams } from 'react-router-dom';
import { UserCircle, Users, ImageIcon, Loader2 } from 'lucide-react';

const UserProfile = () => {
    const [userProfile, setProfile] = useState(null);
    const { state, dispatch } = useContext(UserContext);
    const { userid } = useParams();
    const [requestStatus, setRequestStatus] = useState('none'); // 'none', 'pending', 'friends'

    useEffect(() => {
        // Initial fetch of user profile and friend status
        fetch(`/user/${userid}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
            .then(res => res.json())
            .then(result => {
                setProfile(result);
                console.log(result);
                // Check friendship status
                if (result.user.friends.length != 0 && result.user.friends.includes(state._id)) {
                    setRequestStatus('friends');
                } else {
                    // Check if there's a pending request
                    fetch(`/friend-requests`, {
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("jwt")
                        }
                    })
                        .then(res => res.json())
                        .then(data => {
                            console.log(data);
                            if (data.exists) {
                                setRequestStatus('pending');
                            }
                        });
                }
            });
    }, [userid]);

    const sendFriendRequest = () => {
        fetch('/send-friend-request', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                userId: userid
            })
        })
            .then(res => res.json())
            .then(data => {
                setRequestStatus('pending');
            });
    };

    const removeFriend = () => {
        fetch('/remove-friend', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({
                friendId: userid
            })
        })
            .then(res => res.json())
            .then(data => {
                dispatch({
                    type: "UPDATE",
                    payload: { friends: data.friends }
                });
                setRequestStatus('none');
                setProfile(prevState => ({
                    ...prevState,
                    user: {
                        ...prevState.user,
                        friends: prevState.user.friends.filter(id => id !== state._id)
                    }
                }));
            });
    };

    const getFriendActionButton = () => {
        switch (requestStatus) {
            case 'none':
                return (
                    <button
                        onClick={sendFriendRequest}
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200 flex items-center gap-2"
                    >
                        Add Friend
                    </button>
                );
            case 'pending':
                return (
                    <button
                        className="px-6 py-2 bg-orange-500 text-white rounded-full transition-colors duration-200 flex items-center gap-2"
                        disabled={true}
                    >
                        Request Pending
                    </button>
                );
            case 'friends':
                return (
                    <button
                        onClick={removeFriend}
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200 flex items-center gap-2"
                    >
                        Remove Friend
                    </button>
                );
            default:
                return null;
        }
    };

    if (!userProfile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Profile Image */}
                    <div className="relative">
                        {userProfile.user.pic ? (
                            <img
                                src={userProfile.user.pic}
                                alt={userProfile.user.name}
                                className="w-40 h-40 rounded-full object-cover border-4 border-blue-100 shadow-md"
                            />
                        ) : (
                            <UserCircle className="w-40 h-40 text-gray-400" />
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {userProfile.user.name}
                        </h1>
                        <p className="text-gray-600 mb-4">{userProfile.user.email}</p>

                        {/* Stats */}
                        <div className="flex justify-center md:justify-start gap-8 mb-6">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-blue-500" />
                                <span className="text-lg font-semibold">
                                    {userProfile.posts.length} Posts
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" />
                                <span className="text-lg font-semibold">
                                    {userProfile.user.friends.length} Friends
                                </span>
                            </div>
                        </div>

                        {/* Friend Action Button */}
                        {/* {requestStatus === 'friends' ? (
                            <button
                                onClick={removeFriend}
                                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200 flex items-center gap-2"
                            >
                                Remove Friend
                            </button>
                        ) : (
                            <button
                                onClick={sendFriendRequest}
                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200 flex items-center gap-2"
                            >
                                Add Friend
                            </button>
                        )} */}
                        {getFriendActionButton()}
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProfile.posts.map(item => (
                    <div
                        key={item._id}
                        className="relative aspect-square group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                    >
                        <img
                            src={item.photo}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserProfile;