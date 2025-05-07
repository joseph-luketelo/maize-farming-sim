import authActions from '../auth-actions/auth-actions'

const initialState = {
  userDetails: {},
  accountCreationKey: '',
  accountPasswordResetKey: '',
  accountPasswordForgotKey: '',
  accountApprovalSuccess: false,
  isLoggedIn: false
}

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case authActions.FETCH_USER_DETAILS_SUCCESS:
      return { ...state, userDetails: action.userDetails }
    case authActions.SET_ACCOUNT_CREATION_KEY:
      return { ...state, accountCreationKey: action.key }
    case authActions.SET_ACCOUNT_PASSWORD_RESET_KEY:
      return { ...state, accountPasswordResetKey: action.key }
    case authActions.SET_ACCOUNT_PASSWORD_FORGOT_KEY:
      return { ...state, accountPasswordForgotKey: action.key }
    case authActions.SEND_APPROVE_ACCOUNT_SUCCESS:
      return { ...state, accountApprovalSuccess: true }
      case authActions.TOGGLE_IS_LOGGED_IN:
      return { ...state, isLoggedIn: action.value }
    default:
      return state
  }
}
