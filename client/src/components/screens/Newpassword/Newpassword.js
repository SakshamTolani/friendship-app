import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const NewPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const { token } = useParams();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const PostData = async () => {
        try {
            const response = await fetch("/new-password", {
                method: "post",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    password,
                    token
                })
            });
            const data = await response.json();
            
            if (data.error) {
                setError(data.error);
                setTimeout(() => setError(""), 3000);
            } else {
                setSuccess(data.message);
                setTimeout(() => {
                    setSuccess("");
                    navigate("/signin");
                }, 2000);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            setTimeout(() => setError(""), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
                    Instabyte
                </h1>
                
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}
                    
                    {success && (
                        <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                            <p className="text-green-700">{success}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label 
                                htmlFor="password" 
                                className="block text-sm font-medium text-gray-700"
                            >
                                New Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <button
                            onClick={PostData}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                            Update Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewPassword;