import React, { useState, useEffect, useContext } from "react";
import { UserContext } from '../../../App'
import { Link } from 'react-router-dom'
import './SubscribedUserPosts.css';

const SubscribedUserPosts = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [deletingComments, setDeletingComments] = useState({})
    const [addingComment, setAddingComment] = useState({})
    const { state, dispatch } = useContext(UserContext)
    useEffect(() => {
        fetch('/getsubpost', {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        }).then(res => res.json())
            .then(result => {
                console.log(result)
                setData(result.posts)
                setLoading(false)
            })
            .catch(err => {
                console.log(err)
                setLoading(false)
            })
    }, [])
    const likePost = (id) => {
        fetch("/like", {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                postId: id
            })
        }).then(res => res.json())
            .then(result => {
                const newData = data.map(item => {
                    if (item._id == result._id) {
                        return result
                    } else {
                        return item
                    }
                })
                setData(newData)
            })
    }
    const unlikePost = (id) => {
        fetch("/unlike", {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                postId: id
            })
        }).then(res => res.json())
            .then(result => {
                // console.log(result)
                const newData = data.map(item => {
                    if (item._id == result._id) {
                        return result
                    } else {
                        return item
                    }
                })
                setData(newData)
            })
    }
    const makeComment = (text, postId) => {
        if (!text || !text.trim()) return;

        setAddingComment(prev => ({ ...prev, [postId]: true }));

        fetch('/comment', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                postId,
                text
            })
        }).then(res => res.json())
            .then(result => {
                console.log("Comment response:", result);
                const newData = data.map(item => {
                    if (item._id === result._id) {
                        return {
                            ...result,
                            comments: result.comments.map(comment => ({
                                ...comment,
                                postedBy: comment.postedBy || {
                                    _id: state._id,
                                    name: state.name
                                }
                            }))
                        };
                    }
                    return item;
                });
                setData(newData);
            }).catch(err => {
                console.log(err);
            })
            .finally(() => {
                setAddingComment(prev => {
                    const newState = { ...prev };
                    delete newState[postId];
                    return newState;
                });
            });
    }
    const deletePost = (postid) => {
        fetch(`/deletepost/${postid}`, {
            method: "delete",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("jwt")
            }
        }).then(res => res.json())
            .then(result => {
                console.log(result)
                const newData = data.filter(item => {
                    return item._id !== result._id
                })
                setData(newData)
            })
    }
    const deleteComment = (postid, commentid) => {
        setDeletingComments(prev => ({ ...prev, [commentid]: true }))

        fetch(`/deletecomment/${postid}/${commentid}`, {
            method: "delete",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
        })
            .then((res) => res.json())
            .then((result) => {
                const newData = data.map((item) => {
                    if (item._id == result._id) {
                        return result;
                    } else {
                        return item;
                    }
                });
                setData(newData);
            })
            .finally(() => {
                setDeletingComments(prev => {
                    const newState = { ...prev }
                    delete newState[commentid]
                    return newState
                })
            });
    };

    return (
        <div className="subscribed-posts-container">
            {loading ? (
                <div className="upload-progress-overlay">
                    <div className="upload-progress-content">
                        <div className="upload-spinner"></div>
                        <p className="upload-text">Loading posts...</p>
                    </div>
                </div>
            ) : data.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-content">
                        <svg className="empty-icon" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                        <h4>Your Feed is Empty</h4>
                        <p>Start following others to see their amazing posts here!</p>
                        <Link to="/" className="explore-btn">
                            Explore Users
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="posts-grid">
                    {data.map(item => (
                        <div className="post-card" key={item._id}>
                            <div className="post-header">
                                <div className="post-user-info">
                                    <img
                                        src={item.postedBy.pic || 'default-avatar.png'}
                                        className="post-avatar"
                                        alt={item.postedBy.name}
                                    />
                                    <Link to={item.postedBy._id !== state._id ? "/profile/" + item.postedBy._id : "/profile"}>
                                        {item.postedBy.name}
                                    </Link>
                                </div>
                                {item.postedBy._id == state._id && (
                                    <button className="btn-flat delete-btn" onClick={() => deletePost(item._id)}>
                                        <i className="material-icons">delete_outline</i>
                                    </button>
                                )}
                            </div>

                            <div className="post-image-container">
                                <img src={item.photo} alt={item.title} />
                            </div>

                            <div className="post-content">
                                <div className="post-actions">
                                    <div className="left-actions">
                                        {item.likes.includes(state._id) ? (
                                            <button className="btn-flat" onClick={() => unlikePost(item._id)}>
                                                <i className="material-icons liked">favorite</i>
                                            </button>
                                        ) : (
                                            <button className="btn-flat" onClick={() => likePost(item._id)}>
                                                <i className="material-icons">favorite_border</i>
                                            </button>
                                        )}
                                        <button className="btn-flat">
                                            <i className="material-icons">chat_bubble_outline</i>
                                        </button>
                                    </div>
                                    <span className="post-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>

                                <div className="post-details">
                                    <span className="likes-count">{item.likes.length} likes</span>
                                    <h6 className="post-title">{item.title}</h6>
                                    <p className="post-body">{item.body}</p>
                                </div>

                                <div className="comments-section">
                                    {item.comments.map(record => {
                                        const commentUser = record.postedBy || state;
                                        return (
                                            <div className="comment" key={record._id}>
                                                <div className="comment-content">
                                                    <Link
                                                        to={commentUser._id !== state._id ? `/profile/${commentUser._id}` : "/profile"}
                                                        className="comment-author"
                                                    >
                                                        {commentUser.name}
                                                    </Link>
                                                    <span className="comment-text">{record.text}</span>
                                                </div>
                                                {(item.postedBy._id === state._id || commentUser._id === state._id) && (
                                                    <button
                                                        className="btn-flat delete-comment"
                                                        onClick={() => deleteComment(item._id, record._id)}
                                                        disabled={deletingComments[record._id]}
                                                    >
                                                        {deletingComments[record._id] ? (
                                                            <div className="comment-delete-spinner"></div>
                                                        ) : (
                                                            <i className="material-icons tiny">close</i>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <form 
                                    className="comment-form" 
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        makeComment(e.target[0].value, item._id);
                                        e.target[0].value = '';
                                    }}
                                >
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        className="comment-input"
                                        disabled={addingComment[item._id]}
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn-flat"
                                        disabled={addingComment[item._id]}
                                    >
                                        {addingComment[item._id] ? (
                                            <div className="comment-submit-spinner"></div>
                                        ) : (
                                            <i className="material-icons">send</i>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SubscribedUserPosts;