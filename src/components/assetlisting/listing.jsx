import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import {Button, Icon, Card, Row, Col, Navbar, NavItem, CardTitle, Modal} from 'react-materialize';
import params from './../../config/config';
import AssetFilters from './assetFilters.jsx';
import AssetDetails from './assetdetails.jsx';
import PreloadImage from 'react-preload-image';
import axios from 'axios';
import doSend from "./../common/commonUtils.jsx";
const _ = require("lodash")

class Listing extends Component {
    constructor(props) {

        super(props);
        this.state = {
            data: [],
            assetDocId: '',
            assetDBId: '',
            filterJson: [],
            fields: [],
            filterArray: [],
            arr: [],
            count: 0,
            oldarr: [],
            oldcount: 0,
            testing: '',
            selectedAssetCount: '',
            scrollId : '',
            totalAssetCount: ''
        };
        this.getAssetDocId = this.getAssetDocId.bind(this);
        this.selectAsset = this.selectAsset.bind(this);
        this.getAssetsOnScroll = this.getAssetsOnScroll.bind(this);
        this.resetValues = this.resetValues.bind(this);
        this.resetAssetValues = React.createRef();
        this.getTotalAssetsCount = this.getTotalAssetsCount.bind(this);
    }
    
    getAssetDocId(e) {
        this.setState({
            assetDocId: e.currentTarget.attributes['id'].value,
            assetDBId: e.currentTarget.attributes['dbId'].value
        });
    }

    renderAssetDetails() {
        return <AssetDetails assetDocId={this.state.assetDocId} assetDBId={this.state.assetDBId} defaultValues = {this.props.defaultValues} ref={this.resetAssetValues} />;
    }

    componentWillReceiveProps(props) {
        this.setState({
            testing: props
        });

        this.filterAssets();
    }
    getAssetsOnScroll(e)
    {   var self =this;
            const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
            var siteId = localStorage.getItem('SiteId');
            var corpId = localStorage.getItem('CorpId');
            if (bottom) {
                axios({
                    method: 'post',
                    url: params.acsServerUrl+"/api/acs/filterAssetsByScroll",
                    data: this.state.scrollId,
                    headers: {
                        "corp": corpId,
                        "site": siteId,
                        'Content-Length': 0,
                        'Content-Type': 'text/plain'
                    },
                    withCredentials: true,
                    crossDomain: true
                })
                    .then(function (response) {
                        if(response.data.data.length > 0) {
                            var arrAfterScroll = _.concat(self.state.data, response.data.data);
                            console.log('total Array', arrAfterScroll);
                            self.setState({
                                data: arrAfterScroll,
                                scrollId: response.data.scrollId
                            });
                        }
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
    }
    filterAssets() {
        var self = this;
        const fields = {};
        const arr = {};
        this.props.filterValues.map(function (option) {
            option.key = option.key.replace(/\s/g, '');
            if (!fields.hasOwnProperty(option.key)) {
                fields[option.key] = [];
                fields[option.key].push(option.value);
            }
            else {
                fields[option.key].push(option.value);
            }

        })

        arr['filters'] = [];
        $.each(fields, function (key, value) {
            if (!arr.hasOwnProperty(value)) {
                //change filters for all
                arr['filters'].push({
                    field: key,
                    values: value
                });
            }

        })

        var filters = {};
        filters['filters']=arr['filters'];
        var sortType= '';
        if(this.props.sortType == '' || this.props.sortType == 'DESC') {
            sortType = 'DESC'
        }
        else if(this.props.sortType == 'ASC'){
            sortType = "ASC"
        }
        var sortFields = 'created';
        console.log('sortFields',this.props.sortFields);
        if(this.props.sortFields == '' || this.props.sortFields == 'created')
            sortFields = 'created'
        else if(this.props.sortFields == 'dcount')
            sortFields = 'dcount'
        else if(this.props.sortFields == 'vcount')
            sortFields ='vcount'

        filters['sorts'] = [{
            "field": sortFields,
            "sortOrder": sortType
        }]

        var siteId = localStorage.getItem('SiteId');
        var corpId = localStorage.getItem('CorpId');
        var totalAssetCount = self.state.totalAssetCount;
        axios({
                    method: 'post',
                    url: params.acsServerUrl+'/api/acs/filterAssets',
                    data:  filters,
                    headers: {
                        "corp": corpId,
                        "site": siteId
                    },
                    withCredentials: true,
                    crossDomain: true
                })
            .then(function (response) {
                 console.log('data for assets', response.data.data);
                self.setState({
                    data: response.data.data,
                    scrollId : response.data.scrollId,
                    
                });
                setTimeout(function(){
                    $('.media-results').find('span.selected-assets').text(response.data.totalCount)
                },1000)
                arr['filters'] = '';
                self.setState({oldarr: self.state.arr});
                self.setState({count: self.state.count + 1});
                
                self.setState({
                    totalAssetCount: response.data.totalCount
                })
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    componentDidMount(props) {
        var filterJsonVal = $('.asset-listings').attr('selectedfilters');
        //console.log(this.props.filterOptions);
        $('#asset-detail').addClass('fullscreen');
        this.renderAssetDetails();

        var BucketName = 'jdvault-cloudfront';
        AWS.config.credentials = new AWS.Credentials("AKIAICWJGGJWNAQVAAVQ", "9iGK9Upy8tvhbXhnN9nP0WZqN4Yl5xOSDAH3fZ1p");
    }
    selectAsset(event){
        event.preventDefault();
        $(event.target).parent().find('.card-overlay').toggleClass('active');
        var selectedValueCount = $(event.target).parent().parent().find('.card-overlay.active').length;
        if(selectedValueCount >= 1){
            $('.action-bar').show();
        }
        else{
            $('.action-bar').hide();
        }
    }
    resetValues = () => {
        this.resetAssetValues.current.showInfo();
    };
    getTotalAssetsCount(){
        var self = this;
        alert(self.state.totalAssetCount)
        $('.media-results').find('.selected-assets').text(this.state.totalAssetCount);
    }
    render(props, ref) {
        console.log('data',this.state.data);
      return (
        <div className="asset-listings assets-thumbnail" onScroll={this.getAssetsOnScroll} >
        
          {/* Asset Listings Block */}
          {this.state.data.map(function(asset) {
              var s3 = new AWS.S3({
                  apiVersion: '2006-03-01',
                  region: 'ap-south-1',
                  params: {Bucket: 'jdvault-cloudfront',
                      ServerSideEncryption: "AES256"}
              });
              
              if (asset.thumbnail != null) {
                  const multiPartParams = {
                      Bucket: 'jdvault-cloudfront',
                      Key: asset.thumbnail[asset.pfv],
                  };
                  var thumbnailPath = asset.thumbnail.toString();
                  var assetFormat = thumbnailPath.substr(thumbnailPath.length - 3);
                  var url = s3.getSignedUrl("getObject", multiPartParams);
              }
            // Asset Card
            return (

              <div className="card animated small fadeInDown">
                {/* Card Overlay - Selection */}
                <div className="select" onClick={this.selectAsset}>
                    <label>
                      <input
                        type="checkbox"
                        className="filled-in"
                        name={ asset.thumbnail != null &&
                            asset.thumbnail[asset.pfv]
                        }
                      />
                    </label>
                  </div>
                <div className="card-overlay modal-trigger"  data-target="asset-detail" id={asset.docId} dbId={asset.dbId} key={asset.docId} onClick={this.getAssetDocId}> 
                </div>
                <div className="card-details">
                    {/* Card Image */}
                    <div className="card-image">
                        <img src={url} lazy duration="2000ms" style={{
                                        position: 'relative',
                                        width: '100%',
                                        height: '200px',
                                        backgroundColor: '#f7f7f7'
                                    }}/>
                    </div>
                    {/* Card Content */}
                    <div className="card-content">
                        <span className="asset-name truncate">{asset.title}</span>
                        <div className="right">
                            <span className="badge img-format">
                            {assetFormat}
                            </span>
                        </div>
                    </div>
                    {/* Card Action */}
                    <div className="card-action">
                        <span className="views">
                            <img
                            src="../../../src/assets/images/icons/view-icn.png"
                            alt="Views"
                            />
                            {asset.vcount}
                        </span>
                        <span className="downloads">
                            <img
                            src="../../../src/assets/images/icons/download-icn-sm.png"
                            alt="Downloads"
                            />
                            {asset.dcount}
                        </span>
                        <div className="right">
                            <a className="add-wishlist" />
                        </div>
                    </div>
                </div>
              </div>
            );
          }, this)}
            {/* Modal Popup */}
             <Modal id="asset-detail" className="fullscreen"
              modalOptions={{preventScrolling: true}}>
                <div className="modal-content">
                <div className="asset-details">
                    <div className="modal-close waves-effect" onClick={this.resetValues}>
                    <i className="material-icons">close</i>
                    </div>
                    {this.renderAssetDetails() }
                </div>
                </div>
            </Modal>
        </div>
      );
    }
  }

  export default Listing;
  