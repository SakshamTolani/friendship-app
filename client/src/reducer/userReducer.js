export const initialState = null;

export const reducer = (state, action) => {
  switch (action.type) {
    case "USER":
      return {
        ...action.payload,
        friends: action.payload.friends || []
      };
    case "CLEAR":
      return null;
    case "UPDATEPIC":
      return {
        ...state,
        pic: action.payload
      };
    case "UPDATE_FRIENDS":
      return {
        ...state,
        friends: action.payload || []
      };
    default:
      return state;
  }
};