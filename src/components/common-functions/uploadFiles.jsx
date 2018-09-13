import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { render } from 'react-dom';
import {Button, Icon, Row, Col, Carousel, Chip, Collapsible, CollapsibleItem, Input, Form} from 'react-materialize';

const UploadFiles = (url,fromLoc) => {
    var imageId = (url).split("/")[10];
    var fileName = (url).substr(0,url.indexOf('?')).replace(/^.*[\\\/]/, '');
    if(fromLoc == 'from-details') {
        $('.pmWrap').append('<div class="fileCapsule new-upload"><div class="homeIconWrapper left"><div></div></div><div class="file-contents"><div class="imgWrapper"><img src=' + url + ' alt="" /></div><div class="filenameWrapper"><p class="fnTitle truncate">' + fileName + '</p><p class="fnInfo">700 x 333 px | 101 KB</p></div></div></div>');
    }else if(fromLoc == 'additional-file-details'){
        // $('.scWrap').append  div class="fileCapsule new-upload"><div class="homeIconWrapper left"><div></div></div><div class="file-contents"><div class="imgWrapper"><img src=' + url + ' alt="" /></div><div class="filenameWrapper"><p class="fnTitle">' + fileName + '</p><p class="fnInfo">700 x 333 px | 101 KB</p></div></div></div>');
        $('.scWrap .file-listing').append('<li class="fileCapsule new-upload"><div class="imgWrapper"><img src=' + url + ' alt="" /></div><div class="filenameWrapper"><p class="fnTitle truncate">' + fileName + '</p></div></li>');
    }
};
export default UploadFiles;