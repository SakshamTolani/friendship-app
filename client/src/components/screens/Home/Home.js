import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../../App";
import { Link, } from "react-router-dom";
import './Home.css';
import FriendRecommendations from "../FriendRecommendations/FriendRecommendations";

const Home = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { state } = useContext(UserContext);
  const postTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  useEffect(() => {
    fetch("/allpost", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setData(result.posts);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);
  const likePost = (id) => {
    fetch("/like", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId: id,
      }),
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
      });
  };
  const unlikePost = (id) => {
    fetch("/unlike", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        // console.log(result)
        const newData = data.map((item) => {
          if (item._id == result._id) {
            return result;
          } else {
            return item;
          }
        });
        setData(newData);
      });
  };
  const makeComment = (text, postId) => {
    fetch("/comment", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId,
        text,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        const newData = data.map((item) => {
          if (item._id == result._id) {
            return result;
          } else {
            return item;
          }
        });
        setData(newData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const deletePost = (postid) => {
    fetch(`/deletepost/${postid}`, {
      method: "delete",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        const newData = data.filter((item) => {
          return item._id !== result._id;
        });
        setData(newData);
      });
  };
  const deleteComment = (postid, commentid) => {
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
      });
  };

  if (loading) {
    return (
      <div className="upload-progress-overlay">
        <div className="upload-progress-content">
          <div className="upload-spinner"></div>
          <p className="upload-text">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="content-wrapper">
        <div className="flex gap-6 max-w-7xl mx-auto px-4">
          <div className="flex-grow">
            {data.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-state-content">
                  <svg className="empty-icon" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  <h4>No Posts Yet</h4>
                  <p>Be the first to share something amazing!</p>
                  <Link to="/create" className="create-post-btn">
                    <svg className="btn-icon" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                    Create Post
                  </Link>
                </div>
              </div>
            ) : (
              <div className="posts-grid">
                {data.map((item) => (
                  <div key={item._id} className="post-card">
                    <div className="post-header">
                      <div className="post-user-info">
                        <img
                          src={item.postedBy.pic}
                          alt={item.postedBy.name}
                          className="post-avatar"
                        />
                        <Link
                          to={item.postedBy._id !== state._id ? "/profile/" + item.postedBy._id : "/profile"}
                          className="username-link"
                        >
                          {item.postedBy.name}
                        </Link>
                      </div>
                      {item.postedBy._id === state._id && (
                        <button
                          onClick={() => deletePost(item._id)}
                          className="delete-btn"
                        >
                          <svg viewBox="0 0 24 24" className="delete-icon">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="post-image-container">
                      <img src={item.photo} alt={item.title} />
                    </div>

                    <div className="post-content">
                      <div className="post-actions">
                        <div className="action-buttons">
                          <button
                            className={`action-btn ${item.likes.includes(state._id) ? 'liked' : ''}`}
                            onClick={() => item.likes.includes(state._id) ? unlikePost(item._id) : likePost(item._id)}
                          >
                            <svg viewBox="0 0 24 24" className="action-icon">
                              <path d={item.likes.includes(state._id)
                                ? "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                : "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"}
                              />
                            </svg>
                            <span>{item.likes.length}</span>
                          </button>

                          <button className="action-btn">
                            <svg viewBox="0 0 24 24" className="action-icon">
                              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                            </svg>
                            <span>{item.comments.length}</span>
                          </button>
                        </div>
                        <span className="post-date">{postTime}</span>
                      </div>

                      <div className="post-details">
                        <h3 className="post-title">{item.title}</h3>
                        <p className="post-body">{item.body}</p>
                      </div>

                      <div className="comments-section">
                        {item.comments.map((record) => (
                          <div key={record._id} className="comment">
                            <div className="comment-content">
                              <span className="comment-author">{record.postedBy.name}</span>
                              <span className="comment-text">{record.text}</span>
                            </div>
                            {(item.postedBy._id === state._id || record.postedBy._id === state._id) && (
                              <button
                                onClick={() => deleteComment(item._id, record._id)}
                                className="btn-flat delete-comment"
                              >
                                <i className="material-icons tiny">close</i>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <form
                        className="comment-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          makeComment(e.target[0].value, item._id);
                          e.target[0].value = "";
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="comment-input"
                        />
                        <button type="submit" className="btn-flat">
                          <i className="material-icons">send</i>
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="hidden lg:block w-80 flex-shrink-0 sticky top-4 self-start">
            <FriendRecommendations />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
