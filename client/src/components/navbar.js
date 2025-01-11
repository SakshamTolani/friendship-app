import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { SearchIcon, XIcon, MenuIcon } from '@heroicons/react/outline';

const NavBar = () => {
  const { state, dispatch } = useContext(UserContext);
  const [search, setSearch] = useState('');
  const [userDetails, setUserDetails] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (state) {
      fetch('/friend-requests', {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      })
        .then(res => res.json())
        .then(requests => {
          setPendingRequests(requests.filter(req => req.status === 'pending').length);
        });
    }
  }, [state]);

  const renderList = () => {
    if (state) {
      return [
        {
          name: 'Search',
          icon: <SearchIcon className="h-5 w-5" />,
          onClick: () => setIsSearchOpen(true)
        },
        {
          name: 'Home',
          path: '/',
        },
        {
          name: 'Profile',
          path: '/profile',
          badge: pendingRequests > 0 ? pendingRequests : null
        },
        {
          name: 'Create Post',
          path: '/createPost'
        },
        {
          name: 'Log Out',
          onClick: () => {
            localStorage.clear();
            dispatch({ type: "CLEAR" });
            setUserDetails([]); // Clear search results
            setSearch(''); // Clear search input
            navigate("/signin");
          }
        }
      ];
    } else {
      return [
        {
          name: 'Login',
          path: '/signin'
        },
        {
          name: 'Signup',
          path: '/signup'
        }
      ];
    }
  };

  const fetchUsers = (query) => {
    setSearch(query);
    if (!query.trim()) {
      setUserDetails([]);
      return;
    }

    setIsSearching(true);

    fetch('/search-users', {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query
      })
    })
      .then(res => res.json())
      .then(results => {
        // Filter out the logged-in user by checking state._id
        const filteredResults = results.user.filter(
          user => user._id !== state._id
        );
        setUserDetails(filteredResults);
      })
      .catch(err => {
        console.error("Search error:", err);
        setUserDetails([]);
      })
      .finally(() => {
        setIsSearching(false);
      });
  };

  return (
    <>
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to={state ? "/" : "/signin"}
                className="text-xl sm:text-2xl font-bold text-[#6200ee]"
              >
                Instabyte
              </Link>
            </div>

            <div className="hidden md:flex md:items-center md:space-x-6">
              {renderList().map((item, index) => (
                item.path ? (
                  <Link
                    key={index}
                    to={item.path}
                    className="text-gray-700 hover:text-[#6200ee] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="text-gray-700 hover:text-[#6200ee] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    {item.name}
                  </button>
                )
              ))}
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-[#6200ee] hover:bg-gray-100 transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <XIcon className="block h-6 w-6" />
                ) : (
                  <MenuIcon className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {renderList().map((item, index) => (
                item.path ? (
                  <Link
                    key={index}
                    to={item.path}
                    className="relative text-gray-700 hover:text-[#6200ee] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    {item.name}
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-[#6200ee] hover:bg-gray-50 transition-colors duration-200"
                  >
                    {item.name}
                  </button>
                )
              ))}
            </div>
          </div>
        )}
      </nav>

      {isSearchOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => fetchUsers(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#6200ee] focus:ring focus:ring-[#6200ee] focus:ring-opacity-20 transition-colors duration-200"
                  />
                  <div className="mt-4 max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="search-spinner"></div>
                      </div>
                    ) : userDetails.length > 0 ? (
                      userDetails.map((item) => (
                        <Link
                          key={item._id}
                          to={`/profile/${item._id}`}
                          onClick={() => {
                            setIsProfileLoading(true); // Show loader
                            setIsSearchOpen(false);
                            setSearch('');
                            setUserDetails([])
                            // Set a small delay to show the loader before navigation
                            setTimeout(() => {
                              setIsProfileLoading(false); // Hide loader after delay
                            }, 1500); // Adjust time to match the profile loading time
                          }}
                          className="block px-4 py-2 hover:bg-gray-50 rounded-xl transition-colors duration-200"
                        >
                          <div className="flex items-center">
                            <img
                              src={item.pic}
                              alt={item.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <span className="ml-3 font-medium text-gray-900">{item.name}</span>
                          </div>
                        </Link>
                      ))
                    ) : search.length != 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <img
                          src="https://res.cloudinary.com/sakshamtolani/image/upload/v1736591256/ifghradhluaq9tyuwenw.png"
                          alt="No Results"
                          className="h-24 w-24 mb-4"
                        />
                        <p className="text-gray-500 text-sm">
                          No users found matching "<span className="font-bold">{search}</span>"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearch('');
                    setUserDetails([]);
                  }}
                  className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-[#6200ee] text-base font-medium text-white hover:bg-[#5000c9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6200ee] sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isProfileLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="search-spinner"></div>
        </div>
      )}

      <style jsx>{`
        .search-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #6200ee;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default NavBar;