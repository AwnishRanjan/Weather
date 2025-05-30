import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import rAFTimeout from '../../helpers/rAFTimeout';
import Close from '../../components/Close';
import svg from '../../svg/github.svg';
import './index.scss';
import './transition.scss';

class Info extends PureComponent {
  constructor() {
    super();

    this.transition = React.createRef();
    this.view = React.createRef();
    this.close = React.createRef();
    this.onInfoClose = this.onInfoClose.bind(this);
  }

  onInfoClose() {
    rAFTimeout(() => this.view.current.classList.remove('animate-in'), 1);
    rAFTimeout(() => this.close.current.hide(), 20);
    rAFTimeout(() => this.transition.current.classList.remove('animate-in'), 100);
    rAFTimeout(() => {
      this.props.onInfoClose();
    }, 110);
  }

  getStyle(show) {
    if (!show) {
      return '';
    }

    rAFTimeout(() => this.transition.current.classList.add('animate-in'), 1);

    rAFTimeout(() => this.close.current.animate(), 50);

    rAFTimeout(() => {
      this.view.current.classList.remove('hide');
      this.view.current.classList.add('animate-in');
      this.view.current.setAttribute('aria-hidden', false);
    }, 150);

    return '';
  }

  render() {
    return <Fragment>
      <div ref={this.transition} className="transition"></div>
      <section ref={this.view} className={`info ${this.getStyle(this.props.show)}`}>
        <Close ref={this.close} onCloseClick={this.onInfoClose} />
        <h1>About</h1>
        <p>PWA Weather Application made with React/Scss/ES6</p>
        <p>This is a personal project built in my spare time for learning purposes.</p>
        <h2>APIs</h2>
        <ul>
          <li><a className="link" href="https://www.ipify.org" target="_blank" rel="noopener noreferrer">Ipify (ip address)</a></li>
          <li><a className="link" href="https://tools.keycdn.com/geo" target="_blank" rel="noopener noreferrer">IP Location Finder by KeyCDN</a></li>
          <li>Powered by <a href="https://www.weatherapi.com/"  target="_blank" rel="noopener noreferrer" title="Weather API">WeatherAPI.com</a></li>
        </ul>
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/iondrimba/react-weather-app" className="github" title="Github">
          <img src={svg} alt="Github icon" width="32" height="32" />
        </a>
      </section>
    </Fragment>
  }
}

Info.propTypes = {
  show: PropTypes.bool,
  onInfoClick: PropTypes.func,
  onInfoClose: PropTypes.func
};

export default Info;
