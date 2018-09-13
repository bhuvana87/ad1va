import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Button, Icon, Row, Col, Carousel, Chip, Collapsible, CollapsibleItem, Input, Form} from 'react-materialize';

class InputField extends Component{
    constructor(props) {
        super(props);
        this.state = {value: ''};
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
        this.setState({value: event.target.value});
    }
    render(label, type) {
        return(
        <label>
            {this.props.label}
            <input type={this.props.type} id ={this.props.label} defaultValue={this.props.value} onChange={this.handleChange} placeholder={this.props.placeholder}  contenteditable="true" disabled={this.props.disabledval ? "disabled" : false} />
        </label>
        );
    }
}

export default InputField;