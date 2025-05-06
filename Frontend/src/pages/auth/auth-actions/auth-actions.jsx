const authActions = {
    FETCH_USER_DETAILS_REQUEST: 'FETCH_USER_DETAILS_REQUEST',
    FETCH_USER_DETAILS_SUCCESS: 'FETCH_USER_DETAILS_SUCCESS',
    SET_LOGIN_REQUEST: 'SET_LOGIN_REQUEST',
    SEND_CREATE_ACCOUNT_REQUEST: 'SEND_CREATE_ACCOUNT_REQUEST',
    SET_ACCOUNT_CREATION_KEY: 'SET_ACCOUNT_CREATION_KEY',
    SET_ACCOUNT_PASSWORD_RESET_KEY: 'SET_ACCOUNT_PASSWORD_RESET_KEY',
    SET_ACCOUNT_PASSWORD_FORGOT_KEY: 'SET_ACCOUNT_PASSWORD_FORGOT_KEY',
    RESEND_CREATE_ACCOUNT_EMAIL: 'RESEND_CREATE_ACCOUNT_EMAIL',
    SEND_FORGOT_PASSWORD_EMAIL: 'SEND_FORGOT_PASSWORD_EMAIL',
    SEND_RESET_PASSWORD_DETAILS: 'SEND_RESET_PASSWORD_DETAILS',
    SET_LOGOUT_REQUEST: 'SET_LOGOUT_REQUEST',
    SEND_APPROVE_ACCOUNT_REQUEST: 'SEND_APPROVE_ACCOUNT_REQUEST',
    SEND_APPROVE_ACCOUNT_SUCCESS: 'SEND_APPROVE_ACCOUNT_SUCCESS',
    fetchUserDetailsRequest: () => ({ type: authActions.FETCH_USER_DETAILS_REQUEST }),
    fetchUserDetailsSuccess: (userDetails) => ({
      type: authActions.FETCH_USER_DETAILS_SUCCESS,
      userDetails
    }),
    fetchLoginRequest: (login) => ({ type: authActions.SET_LOGIN_REQUEST, login }),
    fetchLogoutRequest: () => ({ type: authActions.SET_LOGOUT_REQUEST }),
    sendCreateAccountRequest: (accountDetails) => ({ type: authActions.SEND_CREATE_ACCOUNT_REQUEST, accountDetails }),
    setAccountCreationKey: (key) => ({ type: authActions.SET_ACCOUNT_CREATION_KEY, key }),
    setAccountPasswordResetKey: (key) => ({ type: authActions.SET_ACCOUNT_PASSWORD_RESET_KEY, key }),
    setAccountPasswordForgotKey: (key) => ({ type: authActions.SET_ACCOUNT_PASSWORD_FORGOT_KEY, key }),
    resendCreateAccountEmail: () => ({ type: authActions.RESEND_CREATE_ACCOUNT_EMAIL }),
    sendForgotPasswordEmail: (email) => ({ type: authActions.SEND_FORGOT_PASSWORD_EMAIL, email }),
    sendResetPasswordDetails: (uid, token, new_password1, new_password2) => ({
      type: authActions.SEND_RESET_PASSWORD_DETAILS,
      uid,
      token,
      new_password1,
      new_password2
    }),
    sendApproveAccountRequest: (key) => ({ type: authActions.SEND_APPROVE_ACCOUNT_REQUEST, key }),
    sendApproveAccountSuccess: () => ({ type: authActions.SEND_APPROVE_ACCOUNT_SUCCESS })
  }
  
  export default authActions
  