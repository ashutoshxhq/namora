import { SET_SHOW } from "./actionTypes";

export function notificationReducer(state: any, action: any) {
  switch (action.type) {
    case SET_SHOW:
      return {
        ...state,
        isShow: action.isShow,
        title: action.title,
        description: action.description,
        status: action.status,
      };
    default: {
      return state;
    }
  }
}
