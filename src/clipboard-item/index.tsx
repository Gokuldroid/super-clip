import './styles.scss'


import React, { Component } from 'react'
const { clipboard } = window.require('electron');


export default class index extends Component<any, any> {

  handleClick(text: any) {
    clipboard.writeText(text);
  }
  
  render() {
    return(
      <p className={'clipboard-item ' + (this.props.active)} onClick={(e) => this.handleClick(this.props.item.text)}>{this.props.item.text}</p>
    )
  }
}