import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Button, Icon, Row, Col, Carousel, Chip, Collapsible, CollapsibleItem, Input, Form} from 'react-materialize';

class TextArea extends Component{
    constructor(props) {
        super(props);
        this.state = {text: ""};
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
        this.setState({text: event.target.value});
    }
    componentWillReceiveProps(props){
        this.setState({
            text: this.props.value
        })
    }
    render(label, type) {
        //var disabled = $.parseJSON(this.props.disabled);
        return(
        <label>
            {this.props.label}
            <textarea value={this.state.text} id ={this.props.label} onChange={this.handleChange} placeholder={this.props.placeholder}  className={this.props.class} disabled={this.props.disabledval ? "disabled" || "true" : false}></textarea>
        </label>
        );
    }
}

export default TextArea;