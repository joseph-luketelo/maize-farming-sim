import { all, call, put, takeLatest, select } from 'redux-saga/effects'
import { notification } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { datadogLogs } from '@datadog/browser-logs'
import authActions from '../auth-actions/auth-actions'
import requestObj from '../../../utils/request/request'

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

export function* fetchUserDetails() {
  try {
    const currentUser = yield call(requestObj.request, '/api/user/current')
    yield put(authActions.fetchUserDetailsSuccess(currentUser))
    const userTourInfo = yield call(requestObj.request, '/api/fdeprofile/current')
  } catch (error) {
    console.log('error')
    datadogLogs.logger.error('Auth-Sagas.js: fetchUserDetails', {}, error)

    return
  }
}

export function* login(loginInfo) {
  console.log("PATIKANA")
  const csrftoken = getCookie('csrftoken')
  try {
    yield call(requestObj.request, '/rest-auth/login/', {
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/json;charset=UTF-8'
      },
      method: 'POST',
      body: JSON.stringify(loginInfo.login)
    })
    yield put(authActions.fetchUserDetailsRequest())
  } catch (error) {
    notification.open({
      message: <div className="api-error-notification-message">Error</div>,
      description: (
        <div className="api-error-notification-description">
          Unable to login. Username or Password are either not correct or the account does not exist. Please try again.
          If issues persist, please contact our help desk.
        </div>
      ),
      icon: <ExclamationCircleOutlined style={{ color: '#AC1C1E' }} />,
      duration: 5,
      className: 'api-error-notification'
    })
    return
  }
}

export function* createAccount(accountDetails) {
  const csrftoken = getCookie('csrftoken')
  const url = '/rest-auth/registration/'
  const options = {
    headers: {
      'X-CSRFToken': csrftoken,
      'Content-Type': 'application/json;charset=UTF-8'
    },
    method: 'POST',
    body: JSON.stringify(accountDetails.accountDetails)
  }

  // try {
  const response = yield fetch(url, options)
  const data = yield response.json()

  // Handle Errors for Username and Email
  if ('email' in data && 'username' in data) {
    return notification.open({
      message: <div className="api-error-notification-message">Error</div>,
      description: (
        <div className="api-error-notification-description">
          Unable to create an account. Please make sure you have entered a valid email address and unique Username. If
          the issue persists, please contact support.
        </div>
      ),
      icon: <ExclamationCircleOutlined style={{ color: '#AC1C1E' }} />,
      duration: 5,
      className: 'api-error-notification'
    })
  }

  // Handle Errors for Username
  if ('username' in data) {
    return notification.open({
      message: <div className="api-error-notification-message">Error</div>,
      description: (
        <div className="api-error-notification-description">
          Unable to create an account. An account with this username already exists. If the issue persists, please
          contact support.
        </div>
      ),
      icon: <ExclamationCircleOutlined style={{ color: '#AC1C1E' }} />,
      duration: 5,
      className: 'api-error-notification'
    })
  }

  // Handle Errors for Username
  if ('email' in data) {
    return notification.open({
      message: <div className="api-error-notification-message">Error</div>,
      description: (
        <div className="api-error-notification-description">
          Unable to create an account. An account with this email already exists. If the issue persists, please contact
          support.
        </div>
      ),
      icon: <ExclamationCircleOutlined style={{ color: '#AC1C1E' }} />,
      duration: 5,
      className: 'api-error-notification'
    })
  }

  if (data?.detail === 'Verification e-mail sent.') {
    yield put(authActions.setAccountCreationKey(accountDetails.accountDetails.email))
  }
}

export function* resendCreateAccountEmail() {
  const csrftoken = getCookie('csrftoken')
  try {
    const accountCreationKey = yield select((state) => state.auth.accountCreationKey)
    yield call(requestObj.request, '/rest-auth/registration/resend-email/', {
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/json;charset=UTF-8'
      },
      method: 'POST',
      body: JSON.stringify({ email: accountCreationKey })
    })
    notification.open({
      message: <div>Success</div>,
      description: (
        <div className="api-error-notification-description">An email has been sent. Please check your inbox.</div>
      ),
      duration: 5,
      className: 'api-error-notification'
    })
  } catch (error) {
    notification.open({
      message: <div className="api-error-notification-message">Error</div>,
      description: (
        <div className="api-error-notification-description">
          An error occured. Please try again. If the problem persist, please contact our help desk.
        </div>
      ),
      icon: <ExclamationCircleOutlined style={{ color: '#AC1C1E' }} />,
      duration: 5,
      className: 'api-error-notification'
    })
  }
}
export function* sendForgotPasswordEmail(email) {
  try {
    const response = yield call(requestObj.request, '/rest-auth/password/reset/', {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      method: 'POST',
      body: JSON.stringify({ email: email.email })
    })
    if (response?.detail === 'Password reset e-mail has been sent.') {
      yield put(authActions.setAccountPasswordForgotKey(email))
    }
  } catch (error) {
    notification.open({
      message: <div className="api-error-notification-message">Error</div>,
      description: (
        <div className="api-error-notification-description">
          An error occured. Please try again. If the problem persist, please contact our help desk.
        </div>
      ),
      icon: <ExclamationCircleOutlined style={{ color: '#AC1C1E' }} />,
      duration: 5,
      className: 'api-error-notification'
    })
  }
}

export function* resetPassword(props) {
  try {
    const response = yield call(requestObj.request, '/rest-auth/password/reset/confirm/', {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      method: 'POST',
      body: JSON.stringify({
        uid: props.uid,
        token: props.token,
        new_password1: props.new_password1,
        new_password2: props.new_password2
      })
    })
    if (response?.detail === 'Password has been reset with the new password.') {
      yield put(authActions.setAccountPasswordResetKey(props.token))
    }
  } catch (error) {
    notification.open({
      message: <div className="api-error-notification-message">Error</div>,
      description: (
        <div className="api-error-notification-description">
          An error occured. Please try again. If the problem persist, please contact our help desk.
        </div>
      ),
      icon: <ExclamationCircleOutlined style={{ color: '#AC1C1E' }} />,
      duration: 5,
      className: 'api-error-notification'
    })
  }
}

export function* logout() {
  const csrftoken = getCookie('csrftoken')
  try {
    yield call(requestObj.request, '/rest-auth/logout/', {
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/json;charset=UTF-8'
      },
      method: 'POST',
      body: JSON.stringify()
    })
    localStorage.clear()
    window.location.href = '/data-explorer/'
  } catch (error) {
    console.log(error)
    datadogLogs.logger.error('Auth-Sagas.js: logout', {}, error)
    return
  }
}

export function* sendApproveAccountRequest(key) {
  const csrftoken = getCookie('csrftoken')
  try {
    const response = yield call(requestObj.request, '/rest-auth/registration/verify-email/', {
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/json;charset=UTF-8'
      },
      method: 'POST',
      body: JSON.stringify({ key: key.key })
    })
    if (response) {
      yield put(authActions.sendApproveAccountSuccess())
    }
  } catch (error) {
    notification.open({
      message: <div className="api-error-notification-message">Error</div>,
      description: (
        <div className="api-error-notification-description">
          An error occured. Please try again. If the problem persist, please contact our help desk.
        </div>
      ),
      icon: <ExclamationCircleOutlined style={{ color: '#AC1C1E' }} />,
      duration: 5,
      className: 'api-error-notification'
    })
  }
}

export function* authSagas() {
  yield all([
    takeLatest(authActions.FETCH_USER_DETAILS_REQUEST, fetchUserDetails),
    takeLatest(authActions.SET_LOGIN_REQUEST, login),
    takeLatest(authActions.SET_LOGOUT_REQUEST, logout),
    takeLatest(authActions.SEND_CREATE_ACCOUNT_REQUEST, createAccount),
    takeLatest(authActions.RESEND_CREATE_ACCOUNT_EMAIL, resendCreateAccountEmail),
    takeLatest(authActions.SEND_FORGOT_PASSWORD_EMAIL, sendForgotPasswordEmail),
    takeLatest(authActions.SEND_RESET_PASSWORD_DETAILS, resetPassword),
    takeLatest(authActions.SEND_APPROVE_ACCOUNT_REQUEST, sendApproveAccountRequest)
  ])
}
