import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import showToast from '../../Toast';
import "./CreatePost.css"

const CreatePost = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [image, setImage] = useState("");
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (url) {
            fetch("/createpost", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("jwt")
                },
                body: JSON.stringify({
                    title,
                    body,
                    pic: url
                })
            }).then(res => res.json())
                .then(data => {
                    if (data.error) {
                        showToast(data.error, "error");
                    } else {
                        showToast("Created post Successfully", "success");
                        navigate('/');
                    }
                }).catch(err => {
                    console.log(err);
                    showToast("Error creating post", "error");
                });
        }
    }, [url]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const postDetails = () => {
        if (!title || !body || !image) {
            showToast("Please fill all fields", "error");
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append("file", image);
        data.append("upload_preset", "instagram");
        data.append("cloud_name", "sakshamtolani");

        fetch(`https://api.cloudinary.com/v1_1/sakshamtolani/image/upload`, {
            method: "post",
            body: data
        })
            .then(res => {
                if (!res.ok) throw new Error('Upload failed');
                return res.json();
            })
            .then(data => {
                if (!data.url) throw new Error('No URL in response');
                setUrl(data.url);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
                showToast("Failed to upload image. Please try again.", "error");
            });
    };

    return (
        <div className="create-post-container">
            <div className="header-gradient"></div>
            
            <div className="content-wrapper">
                <div className="create-post-card">
                    <h2 className="create-post-title">Create New Post</h2>

                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            id="title"
                            type="text"
                            placeholder="Add a title to your post"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="form-input"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="body">Description</label>
                        <textarea
                            id="body"
                            placeholder="What's on your mind?"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="form-input textarea"
                            rows="4"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Upload Image</label>
                        <div className={`upload-area ${preview ? 'has-preview' : ''}`}>
                            {preview ? (
                                <div className="preview-container">
                                    <img src={preview} alt="Preview" className="image-preview" />
                                    <button
                                        className="remove-preview"
                                        onClick={() => {
                                            setPreview(null);
                                            setImage(null);
                                        }}
                                        disabled={loading}
                                    >
                                        <svg viewBox="0 0 24 24" className="remove-icon">
                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="upload-prompt">
                                    <svg className="upload-icon" viewBox="0 0 24 24">
                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                    </svg>
                                    <span>Click to upload an image</span>
                                    <span className="upload-hint">or drag and drop</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="file-input"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        onClick={postDetails}
                        disabled={loading}
                        className="submit-button"
                    >
                        {loading ? (
                            <div className="button-loader">
                                <div className="loader-dot"></div>
                                <div className="loader-dot"></div>
                                <div className="loader-dot"></div>
                            </div>
                        ) : (
                            "Share Post"
                        )}
                    </button>
                </div>
            </div>

            {loading && (
                <div className="upload-progress-overlay">
                    <div className="upload-progress-content">
                        <div className="upload-spinner"></div>
                        <p className="upload-text">Uploading post...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePost;