import React, {Component} from 'react';
import {NotificationManager} from 'react-notifications';
import {withRouter} from "react-router-dom"
import GeneralService from "../../services/GeneralService";

class MarketAdd extends Component {
    constructor(props) {
        super(props);

        this.state = {
            market: props.market,
            mode: props.mode,
            submit: props.submit,
            invalid: {
                id: false,
                maxRate: false
            }
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        this.checkValidation().then(isValid => {
            if (isValid) {
                console.log('valid');
                try {
                    this.state.submit(this.state.market).then(() => {
                        console.log('then');
                        NotificationManager.info('Please wait for confirmation.', '', 5000);
                        this.props.history.push('/marketowner');
                    }).catch(error => {
                        console.log('error', error);
                        console.log(GeneralService.getWeb3ErrorText(error.message));
                        NotificationManager.error('Cannot '+this.state.mode+' market.', GeneralService.getWeb3ErrorText(error.message), 8000);
                        return false;
                    });
                } catch (error) {
                    console.log("errors", error);
                    if (error.message.indexOf('invalid address') >= 0) {
                        this.showInvalidData(['address'], ['Invalid address.']);
                    }
                    return false;
                }
            }
        });
        return false;
    }

    showInvalidData(fields, messages) {
        var invalid = {...this.state.invalid};
        fields.map((field) => {
            invalid[field] = true;
            return invalid[field];
        });
        this.setState({
            invalid: invalid
        });
        messages.map(message => NotificationManager.error(message, '', 8000));
    }

    checkValidation() {
        return new Promise((resolve, reject) => {
            var fields = [];
            var messages = [];
            var result = true;
            if (this.state.market.id === "") {
                fields.push('id');
                messages.push('Internal ID is required field.');
                result = false;
            }

            if (this.state.market.id < 1) {
                fields.push('id');
                messages.push('Internal ID should be greatest than zero.');
                result = false;
            }
            if ((this.state.market.maxRate === "") || (this.state.market.maxRate === 0)) {
                fields.push('maxRate');
                messages.push('Maximum rate is required field and should be greatest than zero.');
                result = false;
            }

            if (this.state.market.maxRate > 100) {
                fields.push('maxRate');
                messages.push('Maximum rate is 100.');
                result = false;
            }


            this.showInvalidData(fields, messages);
            resolve(result);
        });
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        var market = {...this.state.market};
        market[name] = value;

        var invalid = {...this.state.invalid};
        invalid[name] = false;
        this.setState({
            market: market,
            invalid: invalid
        });
    }

    render() {
        console.log('FORM STATE: ', this.state);
        return (
            <div className="pure-g">
                <div className='pure-u-1-1'>
                    <h2>{this.state.mode === "add" ? "Add" : "Edit"} market : &nbsp;</h2>
                    <form className="pure-form pure-form-aligned">
                        <fieldset>
                            <div className="pure-control-group">
                                <label htmlFor="id">Internal ID <span className="required">*</span></label>
                                <input name="id"
                                       type="text"
                                       placeholder="Internal id"
                                       value={this.state.market.id}
                                       onChange={this.handleInputChange}
                                       className={this.state.invalid.id ? "field-error" :  ""}
                                />
                            </div>

                            <div className="pure-control-group">
                                <label htmlFor="maxRate">Maximum Rate <span className="required">*</span></label>
                                <input name="maxRate"
                                       type="text"
                                       placeholder="Maximum rate"
                                       value={this.state.market.maxRate}
                                       onChange={this.handleInputChange}
                                       className={this.state.invalid.maxRate ? "field-error" :  ""}
                                />
                            </div>

                            <div className="pure-control-group">
                                <label></label>
                                <button type="submit" className="button-success pure-button"
                                        onClick={this.handleSubmit}>{this.state.mode === "add" ? "Add" : "Save"}</button>
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        );
    }
}

export default withRouter(MarketAdd);