import React, { PureComponent } from 'react';
import './index.scss';

class Error extends PureComponent {
  render() {
    return (
      <div className="error">
        <h1>:(</h1>
        Unable to fetch weather data. Please check your internet connection and try again later.
      </div>
    )
  }
}

export default Error;
