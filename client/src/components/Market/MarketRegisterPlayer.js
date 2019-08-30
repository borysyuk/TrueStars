import React from 'react';
import FormComponent from "../General/FormComponent";
import MarketOwnerService from "../../services/MarketOwnerService";
import GeneralService from "../../services/GeneralService";
import {NotificationManager} from "react-notifications";

class MarketRegisterPlayer extends FormComponent {
    constructor(props) {
        super(props);

        this.state = {
            player: MarketOwnerService.newPlayer(),
            invalid: {
                address: false,
                weight: false
            }
        };

        this.handleSubmit = this.handleSubmit.bind(this);

        this.handleInputChange = this.handleInputChange('player');
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    checkValidation() {
        return new Promise((resolve, reject) => {
            var fields = [];
            var messages = [];
            var result = true;
            if (this.state.player.address === "") {
                fields.push('address');
                messages.push('Player\'s address is required field.');
                result = false;
            }

            if (this.state.player.weight < 1) {
                fields.push('weight');
                messages.push('Player\'s weight should be greatest than zero.');
                result = false;
            }

            if (this.state.player.weight > 65536) {
                fields.push('weight');
                messages.push('Maximum of player\'s weight is 65536.');
                result = false;
            }


            this.showInvalidData(fields, messages);
            resolve(result);
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.checkValidation().then(isValid => {
            if (isValid) {
                console.log('valid');
                try {
                    this.props.submit(this.props.id, this.state.player.address, this.state.player.weight).then(() => {
                        console.log('then');
                        NotificationManager.info('Please wait for confirmation.', '', 5000);
                        this.setState({player: MarketOwnerService.newPlayer()});
                    }).catch(error => {
                        console.log('error', error);
                        console.log(GeneralService.getWeb3ErrorText(error.message));
                        NotificationManager.error('Cannot add player.', GeneralService.getWeb3ErrorText(error.message), 8000);
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

    render() {
        console.log('FORM STATE: ', this.state);
        return (
            <div className="pure-g">
                <div className='pure-u-1-1'>

                    <form className="pure-form pure-form-aligned" onSubmit={this.handleSubmit}>
                        <fieldset>
                            <div className="pure-control-group">
                                <label htmlFor="address">Player's address <span className="required">*</span></label>
                                <input name="address"
                                       type="text"
                                       placeholder="Player's address"
                                       value={this.state.player.address}
                                       className={this.state.invalid.address ? "field-error" :  ""}
                                       onChange={this.handleInputChange}

                                />&nbsp;
                            </div>
                        </fieldset>
                        <fieldset>
                            <div className="pure-control-group">
                                <label htmlFor="weight">Player's weight <span className="required">*</span></label>
                                <input name="weight"
                                       type="text"
                                       placeholder="Player's weight"
                                       value={this.state.player.weight}
                                       className={this.state.invalid.weight ? "field-error" :  ""}
                                       onChange={this.handleInputChange}

                                />&nbsp;
                            </div>
                        </fieldset>
                        <input type="submit" value="Add player" />
                    </form>
                </div>
            </div>
        );
    }
}

export default MarketRegisterPlayer;