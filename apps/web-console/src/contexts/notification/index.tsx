import { createContext, useContext, useReducer } from "react";
import { notificationReducer } from "./reducer";
import { TNotificationState, TNotificationStoreProvider } from "./types";
import { SET_SHOW } from "./actionTypes";

const storeContext = createContext<any>({});
const dispatchContext = createContext<any>({});

export const initialAppState: TNotificationState = {
  isShow: false,
  title: "",
  description: "",
  status: "",
};

export const NotificationStoreProvider = ({
  children,
}: TNotificationStoreProvider) => {
  const [state, dispatch] = useReducer(notificationReducer, initialAppState);

  const hideNotification = () => {
    dispatch({
      type: SET_SHOW,
      isShow: false,
      title: "",
      description: "",
      status: "",
    });
  };

  const showNotification = ({ title = "", description = "", status = "" }) => {
    dispatch({
      type: SET_SHOW,
      isShow: true,
      title,
      description,
      status,
    });
  };

  const dispatches = {
    showNotification,
    hideNotification,
  };

  return (
    <dispatchContext.Provider value={{ ...dispatches }}>
      <storeContext.Provider value={state}>{children}</storeContext.Provider>
    </dispatchContext.Provider>
  );
};

export const useNotificationStore = () => {
  const _storeContext = useContext(storeContext);
  if (!_storeContext) {
    throw new Error(`Components cannot be used outside the context`);
  }
  return _storeContext;
};

export const useNotificationDispatch = () => {
  const _dispatchContext = useContext(dispatchContext);
  if (!_dispatchContext) {
    throw new Error(`Components cannot be rendered outside the context`);
  }
  return _dispatchContext;
};
