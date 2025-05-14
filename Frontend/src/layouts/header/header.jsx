import * as React from 'react'
import { Menu, Button } from 'antd'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'

import Logo from '../../../src/assets/images/maize.jpeg'
import UserLogo from '../../../src/assets/images/user.png'
import authActions from '../../pages/auth/auth-actions/auth-actions'
import SignIn from '../../pages/auth/SignIn'
import './header.css'

const { SubMenu } = Menu

export default function Header(props) {
  
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)

    const logout = () => {
        dispatch(authActions.toggleIsLoggedIn(false))
        navigate("/login")
    }
  // Render
  return isLoggedIn ? (
    <header style={{ display: 'flex' }}>
      <div className="header-left-group">
        <a href="/">
          <img src={Logo} className="header-logo"  style={{ height: 50, display: 'flex', alignItems: 'center' }}/>
        </a>
        <div className="header-pages-group">
         
        </div>
      </div>
      <Menu        
        mode="horizontal"
        theme="light"
        style={{
          position: 'absolute',
          right: 0,
          width: 440,
          height: 64,
          display: 'flex',
          justifyContent: 'right'
        }}
      > 
      <Menu.Item key="manage" style={{ color: '#096640', height: 68, display: 'flex', alignItems: 'center' }}>
            About us
          </Menu.Item>         
        <SubMenu
        key="sub1"
        title={
            <div style={{ height: 68, display: 'flex', alignItems: 'center' }}>
            <img src={UserLogo} alt="profile-icon" style={{ width: 28, height: 28 }} />
            </div>
        }
        id="help-button"
        >
        <div className="div-logout">                  
            <Button onClick={() => logout()} className="btn-logout" type="link">
                Log out
            </Button>
            </div>    
        </SubMenu>    
      </Menu>
    </header>
  ): null
}
