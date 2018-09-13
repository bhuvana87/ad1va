import React, { Component } from 'react';

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import Assets from './assetlisting/assetlisting.jsx';
import AssetDetails from './assetlisting/assetdetails.jsx';
import Insights from './insights/insights.jsx';
import ApproveAssets from './approve-assets/approveAssets.jsx';
import Settings from './settings/settings.jsx';
import doSend from './common/commonUtils.jsx'
import '../assets/css/styles.scss';
import axios from 'axios';
import params from '../config/config';
import { request } from 'https';
import { HashRouter } from 'react-router-dom';


class App extends Component{

    constructor(props){
        super(props);
        this.state = {
            responseCode: '',
            siteId:''
        }
    }
    componentDidMount(){
        const response = doSend('get', params.acsServerUrl+'/api/acs/health', null, null);
    }
    render() {
        return(
            //this.state.responseCode == 200 &&
            <Router>
                <div>
                    {/* Routing Configuration */}
                    <Switch>
                        {/*<HashRouter basename="/"/>*/}
                        <Route exact path='/' component={() => <Assets siteId={this.state.siteId} />}  />
                        {/*<HashRouter basename="/" component = {Assets}/>*/}
                        {/*<Link to="/Assets"/>*/}
                        <Route exact path='/Assets' component={Assets} />
                        <Route exact path='/AssetDetails' component={AssetDetails} />
                        <Route exact path='/Insights' component={Insights} />
                        <Route exact path='/ApproveAssets' component={ApproveAssets} />
                        <Route exact path='/Settings' component={Settings} />
                    </Switch>
                </div>
            </Router>
        );
    }
}

export default App;