import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import {Button, Icon, Card, Row, Col, Navbar, NavItem, CardTitle} from 'react-materialize';
import params from './../../../config/config';

class Sidebar extends Component {
    constructor(props) {
      super(props);
  
      this.state = {
        data: [],
      };
    }
    componentDidMount() {

          this.setState({
            data: [
                {
                    "id": 1,
                    "name": "Assets",
                    "link": "/",
                    "iconText": "filter",
                    "priority": 3
                },
                {
                    "id": 2,
                    "name": "Insights",
                    "link": "/Insights",
                    "iconText": "pie_chart",
                    "priority": 1
                },
                {
                    "id": 3,
                    "name": "Approve Assets",
                    "link": "/",
                    "iconText": "playlist_add_check",
                    "priority": 4
                },
                {
                    "id": 4,
                    "name": "Settings",
                    "link": "/",
                    "iconText": "settings",
                    "priority": 2
                }
            ]
          });

    }
    render() {
      return (
        <aside className="sidebar">
          {/* Sidebar Navigation Block */}
          <div id="sideNav" className="side-menu">
            <ul className="list">
              {this.state.data.map(function(item) {
                {
                  /* Sidebar Navigation Links  */
                }
                return (
                  <li key={item.id}>
                    <Link to={item.link} className="waves-effect waves-dark">
                      <i className="material-icons">{item.iconText}</i>
                      <p>{item.name}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      );
    }
  }
  
  export default Sidebar;
  