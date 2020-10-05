import React from 'react'
import { useHistory } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth0 } from '@auth0/auth0-react'

// Components
const handleLogout = async (event, auth0LogoutFun, history) => {
  event.preventDefault()
  try {
    await auth0LogoutFun()
    toast.success('Logout successful')
    history.push('/')
  } catch (err) {
    console.log(err)
    toast.error('Oops, something went wrong')
  }
}

const Logout = props => {
  const history = useHistory()
  const { isAuthenticated, logout } = useAuth0()

  if (isAuthenticated) {
    return (
      <div className="form-container">
        <div className="form-title"> Logout </div>
        <div className="form-text">
          Clicking logout will remove the session which essentially removes the token from the client, we can login
          again.
        </div>
        <div className="form">
          <div className="input-row margin-top-50">
            <button onClick={e => handleLogout(e, logout, history)} className={'logout align-right'}>
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="form-container">
        <div className="form-title"> Logout </div>
        <div className="form-text">To logout you first need to be logged in!</div>
      </div>
    )
  }
}

export default Logout
