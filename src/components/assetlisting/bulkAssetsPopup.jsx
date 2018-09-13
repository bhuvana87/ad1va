import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { render } from 'react-dom';
import Listing from './listing.jsx';

import {Button, Icon, Row, Col, Carousel, Chip, Collapsible, CollapsibleItem, Input, Form, Dropdown, NavItem} from 'react-materialize';
import MultiSelectAssetDropdown from './../forms/multiSelectAssetDropdown.jsx';
import params from './../../config/config';
import axios from 'axios';
import { WithContext as ReactTags } from 'react-tag-input';
import TextArea from './../forms/textarea.jsx';

const KeyCodes = {
    comma: 188,
    enter: 13,
  };
  const delimiters = [KeyCodes.comma, KeyCodes.enter];
class BulkAssetsPopup extends Component{
    constructor(props) {
        super(props);
        this.state={
            data: [],
            mediadata: [],
            savedData: [],
            tags: [],
            suggestions: [],
            selectedAssets: [],
            selectionValue:'',
            savedDataResponse: '',
            isAssetEdit: false,
            dbId:'',
            esId:''
        }
        this.handleDelete = this.handleDelete.bind(this);
        this.handleAddition = this.handleAddition.bind(this);
        this.getAssetData = this.getAssetData.bind(this);
        this.resetValues = this.resetValues.bind(this);
        this.textInput = React.createRef();
        this.toggleDataFields - this.toggleDataFields.bind(this);
    }
    handleSelectionChange = e => this.setState({ value: e.target.value });
    handleDelete = (i) =>{
        const { tags } = this.state;
        this.setState({
         tags: tags.filter((tag, index) => index !== i),
        });
    }
    handleAddition = (tag) =>{
        this.setState(state => ({ tags: [...state.tags, tag] }));
    }
   
    toggleDescriptionField = (event) => {
        var parent = event.target.parentNode;
        $(event.target).toggleClass('active');
        var thumbnailBlock = $(parent).parents().eq(4).find('.fileListSide .card');
        $.each($(thumbnailBlock), function(index, val){
            var contentPath = $(val).find('.card-content');
            if($(event.target).hasClass('active')){
                contentPath.append('<TextArea placeholder="Description goes here" class="asset-description" />');
            }
            else{
                contentPath.find('.asset-description').remove();
            }
        });
    }
    
    toggleDataFields = (event) => {
        var parent = event.target.parentNode;
        $(event.target).toggleClass('active');
        var parentField = $(parent).attr('field');
        var label = $(parent).find('span').text();
        var thumbnailBlock = $(parent).parents().eq(4).find('.fileListSide .card');
        var self = this;
        $.each($(thumbnailBlock), function(index, val){
            var contentPath = $(val).find('.card-content');
            if($(event.target).hasClass('active')){
                contentPath.append('<div class="optional-field '+parentField+'"><ul className="collapsible multiDropdownTag" id="'+parentField+index+'"></ul></div>');
                const defaultValues = self.state.data.templateFields[parentField].values;
                ReactDOM.render(<MultiSelectAssetDropdown icon="info_outline" placeholder="" label={label} value="" disabled="" selectedValues="" defaultValues={defaultValues} fieldValue={parentField+index + '-data'} class="multiselect" />, document.getElementById(parentField+index));
            }
            else{
                contentPath.find("."+parentField).remove();
            }
        });
    }

    componentWillReceiveProps(props){
        console.log('props',props)
       this.setState({
           isAssetEdit: props.isEdit,
           dbId:props.dbId,
           esId:props.esId,
           data:props.templateFields
       })
    }
    resetValues(e){
        var parent = e.target.parentNode;
        this.setState({
            isAssetEdit: false
        })
        $(parent).parents().eq(1).find('textarea[name="fileUploadDesc"]').val('');
        $(parent).parents().eq(1).find('.ReactTags__selected .ReactTags__tag').remove();
        $("#uploadFileForm").find('.pmWrap').html('');
    }
    getAssetData = (event) => {
        var parent = event.target.parentNode;
        var thumbnailBlock = $(parent).parents().eq(1).find('.fileListSide .card');
        var thumbNailBlockInput = $(thumbnailBlock).find('.card-overlay.active').parent();
        const thumbnailData = [];
        const thumbnailEditedData = [];
        const tagsData = [];
        const savedData = {};
        const editedData = {};
        var urls = [];
        savedData['config'] = {};
        editedData['config'] = {};
        savedData['description'] = [];
        savedData['tags'] = [];
        savedData['source'] = "Source Type";
        var flag = 0;
        var listCount = 0;
        var description = $(parent).find('textarea[name="fileUploadDesc"]').val();
        if(description != ''){
            editedData['description'] = [];
            editedData['description'] = description;
        }else{
            Materialize.toast('Please Enter a Description!', 1000 , 'red');
          //  alert('Please Enter a Description');
            flag++;
            return false;
        }
        savedData['description'] = description;  
        $.each($(parent).find('.collapsible.multiDropdownTag li'), function(i,v){
            var selectedField = $(v).find('.collapsible-header').attr('field');
            var selectedFieldText = $(v).find('.collapsible-header span').text();
            var selectedValues = [];
            //todo : get each input field and validate
                $(this).find('input[type="checkbox"]:checked').map(function () {
                    var selVal = $(this).val();
                    selectedValues.push(selVal);
                    listCount++;
                });
            if(selectedField != 'tags')
                if(selectedValues == ''){
                    // alert('Select a value from ' + selectedFieldText);
                    window.Materialize.toast('Select a value from ' + selectedFieldText, 1000, 'red');
                    flag++;
                    return false;
                }
                if(selectedValues.length > 0){
                    editedData['config'][selectedField]= selectedValues;
                }
                savedData['config'][selectedField]= selectedValues;
        })
        // if(listCount <= 3) {
        //     window.Materialize.toast('Please Select an Item from the List !', 2000, 'red');
        //     flag++;
        //     return false;
        // }
              
        var tagsCount = this.state.tags.length;
        $.each(this.state.tags, function(k, v){
            savedData['tags'].push(v.text);
        })
        if(tagsCount > 0){
            editedData['tags'] = [];
            $.each(this.state.tags, function(k, v){
                editedData['tags'].push(v.text);
            })
        }
        $.each($(thumbNailBlockInput), function(index, val){
            var imgPath = $(val).attr('data-path');
            var esId= $(val).attr('esId');
            var dbId = $(val).attr('dbId');

            console.log('esId',esId);
            if($(val).find('input[name="filetitle"]').val() != '' && $(val).find('input[name="filetitle"]').val().trim() != '') {
                var title = $(val).find('input[name="filetitle"]').val();
            }else{
                window.Materialize.toast('Please Enter a Title !', 2000, 'red');
                flag++;
                return false;
            }
            thumbnailData.push({"title": title, "bfl": imgPath ,"config" : savedData['config'],'source' : 'Source Type',"description":savedData['description'],'tags':savedData['tags']});
             var obj2 = editedData;
             thumbnailEditedData.push($.extend({"title": title}, obj2 ));
             if(esId != 'undefined') {
                 urls.push(params.acsServerUrl + "/api/acs/updateAsset/" + dbId + "/" + esId)
             }
        });
        //this.textInput.current.validateField();
        var finalData = [];
        var url = '';
        var method = '';
        if(this.state.isAssetEdit == true || urls.length != 0){
            finalData = thumbnailEditedData;
            // url = params.acsServerUrl+"/api/acs/updateAsset/"+this.state.dbId+"/"+this.state.esId;
            method = "put";
        }
        else{
            finalData = thumbnailData;
            for (var j = 0; j < finalData.length; j++) {
                urls.push(params.acsServerUrl + "/api/acs/addAsset")
            }
            method= "post";
        }
        
        //add assets to db
        if(flag == 0) {
            var siteId = localStorage.getItem('SiteId');
            var corpId = localStorage.getItem('CorpId');
            for (var i = 0; i < finalData.length; i++) {

              console.log(finalData[i]);
                axios({
                    method: method,
                    url: urls[i],
                    data: finalData[i],
                    headers: {
                        "corp": corpId,
                        "site": siteId
                    },
                    withCredentials: true,
                    crossDomain: true
                })
                    .then(function (response) {
                        setTimeout(function () {
                            console.log(response.data);
                            if (response.status == '201') {
                                var savedAsset = $('#bulk-thumbnails').find('.card[data-path="' + response.data.bfl + '"]').find('.clearFile');
                                $(savedAsset).trigger('click');
                                window.Materialize.toast('Asset Created !', 3000);
                                setTimeout(function(){
                                    var selectedCount = $('#assetFilePopup .card').length;
                                    $('#selectedCount .selected,#selectedCount .results').text(selectedCount);
                                    window.location.reload();
                                }, 1000)
                            }
                            else{
                                window.Materialize.toast('Asset Updated !', 3000, 'blue');
                            }
                        }, 200);
                    })
                    .catch(function (error) {
                        setTimeout(function () {
                            console.log(error);
                        });
                    });
            }
        }
    }
    componentDidMount() {
        var self =this;
        var siteId = localStorage.getItem('SiteId');
        
        // axios({
        //     method: 'get',
        //     url: params.pbsServerUrl+'/templateConfig/'+siteId+'/VAULT',
        //     withCredentials: true,
        //     crossDomain: true
        // })
        //     .then(function (response) {
        //         self.setState({
        //             data: response.data
        //         });
        //     })
        //     .catch(function (error) {
        //         console.log(error);
        //     });
        axios({
            method: 'get',
            url: params.pbsServerUrl+'/templateConfig/getAllMediaTypes',
            withCredentials: true,
            crossDomain: true
        })
            .then((response) => {
                self.setState({
                    mediadata: response.data,
                });
            }).catch((error) => {
            console.error(error);
        });

    }
    
    render() {
        const { tags, suggestions } = this.state;
        return(
                <div id="assetFilePopup" className="white modal fullscreen">
                    <div className="modal-content">
                        <div className="row right-align closeModal">
                            <div className="modal-close waves-effect full" onClick={this.resetValues}>
                                <i className="material-icons">close</i>
                            </div>
                        </div>
                        <div className="row noBottom">
                            <div className="col m8 white fileListSide">
                                <div className="row">
                                    <div className="col s6 selectBox no-padding-left" id="selectedCount">
                                        <span className="selected"></span><span className="results"></span> Results
                                    </div>
                                    <div className="col s6 no-padding-right right selectBoxAll">
                                    {/* <!-- Dropdown Trigger --> */}
                                    {/* <Dropdown trigger={
                                            <p>Select</p>
                                        }>
                                        <NavItem>Select All</NavItem>
                                        <NavItem>Select None</NavItem>
                                   </Dropdown> */}
                                    </div>
                                </div>
                                <div className="row clearfix afpThumbnails" id="bulk-thumbnails">
                                    {/* Uploaded asset thumbnails */ }
                                </div>
                            </div>
                            <div className="col m4 fileDetailSide">
                                <h5>Uploading Files</h5>
                                <hr />
                                <form id="uploadFileForm" name="uploadFileForm">
                                    
                                    <ul className="collapsible multiDropdownTag">
                                    <li>
                                        <div className="collapsible-header" field="tags" ><i className="material-icons">info_outline</i>Description <i className="material-icons right rotate">keyboard_arrow_right</i><img className="right collapHeadIcon" src="src/assets/images/icons/view-slash-icn.png" alt="eye" onClick={this.toggleDescriptionField} /></div>
                                        <div className="collapsible-body">
                                            <div className="input-field noTop">
                                                <textarea name="fileUploadDesc" placeholder="description goes here" className="materialize-textarea fileUploadDesc" data-length="120"></textarea>
                                                <hr />
                                            </div>  
                                        </div>
                                    </li>
                                        {
                                            _.map(this.state.data.templateFields, (filterData,key) =>{
                                                const filterLabel = filterData.displayName;
                                                var filterValues = filterData.values;
                                                
                                                return <MultiSelectAssetDropdown icon="info_outline" placeholder="" label={filterLabel} value={filterLabel} disabled="" selectedValues="" defaultValues={filterValues} fieldValue={key} key={filterLabel} class="multiselect" toggleData={this.toggleDataFields} ref={this.textInput}/>
                                                        
                                            })
                                        }
                                        <MultiSelectAssetDropdown icon="info_outline" placeholder="" label="Media Types" value="" disabled="" selectedValues="" defaultValues={this.state.mediadata} fieldValue="MediaType" class="multiselect"/>
                                        <li>
                                            <div className="collapsible-header" field="tags" ><i className="material-icons">info_outline</i>Tags<i className="material-icons right rotate">keyboard_arrow_right</i></div>
                                                <div className="collapsible-body">
                                                    <ReactTags tags={tags}
                                                        suggestions={suggestions}
                                                        handleDelete={this.handleDelete}
                                                        handleAddition={this.handleAddition}
                                                        delimiters={delimiters} 
                                                        inline = {true}
                                                    />
                                                </div>
                                        </li>
                                    </ul>   
                                    <button className="btn btn-primary waves-effect saveBtn waves-light " type="button" onClick={this.getAssetData}>SAVE DETAILS </button>  
                                </form>
                                
                            </div>
                        </div>
                        
                    </div>
                </div>
        );
    }
}

export default BulkAssetsPopup;