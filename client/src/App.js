import React, { useEffect, createContext, useReducer, useContext } from 'react'
import NavBar from './components/navbar';
import "./App.css"
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import Home from './components/screens/Home/Home';
import SignIn from './components/screens/SignIn/SignIn';
import Profile from './components/screens/Profile/profile';
import SignUp from './components/screens/SignUp/SignUp';
import CreatePost from './components/screens/CreatePost/CreatePost';
import UserProfile from './components/screens/UserProfile/UserProfile';
import SubscribedUserPosts from './components/screens/SubscribedUserPosts/SubscribedUserPosts'
import Reset from './components/screens/Reset/Reset'
import Newpassword from './components/screens/Newpassword/Newpassword'
import { initialState, reducer } from './reducer/userReducer'

export const UserContext = createContext()

const Routing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useContext(UserContext);  // Use context here instead

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    console.log("Routing - User from localStorage:", user)
    if (user) {
      dispatch({ type: "USER", payload: user })
    } else {
      if (!location.pathname.startsWith('/reset')) {
        navigate("/signin")
      }
    }
  }, [])

  return (
    <Routes>
      <Route exact path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route exact path="/profile" element={<Profile />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/createPost" element={<CreatePost />} />
      <Route path="/profile/:userid" element={<UserProfile />} />
      <Route path="/myfollowingpost" element={<SubscribedUserPosts />} />
      <Route exact path="/reset" element={<Reset />} />
      <Route path="/reset/:token" element={<Newpassword />} />
    </Routes>
  )
}

function App() {
  const [state, dispatch] = useReducer(reducer, null)  // Move state management here

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    console.log("App - Initial user load:", user)
    if (user) {
      dispatch({ type: "USER", payload: user })
    }
  }, [])

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      <BrowserRouter>
        <NavBar />
        <Routing />
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;