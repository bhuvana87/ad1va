import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {Button, Icon, Card, Row, Col, Navbar, NavItem, CardTitle} from 'react-materialize';
import params from './../../../config/config';
import Dropdown from './../../forms/dropdown.jsx';

class Header extends Component{
    constructor(props) {
        super(props);
        
        this.state = {
            logo: [],
            applinks: []
        };

        this.logout = this.logout.bind(this);
        this.deleteCookie = this.deleteCookie.bind(this);

    }

     deleteCookie(name) {
        document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;Domain=.2adpro.com';
    }

    logout(e){

        axios({
            method: "POST",
            url:params.acsServerUrl+"/logout",
            withCredentials: true,
            crossDomain: true
        } )
            .then( (response) => {

                var cookies = document.cookie.split(";");
                for (var i = 0; i < cookies.length; i++){
                    console.log(cookies[i].split("=")[0]);
                    this.deleteCookie(cookies[i].split("=")[0]);

                }
                localStorage.clear();
                window.location = params.ssoLogingUrl + '?gotoUrl=' + window.location.href;


            })

    }
    componentDidMount(){

            this.setState({
                logo:[{
                    "corpId": 1,
                    "name": "Newscorp",
                    "imageUrl": "https://newscorpcom.files.wordpress.com/2014/05/news_corp_logo.jpg"
                }]
            });


                this.setState({
                    applinks: [
                        {
                            "id": 1,
                            "iconName": "apps",
                            "type" : "dropdown",
                            "menu": [
                                {
                                    "id": 1,
                                    "name": "JD",
                                    "link": "https://jdvault-nextgen.netlify.com/jdvault/dashboard.html"
                                },
                                {
                                    "id": 2,
                                    "name": "JD Flow",
                                    "link": "https://jdvault-nextgen.netlify.com/jdvault/dashboard.html"
                                },
                                {
                                    "id": 3,
                                    "name": "JD Traffic",
                                    "link": "https://jdvault-nextgen.netlify.com/jdvault/dashboard.html"
                                }
                            ]
                        }
                    ]
                });


        $('.menu-link').click(function(){
            $('body').toggleClass('sidebar-mini');
        });
    }

    render() {
        return(
        <div>
          {/* Top Navigation */}
           <Navbar>
                <div className="nav-wrapper">
                    {/* Collapsible Menu Link */}
                    <ul className="left hide-on-med-and-down">
                        <li>
                            <a href="#" className="menu-link center-align waves-effect waves-light">
                                <i className="material-icons">menu</i>
                            </a>
                        </li>
                    </ul>
                    {/* Logo */}
                    <div className="brand-logo">
                    {
                        this.state.logo.map(function (logo) {
                            return  <Link key={logo.corpId} to="/" className="left-align">
                                        <img src={logo.imageUrl} alt={logo.name} />
                                    </Link>
                        })
                    }
                    </div>
                    {/* Navigation - Right Menu */}
                    <ul className="right hide-on-med-and-down">
                        <li>
                            {/* Search Block */}
                            <div className="search-container">
                                <div className="search">
                                    <div className="input-field clearable">
                                        <i className="material-icons prefix">search</i>
                                        <input placeholder="Search" id="search" type="text" className="validate"  />
                                        <i className="material-icons search-clear">clear</i>
                                    </div>
                                    <div className="search-dropdown">
                                        <span className="arrow-up"></span>
                                        <div className="search-results" id="search-listing">
                                            <ul className="collection dropdown-list">
                                                <li className="collection-header">
                                                    <h5>
                                                        <i className="material-icons  grey-text text-lighten-1">image_aspect_ratio</i>
                                                        Results for Car
                                                        <label>15</label>
                                                    </h5>
                                                </li>
                                                <li className="collection-item avatar">
                                                    <a href="#">
                                                        <div className="avatar-img">
                                                            <img src="./../../../src/assets/images/car-icn.png" alt="" />
                                                        </div>
                                                        <span className="title">Stockphoto of Cars</span>
                                                        <label>JPG</label>
                                                    </a>
                                                </li>
                                                <li className="collection-item avatar">
                                                    <a href="#">
                                                        <div className="avatar-img">
                                                            <img src="./../../../src/assets/images/car-icn.png" alt="" />
                                                        </div>
                                                        <span className="title">Honda Amaze, Honda Jazz</span>
                                                        <label>JPG</label>
                                                    </a>
                                                </li>
                                                <li className="collection-item avatar">
                                                    <a href="#">
                                                        <div className="avatar-img">
                                                            <img src="./../../../src/assets/images/car-icn.png" alt="" />
                                                        </div>
                                                        <span className="title">Chevrolet Beat</span>
                                                        <label>PNG</label>
                                                    </a>
                                                </li>
                                                <li className="collection-item avatar">
                                                    <a href="#">
                                                        <div className="avatar-img">
                                                        <img src="./../../../src/assets/images/car-icn.png" alt="" />
                                                        </div>
                                                        <span className="title">Toyoto Innova</span>
                                                        <label>GIF</label>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        {/* Apps Dropdown */}
                        <li>{
                            this.state.applinks.map(function (link) {
                                return <Dropdown name={link.iconName} key={link.id} appsdropdown={link.menu} />
                            })
                        }</li>
                        {/* Notifications */}
                        <li>
                            <a href="#"><i className="material-icons">notifications_none</i></a>
                        </li>
                        {/* Profile Dropdown */}
                        <li className="dropdown">
                            <a href="#" className='hover-link'>
                            <img src="./../../../src/assets/images/avatar.jpg" alt="User" className="profile-img" />
                            </a>
                            <div className="dropdown-contents mt10 dropdown-right">
                                <span className="arrow-up"></span>
                            <ul className="dropdown-menu" >
                                <li className="header"><i className="fas fa-user"></i> Mukesh Bhavsar</li>
                                <li><a href="#"><i className="fas fa-pencil-alt"></i> Edit Profile</a></li>
                                <li><a href="#"><i className="fas fa-globe"></i> Language</a></li>
                                <li className="footer"><a onClick={this.logout}  className="btn btn-primary waves waves-light">Logout</a></li>
                            </ul>
                        </div>
                        </li>
                    </ul>

                </div>
            </Navbar>
        </div>
        );
    }
}

export default Header;