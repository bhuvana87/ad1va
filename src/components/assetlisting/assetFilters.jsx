import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { render } from 'react-dom';
import Listing from './listing.jsx';
import BulkAssetsPopup from './bulkAssetsPopup.jsx';
import {Button, Icon, Row, Col, Carousel, Chip, Collapsible, CollapsibleItem, Input, Dropdown, NavItem, Form, Modal} from 'react-materialize';
import params from './../../config/config';
import axios from 'axios';
import FileUploaderS3 from './../forms/fileuploaders3.jsx';
import _ from 'lodash';
import ShowBulkAssetPopUp from "./../common-functions/showBulkAssetPopup.jsx";

class AssetFilters extends Component{
    constructor(props) {
        super(props);
        this.state = {
          filterData: [],
          data: [],
          checked: false,
          isFilter: false,
          options: [],
          optionsSend: [],
          filterArray: [],
          filterField: '',
          optionsPair: [],
          filterOptArr: [],
          isActions: false,
          sortType:'',
          sortFields:'',
          isEditAsset: false,
          totalAssetCount: '',
          fieldVal: '',
          filterInputStatus: false
        };
        this.removeFilter = this.removeFilter.bind(this);
        this.bulkEdit = this.bulkEdit.bind(this);
        this.removeFilter = this.removeFilter.bind(this);
        this.sortTypes= this.sortTypes.bind(this);
        this.sortFields = this.sortFields.bind(this);
        this.deleteAssets = this.deleteAssets.bind(this);
        this.deleselectAssets = this.deleselectAssets.bind(this);
        this.totalCount = React.createRef();
        this.onUpdate = this.onUpdate.bind(this);
    }
    onChange(e) {
        const options = this.state.options;
        const optionsSend = this.state.optionsSend;
        const optionsPair = this.state.optionsPair;
        const filterArray = this.state.filterArray;
        const filterItem = this.state.filterItem;
        const filterField = this.state.filterField;
        const removeVal = '';
        var parent = e.target.getAttribute('parent');
        if (e.target.checked) {
            options.push(e.target.value);
            optionsSend.push({"key":parent,"value":e.target.value}); 
            $('.filter-values').fadeIn().addClass('active');
        }else {
            var val= options.indexOf(e.target.value);
            options.splice(val, 1);
            optionsPair.splice(val, 1);
            optionsSend.splice(val,1);
        }
        if(options.length == 0){
            $('.filter-values').fadeOut().removeClass('active');
        }
        this.setState({ options: options });
        this.setState({optionsPair: optionsPair});
        this.setState({
          isFilter: true,
        })
        const fields = {};
        const filterResponse = {};

        this.state.optionsSend.map(function(option){
        option.key = option.key.replace(/\s/g,'');
        if(!fields.hasOwnProperty(option.key))
        {
          fields[option.key] = [];
          fields[option.key].push(option.value);
        }
        else{
          fields[option.key].push(option.value);
        }
      })
    
      filterResponse['filters']=[];
      filterResponse['client'] = 'testclient';
      filterResponse['site'] = 'testsites';
      $.each(fields, function(key, value){
          console.log('********************///----')
          console.log(key + '------------------' + value);   
        if(! filterResponse.hasOwnProperty(value)){
          //change filters for all
          filterResponse['filters'].push({
              field: 'config.' + key,
              values: value
          });
        }
        
      })
      console.log(filterResponse)
      var self=this;
      }
    removeFilter(e){
        const removeval = e.target.getAttribute('filtername');
        $('.filter-options .dropdown-content').find('input[name="filter-'+ removeval + '"]').trigger('click');
    }
    bulkEdit(e){
        e.stopPropagation();
        e.preventDefault();
        var isEdit = true;
        var items = $('.card-overlay.active');
        var assetCount = $(items).length;
        $(items).each(function(index, value){
            var thumbnailPath = $(value).parent().find('.select input').attr('name');
            var dbId = $(value).attr('dbid');
            var esId = $(value).attr('id');
            var filenm = thumbnailPath.substring(thumbnailPath.lastIndexOf('/')+1);
            AWS.config.credentials = new AWS.Credentials("AKIAICWJGGJWNAQVAAVQ", "9iGK9Upy8tvhbXhnN9nP0WZqN4Yl5xOSDAH3fZ1p");
            var s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                region: 'ap-south-1',
                params: {Bucket: 'jdvault-cloudfront',
                    ServerSideEncryption: "AES256"}
            });
            const multiPartParams = {
                Bucket: 'jdvault-cloudfront',
                Key: thumbnailPath,
            };
            var url = s3.getSignedUrl("getObject", multiPartParams);
            var title = $(value).parent().find('.card-details .card-content').find('span.asset-name').html();
            ShowBulkAssetPopUp(thumbnailPath, filenm, url, title, isEdit, dbId, esId);
        });
        $('#selectedCount .selected,#selectedCount .results').text(assetCount);
        this.setState({
            isEditAsset: true
        })
    }
    deleteAssets(e){
        var items = $('.card-overlay.active');
        var deleteAssets = [];
        $(items).each(function(index, value){
            var dbId = $(value).parent().find('.card-overlay').attr('dbid');
            var docId = $(value).parent().find('.card-overlay').attr('id');
            var siteId = localStorage.getItem('SiteId');
            var corpId = localStorage.getItem('CorpId');
            axios({
                method: 'delete',
                url: params.acsServerUrl+"/api/acs/deleteAsset/"+dbId+"/"+docId,
                headers: {
                    "corp": corpId,
                    "site": siteId,
                },
                withCredentials: true,
                crossDomain: true
            })
                .then(function (response) {
                    console.log('Successfully Deleted',response);
                })
                .catch(function (error) {

                    console.log('Error In Deletion',error);

                });
            deleteAssets.push({"dbId": dbId, "docId": docId})
        })
        console.log('List of Deleted Assets',deleteAssets);
        
        window.Materialize.toast('Assets Deleted !', 1000, 'teal');
        setTimeout(function(){
            window.location.reload();   
        }, 500)
    }
    deleselectAssets(e){
        var items = $('.card-overlay.active');
        $(items).each(function(index, value){
            $(this).removeClass('active');
        })
        $('.action-bar').hide();
    }
    
    sortTypes(e){
        if(this.state.sortType == '' || this.state.sortType == 'DESC')
            this.setState({sortType : 'ASC'});
        else
            this.setState({sortType : 'DESC'});
    }
    sortFields(e){
        if( e.target.name == 'Date created')
            this.setState({sortFields : 'created'});
        else if(e.target.name == 'Most Downloaded')
            this.setState({sortFields : 'dcount'});
        else if(e.target.name == 'Most Viewed')
            this.setState({sortFields : 'vcount'});
        console.log('comes here',this.state.sortFields);

    }
    componentWillReceiveProps(props) {
        var self = this;
        var siteId = localStorage.getItem('SiteId');
        if(siteId == null){
            siteId = this.props.siteId;
        }
            axios({
                method: 'get',
                url: params.pbsServerUrl+'/templateConfig/'+siteId+'/VAULT',
                withCredentials: true,
                crossDomain: true
            })
                .then(function (response) {
                    self.setState({
                        data: response.data
                    });
                    console.log(self.state.data);
                    console.log('************************');
                })
                .catch(function (error) {
                    console.log(error);
                });
    }
    onUpdate = (val) => {
        this.setState({
          fieldVal: val,
        })
    };
    componentDidMount(){
            $('.dropdown.animPop').find('.dropdown-contents .dropdown-select li ').click(function(){
                var selectedSortVal = $(this).find('a').attr('name');
                $(this).parents().eq(3).find('.hover-link span').text(selectedSortVal);
                $(this).parents().eq(3).find('.dropdown-contents').slideUp();
            })
            $('.sort').click(function(){
                $(this).find('i.fas').toggleClass('fa-sort-amount-up', 'fa-sort-amount-down');
            })
    }
    render() {
        console.log('this one',this.state.data);
        const transitionOptions = {
            transitionName: "fade",
            transitionEnterTimeout: 500,
            transitionLeaveTimeout: 500
          }
      
        console.log('this one',this.state.sortFields);
        return(
        <div>
        
        {/* Assets Filters */}
        <section id="filters">
            <div className="filters-container">
                <div className="row">
                    <div className="col m6 no-padding-left">
                        <div className="filters">
                            <ul className="filter-options">
                                {
                                    _.map(this.state.data.templateFields, (filterData,key) =>{
                                        const filterArr = filterData.values;
                                        const tagItem = filterArr.map((value) =>
                                            <NavItem key={value} className="tag-item" >
                                                <a href="#">{value}</a>
                                            </NavItem>
                                        );
                                        const filterItem = filterArr.map((value) =>
                                            <li key={value}>
                                                <Input name={'filter-'+value} type='checkbox' value={value} label={value} className='filled-in' onChange={this.onChange.bind(this)} parent={key} />
                                            </li>
                                        );
                                        return  <Dropdown key={filterData.displayName} trigger={
                                            <Button><img src="../src/assets/images/icons/filter-icn.png" alt=""/> {filterData.displayName}</Button>
                                        } options={{belowOrigin: true, closeOnClick: false}}>
                                            {filterItem}
                                        </Dropdown>
                                    })

                                }
                            </ul>
                        </div>
                    </div>
                    <div className="col m6 no-padding-right right-align">
                        {/* <form className="createAssetForm" onClick={this.uploadAssets}> 
                            <a href="#" id="createAssetAnchor" className="btn btn-primary waves-effect waves-light">Create Asset</a>
                            <input name="createAssetInput" type="file" multiple className="hide" />
                        </form> */}
                        <FileUploaderS3 class="bulk-upload" />
                        {/* <FileUploader1 /> */}
                    </div>
                </div>
               
                {/* <!-- Media Filters -->   */}
                <div className="media-filters">
                    <div className="row">
                        <div className="col m6 no-padding-left">
                            <div className="media-results">
                                <span className="selected-assets">{this.state.totalAssetCount}</span>
                                <span className="total-assets"> matching results</span>
                            </div>
                            <div className="media-sort">
                                
                                <div className="order-by dropdown animPop once">
                                    <label>Order By</label>
                                    <a href="#" className="hover-link"><span>Date created</span> <i className="fa fa-caret-down"></i></a>
                                    <div className="dropdown-contents">
                                    <ul className="dropdown-menu auto dropdown-select" id="media-sort">
                                        <span className="arrow-up"></span>
                                        <li><a href="#" name="Date created" onClick={this.sortFields}><label>Order By</label> Date created</a></li>
                                        <li><a href="#" name="Most Downloaded" onClick={this.sortFields}><label>Order By</label> Most Downloaded</a></li>
                                        <li><a href="#" name="Most Viewed" onClick={this.sortFields}><label>Order By</label> Most Viewed</a></li>
                                    </ul>
                                    </div>
                                    <a href="#" title="Sort descending" className="sort" onClick={this.sortTypes}>
                                    <i className="fas fa-sort-amount-down"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="col m6 no-padding-right">
                        <div className="right">
                            <div className="bulk-actions right">
                            <div class="action-bar"  {...transitionOptions}>
                                {/* <a href="#" class="tooltipped" data-position="bottom" data-tooltip="View"><span class="actionEye"></span></a> */}
                                <a href="#" id="batchEdit" class="tooltipped" data-position="bottom" data-tooltip="Edit" onClick={this.bulkEdit}><span class="actionEdit"></span></a>
                                <a href="#" class="tooltipped" data-position="bottom" data-tooltip="Download"><span class="actionDownload"></span></a>
                                <a href="#" class="tooltipped" data-position="bottom" data-tooltip="Share"><span class="actionShare"></span></a>
                                <a href="#" className="tooltipped" data-position="bottom" data-tooltip="Delete" >
                                <Modal
                                    header={<Icon medium className="grey-text text-lighten-1">highlight_off</Icon>}
                                    className='confirm-delete small center-align'
                                    trigger={ <span className="actionDel"></span>}>
                                    <h3>Delete Assets</h3>
                                    <p>Are you sure you want to delete these assets? This process cannot be undone.</p>
                                    <a class="waves-effect waves-light btn btn-primary modal-close" onClick={this.deleteAssets}>Confirm</a><a class="waves-effect waves-light btn btn-grey modal-close" onClick={this.deleselectAssets}>Cancel</a>
                                </Modal>
                                </a>
                            </div>
                                <div className="select-all">
                                    <div className="dropdown animPop once">
                                        <a href="#" className='hover-link' id="select-value">
                                            <input type="checkbox" className="filled-in" />
                                            <span>Select</span>
                                            <i className="fa fa-caret-down"></i>
                                        </a>
                                        <div className="dropdown-contents" id="select-options">
                                            <ul className="dropdown-menu">
                                                <span className="arrow-up"></span>
                                                <li>
                                                <a href="#" name="All assets" className="select-all" id="select-all">
                                                    <span>Select all</span>
                                                    <label>200</label>
                                                </a>
                                                </li>
                                                <li>
                                                <a href="#" name="Visible assets" className="select-all" id="visible-assets">
                                                    <span>Select visible assets</span>
                                                    <label>44</label>
                                                </a>
                                                </li>
                                                <li>
                                                <a href="#" name="Select" id="select-none">
                                                    <span>Select none</span>
                                                </a>
                                                </li>
                                            </ul>
                                        </div>
                                        </div>
                                </div>
                            <div className="grid-options">
                            <a href="#" className="tooltipped active" id="assets-thumbnail" data-position="bottom" data-tooltip="Thumbnail"><i className="fas fa-th"></i></a>
                            <a href="#" className="tooltipped" id="assets-large" data-position="bottom" data-tooltip="Large"><i className="fas fa-th-large"></i></a>
                            <a href="#" className="tooltipped" data-position="bottom" data-tooltip="Detail"><i className="fas fa-th-list"></i></a>
                            </div>
                            <div className="quick-views dropdown animPop once">
                            <a href="#" className='hover-link'><i className="material-icons">more_vert</i></a>
                            <div className="dropdown-contents dropdown-right">
                                <ul className="dropdown-menu" id="quickview-links">
                                <span className="arrow-up"></span>
                                <li><a href="#"><i className="far fa-heart"></i> Wishlist</a></li>
                                <li><a href="#"><i className="fas fa-search"></i> Saved Searches</a></li>
                                </ul>
                            </div>
                            </div>
                        </div>
                        </div>
                        </div>
                    </div>
                </div>
                {/* <!-- Filter Values --> */}
                <div className="filter-values">
                {
                    this.state.options.map(function(filterOption){
                        return <div className="filter-item selected-filters" id={filterOption} key={filterOption+'Filter'}>
                                    <i className="fas fa-filter"></i>
                                    <span className="filter-text">{filterOption}</span>
                                    <a href="#" className="remove-filter" onClick={this.removeFilter}><i className="material-icons" filtername={filterOption}>clear</i></a>
                                </div>
                    }, this)
                }
                    {/* <div className="filter-item">
                        <span className="filter-text">Clear Filters</span>
                        <a href="#" className="clear-filters remove-filter"><i className="material-icons" >clear</i></a>
                    </div>
                    <div className="filter-item modal-trigger" >
                        <i className="far fa-save"></i>
                        <span className="filter-text">Save Filters</span>
                    </div> */}
                </div>
            </div>
        </section>
        {/* Assets listings section */}
        <section id="assets">
            <Listing filterValues={this.state.optionsSend} defaultValues ={this.state.data.templateFields} defaultMediaValues={this.state.mediaTypeValues} sortType={this.state.sortType} sortFields={this.state.sortFields}  onUpdate={this.onUpdate} />
        </section>
         {/* <!-- file popup --> */}
         <BulkAssetsPopup isEdit={this.state.isEditAsset} templateFields={this.state.data} />
        </div>
        );
    }
}

export default AssetFilters;