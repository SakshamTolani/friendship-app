//profile.js
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../App";
import "./profile.css";

const Profile = () => {
  const [mypics, setPics] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useContext(UserContext);
  const [image, setImage] = useState("");
  const [showUpdatePhoto, setShowUpdatePhoto] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    // Log the initial state
    console.log("Profile state:", state);

    if (!state) {
      setLoading(true);
      return;
    }

    // Initialize friends array if it doesn't exist
    if (!state.friends) {
      dispatch({
        type: "USER",
        payload: { ...state, friends: [] }
      });
    }

    if (state._id) {
      // Fetch user's complete data
      // fetch(`/user/${state._id}`, {
      //   headers: {
      //     Authorization: "Bearer " + localStorage.getItem("jwt"),
      //   },
      // })
      //   .then(res => res.json())
      //   .then(result => {
      //     if (result.user) {
      //       // Update the state with complete user data
      //       dispatch({
      //         type: "USER",
      //         payload: { ...result.user, friends: result.user.friends || [] }
      //       });
      //     }
      //   })
      //   .catch(err => console.error("Error fetching user data:", err));

      // // Fetch user posts
      // fetch("/mypost", {
      //   headers: {
      //     Authorization: "Bearer " + localStorage.getItem("jwt"),
      //   },
      // })
      //   .then((res) => res.json())
      //   .then((result) => {
      //     console.log("Posts result:", result);
      //     if (result.mypost) {
      //       setPics(result.mypost);
      //     }
      //     setLoading(false);
      //   })
      //   .catch((err) => {
      //     console.error(err);
      //     setLoading(false);
      //   });
      fetch(`/user/${state._id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      })
        .then(res => res.json())
        .then(result => {
          if (result.user) {
            dispatch({
              type: "USER",
              payload: { ...result.user, friends: result.user.friends || [] }
            });
            setPics(result.posts);
          }
          setLoading(false);
        })

      // Fetch friend requests
      fetch("/friend-requests", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      })
        .then((res) => res.json())
        .then((result) => {
          console.log("Friend requests:", result);
          setFriendRequests(result || []);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [state?._id]);

  useEffect(() => {
    if (image) {
      setPhotoUploading(true);
      const data = new FormData();
      data.append("file", image);
      data.append("upload_preset", "instagram");
      data.append("cloud_name", "sakshamtolani");
      fetch("https://api.cloudinary.com/v1_1/sakshamtolani/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          fetch("/updatepic", {
            method: "put",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
            body: JSON.stringify({
              pic: data.url,
            }),
          })
            .then((res) => res.json())
            .then((result) => {
              localStorage.setItem(
                "user",
                JSON.stringify({ ...state, pic: result.pic })
              );
              dispatch({ type: "UPDATEPIC", payload: result.pic });
              setPhotoUploading(false);
              setShowUpdatePhoto(false);
            });
        })
        .catch((err) => {
          console.error(err);
          setPhotoUploading(false);
        });
    }
  }, [image]);

  useEffect(() => {
    console.log("Current state:", state);
    console.log("Current friend requests:", friendRequests);
    console.log("Current posts:", mypics);
  }, [state, friendRequests, mypics]);

  const updatePhoto = (file) => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    setPhotoUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "instagram");
    data.append("cloud_name", "sakshamtolani");

    fetch("https://api.cloudinary.com/v1_1/sakshamtolani/image/upload", {
      method: "post",
      body: data,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data.url) {
          throw new Error("No URL received from Cloudinary");
        }

        return fetch("/updatepic", {
          method: "put",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("jwt"),
          },
          body: JSON.stringify({
            pic: data.url,
          }),
        });
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((result) => {
        if (!result.pic) {
          throw new Error("No picture URL in response");
        }

        localStorage.setItem(
          "user",
          JSON.stringify({ ...state, pic: result.pic })
        );
        dispatch({ type: "UPDATEPIC", payload: result.pic });
        setPhotoUploading(false);
        setShowUpdatePhoto(false);
      })
      .catch((err) => {
        console.error("Error uploading photo:", err);
        setPhotoUploading(false);
        // Add user feedback here
        alert("Failed to upload photo. Please try again.");
      });
  };

  const handleFriendRequest = (requestId, fromUserId, action) => {
    setLoading(true);
    fetch(`/${action}-friend-request`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        requestId,
        fromUserId
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        // Update friend requests
        setFriendRequests(prev =>
          prev.filter(request => request._id !== requestId)
        );

        // Update friends list from the response
        if (action === "accept") {
          dispatch({
            type: "USER",
            payload: { ...result, friends: result.friends || [] }
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
    setLoading(false);
  };

  if (!state || loading) {
    console.log("Rendering loader because:", { state, loading });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-text">Loading...</div>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-text">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header-gradient"></div>


      {showUpdatePhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Update Profile Photo</h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => updatePhoto(e.target.files[0])}
              className="mb-4"
            />
            {photoUploading && <p>Uploading...</p>}
            <button
              onClick={() => setShowUpdatePhoto(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="profile-content">
        <div className="profile-card">
          <div className="flex flex-col md:flex-row items-center">
            <div className="relative group -mt-24 mb-4 md:mb-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                <img
                  className="w-full h-full object-cover"
                  src={state ? state.pic : "loading"}
                  alt="profile"
                />
              </div>
              <button
                onClick={() => setShowUpdatePhoto(true)}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-110"
              >
                Update
              </button>
            </div>

            <div className="md:ml-10 text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-poppins text-3xl font-bold text-gray-900">
                    {state ? state.name : "loading"}
                  </h2>
                  <p className="text-gray-600 mt-1">{state ? state.email : "loading"}</p>
                </div>
                <button className="mt-4 md:mt-0 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200">
                  Edit Profile
                </button>
              </div>

              <div className="flex items-center justify-center md:justify-start space-x-8 mt-6">
                <div className="text-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                  <div className="text-2xl font-bold text-gray-900">{mypics.length}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
                <div className="text-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {Array.isArray(state?.friends) ? state.friends.length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Friends</div>
                </div>
                <div className="text-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {friendRequests.filter((req) => req.status === "pending").length}
                  </div>
                  <div className="text-sm text-gray-600">Pending Requests</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Friend Requests */}
        {friendRequests.length > 0 && (
          <div className="mb-8">
            <h4 className="font-poppins text-xl font-semibold mb-4">Pending Friend Requests</h4>
            <div className="space-y-4">
              {friendRequests.map((request) => (
                <div
                  key={request._id}
                  className="flex items-center justify-between bg-white rounded-lg shadow-md p-4"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      className="w-12 h-12 rounded-full object-cover"
                      src={request.from.pic}
                      alt={request.from.name}
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{request.from.name}</p>
                      <p className="text-sm text-gray-600">Status: {request.status}</p>
                    </div>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleFriendRequest(request._id, request.from._id, "accept")}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleFriendRequest(request._id, request.from._id, "reject")}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Posts */}
        <div className="mb-8">
          {mypics.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <h4 className="text-2xl font-semibold text-gray-900 mb-2">No Posts Yet</h4>
              <button
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                onClick={() => navigate("/createPost")}
              >
                Create Post
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {mypics.map((item) => (
                <div
                  key={item._id}
                  className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-w-1 aspect-h-1"
                >
                  <img
                    src={item.photo}
                    alt={item.title}
                    className="object-cover w-full h-full transform group-hover:scale-110 transition duration-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
