import React from 'react'

import { useAuth0 } from '@auth0/auth0-react'
import { toast } from 'react-toastify'

const Login = props => {
  const { isLoading, error, isAuthenticated, loginWithRedirect } = useAuth0()

  if (error) {
    toast.error(error)
  }
  if (isLoading) {
    return <div>Loading ...</div>
  } else if (!isAuthenticated) {
    return (
      <React.Fragment>
        <div className="form-container">
          <div className="form-title"> Login/Register</div>
          <div className="form-text">
            <div className="form-text-paragraphs">
              <p>
                In previous examples, the Login and Register tab contained a login/register form. We no longer need such
                a form since Auth0 provides us with a login form that supports credential-based login/signup as well as
                SSO out-of-the-box.
              </p>
            </div>
          </div>
          <div className="form-text">Click the Login button to get redirected to the Auth0 login form!</div>
          <div className="form-text">
            <button onClick={loginWithRedirect} className="login">
              Login
            </button>
          </div>
        </div>
      </React.Fragment>
    )
  } else {
    return (
      <div className="form-container">
        <div className="form-title"> Login </div>
        <div className="form-text">You are already logged in, logout first!</div>
      </div>
    )
  }
}

export default Login
