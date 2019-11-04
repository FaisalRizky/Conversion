import React from 'react';
import _ from 'lodash';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import NumberFormat from 'react-number-format';
import './Currency.container.css';

export class Currency extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      currentCurrency: ['USD', 'CAD', 'IDR', 'GBP', 'CHF', 'SGD', 'INR' , 'MYR', 'JPY', 'KRW'],
      allCurrency: [],
      currencyObj: [],
      amountOfCurrency: [],
      baseCurrencyFromApi:'',
      selectedOption: '',
      baseCurrencyFromUser:'USD',
      amount: 10,
      dateOfConversionRate:'',
    };
  }

  componentDidMount () {
    this.getCurrency()
  }

  addCurrency = event =>{
    let dataNew = this.state.currentCurrency
    dataNew.unshift(this.state.selectedOption.value)
    console.log(dataNew);
    this.setState({currentCurrency : dataNew})
  }
  /**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON, status from the response
 */
  parseJSON(response) {
      return new Promise((resolve) => response.json()
        .then((json) => resolve({
          status: response.status,
          ok: response.ok,
          json,
        })));
    }
  
  /**
   * Requests a URL, returning a promise
   *
   * @param  {string} url       The URL we want to request
   * @param  {object} [options] The options we want to pass to "fetch"
   *
   * @return {Promise}           The request promise
   */
  request(url, options) {
    let endpoint = 'https://api.exchangeratesapi.io/';
    return new Promise((resolve, reject) => {
      fetch(endpoint  + url, options)
        .then(this.parseJSON)
        .then((response) => {
          if (response.ok) {
            this.setState({
                allCurrency :  Object.keys(response.json.rates),
                currencyObj :  response.json.rates,
                baseCurrencyFromApi : response.json.base,
                dateOfConversionRate : response.json.date
            })
          }
          // extract the error from the server's json
          return reject(response.json.meta.error);
        })
        .catch((error) => reject({
          networkError: error.message,
        }));
    });
  }
  
  //Get Api endpoint
  getCurrency () {
      return this.request('latest');
  }

  getOptions (data) {
    return data.map((data) => {
      let disabled = false;
      if(this.state.currentCurrency.includes(data)) {
        disabled = true;
      }
      return {
        value: data,
        label: data,
        disabled: disabled
      };
    });
  }

  //handle base rate from user
  handleBaseCurrencyFromUser = data => {
    this.setState({
      baseCurrencyFromUser : data.target.value
    });
  }

  //handle base rate from user
  handleAmount = data => {
    let amounts = data.target.value;
    if(isNaN(data.target.value) || parseFloat(data.target.value) < 0 || data.target.value.length < 1){
        this.setState({amount: 0});
    }
    this.setState({amount: amounts});
  } 

   //handle base rate from user
  onKeyPressAmount = event => {
    const keyCode = event.keyCode || event.which;
    const keyValue = String.fromCharCode(keyCode);
     if (/\+|-/.test(keyValue))
       event.preventDefault();
  } 

  deleteCurrency (index) {
    let dataNew = this.state.currentCurrency;
    dataNew.splice(index,1)
    this.setState({currentCurrency : dataNew})
  };

  generateConversionData () {
    const {currentCurrency} = this.state;
    if (!_.isEmpty(currentCurrency)) {
      return currentCurrency.map((item, index) => {
        return (
          <div>
            <li>
              {this.getRate(item)}
              <a onClick={() => { this.deleteCurrency(index) }}>
                {item}( - )
              </a>
            </li>
          </div>
        );
      });
    }
  }

  getRate(currency) {
    const {currencyObj} = this.state
    let rates = parseFloat(currencyObj[currency]) / currencyObj[this.state.baseCurrencyFromUser]
    
    let total = (rates * this.state.amount).toFixed(2);
    return (
      <NumberFormat value={total} displayType={'text'} thousandSeparator={true} />
    );
  }

  handleChangeSelect = data => {
    this.setState({selectedOption: data})
  }


  render () {
    return (
      <div>
        <div className="ui">
          <nav className="navbar app">Currency Converter</nav>
          <nav className="navbar board">USD Amount 
          <input
            value={this.state.amount}
            ref='name'
            onChange={this.handleAmount}
            onKeyPress={this.onKeyPressAmount}
            type="number"
          /></nav>
          <div className="lists">
            <div className="list">
              <header>Rate USD in Other Currency</header>
              <ul>
                {this.generateConversionData()}
              </ul>
              <footer>
                <Select
                  value={this.state.selectedOption}
                  className="select-new-currency"
                  onChange={this.handleChangeSelect}
                  options={this.getOptions(this.state.allCurrency)}
                  isOptionDisabled={this.state.currentCurrency}
                />
                 <button onClick={this.addCurrency}>
                    Submit
                </button>
              </footer>
            </div>
            </div>
          </div>
      </div>
    );
  }
};

export default Currency;
