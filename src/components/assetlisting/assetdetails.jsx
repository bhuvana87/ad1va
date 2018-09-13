import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import {Button, Icon, Row, Col, Carousel, Chip, Collapsible, CollapsibleItem, Input, Form} from 'react-materialize';
import params from './../../config/config';
import InputField from './../forms/inputfield.jsx';
import MultiSelectAssetDropdown from './../forms/multiSelectAssetDropdown.jsx';
import PreloadImage from 'react-preload-image';
import FileUploaderS3 from './../forms/fileuploaders3.jsx';
import axios from 'axios';
import { WithContext as ReactTags } from 'react-tag-input';
import TextArea from './../forms/textarea.jsx';

const KeyCodes = {
    comma: 188,
    enter: 13,
  };
  const delimiters = [KeyCodes.comma, KeyCodes.enter];
class AssetDetails extends Component{
    constructor(props){
        super(props);
        this.state = {
            details: {},
            det: [],
            assetCarousel: '',
            assetCode: '',
            assetName: '',
            assetTypes: [],
            categoryTypes: [],
            mediaTypes: [],
            tags: [],
            suggestions: [],
            TotalAssetTypes: [],
            TotalCategoryTypes: [],
            tagOptions: [],
            primaryFiles: [],
            additionalFiles: [],
            params:{},
            urlForImages:[],
            bfl:'',
            lastVersionId:0,
            defaultValuesCategory : [],
            defaultValuesAssetType : [],
            defaultValuesMediaType : [],
            disabledVal:'disabled',
            assetDbId:'',
            assetEsId:'',
            isEdit: true,
            additionalFilesCount: '',
            assetTypeDisplayName:'',
            categoryTypeDisplayName:''
        }
        // this.moveNextAsset = this.moveNextAsset.bind(this);
        // this.movePrevAsset = this.movePrevAsset.bind(this);
        this.editDetails = this.editDetails.bind(this);
        this.saveDetails = this.saveDetails.bind(this);
        this.showAdditionalFiles = this.showAdditionalFiles.bind(this);
    }
    handleDelete = (i) =>{
        const { tags } = this.state;
        this.setState({
         tags: tags.filter((tag, index) => index !== i),
        });
    }
    handleAddition = (tag) =>{
        this.setState(state => ({ tags: [...state.tags, tag] }));
    }
    // Slider image format
    renderSliderElement(param, imgurl) {
        switch(param) {
            case 'jpg':
                return <PreloadImage src={imgurl} alt="" />;
            case 'png':
                return <PreloadImage src={imgurl} alt="" />;
            case 'pdf':
                return <embed src={imgurl} width="100%" height="100%" className="pdf-img" />;
            case 'video':
                return  <video controls>
                            <source src={imgurl} type="video/mp4" />
                            <source src={imgurl} type="video/ogg" />
                            Your browser does not support HTML5 video.
                        </video>;
            default:
                return <PreloadImage src={imgurl} alt="" />;
        }
      }
      setImageFormat(imageName){
        switch(imageName.substr(-3)) {
            case 'sql':
                return <img src="src/assets/images/logos/sql-icon.jpg" />;
            case 'ocx':
                return <img src="src/assets/images/logos/docx-icon.jpg" />;
            default:
                return <img src="src/assets/images/logos/ps-logo.png" />;
        }   
    }
      //For toggling additional files(source files) on click of '+' symbol in UI
      showAdditionalFiles(event){
        $(event.target).parent().siblings().find('.additional-files').hide();
        $(event.target).parent().siblings().find('.showfiles').removeClass('active');
        $(event.target).parent().find('.additional-files').slideToggle();
        $(event.target).toggleClass('active');
        const filesCount = $(event.target).parent().find('.additional-files .file-listing').find('li.fileCapsule').length;
        this.setState({
            additionalFilesCount: filesCount
        })
      }

    // moveNextAsset(event){
    //     var b = $(event.target).parent().parent().prev().find('.carousel-item');
    //     var currentid = "#"+b["0"].id+"";
    //     var nextid = $("#assets").closest('div').find(currentid).next();
    //     var self = this;
    //     console.log('nextid',nextid["0"].id);
    //
    //     self.setState({
    //         params : {
    //             assetDocId: nextid["0"].id
    //         }
    //     });
    //     setTimeout(function () {
    //         self.displayDetails(self.state.params,self);
    //     }, 200);
    //     self.componentDidMount();
    // }
    // movePrevAsset(event){
    //     var b = $(event.target).parent().parent().parent().find('.carousel').attr('id');
    //      var previd = $("#assets").closest('div').find("#" + b).prev();
    //     var self = this;
    //     console.log("previd",previd["0"].id);
    //     self.setState({
    //         params : {
    //             assetDocId: previd["0"].id
    //         }
    //     });
    //     setTimeout(function () {
    //         self.displayDetails(self.state.params,self);
    //     }, 200);
    //     $('.asset-slider').find(previd).carousel();
    // }

    
    componentWillReceiveProps(props) {
        console.log('props1',props);
        // AssetDocId and assetDBId obtained from listing.jsx
        var self = this;
        var testing = props;

        this.displayDetails(testing,self);

    }

    displayDetails(values,self)
    {   console.log('displaydetails',values);
        var siteId = localStorage.getItem('SiteId');
        var corpId = localStorage.getItem('CorpId');
    var url = params.acsServerUrl+'/api/acs/getAsset/'+values.assetDBId+'/'+values.assetDocId;
    axios({
        method : 'get',
        url : url,
        params : {},
        headers : {
            "corp": corpId,
            "site": siteId
        },
        withCredentials: true,
        crossDomain: true
    })
        .then((response) => {
            console.log('get asset details',response.data);
            var datas = response.data;
            self.setState({
                details: datas,
                tags: []
            })
            const images = this.state.details.outputFiles;
            const imageArray = images;
            const assettype =  this.state.details.config.field1;
            const category =  this.state.details.config.field0;
            const mediatype = this.state.details.config.MediaType;
            const tags = this.state.tags;
            
            this.state.urlForImages = [];   
            var s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                region: 'ap-south-1',
                params: {Bucket: 'jdvault-cloudfront',
                    ServerSideEncryption: "AES256"}
            });
            imageArray.map((imgurl) => {

                const multiPartParams = {
                    Bucket: 'jdvault-cloudfront',
                    Key: imgurl,
                };
                this.state.urlForImages.push(s3.getSignedUrl("getObject", multiPartParams));
            });

            axios({
                method: 'get',
                url: params.pbsServerUrl+'/templateConfig/getAllMediaTypes',
                withCredentials: true,
                crossDomain: true
            })
                .then((response) => {
                    self.setState({
                        defaultValuesMediaType: response.data
                    });
                }).catch((error) => {
                console.error(error);
            });
            this.setState(
                {
                    assetCode: this.state.details.code,
                    assetName:  this.state.details.title,
                    assetTypes: assettype,
                    categoryTypes: category,
                    //to add TotalAssetTypes and Total,
                    tagOptions: category,
                    mediaTypes: mediatype,
                    primaryFiles: this.state.urlForImages,
                    additionalFiles: this.state.details.sourceFiles,
                    defaultValuesCategory : values.defaultValues.field0.values,
                    defaultValuesAssetType : values.defaultValues.field1.values,
                    assetDbId:values.assetDBId,
                    assetEsId:values.assetDocId,
                    bfl:this.state.details.bfl,
                    lastVersionId:this.state.details.nextVersion,
                    assetTypeDisplayName:values.defaultValues.field1.displayName,
                    categoryTypeDisplayName:values.defaultValues.field0.displayName

                }
            );
            const tagoptions = this.state.tags;
        // this.state.details.tags.map(function(val){
        //     tagoptions.push(val);
        // })
        const tagvalues = this.state.details.tags.map((tag) => {
           tags.push({
               id: tag,
               text: tag
           })
        });
        
        this.setState({
            tags: tags
        })

        console.log(this.state.tags);

                const imageItem = this.state.urlForImages.map((imgurl) => {

                    var assetnm = decodeURI(imgurl.replace(/^.*[\\\/]/, '').split('.').slice(0, -1).join('.'));

                    return (
                        
                    <div className="carousel-item">
                        {this.renderSliderElement('jpg',imgurl)}
                        <div className="assetName">{assetnm}</div>
                    </div>
                    )});
                //sliderImage for display in details view
                let sliderImage =
                    (
                    <Carousel options={{ fullWidth: true }} carouselId={values.assetDocId} key={values.assetDocId}>
                        {imageItem}
                    </Carousel>
                )
                this.setState({
                    assetCarousel: sliderImage,
                })
            })
            .catch((error) =>{
                console.log(error);
            });

    }

    editDetails(e){
        //Todo
        // $("#field0, #field1, #tags").prop("disabled", "");
        $("#field0, #field1, #MediaType").removeClass('disabled');
        $("#NAME, #Description").attr('disabled',false);
        
        this.setState({
            disabledVal: '',
        })
        $(e.target).hide();
        $('li[name="tags"]').removeClass('disabled');
        $(e.target).parent().find('.infoIcon').show();
        $(e.target).parent().parent().find('.saveBtn').removeClass('disabled');
    }
    showInfo(e){
        //Todo
        $("#field0, #field1, #MediaType").attr("class", "disabled");
        $("#NAME, #Description").attr('disabled',true);
      //  $(e.target).hide();
        $('li[name="tags"]').addClass('disabled');
        $('.info-panel .editIcon').show();
        $('.info-panel .infoIcon').hide();
        $(e.target).parent().parent().find('.saveBtn').addClass('disabled');
    }
    saveDetails(e){
        var self = this;
        var parent = e.target.parentNode;
        e.persist();
        console.log(parent);
        $("#field0, #field1, #MediaType").attr("class", "disabled");
        $("#NAME, #Description").attr('disabled',true);
        $(parent).find('.infoIcon').hide();
        $('li[name="tags"]').addClass('disabled');
        $(parent).find('.editIcon').show();
        const savedData = {};
        savedData['config'] = {};
        savedData['description'] = $(parent).find('#Description').val();
        savedData['tags'] = [];
        savedData['title'] = $(parent).find('#NAME').val();
        var listCount = 0;
        $(parent).find('.new-upload').remove();
        $(parent).parents().eq(3).find('.modal-close').trigger('click');
        $.each($(parent).find('.collapsible.multiDropdownTag li'), function(i,v){
            var selectedField = $(v).find('.collapsible-header').attr('field');
            var selectedValues = [];
            var tagValues = [];
            //todo : get each input field and validate
            $(this).find('input[type="checkbox"]:checked').map(function () {
                var selVal = $(this).val();
                selectedValues.push(selVal);
                listCount++;
            });
            $(this).find('.ReactTags__selected span.ReactTags__tag').map(function () {
                var tagVal = $(this).text().slice(0,-1) ;
                tagValues.push(tagVal);
            });
            if(selectedField != 'tags')
                savedData['config'][selectedField]= selectedValues;
            else
              savedData['tags'] = tagValues;
            
        })
        var val = [];
        savedData['updateSourceFiles'] = true;
        savedData['updateOutputFiles'] = true;

        $.each($(parent).find('.collapsible label').not('.active'),function(i,v){
            val[v.innerText] = $('#'+v.innerText).val();
        })
        // var description = $(parent).find('textarea[name="fileUploadDesc"]').val();
        var urlForEdit = params.acsServerUrl+'/api/acs/updateAsset/'+this.state.assetDbId+'/'+this.state.assetEsId;
        var siteId = localStorage.getItem('SiteId');
        var corpId = localStorage.getItem('CorpId');
            axios({
                        method: 'put',
                        url: urlForEdit,
                        data: savedData,
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
                                    window.Materialize.toast('Asset Updated !', 3000,'blue');
                            }, 200);
                            var val = {
                                assetDbId : response.id,
                                assetDocId : response.docId
                            }
                            this.displayDetails(val,this);
                        })
                        .catch(function (error) {
                            setTimeout(function () {
                                console.log(error);
                            });
                        });
    }
    render() {       
        const { suggestions } = this.state;
        const tags =  this.state.tags;
        var headingHeight = $('.asset-slider').find('h2').height();
        var metricsHeight = $('.asset-slider').find('.asset-metrics').height();
        var reduceHeight = headingHeight + metricsHeight;
        var sliderHeight = $(window).height() - reduceHeight - 130;
        $('.asset-slider').find('.carousel.carousel-slider').css('height',sliderHeight);
        function movePrevSlide(e) {
            e.preventDefault();
            e.stopPropagation();
            $('.carousel').carousel('prev');

        }
        function moveNextSlide(e) {
            e.preventDefault();
            e.stopPropagation();
            $('.carousel').carousel('next');
        }
        var defCat = '';
        var defAssetType = '';
        var defMediaType = '';
        if(this.state.defaultValuesCategory != '' && this.state.defaultValuesAssetType != ''){
            defCat  = this.state.defaultValuesCategory;
            defAssetType = this.state.defaultValuesAssetType;
            //defMediaType = this.state.defaultValuesMediaType;
        }
        var bfl = this.state.bfl;
        var lastVersionId = this.state.lastVersionId;
        
        return(
            <div className="row">
              <div className="col m9 no-padding">
              {/* Asset Slider */}
                <div className="slider-panel">
                 {/* Slider Navigation */}
                <div className="carousel-fixed-item center middle-indicator">
                    <div className="left cIndicator">
                        <div onClick={movePrevSlide} className="movePrevCarousel middle-indicator-text waves-effect waves-light content-indicator"><i className="material-icons left  middle-indicator-text" >chevron_left</i></div>
                    </div>
                    <div className="right cIndicator">
                        <div onClick={moveNextSlide} className="moveNextCarousel middle-indicator-text waves-effect waves-light content-indicator"><i className="material-icons right middle-indicator-text">chevron_right</i></div>
                    </div>
                </div>
                    {
                         <div key={this.state.details} className="asset-slider">
                        <h2>{this.state.details.title}</h2>
                        {/* Slider Images */}
                        {this.state.assetCarousel}
                        <div className="asset-metrics">
                        <span><img src="src/assets/images/icons/download-icn.png" alt="" rel="preload"/> {this.state.details.dcount}</span>
                        <span><img src="src/assets/images/icons/views-icn.png" alt="" rel="preload" /> {this.state.details.vcount}</span>
                        <div className="right asset-actions">
                        <a  className="btn btn-grey" id="changelogs-link"><i className="fas fa-history"></i> Change Logs</a>
                        <a  className="btn btn-grey"> <i className="fa fa-angle-left"></i> Previous</a>
                        <a  className="btn btn-grey">Next <i className="fa fa-angle-right"></i></a>
                        </div>
                        </div>
                        </div>
                    }
                </div>
              </div>
              <div className="col m3 no-padding">
                <div className="info-panel">
                    {/* Asset Details */}
                    <h3>Asset Details <i className="fas fa-info right infoIcon" onClick={this.showInfo}></i> <i className="fas fa-pencil-alt right editIcon" onClick={this.editDetails}></i><i className="fas fa-trash-alt right deleteIcon dropdown-trigger" data-target="eDeleteConfirm"></i><i className="far fa-envelope right mailIcon dropdown-trigger"  data-target="eMailPopup"></i> </h3>
                    <form id="uploadFileForm" name="editFileForm">
                    <ul className="collapsible">
                        <li className="active">
                            <div className="collapsible-header"><i className="material-icons">info_outline</i> INFORMATION <i className="material-icons right rotate">keyboard_arrow_right</i></div>
                            <div className="collapsible-body">
                                <InputField placeholder="" label="Code" value={this.state.details.code} type="text" disabledval="true" />
                                <InputField placeholder="" label="NAME" value={this.state.details.title} type="text" disabledval={this.state.disabledVal} className="truncate" />
                                {/* <TagInput /> */}
                                <TextArea placeholder="" label="Description" class="asset-description" value={this.state.details.description} disabledval={this.state.disabledVal} />
                                <ul className="collapsible multiDropdownTag">
                                    <MultiSelectAssetDropdown placeholder="" icon="" label={this.state.assetTypeDisplayName} value={this.state.assetTypes} disabled={this.state.disabledVal} selectedValues={this.state.assetTypes} class="multiselect" defaultValues = {defAssetType} fieldValue = "field1" id="field1"/>
                                    <MultiSelectAssetDropdown placeholder="" icon="" label={this.state.categoryTypeDisplayName} value={this.state.categoryTypes} disabled={this.state.disabledVal} selectedValues={this.state.categoryTypes} defaultValues = {defCat} fieldValue="field0" id="field0"/>
                                    <MultiSelectAssetDropdown placeholder="" icon="" label="Media Type" value={this.state.mediaTypes} disabled={this.state.disabledVal} selectedValues={this.state.mediaTypes} defaultValues = {this.state.defaultValuesMediaType} fieldValue="MediaType" id="MediaType"/>
                                    {/* <MultiSelectAssetDropdown placeholder="" icon="" label="Tags" value={this.state.details.tags} disabled={this.state.disabledVal} selectedValues={this.state.details.tags} id="tags " type="tags" /> */}
                                    <li class="disabled" name="tags">
                                        <div className="collapsible-header" field="tags" >Tags<i className="material-icons right rotate">keyboard_arrow_right</i></div>
                                        <div className="collapsible-body">
                                        <ReactTags tags={tags}
                                            suggestions={suggestions}
                                            handleDelete={this.handleDelete}
                                            handleAddition={this.handleAddition}
                                            delimiters={delimiters} 
                                            inline = {true}
                                            id="tags"
                                        />
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li>
                            <div className="collapsible-header"><i className="material-icons">content_copy</i> PRIMARY FILES <i className="material-icons right rotate">keyboard_arrow_right</i><span className="active badge">{this.state.primaryFiles.length}</span></div>
                            <div className="collapsible-body">
                                <div className="pmWrap">
                                {   //show primary files with image as icons
                                    this.state.primaryFiles.map((image) => {
                                       // $("#Code").prop("disabled",true);
                                      //  $("#NAME").prop("disabled",true);
                                        var version =(image).split("/")[10];
                                        console.log('ver',version);
                                        return <div className="fileCapsule" key={image} id={image.split("/")[10]}>
                                        <div className="homeIconWrapper left"><div></div></div>
                                        <div className="showfiles expand" onClick={this.showAdditionalFiles}></div>
                                                    <div className="file-contents">
                                                        <Input name={image} type='checkbox' value={image.substr(0,image.indexOf('?')).replace(/^.*[\\\/]/, '')} label={image} className='filled-in' defaultChecked='checked' />
                                                        <div className="imgWrapper"><PreloadImage src={image} alt="" /></div>
                                                        <div className="filenameWrapper"><p className="fnTitle truncate">{image.substr(0,image.indexOf('?')).replace(/^.*[\\\/]/, '')}</p><p className="fnInfo">700 x 333 px | 101 KB</p></div>
                                                    </div>
                                                    <ul className="scWrap additional-files mt15">
                                                    <div className="btn btn-grey btn-full addtnlBtn">Additional files <span className="active badge">{this.state.additionalFilesCount}</span></div> 
                                                    <div class="file-listing">
                                                    {
                                                        this.state.additionalFiles != null &&
                                                        this.state.additionalFiles.map((source) => {
                                                            if(source.includes(version)){
                                                                return  <li className="fileCapsule" key={source}>
                                                                    <Input name={source} type='checkbox' value={source.replace(/^.*[\\\/]/, '')} label={source} className='filled-in' defaultChecked='checked' />
                                                                    <div className="imgWrapper">{this.setImageFormat(source.replace(/^.*[\\\/]/, ''))}</div>
                                                                    <div className="filenameWrapper">
                                                                        <p className="fnTitle truncate">{source.replace(/^.*[\\\/]/, '')}</p>
                                                                    </div>
                                                                </li>
                                                            }
                                                        }, this)
                                                    }
                                                    </div>
                                                    {/* <button id="addFilesSec0" action="assets/uploads" method="post" encType="multipart/form-data" multiple="" className="btn addFiles btn-dotted dz-clickable"><i className="material-icons">cloud_upload</i>ADDITIONAL FILES<div className="dz-message"></div></button> */}
                                                        <FileUploaderS3 fromLoc="additional-file-details" bfl={bfl} lastVersionId={version} class="inline-upload upload-additional" label="Additional Files" />
                                                    </ul>
                                                </div>
                                    })
                                }
                                </div>

                                {/* <button id="addFilesSec" className="btn btn-grey addFiles dropzone" multiple>
                                    <i className="fa fa-plus"></i>
                                    ADD FILES
                                    <div className="dz-message"></div>
                                </button> */}
                                <FileUploaderS3 fromLoc="from-details" bfl={this.state.bfl} lastVersionId={this.state.lastVersionId} class="inline-upload" label="Add Files" />
                            </div>
                        </li>
                    </ul>
                  </form>
                  <button className="btn btn-prime waves-effect saveBtn waves-light disabled" onClick={this.saveDetails} type="submit" name="action">SAVE DETAILS</button>
                </div>
              </div>
            </div>
        );
    }
}

export default AssetDetails;