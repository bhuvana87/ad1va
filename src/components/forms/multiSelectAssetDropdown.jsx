import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Button, Icon, Card, Row, Col, Input, Chip, Collapsible, CollapsibleItem, Dropdown, NavItem} from 'react-materialize';
import Tag from 'react-materialize/lib/Tag';
class MultiSelectAssetDropdown extends Component{
    constructor(props) {
        super(props);
        this.state = {
            disableVal: '',
            options: [],
            selectedValues: [],
            optionsPair: [],
            isError: false,
            optionsSend: [],
        }
    }
    onChange(e) {
        const options = this.state.options;
        const optionsSend = this.state.optionsSend;
        const optionsPair = this.state.optionsPair;
        var parent = e.target;
        e.persist();
        if (e.target.checked) { // stop duplicate entries
            if(options.indexOf(e.target.value) == -1){
                options.push(e.target.value);
                this.setState(previous=>({
                    selectedValues: [...previous.selectedValues,e.target.value]
                }))
            }
        }else {
            var val= options.indexOf(e.target.value);
            options.splice(val, 1);
            var arr = this.state.selectedValues;
            var index = arr.indexOf(e.target.value);
            arr.splice(index,1);
            this.setState(previous=>({
                selectedValues: arr
            }))
        }
        this.setState({ options: options });
        var self =this;
        setTimeout(function(){
            console.log('parent',self.state.selectedValues);
        },2000)
    }
     
    componentDidMount(){
        $('.optional-field .collapsible-header').click(function(e){
            $(this).parent().find('.collapsible-body').slideToggle(500);
        });
      $('.collapsible li.disabled').find('.collapsible-body').css('display','block');
      $('.collapsible li.disabled').click(function(e){
        if( $('.collapsible li').hasClass('disabled')){
            var stop = true;
            if(stop){
                e.stopPropagation();
            }
        }
      })
      
    }
    componentDidUpdate()
     {
         // console.log('comes here');
        if(this.props.selectedValues != undefined)
        $.each(this.props.selectedValues, function (key,val) {
            // console.log('multi', val);
            $('[name="' + val + '"]').prop('checked', 'true');
        })
    }
    componentWillReceiveProps(props){
        console.log(this.props.disabled);
        // if($('.collapsible li').hasClass('disabled')){
        this.setState({
          selectedValues: this.props.selectedValues
           })
        // }
    }
    toggleOptionalField = (event) => {
        this.props.toggleData(event);
    }
    validateField() {
       if(this.state.selectedValues == '' || this.state.selectedValues == undefined){
           console.log(this.props.label);
           alert('Select a value from ' + this.props.label);
           window.Materialize.toast('Select a value from ' + this.props.label, 1000, 'red');
       }
       else{
        //    this.setState({
        //     isError: false,
        //     errorClass: ''
        //    })
       }
    }
    render(label, type, disabled) {
        disabled = false;
        const isSelected = this.state.isSelected;

        return(
            <li className={this.props.disabled} id={this.props.id}>
                <div className="collapsible-header" field={this.props.fieldValue}><i className="material-icons">{this.props.icon}</i><span>{this.props.label}</span><i className="material-icons right rotate">keyboard_arrow_right</i><img className="right collapHeadIcon" src="src/assets/images/icons/view-slash-icn.png" alt="eye" onClick={this.toggleOptionalField} /></div>
                <div className="collapsible-body">
                <div className="chipsWrap">
                        {
                            this.state.selectedValues != undefined &&
                            this.state.selectedValues.length != 0 &&
                            this.state.selectedValues.map(function(val){
                                return  <Chip key={val}>
                                            <i className="material-icons">check</i>
                                            <span>{val}</span>
                                        </Chip>
                            }, this)
                        }
                        </div>
                        <div className="dropdown-values">
                            {
                                _.map(this.props.defaultValues, (filterData,key) => {
                                    return <Input name={filterData} key={filterData} type='checkbox' value={filterData} label={filterData}
                                                  className='filled-in' onChange={this.onChange.bind(this)}/>

                                })
                            }
                        </div>
                </div>
            </li>
        );
    }
}

export default MultiSelectAssetDropdown;