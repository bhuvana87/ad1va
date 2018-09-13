import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import {Button, Icon, Card, Row, Col, Navbar, NavItem, CardTitle} from 'react-materialize';
import Header from '../shared/header/header.jsx';
import Sidebar from '../shared/sidebar/sidebar.jsx';
import Preloader from '../shared/preloader/preloader.jsx';

class Settings extends Component{
    render() {
        return(
        <div>
          <Preloader/>{/* Preloader */}
          <Header />{/* Header */}
          <Sidebar />{/* Sidebar */}
          
          {/* Main Content Block */}
          <main className="main-panel">
          <br/>
            <h5>Main Content - Settings</h5>
          </main>
        </div>
        );
    }
}

export default Settings;