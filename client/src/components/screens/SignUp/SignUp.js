import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserIcon } from '@heroicons/react/outline';

const SignUp = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [image, setImage] = useState("");
    const [preview, setPreview] = useState("");
    const [url, setUrl] = useState(undefined);

    useEffect(() => {
        if (url) {
            uploadFields();
        }
    }, [url]);

    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const uploadFields = () => {
        if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
            showToast("Invalid Email", "error");
            return;
        }
        fetch("/signup", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password,
                pic: url
            })
        }).then(res => res.json())
            .then(data => {
                if (data.error) {
                    showToast(data.error, "error");
                } else {
                    showToast(data.message, "success");
                    navigate("/signin");
                }
            });
    }

    const uploadPic = () => {
        const data = new FormData();
        data.append("file", image);
        data.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
        data.append("cloud_name", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);
        fetch(process.env.REACT_APP_CLOUDINARY_UPLOAD, {
            method: "post",
            body: data
        })
            .then(res => res.json())
            .then(data => {
                setUrl(data.url);
            })
            .catch(err => {
                console.log(err);
            });
    }

    const PostData = () => {
        if (image) {
            uploadPic();
        } else {
            uploadFields();
        }
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left side - Decorative/Brand section */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">
                <div className="flex flex-col justify-center items-center w-full text-white p-12">
                    <h1 className="font-poppins text-5xl font-bold mb-8">Instabyte</h1>
                    <p className="text-xl text-center mb-6">Join our community today!</p>
                    <div className="space-y-4 text-center">
                        <p className="text-lg">🌟 Share your amazing moments</p>
                        <p className="text-lg">👥 Connect with friends</p>
                        <p className="text-lg">💫 Discover inspiring content</p>
                    </div>
                </div>
            </div>

            {/* Right side - Sign up form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="max-w-md w-full space-y-8">
                    {/* Logo for mobile view */}
                    <div className="md:hidden text-center mb-8">
                        <h1 className="font-poppins text-4xl font-bold text-blue-600">Instabyte</h1>
                        <p className="mt-2 text-gray-600">Create your account</p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
                        <div>
                            <h2 className="font-poppins text-3xl font-bold text-gray-900 text-center">
                                Sign up
                            </h2>
                            <p className="mt-2 text-center text-sm text-gray-600">
                                Create an account to get started
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Profile Picture
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-150">
                                    <div className="space-y-2 text-center">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="mx-auto h-24 w-24 rounded-full object-cover ring-2 ring-blue-500"
                                            />
                                        ) : (
                                            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        )}
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span>Upload a photo</span>
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={(e) => {
                                                        setImage(e.target.files[0]);
                                                        setPreview(URL.createObjectURL(e.target.files[0]));
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={PostData}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                            >
                                Create account
                            </button>

                            <div className="text-center">
                                <Link
                                    to="/signin"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition duration-150"
                                >
                                    Already have an account? <span className="underline">Sign in</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;