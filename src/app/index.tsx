
import React, { Component } from 'react'
import './style.scss';
import ClipBoardItem from '../clipboard-item';
import FuzzySearch from 'fuzzy-search';

declare global {
  interface Window {
    require: any;
  }
}


const { clipboard } = window.require('electron');
const Mousetrap = window.require('mousetrap');

interface IndexState {
  items: Array<any>,
  filteredItems: Array<any>,
  searchString: string,
  current: string,
  highLightIndex: number
}
export default class index extends Component<any, IndexState> {
  nameInput: any
  constructor(props: any) {
    super(props);
    this.state = {
      items: [],
      filteredItems: [],
      searchString: '',
      current: '',
      highLightIndex: -1
    };
  }

  componentDidMount() {
    this._readClip();
    this._registerShortcuts();
  }

  _readClip = () => {
    let clip = clipboard.readText();
    if (clip == null || clip.trim() == '') {
      return;
    }
    clip = clip.trim();
    let items = this.state.items;
    if (this.state.current !== clip) {
      if (!items.map((item: any) => item.text).includes(clip)) {
        items = this.state.items.slice(0, 100);
        let index = 0;
        items = [{ text: clip }, ...items].map((item) => {
          item.index = index;
          index += 1;
          return item;
        });
      }
    }
    this.setState({
      items,
      filteredItems: this.filterSearch(items),
      current: clip,
    });
    setInterval(this._readClip, 1000);
  }

  _registerShortcuts = () => {
    Mousetrap.bind('up', () => {
      this.setState((preState: IndexState) => {
        return { highLightIndex: Math.max(0, preState.highLightIndex - 1) }
      });
    });
    Mousetrap.bind('down', () => {
      this.setState((preState: IndexState) => {
        return { highLightIndex: Math.min(preState.filteredItems.length - 1, preState.highLightIndex + 1) }
      });
    });
    Mousetrap.bind('enter', () => {
      let selectedItem = this.state.filteredItems.find((item: any) => {
        return item.index == this.state.highLightIndex;
      });
      if(selectedItem) {
        clipboard.writeText(selectedItem.text);
      }
    });
    Mousetrap.bind('/', () => { this.nameInput.focus(); }, 'keyup');
  }

  filterSearch(items: Array<any>) {
    let index = 0;
    let itemMapper = (item: any) => {
      item.index = index;
      index += 1;
      return item;
    };
    if(this.state.searchString != '') {
      const searcher = new FuzzySearch(items, ['text'], {
        caseSensitive: false,
      });
      return searcher.search(this.state.searchString).map(itemMapper);
    } else {
      return this.state.items.map(itemMapper);
    }
  }

  handleSearch = (element: any) => {
    let searchString = element.target.value;
    this.setState({ searchString: searchString });
  }

  highlightClass = (item: any) => {
    return ` ${item.text == this.state.current ? 'active' : ''} ${this.state.highLightIndex == item.index ? 'highlight' : ''}`;
  }

  searchUnFocus = (e: any) => {
    if (e.keyCode == 38 || e.keyCode == 40) {
      this.nameInput.blur();
    }
  }

  render() {
    return (
      <div className="App">
        <input className='form-control search-box' type="text" onChange={this.handleSearch} ref={input => { this.nameInput = input; }} onKeyDown={this.searchUnFocus}/>
        <div className='clipboard-container'>{this.state.filteredItems.map((item: any) => (<ClipBoardItem key={item.index} item={item} active={this.highlightClass(item)} />))}</div>
      </div>
    );
  }
}
