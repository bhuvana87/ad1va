
import axios from 'axios';
import params from '../../config/config';
import { Component } from 'react';



var doSend = function (type, url, jsonInput,headers){
    axios({method: type,
        url: url,
        data: jsonInput,
        headers:headers,
        withCredentials: true,
        crossDomain: true
    })
        .then( (response) => {
            //response.json();
            console.log('sta',response.status);
            console.log('sta',response);
            if(response.status == 220){
                console.log('user is not logged in, redirecting to login page');
                window.location = params.ssoLogingUrl + '?gotoUrl=' + window.location.href;
            }
            else{
                console.log('Session is set and active');
            }
            return response;
        }).catch((error) => {
        console.log('err',error);
        return error;
    });
}

export default doSend;
