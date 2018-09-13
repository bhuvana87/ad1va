import React, { Component } from 'react';
import AWS from 'aws-sdk';
import fs from 'fs';
import FileReaderInput from 'react-file-reader-input';
import { UploaderComponent } from '@syncfusion/ej2-react-inputs';
import {Button, Icon, Card, Row, Col, Navbar, NavItem, CardTitle} from 'react-materialize';
import axios from 'axios';
import ShowBulkAssetPopUp from "./../common-functions/showBulkAssetPopup.jsx";
import UploadFiles from "./../common-functions/uploadFiles.jsx";

class FileUploaderS3 extends Component {
    constructor(props){
        super(props);
        this.state = {
            selectedFile: null,
            nameFile: "",
            selectedImage: '',
            urlForAwsSession : '',
            urlForAssetUpdate : '',
            uploadedFilesCount: '',
            year : '',
            month : '',
            date : '',
            timeInMilliseconds: '',
            dataId: '',
        }
        this.fileSelectHandler = this.fileSelectHandler.bind(this);
    }
    componentWillReceiveProps(props){
        this.setState({
            dataId: this.props.bfl
        })
    }
    
    fileSelectHandler = (event, results) => {
        console.log('props',this.props.fromLoc);
        $('#assets').find('.card-overlay').removeClass('active');
        $('.action-bar').hide();
        var files = results.length;
        var dt = new Date();
        var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        this.setState({
            uploadedFilesCount: files
        })
        for (var i = 0; i < files; i++) {
            var item = results[i];
            this.setState({
                selectedFile: item[0].target.result,
                nameFile: item[1].name,
                year : dt.getFullYear(),
                month : monthNames[dt.getMonth()],
                date : dt.getDate(),
                timeInMilliseconds : dt.getTime()
            });
            if(this.props.fromLoc == 'from-details'){
                this.fileUploader(this.props.fromLoc,this.props.bfl,this.props.lastVersionId);
                this.thumbnailUploader(this.props.fromLoc,this.props.bfl,this.props.lastVersionId);
            }else if(this.props.fromLoc == 'additional-file-details'){
                this.fileUploader(this.props.fromLoc,this.props.bfl,this.props.lastVersionId);
            } else {
                this.fileUploader();
                this.thumbnailUploader();
            }


        }
        $('#selectedCount .selected,#selectedCount .results').text(this.state.uploadedFilesCount);
    }

    fileUploader = (getLoc,bfl,lastVersionId) => {

        //   this.state.urlForAwsSession = 'http://localhost:9000/hello-world';
        //   this.state.urlForAssetUpdate = 'http://localhost:9080/api/acs/updateAsset';
        var th = this;
        var site_id = localStorage.getItem('SiteId');
        var corp_id = localStorage.getItem('CorpId');
        var cluster_id = localStorage.getItem('ClusterId');
        var user_id = localStorage.getItem('UserId');

        var version = 0; //later from form data
        var buffer = th.state.selectedFile;
        var fileName = th.state.nameFile;
        console.log(buffer.byteLength);
        //   var check = JSON.parse(result.request.response);

        //AWS.config.credentials = new AWS.Credentials(check.context.entity.accessKeyId, check.context.entity.secretAccessKey,check.context.entity.sessionToken);
        var BucketName = 'jdvault-cloudfront';
        AWS.config.credentials = new AWS.Credentials("AKIAICWJGGJWNAQVAAVQ", "9iGK9Upy8tvhbXhnN9nP0WZqN4Yl5xOSDAH3fZ1p");
        var s3 = new AWS.S3({
            apiVersion: '2006-03-01',
            region: 'ap-south-1',
            params: {Bucket: BucketName,
                ServerSideEncryption: "AES256"}
        });
        var bundleId = fileName+'_'+th.state.timeInMilliseconds;
        var extension = fileName.substring(fileName.lastIndexOf('.')+1, fileName.length);
        var thumbnailPath = corp_id+'/'+cluster_id+'/'+site_id+'/'+th.state.year+'/'+th.state.month+'/'+th.state.date+'/'+bundleId;
        if(getLoc == 'from-details')
        {
            var ver = parseInt(lastVersionId);
            var uploadPath = bfl+'/V'+ver+'/output/'+fileName;
        }else if(getLoc == 'additional-file-details'){
            var ver = lastVersionId;
            var uploadPath = bfl+'/'+ver+'/source/'+fileName;
        }
        else{
            var uploadPath = corp_id+'/'+cluster_id+'/'+site_id+'/'+th.state.year+'/'+th.state.month+'/'+th.state.date+'/'+bundleId+'/V'+version+'/output/'+fileName;
        }
        var startTime = new Date();
        var partNum = 0;
        var partSize = 1024 * 1024 * 5;
        var numPartsLeft = Math.ceil(buffer.byteLength / partSize);
        const multiPartParams = {
            Bucket: BucketName,
            Key: uploadPath,
        };
        var multipartMap = {
            Parts: []
        };

        function completeMultipartUpload(s3, doneParams,fromLoc) {
            console.log('yo',fromLoc);
            s3.completeMultipartUpload(doneParams, function (err, data) {
                if (err) {
                    console.log("An error occurred while completing the multipart upload");
                    console.log(err);
                }
                else {
                    var delta = (new Date() - startTime) / 1000;
                    console.log('Completed upload in', delta, 'seconds');
                    console.log('Final upload data:', data.Key);
                    var filenm = data.Key.substring(data.Key.lastIndexOf('/') + 1);
                    var basePath = data.Key.substring(0, data.Key.indexOf('/V'));
                    var url = s3.getSignedUrl("getObject", multiPartParams);
                    var title = '';
                    var isEdit = false;
                    console.log("generated url from s3: ", url);
                    console.log(fromLoc);
                    if (fromLoc != 'from-details' && fromLoc != 'additional-file-details') {
                        ShowBulkAssetPopUp(thumbnailPath, filenm, url, title, isEdit);
                    }
                    else{
                        UploadFiles(url,fromLoc);
                    }
                }
            });
        }
        function uploadPart(s3, multipart, partParams,fromLoc) {
            s3.uploadPart(partParams, function(multiErr, mData) {
                if (multiErr){
                    console.log('multiErr, upload part error:', multiErr);
                    return;
                }
                multipartMap.Parts[this.request.params.PartNumber - 1] = {
                    ETag: mData.ETag,
                    PartNumber: Number(this.request.params.PartNumber)
                };

                console.log("Completed part", this.request.params.PartNumber);
                console.log('mData', mData);
                if (--numPartsLeft > 0) return; // complete only when all parts uploaded
                var doneParams = {
                    Bucket: BucketName,
                    Key: uploadPath,
                    MultipartUpload: multipartMap,
                    UploadId: multipart.UploadId
                };
                console.log("Completing upload...");
                completeMultipartUpload(s3, doneParams,fromLoc);
            });
        }

        // Multipart
        console.log("Creating multipart upload for:", uploadPath);
        s3.createMultipartUpload(multiPartParams, function(mpErr, multipart){
            if (mpErr) { console.log('Error!', mpErr);  }
            console.log("Got upload ID", multipart.UploadId);

            // Grab each partSize chunk and upload it as a part
            for (var rangeStart = 0; rangeStart < buffer.byteLength; rangeStart += partSize) {
                partNum++;
                var end = Math.min(rangeStart + partSize, buffer.byteLength),
                    partParams = {
                        Body: buffer.slice(rangeStart, end),
                        Bucket: BucketName,
                        Key: uploadPath,
                        PartNumber: String(partNum),
                        UploadId: multipart.UploadId
                    };
                // Send a single part
                console.log('Uploading part: #', partParams.PartNumber, ', Range start:', rangeStart);
                uploadPart(s3, multipart, partParams, th.props.fromLoc);
            }
        });
        //   })
    }

    thumbnailUploader = (getLoc,bfl,lastVersionId) => {
        var th = this;
        var site_id = localStorage.getItem('SiteId');
        var corp_id = localStorage.getItem('CorpId');
        var cluster_id = localStorage.getItem('ClusterId');
        var user_id = localStorage.getItem('UserId');
        var version = 0; //later from form data

        //   axios.get(this.state.urlForAwsSession,{ crossdomain: true })

        //       .then(function(result) {
        //           var details = result;
        var buffer = th.state.selectedFile;
        var fileName = th.state.nameFile;
        console.log(buffer.byteLength);
        //   var check = JSON.parse(result.request.response);

        //AWS.config.credentials = new AWS.Credentials(check.context.entity.accessKeyId, check.context.entity.secretAccessKey,check.context.entity.sessionToken);
        var BucketName = 'jdvault-cloudfront';
        AWS.config.credentials = new AWS.Credentials("AKIAICWJGGJWNAQVAAVQ", "9iGK9Upy8tvhbXhnN9nP0WZqN4Yl5xOSDAH3fZ1p");
        var s3 = new AWS.S3({
            apiVersion: '2006-03-01',
            region: 'ap-south-1',
            params: {Bucket: BucketName,
                ServerSideEncryption: "AES256"}
        });

        var bundleId = fileName+'_'+th.state.timeInMilliseconds;
        var extension = fileName.substring(fileName.lastIndexOf('.')+1, fileName.length);
        // var photoKey = '144/34/1710/2018/July/2/1/V1/'+fileName;
        var thumbnailPath = corp_id+'/'+cluster_id+'/'+site_id+'/'+th.state.year+'/'+th.state.month+'/'+th.state.date+'/'+bundleId;

        if(getLoc == 'from-details')
        {console.log('comes here 3');
            var ver = parseInt(lastVersionId);
            var uploadPath = bfl+'/V'+ver+'/thumbnail/'+fileName;
        }
        else
        {
            var uploadPath = corp_id+'/'+cluster_id+'/'+site_id+'/'+th.state.year+'/'+th.state.month+'/'+th.state.date+'/'+bundleId+'/V'+version+'/thumbnail/'+fileName;

        }
        var startTime = new Date();
        var partNum = 0;
        var partSize = 1024 * 1024 * 5;
        var numPartsLeft = Math.ceil(buffer.byteLength / partSize);
        const multiPartParams = {
            Bucket: BucketName,
            Key: uploadPath,
        };
        var multipartMap = {
            Parts: []
        };


        function completeMultipartUpload(s3, doneParams) {

            s3.completeMultipartUpload(doneParams, function(err, data) {
                if (err) {
                    console.log("An error occurred while completing the multipart upload");
                    console.log(err);
                }
                else {
                    var delta = (new Date() - startTime) / 1000;
                    console.log('Completed upload in', delta, 'seconds');
                    console.log('Final upload data:', data.Key);
                }
            });
        }

        function uploadPart(s3, multipart, partParams) {
            s3.uploadPart(partParams, function(multiErr, mData) {
                if (multiErr){
                    console.log('multiErr, upload part error:', multiErr);
                    return;
                }
                multipartMap.Parts[this.request.params.PartNumber - 1] = {
                    ETag: mData.ETag,
                    PartNumber: Number(this.request.params.PartNumber)
                };

                console.log("Completed part", this.request.params.PartNumber);
                console.log('mData', mData);
                if (--numPartsLeft > 0) return; // complete only when all parts uploaded
                var doneParams = {
                    Bucket: BucketName,
                    Key: uploadPath,
                    MultipartUpload: multipartMap,
                    UploadId: multipart.UploadId
                };

                console.log("Completing upload...");
                completeMultipartUpload(s3, doneParams);
            });
        }

        // Multipart
        console.log("Creating multipart upload for:", uploadPath);
        s3.createMultipartUpload(multiPartParams, function(mpErr, multipart){
            if (mpErr) { console.log('Error!', mpErr);  }
            console.log("Got upload ID", multipart.UploadId);

            // Grab each partSize chunk and upload it as a part
            for (var rangeStart = 0; rangeStart < buffer.byteLength; rangeStart += partSize) {
                partNum++;
                var end = Math.min(rangeStart + partSize, buffer.byteLength),
                    partParams = {
                        Body: buffer.slice(rangeStart, end),
                        Bucket: BucketName,
                        Key: uploadPath,
                        PartNumber: String(partNum),
                        UploadId: multipart.UploadId
                    };
                // Send a single part
                console.log('Uploading part: #', partParams.PartNumber, ', Range start:', rangeStart);
                uploadPart(s3, multipart, partParams);
            }
        });
        //   })
    }
    componentDidMount(){
        
    }
    render() {
       
        return (
            <div className="index btn btn-primary waves-effect waves-light btn-fileuploader mt10">
                <div className={this.props.class}>
                    <i class="material-icons">cloud_upload</i>
                    <FileReaderInput as="buffer" id="file" name="file" onChange={this.fileSelectHandler} multiple />
                </div>
            </div>
        );
    }
}

export default FileUploaderS3;
