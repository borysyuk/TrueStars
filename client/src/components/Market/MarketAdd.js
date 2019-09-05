import React from 'react';
import {NotificationManager} from 'react-notifications';
import {withRouter} from "react-router-dom"
import GeneralService from "../../services/GeneralService";
import FormComponent from "../General/FormComponent";

class MarketAdd extends FormComponent {
    constructor(props) {
        super(props);

        this.state = {
            market: props.market,
            mode: props.mode,
            submit: props.submit,
            invalid: {
                id: false,
                maxRating: false
            }
        };

        this.handleSubmit = this.handleSubmit.bind(this);

        this.handleInputChange = this.handleInputChange('market');
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
            if ((this.state.market.maxRating === "") || (this.state.market.maxRating === 0)) {
                fields.push('maxRating');
                messages.push('Maximum rate is required field and should be greatest than zero.');
                result = false;
            }

            if (this.state.market.maxRating > 100) {
                fields.push('maxRating');
                messages.push('Maximum of rate is 100.');
                result = false;
            }


            this.showInvalidData(fields, messages);
            resolve(result);
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
                                <label htmlFor="maxRating">Max rating <span className="required">*</span></label>
                                <input name="maxRating"
                                       type="text"
                                       placeholder="Max rating"
                                       value={this.state.market.maxRating}
                                       onChange={this.handleInputChange}
                                       className={this.state.invalid.maxRating ? "field-error" :  ""}
                                />
                            </div>

                            <div className="pure-control-group">
                                <label htmlFor="stake">Stake (eth)<span className="required">*</span></label>
                                <input name="stake"
                                       type="number"
                                       placeholder="stake"
                                       value={this.state.market.stake}
                                       onChange={this.handleInputChange}
                                       min="0.00"
                                       max="100.00"
                                       step="0.01"
                                       className={this.state.invalid.stake ? "field-error" :  ""}
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