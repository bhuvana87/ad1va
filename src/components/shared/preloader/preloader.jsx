import React, { Component } from 'react';

class Preloader extends Component{
    componentDidMount() {
        var preloaderbar = new Nanobar({target: document.getElementById('preloader')});
        preloaderbar.go(100);
    };
    render() {
        return(
        // Preloader Block
        <div id="preloader"></div>
        );
    }
}

export default Preloader;