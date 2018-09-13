import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import {Button, Icon, Card, Row, Col, Navbar, NavItem, CardTitle} from 'react-materialize';
import Header from '../shared/header/header.jsx';
import Sidebar from '../shared/sidebar/sidebar.jsx';
import Preloader from '../shared/preloader/preloader.jsx';
import Listing from './listing.jsx';
import AssetFilters from './assetFilters.jsx';
import params from "../../config/config";
import axios from "axios/index";

class Assets extends Component{
  constructor(props){
      super(props);
      this.state = {
         details: [],
         siteId:''
      }
  }

  componentWillMount(){
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(';');
      var userId = '';
      var self = this;
      console.log('cookie',ca);
      if(ca[0] != '' && ca[1] != '' ) {
          for (var i=0;i<ca.length;i++) {
              var cookieval = ca[i].split('=');
              if(cookieval[0] == " _userID" || cookieval[0] == "_userID" ) {
                  userId = cookieval[1]
              }
          }
          axios({
              method: 'get',
              url: params.metadataUrl+'/metadata/userdetails?username='+userId,
              withCredentials: true,
              crossDomain: true
          })
              .then(function (res) {
                  console.log('site data',res);
                  var corpId = res.data.response.corporateId;
                  var clusterId = res.data.response.clusters["0"].clusterId;
                  var siteId = res.data.response.clusters["0"].sites["0"].siteId;
                  localStorage.setItem('CorpId', corpId);
                  localStorage.setItem('ClusterId', clusterId);
                  localStorage.setItem('SiteId', siteId);
                  localStorage.setItem('UserId',userId);
                  self.setState({
                      siteId:siteId
                  })
              })

      }

  }
    render() {

        return(
        <div>
          <Preloader/>{/* Preloader */}
          <Header />{/* Header */}
          <Sidebar />{/* Sidebar */}
          
          {/* Main Content Block */}
          <main className="main-panel">
            <AssetFilters siteId={this.state.siteId}/>
          </main>
        </div>
        );
    }
}
export default Assets;