import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { render } from 'react-dom';

const ShowBulkAssetPopUp = (thumbnailPath, filenm, url, title, isEdit, dbId, esId) => {
    
    const cardItem = '<div class="col s4"><div class="card animated small" data-path="'+ thumbnailPath + '" dbId="'+dbId+'" esId="'+esId+'"><div class="card-overlay active"><div class="select"><label><input type="checkbox" checked="true" class="filled-in" name="'+ filenm +'" /><span></span></label></div></div><div id ="image-placeholder" class="card-image"><img src="'+url+'"  alt="" /><span class="card-title left clearFile"><i class="small material-icons clear">clear</i></span><span class="card-title right"><span class="badge img-format" data-format="JPG">'+ filenm.substr(filenm.length - 3) +'</span></span></div><div class="card-content"><span class="file-name">Title</span><input name="filetitle" type="text" class="validate" value="' + title + '" /><span class="file-name cardContentSubtitle">Optional Fields</span></div></div></div>';
                    $('#assetFilePopup').css({'opacity':'0','z-index': '9999','display':'none'});
                    $('#assetFilePopup').css({'display':'block'});
                    $('#assetFilePopup').animate({'opacity':'1'}, 300);
                    $.each($('#assetFilePopup').find('#uploadFileForm .multiDropdownTag li').find('input[type="checkbox"]'), function(i, v){
                        $(v).prop('checked', false);
                    })
                    $('html').css({'overflow':'hidden'})
                    $(".fileDetailSide h5").html('Uploading Files');
                    $("#bulk-thumbnails").append(cardItem);
                    $('#assetFilePopup .modal-close .material-icons').on('click', function(){
                        $('#assetFilePopup').animate({'opacity':'0'}, 300);
                        $('#assetFilePopup').css({'display':'none'});
                        $("#bulk-thumbnails").html('');
                    });
                    $("#bulk-thumbnails").find('.card-overlay').on('click', function(){
                        if(!$(this).find('input').is(':checked')){
                            $(this).removeClass('active');
                        }
                        else{
                            $(this).addClass('active');
                        }
                    })
                    
                    $('.clearFile').click(function(){
                        $(this).parents().eq(2).fadeOut(300, function() { $(this).remove(); });
                        var selectedCount = $(this).parents().find('#assetFilePopup .card').length - 1;

                        setTimeout(function(){
                            $('#selectedCount .selected,#selectedCount .results').text(selectedCount);
                        }, 1000)
                        
                    })
};
export default ShowBulkAssetPopUp;