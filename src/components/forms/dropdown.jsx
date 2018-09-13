import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import {Button, Icon, Card, Row, Col, Navbar, NavItem, CardTitle} from 'react-materialize';

class Dropdown extends Component{
    constructor(props) {
        super(props);
    }
    componentDidMount(){
        $('.menu-link').click(function(){
            $('body').toggleClass('sidebar-mini');
        });
        $('.dropdown').hover(function() {
            $(this).find('.dropdown-contents').stop(true, true).delay(200).slideDown(200);
        }, function() {
            $(this).find('.dropdown-contents').stop(true, true).delay(200).slideUp(200);
        });
    }
    render() {
       
        return(
                <div className="dropdown">
                    <a href="#" className='hover-link'><i className="material-icons">{this.props.name}</i></a>
                    <div className="dropdown-contents">
                        <span className="arrow-up"></span>
                        <ul className="dropdown-menu" >
                            {this.props.appsdropdown.map((menu) => <li key={menu.id}><Link to="/" target="_blank">{menu.name}</Link></li>)}
                        </ul>
                    </div>
                </div>
        );
    }
}

export default Dropdown;